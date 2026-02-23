require('dotenv').config();
const { getPool } = require('./db');
const logger = require('../main/common/logger');

async function promoteUser() {
    const email = process.argv[2];

    if (!email) {
        console.error('Usage: node promote-user.js <email>');
        process.exit(1);
    }

    try {
        logger.info(`Attempting to promote user ${email} to Admin...`);
        const pool = await getPool();
        const request = pool.request();

        // Find the Admin role ID
        const roleResult = await request.query("SELECT id FROM Roles WHERE name = 'Admin'");
        if (roleResult.recordset.length === 0) {
            throw new Error("Admin role not found in database. Please run 'yarn init-db' first.");
        }
        const adminRoleId = roleResult.recordset[0].id;

        // Update the user's role
        request.input('email', email);
        request.input('roleId', adminRoleId);

        const updateResult = await request.query("UPDATE Users SET roleId = @roleId WHERE email = @email");

        if (updateResult.rowsAffected[0] === 0) {
            logger.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        logger.info(`Successfully promoted ${email} to Admin!`);
        process.exit(0);
    } catch (err) {
        logger.error('Promotion failed:', err);
        process.exit(1);
    }
}

promoteUser();
