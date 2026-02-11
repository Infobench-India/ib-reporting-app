const request = require('supertest');
const bcrypt = require('bcryptjs');

// Mock UserService to avoid DB dependency
jest.mock('../server/api/services/UserService', () => ({
  getUserByEmail: jest.fn(),
  getUserById: jest.fn(),
  getUserPermissions: jest.fn(),
  updateLastLogin: jest.fn(),
}));

const UserService = require('../server/api/services/UserService');
const app = require('../server');

describe('Auth API', () => {
  beforeAll(() => {
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

    UserService.getUserPermissions.mockResolvedValue([
      { id: 'p1', name: 'read_report' },
      { id: 'p2', name: 'create_report' }
    ]);
  });

  test('health endpoint responds', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status');
  });

  test('login with valid credentials returns tokens and user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@infobench.in', password: 'Test@123456' })
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('admin@infobench.in');
  });
});
