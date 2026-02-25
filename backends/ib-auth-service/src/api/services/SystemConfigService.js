const { v4: uuidv4 } = require('uuid');
const { getPool } = require('../../utils/db');
const logger = require('../../main/common/logger');

class SystemConfigService {
    static async getAll() {
        const p = await getPool();
        try {
            const query = `
        SELECT id, ${p.escapeIdentifier('key')}, ${p.escapeIdentifier('value')}, description, "createdAt", "updatedAt"
        FROM SystemConfigs
        ORDER BY ${p.escapeIdentifier('key')};
      `;
            const result = await p.query(query);

            // Parse JSON values
            return result.rows.map(row => ({
                ...row,
                value: row.value ? JSON.parse(row.value) : null
            }));
        } catch (err) {
            logger.error('Get all system configs failed:', err);
            throw err;
        }
    }

    static async getByKey(key) {
        const p = await getPool();
        try {
            const query = `
        SELECT id, ${p.escapeIdentifier('key')}, ${p.escapeIdentifier('value')}, description, "createdAt", "updatedAt"
        FROM SystemConfigs
        WHERE ${p.escapeIdentifier('key')} = @key;
      `;
            const result = await p.query(query, { key });

            const config = result.rows[0];
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
        const p = await getPool();
        try {
            const existing = await this.getByKey(key);
            const jsonValue = JSON.stringify(value);

            if (existing) {
                const query = `
          UPDATE SystemConfigs 
          SET ${p.escapeIdentifier('value')} = @value, 
              description = COALESCE(@description, description),
              updatedAt = ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'}
          WHERE ${p.escapeIdentifier('key')} = @key;
        `;
                await p.query(query, {
                    key,
                    value: jsonValue,
                    description
                });

                logger.info(`System config updated: ${key}`);
                return await this.getByKey(key);
            } else {
                const id = uuidv4();
                const query = `
          INSERT INTO SystemConfigs (id, ${p.escapeIdentifier('key')}, ${p.escapeIdentifier('value')}, description, "createdAt", "updatedAt")
          VALUES (@id, @key, @value, @description, ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'}, ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'});
        `;
                await p.query(query, {
                    id,
                    key,
                    value: jsonValue,
                    description
                });

                logger.info(`System config created: ${key}`);
                return { id, key, value, description };
            }
        } catch (err) {
            logger.error(`Upsert system config (${key}) failed:`, err);
            throw err;
        }
    }

    static async delete(id) {
        const p = await getPool();
        try {
            const query = `DELETE FROM SystemConfigs WHERE id = @id;`;
            await p.query(query, { id });

            logger.info(`System config deleted: ${id}`);
        } catch (err) {
            logger.error(`Delete system config (${id}) failed:`, err);
            throw err;
        }
    }
}

module.exports = SystemConfigService;
