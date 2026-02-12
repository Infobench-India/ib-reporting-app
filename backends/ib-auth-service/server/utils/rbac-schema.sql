-- RBAC Database Schema Initialization Script
-- Run this in your SQL Server database

-- Create Tables
IF OBJECT_ID('Users', 'U') IS NULL
BEGIN
    CREATE TABLE Users (
        id NVARCHAR(36) PRIMARY KEY,
        email NVARCHAR(255) NOT NULL UNIQUE,
        firstName NVARCHAR(100),
        lastName NVARCHAR(100),
        passwordHash NVARCHAR(255) NOT NULL,
        roleId NVARCHAR(36),
        isActive BIT DEFAULT 1,
        lastLogin DATETIME,
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE()
    );
    CREATE INDEX IDX_Users_Email ON Users(email);
    CREATE INDEX IDX_Users_RoleId ON Users(roleId);
END;

IF OBJECT_ID('Roles', 'U') IS NULL
BEGIN
    CREATE TABLE Roles (
        id NVARCHAR(36) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(500),
        isActive BIT DEFAULT 1,
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE()
    );
END;

IF OBJECT_ID('Permissions', 'U') IS NULL
BEGIN
    CREATE TABLE Permissions (
        id NVARCHAR(36) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(500),
        action NVARCHAR(50) NOT NULL,
        resource NVARCHAR(100) NOT NULL,
        isActive BIT DEFAULT 1,
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE()
    );
    CREATE INDEX IDX_Permissions_Resource_Action ON Permissions(resource, action);
END;

IF OBJECT_ID('RolePermissions', 'U') IS NULL
BEGIN
    CREATE TABLE RolePermissions (
        roleId NVARCHAR(36) NOT NULL,
        permissionId NVARCHAR(36) NOT NULL,
        createdAt DATETIME DEFAULT GETDATE(),
        PRIMARY KEY (roleId, permissionId),
        FOREIGN KEY (roleId) REFERENCES Roles(id),
        FOREIGN KEY (permissionId) REFERENCES Permissions(id)
    );
END;

IF OBJECT_ID('AuditLog', 'U') IS NULL
BEGIN
    CREATE TABLE AuditLog (
        id NVARCHAR(36) PRIMARY KEY,
        userId NVARCHAR(36),
        action NVARCHAR(100) NOT NULL,
        resource NVARCHAR(100) NOT NULL,
        details NVARCHAR(MAX),
        ipAddress NVARCHAR(50),
        statusCode INT,
        createdAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id)
    );
    CREATE INDEX IDX_AuditLog_UserId ON AuditLog(userId);
    CREATE INDEX IDX_AuditLog_CreatedAt ON AuditLog(createdAt);
END;

-- Add foreign key for Users.roleId
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_NAME = 'Users' AND CONSTRAINT_TYPE = 'FOREIGN KEY' AND CONSTRAINT_NAME = 'FK_Users_RoleId')
BEGIN
    ALTER TABLE Users ADD CONSTRAINT FK_Users_RoleId FOREIGN KEY (roleId) REFERENCES Roles(id);
END;

-- Insert Default Roles
IF NOT EXISTS (SELECT 1 FROM Roles WHERE name = 'Admin')
BEGIN
    INSERT INTO Roles (id, name, description) VALUES (NEWID(), 'Admin', 'Administrator with full access');
    INSERT INTO Roles (id, name, description) VALUES (NEWID(), 'Manager', 'Manager with limited administrative access');
    INSERT INTO Roles (id, name, description) VALUES (NEWID(), 'User', 'Standard user access');
    INSERT INTO Roles (id, name, description) VALUES (NEWID(), 'Viewer', 'Read-only access');
END;

-- Insert Default Permissions
IF NOT EXISTS (SELECT 1 FROM Permissions WHERE name = 'create_report')
BEGIN
    INSERT INTO Permissions (id, name, description, action, resource) VALUES (NEWID(), 'create_report', 'Can create reports', 'CREATE', 'Report');
    INSERT INTO Permissions (id, name, description, action, resource) VALUES (NEWID(), 'read_report', 'Can view reports', 'READ', 'Report');
    INSERT INTO Permissions (id, name, description, action, resource) VALUES (NEWID(), 'update_report', 'Can update reports', 'UPDATE', 'Report');
    INSERT INTO Permissions (id, name, description, action, resource) VALUES (NEWID(), 'delete_report', 'Can delete reports', 'DELETE', 'Report');
    INSERT INTO Permissions (id, name, description, action, resource) VALUES (NEWID(), 'manage_users', 'Can manage users', 'MANAGE', 'User');
    INSERT INTO Permissions (id, name, description, action, resource) VALUES (NEWID(), 'manage_roles', 'Can manage roles', 'MANAGE', 'Role');
    INSERT INTO Permissions (id, name, description, action, resource) VALUES (NEWID(), 'view_analytics', 'Can view analytics', 'READ', 'Analytics');
    INSERT INTO Permissions (id, name, description, action, resource) VALUES (NEWID(), 'export_data', 'Can export data', 'EXPORT', 'Data');
    INSERT INTO Permissions (id, name, description, action, resource) VALUES (NEWID(), 'execute_terminal', 'Can execute terminal commands', 'EXECUTE', 'Terminal');
END;

-- Assign Permissions to Admin Role
IF NOT EXISTS (SELECT 1 FROM RolePermissions WHERE roleId = (SELECT id FROM Roles WHERE name = 'Admin') AND permissionId = (SELECT id FROM Permissions WHERE name = 'create_report'))
BEGIN
    INSERT INTO RolePermissions (roleId, permissionId)
    SELECT r.id, p.id FROM Roles r, Permissions p WHERE r.name = 'Admin';
END;

-- Assign Permissions to Manager Role
IF NOT EXISTS (SELECT 1 FROM RolePermissions WHERE roleId = (SELECT id FROM Roles WHERE name = 'Manager') AND permissionId = (SELECT id FROM Permissions WHERE name = 'create_report'))
BEGIN
    INSERT INTO RolePermissions (roleId, permissionId)
    SELECT r.id, p.id FROM Roles r, Permissions p 
    WHERE r.name = 'Manager' AND p.name IN ('create_report', 'read_report', 'update_report', 'view_analytics', 'export_data');
END;

-- Assign Permissions to User Role
IF NOT EXISTS (SELECT 1 FROM RolePermissions WHERE roleId = (SELECT id FROM Roles WHERE name = 'User') AND permissionId = (SELECT id FROM Permissions WHERE name = 'create_report'))
BEGIN
    INSERT INTO RolePermissions (roleId, permissionId)
    SELECT r.id, p.id FROM Roles r, Permissions p 
    WHERE r.name = 'User' AND p.name IN ('read_report', 'view_analytics');
END;

-- Assign Permissions to Viewer Role
IF NOT EXISTS (SELECT 1 FROM RolePermissions WHERE roleId = (SELECT id FROM Roles WHERE name = 'Viewer') AND permissionId = (SELECT id FROM Permissions WHERE name = 'read_report'))
BEGIN
    INSERT INTO RolePermissions (roleId, permissionId)
    SELECT r.id, p.id FROM Roles r, Permissions p 
    WHERE r.name = 'Viewer' AND p.name IN ('read_report', 'view_analytics');
END;

PRINT 'RBAC Schema initialized successfully!';

-- Password reset tokens table
IF OBJECT_ID('PasswordResets', 'U') IS NULL
BEGIN
    CREATE TABLE PasswordResets (
        id UNIQUEIDENTIFIER PRIMARY KEY,
        userId NVARCHAR(36) NOT NULL,
        token NVARCHAR(255) NOT NULL,
        expiresAt DATETIME NOT NULL,
        usedAt DATETIME NULL,
        createdAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (userId) REFERENCES Users(id)
    );
    CREATE INDEX IX_PasswordResets_Token ON PasswordResets(token);
END;

-- System configurations table
IF OBJECT_ID('SystemConfigs', 'U') IS NULL
BEGIN
    CREATE TABLE SystemConfigs (
        id NVARCHAR(36) PRIMARY KEY,
        [key] NVARCHAR(255) NOT NULL UNIQUE,
        [value] NVARCHAR(MAX) NOT NULL,
        description NVARCHAR(500),
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE(),
        CONSTRAINT CK_SystemConfigs_Value_IsJSON CHECK (ISJSON([value]) > 0)
    );
    CREATE INDEX IDX_SystemConfigs_Key ON SystemConfigs([key]);
END;
