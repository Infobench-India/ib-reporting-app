const { v4: uuidv4 } = require('uuid');
const { getPool } = require('../../utils/db');
const logger = require('../../main/common/logger');

class SystemConfigService {
    static async getAll() {
        const pool = await getPool();
        try {
            const query = `
        SELECT id, [key], [value], description, createdAt, updatedAt
        FROM SystemConfigs
        ORDER BY [key];
      `;
            const result = await pool.request().query(query);

            // Parse JSON values
            return result.recordset.map(row => ({
                ...row,
                value: row.value ? JSON.parse(row.value) : null
            }));
        } catch (err) {
            logger.error('Get all system configs failed:', err);
            throw err;
        }
    }

    static async getByKey(key) {
        const pool = await getPool();
        try {
            const query = `
        SELECT id, [key], [value], description, createdAt, updatedAt
        FROM SystemConfigs
        WHERE [key] = @key;
      `;
            const result = await pool.request()
                .input('key', key)
                .query(query);

            const config = result.recordset[0];
            if (config && config.value) {
                config.value = JSON.parse(config.value);
            }
            return config || null;
        } catch (err) {
            logger.error(`Get system config by key (${key}) failed:`, err);
            throw err;
        }
    }

    static async upsert(key, value, description = null) {
        const pool = await getPool();
        try {
            const existing = await this.getByKey(key);
            const jsonValue = JSON.stringify(value);

            if (existing) {
                const query = `
          UPDATE SystemConfigs 
          SET [value] = @value, 
              description = COALESCE(@description, description),
              updatedAt = GETDATE()
          WHERE [key] = @key;
        `;
                await pool.request()
                    .input('key', key)
                    .input('value', jsonValue)
                    .input('description', description)
                    .query(query);

                logger.info(`System config updated: ${key}`);
                return await this.getByKey(key);
            } else {
                const id = uuidv4();
                const query = `
          INSERT INTO SystemConfigs (id, [key], [value], description, createdAt, updatedAt)
          VALUES (@id, @key, @value, @description, GETDATE(), GETDATE());
        `;
                await pool.request()
                    .input('id', id)
                    .input('key', key)
                    .input('value', jsonValue)
                    .input('description', description)
                    .query(query);

                logger.info(`System config created: ${key}`);
                return { id, key, value, description };
            }
        } catch (err) {
            logger.error(`Upsert system config (${key}) failed:`, err);
            throw err;
        }
    }

    static async delete(id) {
        const pool = await getPool();
        try {
            const query = `DELETE FROM SystemConfigs WHERE id = @id;`;
            await pool.request()
                .input('id', id)
                .query(query);

            logger.info(`System config deleted: ${id}`);
        } catch (err) {
            logger.error(`Delete system config (${id}) failed:`, err);
            throw err;
        }
    }
}

module.exports = SystemConfigService;
