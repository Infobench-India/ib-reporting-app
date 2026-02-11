const { authenticate, authorize, authorizeRoles } = require('../server/middleware/auth');
const jwt = require('jsonwebtoken');

describe('Authentication Middleware', () => {
  const jwtSecret = 'test-secret';
  let req, res, next;

  beforeEach(() => {
    process.env.JWT_SECRET = jwtSecret;
    
    req = {
      headers: {},
      user: null
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  test('should call next if valid token provided', () => {
    const token = jwt.sign(
      { userId: 'test-id', email: 'test@example.com' },
      jwtSecret
    );
    
    req.headers.authorization = `Bearer ${token}`;
    
    authenticate(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should return 401 if no token provided', () => {
    authenticate(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('required')
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 if invalid token provided', () => {
    req.headers.authorization = 'Bearer invalid-token';
    
    authenticate(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('Authorization Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: {
        userId: 'test-id',
        permissions: ['read_report', 'view_analytics']
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  test('should call next if user has required permission', () => {
    const middleware = authorize(['read_report']);
    middleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should return 403 if user lacks required permission', () => {
    const middleware = authorize(['delete_report']);
    middleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining('Insufficient')
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test('should call next if no permissions required', () => {
    const middleware = authorize([]);
    middleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should call next if user has any of multiple required permissions', () => {
    const middleware = authorize(['delete_report', 'read_report']);
    middleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
  });
});

describe('Role Authorization Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: {
        userId: 'test-id',
        role: 'Admin'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    next = jest.fn();
  });

  test('should call next if user has required role', () => {
    const middleware = authorizeRoles(['Admin']);
    middleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should return 403 if user lacks required role', () => {
    const middleware = authorizeRoles(['SuperAdmin']);
    middleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('should call next if user has any of multiple required roles', () => {
    const middleware = authorizeRoles(['User', 'Admin']);
    middleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
  });

  test('should call next if no roles required', () => {
    const middleware = authorizeRoles([]);
    middleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
  });
});
