const AuthController = require('../server/api/controllers/AuthController');
const UserService = require('../server/api/services/UserService');
const EmailService = require('../server/api/services/EmailService');

jest.mock('../server/api/services/UserService');
jest.mock('../server/api/services/EmailService');

describe('AuthController - Forgot Password', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
    });

    describe('forgotPassword', () => {
        it('should send a reset email if user exists', async () => {
            req.body.email = 'test@example.com';
            UserService.getUserByEmail.mockResolvedValue({ id: 'user-123', email: 'test@example.com' });
            UserService.savePasswordResetToken.mockResolvedValue(true);
            EmailService.sendPasswordResetEmail.mockResolvedValue(true);

            await AuthController.forgotPassword(req, res);

            expect(UserService.savePasswordResetToken).toHaveBeenCalled();
            expect(EmailService.sendPasswordResetEmail).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
        });
    });
});
