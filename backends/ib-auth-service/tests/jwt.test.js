const jwt = require('jsonwebtoken');
const { generateTokens, verifyAccessToken } = require('../server/utils/jwt');

describe('JWT Utilities', () => {
  const jwtSecret = 'test-secret';
  const user = {
    userId: 'test-user-id',
    email: 'test@example.com',
    roleId: 'test-role-id',
    role: 'User',
    permissions: ['read_report', 'view_analytics']
  };

  beforeAll(() => {
    process.env.JWT_SECRET = jwtSecret;
    process.env.JWT_EXPIRY = '15m';
  });

  test('should generate valid access and refresh tokens', () => {
    const tokens = generateTokens(user);
    
    expect(tokens).toHaveProperty('accessToken');
    expect(tokens).toHaveProperty('refreshToken');
    expect(typeof tokens.accessToken).toBe('string');
    expect(typeof tokens.refreshToken).toBe('string');
  });

  test('access token should contain user claims', () => {
    const tokens = generateTokens(user);
    const decoded = jwt.decode(tokens.accessToken);
    
    expect(decoded.userId).toBe(user.userId);
    expect(decoded.email).toBe(user.email);
    expect(decoded.role).toBe(user.role);
    expect(decoded.permissions).toEqual(user.permissions);
  });

  test('should verify valid access token', () => {
    const tokens = generateTokens(user);
    const decoded = verifyAccessToken(tokens.accessToken);
    
    expect(decoded).not.toBeNull();
    expect(decoded.userId).toBe(user.userId);
  });

  test('should return null for invalid token', () => {
    const decoded = verifyAccessToken('invalid-token');
    expect(decoded).toBeNull();
  });

  test('should return null for expired token', (done) => {
    const expiredToken = jwt.sign(user, jwtSecret, { expiresIn: '0s' });
    
    // Wait a bit for token to expire
    setTimeout(() => {
      const decoded = verifyAccessToken(expiredToken);
      expect(decoded).toBeNull();
      done();
    }, 1000);
  });
});
