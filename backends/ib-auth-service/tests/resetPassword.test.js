const AuthController = require('../server/api/controllers/AuthController');
const UserService = require('../server/api/services/UserService');
const { hashPassword } = require('../server/utils/password');

jest.mock('../server/api/services/UserService');
jest.mock('../server/utils/password');

describe('AuthController - Reset Password', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
    });

    describe('resetPassword', () => {
        it('should reset password with valid token', async () => {
            req.body = { token: 'valid-token', newPassword: 'new-password-123' };
            UserService.verifyResetToken.mockResolvedValue('user-123');
            hashPassword.mockResolvedValue('new-hashed-password');
            UserService.updatePassword.mockResolvedValue(true);
            UserService.invalidateResetToken.mockResolvedValue(true);

            await AuthController.resetPassword(req, res);

            expect(UserService.updatePassword).toHaveBeenCalledWith('user-123', 'new-hashed-password');
            expect(UserService.invalidateResetToken).toHaveBeenCalledWith('valid-token');
            expect(res.json).toHaveBeenCalledWith({ message: 'Password reset successfully' });
        });

        it('should return error for invalid token', async () => {
            req.body = { token: 'invalid-token', newPassword: 'new-password-123' };
            UserService.verifyResetToken.mockResolvedValue(null);

            await AuthController.resetPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
        });
    });
});
