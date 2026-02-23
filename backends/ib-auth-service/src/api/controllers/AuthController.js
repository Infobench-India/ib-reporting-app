const UserService = require('../services/UserService');
const { comparePassword } = require('../../utils/password');
const { generateTokens } = require('../../utils/jwt');
const logger = require('../../main/common/logger');

class AuthController {
  static async register(req, res) {
    try {
      const { email, password, firstName, lastName, roleId } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const existingUser = await UserService.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const user = await UserService.createUser(email, password, firstName, lastName, roleId);
      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roleId: user.roleId
        }
      });
    } catch (err) {
      logger.error('Registration failed:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await UserService.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: 'User account is inactive' });
      }

      const passwordMatch = await comparePassword(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const permissions = await UserService.getUserPermissions(user.id);
      const { accessToken, refreshToken } = generateTokens({
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        role: user.role,
        permissions: permissions.map(p => p.name)
      });

      await UserService.updateLastLogin(user.id);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      logger.info(`User logged in: ${email}`);

      res.json({
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roleId: user.roleId,
          role: user.role,
          permissions: permissions.map(p => p.name)
        }
      });
    } catch (err) {
      logger.error('Login failed:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  static async logout(req, res) {
    try {
      res.clearCookie('refreshToken');
      logger.info('User logged out');
      res.json({ message: 'Logout successful' });
    } catch (err) {
      logger.error('Logout failed:', err);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  static async refreshToken(req, res) {
    try {
      const token = req.cookies.refreshToken || req.body.refreshToken;

      if (!token) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      const { verifyRefreshToken } = require('../../utils/jwt');
      const decoded = verifyRefreshToken(token);

      if (!decoded) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      const user = await UserService.getUserById(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(403).json({ error: 'User is no longer active' });
      }

      const permissions = await UserService.getUserPermissions(user.id);
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens({
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        role: user.role,
        permissions: permissions.map(p => p.name)
      });

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      logger.info(`Token refreshed for user: ${decoded.userId}`);

      res.json({
        message: 'Token refreshed',
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });
    } catch (err) {
      logger.error('Token refresh failed:', err);
      res.status(500).json({ error: 'Token refresh failed' });
    }
  }

  static async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const user = await UserService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const permissions = await UserService.getUserPermissions(userId);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roleId: user.roleId,
          role: user.role,
          permissions: permissions.map(p => p.name)
        }
      });
    } catch (err) {
      logger.error('Get profile failed:', err);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required' });

      const user = await UserService.getUserByEmail(email);
      if (!user) {
        // Security best practice: don't reveal if user exists
        return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
      }

      const { v4: uuidv4 } = require('uuid');
      const token = uuidv4();
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour

      await UserService.savePasswordResetToken(user.id, token, expiresAt);
      const EmailService = require('../services/EmailService');
      await EmailService.sendPasswordResetEmail(email, token);

      res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    } catch (err) {
      logger.error('Forgot password failed:', err);
      res.status(500).json({ error: 'Failed to process request' });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        logger.warn('ResetPassword failed: Missing token or newPassword');
        return res.status(400).json({ error: 'Token and newPassword are required' });
      }

      const userId = await UserService.verifyResetToken(token);
      if (!userId) {
        logger.warn(`ResetPassword failed: Invalid or expired token: ${token}`);
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      const { hashPassword } = require('../../utils/password');
      const hashedPassword = await hashPassword(newPassword);
      await UserService.updatePassword(userId, hashedPassword);
      await UserService.invalidateResetToken(token);

      res.json({ message: 'Password reset successfully' });
    } catch (err) {
      logger.error('Reset password failed:', err);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }
}

module.exports = AuthController;
