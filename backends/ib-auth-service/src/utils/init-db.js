require('dotenv').config();
const { getPool } = require('./db');
const logger = require('../main/common/logger');

async function initializeDatabase() {
    let p;
    try {
        p = await getPool();
    } catch (err) {
        logger.error('Database initialization: could not connect:', err.message);
        return;
    }

    const isMssql = p.type === 'mssql';

    // Helper: run a statement, ignore "already exists" errors silently
    const run = async (sql) => {
        try {
            await p.query(sql);
        } catch (err) {
            const msg = err.message || '';
            if (msg.includes('already exists') || msg.includes('There is already an object')) return;
            logger.warn('Schema init warning:', msg);
        }
    };

    if (!isMssql) {
        // Enable pgcrypto for gen_random_uuid()
        // Enable the pgcrypto extension for gen_random_uuid()
        try {
            await run(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
            logger.info('pgcrypto extension enabled or already exists.');
        } catch (err) {
            logger.error('Error enabling pgcrypto extension:', err.message);
            throw err; // Stop if extension creation fails
        }
    }

    // ── Tables ─────────────────────────────────────────────────────────────────
    // NOTE: All table/column names are UNQUOTED so PostgreSQL stores them
    // lowercase, matching the unquoted identifiers used in service query strings.

    if (isMssql) {
        await run(`
            IF OBJECT_ID('Roles', 'U') IS NULL
            CREATE TABLE Roles (
                id NVARCHAR(36) PRIMARY KEY,
                name NVARCHAR(100) NOT NULL UNIQUE,
                description NVARCHAR(500),
                isActive BIT DEFAULT 1,
                createdAt DATETIME DEFAULT GETDATE(),
                updatedAt DATETIME DEFAULT GETDATE()
            )
        `);
        await run(`
            IF OBJECT_ID('Permissions', 'U') IS NULL
            CREATE TABLE Permissions (
                id NVARCHAR(36) PRIMARY KEY,
                name NVARCHAR(100) NOT NULL UNIQUE,
                description NVARCHAR(500),
                action NVARCHAR(50) NOT NULL,
                resource NVARCHAR(100) NOT NULL,
                isActive BIT DEFAULT 1,
                createdAt DATETIME DEFAULT GETDATE(),
                updatedAt DATETIME DEFAULT GETDATE()
            )
        `);
        await run(`
            IF OBJECT_ID('Users', 'U') IS NULL
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
            )
        `);
        await run(`IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IDX_Users_Email') CREATE INDEX IDX_Users_Email ON Users(email)`);
        await run(`
            IF OBJECT_ID('RolePermissions', 'U') IS NULL
            CREATE TABLE RolePermissions (
                roleId NVARCHAR(36) NOT NULL,
                permissionId NVARCHAR(36) NOT NULL,
                createdAt DATETIME DEFAULT GETDATE(),
                PRIMARY KEY (roleId, permissionId),
                FOREIGN KEY (roleId) REFERENCES Roles(id),
                FOREIGN KEY (permissionId) REFERENCES Permissions(id)
            )
        `);
        await run(`
            IF OBJECT_ID('AuditLog', 'U') IS NULL
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
            )
        `);
        await run(`
            IF OBJECT_ID('PasswordResets', 'U') IS NULL
            CREATE TABLE PasswordResets (
                id NVARCHAR(36) PRIMARY KEY,
                userId NVARCHAR(36) NOT NULL,
                token NVARCHAR(255) NOT NULL,
                expiresAt DATETIME NOT NULL,
                usedAt DATETIME,
                createdAt DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (userId) REFERENCES Users(id)
            )
        `);
        await run(`
            IF OBJECT_ID('SystemConfigs', 'U') IS NULL
            CREATE TABLE SystemConfigs (
                id NVARCHAR(36) PRIMARY KEY,
                [key] NVARCHAR(255) NOT NULL UNIQUE,
                [value] NVARCHAR(MAX) NOT NULL,
                description NVARCHAR(500),
                createdAt DATETIME DEFAULT GETDATE(),
                updatedAt DATETIME DEFAULT GETDATE()
            )
        `);
    } else {
        // PostgreSQL: use camelCase column names to match MSSQL style
        await run(`
            CREATE TABLE IF NOT EXISTS roles (
                id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
                name VARCHAR(100) NOT NULL UNIQUE,
                description VARCHAR(500),
                "isActive" INT DEFAULT 1,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await run(`
            CREATE TABLE IF NOT EXISTS permissions (
                id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
                name VARCHAR(100) NOT NULL UNIQUE,
                description VARCHAR(500),
                action VARCHAR(50) NOT NULL,
                resource VARCHAR(100) NOT NULL,
                "isActive" INT DEFAULT 1,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await run(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
                email VARCHAR(255) NOT NULL UNIQUE,
                "firstName" VARCHAR(100),
                "lastName" VARCHAR(100),
                "passwordHash" VARCHAR(255) NOT NULL,
                "roleId" VARCHAR(36) REFERENCES roles(id),
                "isActive" INT DEFAULT 1,
                "lastLogin" TIMESTAMP,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
        await run(`
            CREATE TABLE IF NOT EXISTS rolePermissions (
                "roleId" VARCHAR(36) NOT NULL REFERENCES roles(id),
                "permissionId" VARCHAR(36) NOT NULL REFERENCES permissions(id),
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY ("roleId", "permissionId")
            )
        `);
        await run(`
            CREATE TABLE IF NOT EXISTS auditLog (
                id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
                "userId" VARCHAR(36) REFERENCES users(id),
                action VARCHAR(100) NOT NULL,
                resource VARCHAR(100) NOT NULL,
                details TEXT,
                "ipAddress" VARCHAR(50),
                "statusCode" INT,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await run(`
            CREATE TABLE IF NOT EXISTS passwordResets (
                id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
                "userId" VARCHAR(36) NOT NULL REFERENCES users(id),
                token VARCHAR(255) NOT NULL,
                "expiresAt" TIMESTAMP NOT NULL,
                "usedAt" TIMESTAMP,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await run(`
            CREATE TABLE IF NOT EXISTS systemConfigs (
                id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
                key VARCHAR(255) NOT NULL UNIQUE,
                value TEXT NOT NULL,
                description VARCHAR(500),
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    // ── Seed: Default Roles ────────────────────────────────────────────────────
    const T_R = isMssql ? 'Roles' : 'roles';
    const T_P = isMssql ? 'Permissions' : 'permissions';
    const T_RP = isMssql ? 'RolePermissions' : 'rolePermissions';
    const newId = isMssql ? 'NEWID()' : "gen_random_uuid()::text";

    const checkRoles = await p.query(`SELECT COUNT(*) as cnt FROM ${T_R} WHERE name = 'Admin'`);
    const roleCount = parseInt(checkRoles.rows[0].cnt || checkRoles.rows[0].count || 0);

    if (roleCount === 0) {
        const roles = [
            { name: 'Admin', desc: 'Administrator with full access' },
            { name: 'Manager', desc: 'Manager with limited administrative access' },
            { name: 'User', desc: 'Standard user access' },
            { name: 'Viewer', desc: 'Read-only access' },
        ];
        for (const r of roles) {
            await run(`INSERT INTO ${T_R} (id, name, description) VALUES (${newId}, '${r.name}', '${r.desc}')`);
        }
        logger.info('Seeded default roles.');
    }

    // ── Seed: Default Permissions ──────────────────────────────────────────────
    const checkPerms = await p.query(`SELECT COUNT(*) as cnt FROM ${T_P} WHERE name = 'create_report'`);
    const permCount = parseInt(checkPerms.rows[0].cnt || checkPerms.rows[0].count || 0);
    const defaultPerms = [
        { name: 'create_report', desc: 'Can create reports', action: 'CREATE', resource: 'Report' },
        { name: 'read_report', desc: 'Can view reports', action: 'READ', resource: 'Report' },
        { name: 'update_report', desc: 'Can update reports', action: 'UPDATE', resource: 'Report' },
        { name: 'delete_report', desc: 'Can delete reports', action: 'DELETE', resource: 'Report' },
        { name: 'manage_users', desc: 'Can manage users', action: 'MANAGE', resource: 'User' },
        { name: 'manage_roles', desc: 'Can manage roles', action: 'MANAGE', resource: 'Role' },
        { name: 'view_analytics', desc: 'Can view analytics', action: 'READ', resource: 'Analytics' },
        { name: 'export_data', desc: 'Can export data', action: 'EXPORT', resource: 'Data' },
        { name: 'execute_terminal', desc: 'Can execute terminal commands', action: 'EXECUTE', resource: 'Terminal' },
    ];
    if (permCount === 0) {
        for (const perm of defaultPerms) {
            await run(`INSERT INTO ${T_P} (id, name, description, action, resource) VALUES (${newId}, '${perm.name}', '${perm.desc}', '${perm.action}', '${perm.resource}')`);
        }
        logger.info('Seeded default permissions.');
    }

    // ── Seed: Role-Permission Assignments ──────────────────────────────────────
    const checkRPs = await p.query(`SELECT COUNT(*) as cnt FROM ${T_RP}`);
    const rpCount = parseInt(checkRPs.rows[0].cnt || checkRPs.rows[0].count || 0);
    if (rpCount === 0) {
        const assignments = {
            Admin: defaultPerms.map(p => p.name),
            Manager: ['create_report', 'read_report', 'update_report', 'view_analytics', 'export_data'],
            User: ['read_report', 'view_analytics'],
            Viewer: ['read_report', 'view_analytics'],
        };
        const roleIdCol = isMssql ? 'roleId' : 'roleId';
        const permIdCol = isMssql ? 'permissionId' : 'permissionId';
        for (const [roleName, perms] of Object.entries(assignments)) {
            for (const permName of perms) {
                await run(`
                    INSERT INTO ${T_RP} (${roleIdCol}, ${permIdCol})
                    SELECT r.id, p.id FROM ${T_R} r, ${T_P} p
                    WHERE r.name = '${roleName}' AND p.name = '${permName}'
                `);
            }
        }
        logger.info('Seeded default role-permission assignments.');
    }

    logger.info('Database schema initialization complete.');
}

module.exports = { initializeDatabase };