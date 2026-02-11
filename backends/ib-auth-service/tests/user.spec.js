const request = require('supertest');
const bcrypt = require('bcryptjs');

jest.mock('../server/api/services/UserService', () => ({
  getUserByEmail: jest.fn(),
  getUserById: jest.fn(),
  getUserPermissions: jest.fn(),
  getAllUsers: jest.fn(),
  updateUserRole: jest.fn(),
}));

const UserService = require('../server/api/services/UserService');
const app = require('../server');

describe('User endpoints', () => {
  beforeAll(()=>{
    const passwordHash = bcrypt.hashSync('Test@123456', 10);
    UserService.getUserByEmail.mockResolvedValue({
      id: 'test-user-id',
      email: 'admin@infobench.in',
      firstName: 'Admin',
      lastName: 'User',
      passwordHash,
      roleId: 'role-admin-id',
      role: 'Admin',
      isActive: 1
    });

    UserService.getUserById.mockResolvedValue({
      id: 'test-user-id',
      email: 'admin@infobench.in',
      firstName: 'Admin',
      lastName: 'User',
      roleId: 'role-admin-id',
      role: 'Admin',
      isActive: 1
    });

    UserService.getUserPermissions.mockResolvedValue([
      { id: 'p1', name: 'read_report' }
    ]);

    UserService.getAllUsers.mockResolvedValue([
      { id: 'test-user-id', email: 'admin@infobench.in', firstName: 'Admin', lastName: 'User', role: 'Admin', roleId: 'role-admin-id' }
    ]);
  });

  test('GET /api/auth/users/:id returns user detail when authenticated as admin', async () => {
    // First login to obtain token
    const login = await request(app).post('/api/auth/login').send({ email: 'admin@infobench.in', password: 'Test@123456' });
    expect(login.statusCode).toBe(200);
    const token = login.body.accessToken;

    const res = await request(app).get('/api/auth/users/test-user-id').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('admin@infobench.in');
    expect(Array.isArray(res.body.user.permissions)).toBe(true);
  });
});
