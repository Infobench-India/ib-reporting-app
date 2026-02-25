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

        // Find the Admin role ID
        const roleResult = await pool.query("SELECT id FROM Roles WHERE name = 'Admin'");
        console.log(roleResult);
        if (roleResult.rows.length === 0) {
            throw new Error("Admin role not found in database. Please run 'yarn init-db' first.");
        }
        const adminRoleId = roleResult.rows[0].id;

        // Update the user's role
        const updateResult = await pool.query(`UPDATE Users SET "roleId" = @roleId WHERE email = @email`, { email, roleId: adminRoleId });
        console.log(updateResult);
        if (updateResult?.rowsAffected?.[0] === 0) {
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
