const UserService = require('../server/api/services/UserService');
const { getPool } = require('../server/utils/db');
const { hashPassword } = require('../server/utils/password');

jest.mock('../server/utils/db');
jest.mock('../server/utils/password');

describe('UserService', () => {
    describe('createUser', () => {
        it('should create a new user successfully', async () => {
            const mockPool = {
                request: jest.fn().mockReturnThis(),
                input: jest.fn().mockReturnThis(),
                query: jest.fn().mockResolvedValue({}),
            };
            getPool.mockResolvedValue(mockPool);
            hashPassword.mockResolvedValue('hashedPassword');

            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'Test',
                lastName: 'User',
                roleId: 'role-uuid'
            };

            const result = await UserService.createUser(
                userData.email,
                userData.password,
                userData.firstName,
                userData.lastName,
                userData.roleId
            );

            expect(result).toHaveProperty('id');
            expect(result.email).toBe(userData.email);
            expect(mockPool.query).toHaveBeenCalled();
        });
    });
});
