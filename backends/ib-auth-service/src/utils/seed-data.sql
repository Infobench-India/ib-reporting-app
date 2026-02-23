-- Sample users for testing
-- Password for all users: Test@123456

DECLARE @AdminRoleId NVARCHAR(36) = (SELECT id FROM Roles WHERE name = 'Admin');
DECLARE @ManagerRoleId NVARCHAR(36) = (SELECT id FROM Roles WHERE name = 'Manager');
DECLARE @UserRoleId NVARCHAR(36) = (SELECT id FROM Roles WHERE name = 'User');
DECLARE @ViewerRoleId NVARCHAR(36) = (SELECT id FROM Roles WHERE name = 'Viewer');

-- Insert sample users (bcrypt hash for 'Test@123456')
INSERT INTO Users (id, email, firstName, lastName, passwordHash, roleId, isActive)
SELECT 
    NEWID(),
    'admin@infobench.in',
    'Admin',
    'User',
    '$2a$10$YourHashedPasswordHere', -- Replace with actual bcrypt hash
    @AdminRoleId,
    1
WHERE NOT EXISTS (SELECT 1 FROM Users WHERE email = 'admin@infobench.in');

INSERT INTO Users (id, email, firstName, lastName, passwordHash, roleId, isActive)
SELECT 
    NEWID(),
    'manager@infobench.in',
    'Manager',
    'User',
    '$2a$10$YourHashedPasswordHere', -- Replace with actual bcrypt hash
    @ManagerRoleId,
    1
WHERE NOT EXISTS (SELECT 1 FROM Users WHERE email = 'manager@infobench.in');

INSERT INTO Users (id, email, firstName, lastName, passwordHash, roleId, isActive)
SELECT 
    NEWID(),
    'user@infobench.in',
    'Regular',
    'User',
    '$2a$10$YourHashedPasswordHere', -- Replace with actual bcrypt hash
    @UserRoleId,
    1
WHERE NOT EXISTS (SELECT 1 FROM Users WHERE email = 'user@infobench.in');

INSERT INTO Users (id, email, firstName, lastName, passwordHash, roleId, isActive)
SELECT 
    NEWID(),
    'viewer@infobench.in',
    'View',
    'Only',
    '$2a$10$YourHashedPasswordHere', -- Replace with actual bcrypt hash
    @ViewerRoleId,
    1
WHERE NOT EXISTS (SELECT 1 FROM Users WHERE email = 'viewer@infobench.in');

PRINT 'Sample users inserted successfully!';
