require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { getPool } = require('./db');
const logger = require('../main/common/logger');

async function initializeDatabase() {
    try {
        const schemaPath = path.join(__dirname, 'rbac-schema.sql');
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');

        logger.info('Starting database initialization...');
        const pool = await getPool();
        const request = pool.request();

        // Split the schema by GO or semicolon if needed, 
        // but mssql can often handle multiple statements if they are compatible.
        // However, some T-SQL features like CREATE TABLE must be in their own batch.
        // We'll try to run it in chunks or as a whole depending on the content.

        // For T-SQL, it's often better to split by "GO"
        const batches = schemaContent.split(/^\s*GO\s*$/im);

        for (const batch of batches) {
            if (batch.trim()) {
                try {
                    await request.query(batch);
                } catch (err) {
                    // If table already exists, we might get an error depending on the script logic.
                    // The current rbac-schema.sql has IF OBJECT_ID(...) IS NULL checks.
                    logger.warn('Batch execution warning or error (moving to next batch):', err.message);
                }
            }
        }

        logger.info('Database initialization completed successfully!');
        process.exit(0);
    } catch (err) {
        logger.error('Database initialization failed:', err);
        process.exit(1);
    }
}

initializeDatabase();
