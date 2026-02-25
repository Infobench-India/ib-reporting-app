const sql = require('mssql');
const { Pool } = require('pg');
const logger = require('../main/common/logger');

class MssqlProvider {
    constructor(config) {
        this.type = 'mssql';
        this.pool = new sql.ConnectionPool(config);
    }

    async connect() {
        return this.pool.connect();
    }

    async query(queryString, params = {}) {
        const request = this.pool.request();
        for (const [key, value] of Object.entries(params)) {
            request.input(key, value);
        }
        const result = await request.query(queryString);
        return {
            rows: result.recordset || [],
            rowCount: result.rowsAffected ? result.rowsAffected[0] : 0,
            fields: result.recordset?.columns ? Object.keys(result.recordset.columns) : []
        };
    }

    async executeInsert(tableName, columns, values, params) {
        const sql = `INSERT INTO ${tableName} (${columns}) OUTPUT INSERTED.* VALUES (${values})`;
        return this.query(sql, params);
    }

    getPaginationSnippet(offset, limit) {
        return `OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;
    }

    getInsertOutputSnippet() {
        return 'OUTPUT INSERTED.*';
    }

    escapeIdentifier(id) {
        return `[${id}]`;
    }

    getIdentityType() {
        return 'INT PRIMARY KEY IDENTITY(1,1)';
    }

    getTimestampType() {
        return 'DATETIME DEFAULT GETDATE()';
    }
}

class PostgresProvider {
    constructor(config) {
        this.type = 'postgres';
        // Map MSSQL style config to PG style if needed
        this.pool = new Pool({
            host: config.server,
            database: config.database,
            user: config.user,
            password: config.password,
            port: config.port || 5432,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
    }

    async connect() {
        return this.pool.connect();
    }

    async query(queryString, params = {}) {
        // Convert @param to $1, $2 style
        let pgQuery = queryString;
        const values = [];
        let i = 1;

        // Use a sorted list of keys by length descending to avoid partial replacements (e.g., @name vs @name_full)
        const sortedKeys = Object.keys(params).sort((a, b) => b.length - a.length);

        for (const key of sortedKeys) {
            const regex = new RegExp(`@${key}\\b`, 'g');
            if (pgQuery.match(regex)) {
                pgQuery = pgQuery.replace(regex, `$${i++}`);
                values.push(params[key]);
            }
        }

        const result = await this.pool.query(pgQuery, values);
        return {
            rows: result.rows,
            rowCount: result.rowCount,
            fields: result.fields.map(f => f.name)
        };
    }

    async executeInsert(tableName, columns, values, params) {
        const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${values}) RETURNING *`;
        return this.query(sql, params);
    }

    getPaginationSnippet(offset, limit) {
        return `LIMIT ${limit} OFFSET ${offset}`;
    }

    getInsertOutputSnippet() {
        return 'RETURNING *';
    }

    escapeIdentifier(id) {
        return `"${id}"`;
    }

    getIdentityType() {
        return 'SERIAL PRIMARY KEY';
    }

    getTimestampType() {
        return 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
    }
}

function createProvider(connConfig) {
    const rawDbType = (process.env.DB_TYPE || 'mssql').toLowerCase();
    // Tolerate common typos like 'postgress' (extra 's')
    const isPostgresType = rawDbType.startsWith('postgres');

    // Auto-detect from URL
    let detectedType = isPostgresType ? 'postgres' : 'mssql';
    if (connConfig.url && (connConfig.url.startsWith('postgres://') || connConfig.url.startsWith('postgresql://'))) {
        detectedType = 'postgres';
    }

    // Normalize discrete config: DB_HOST -> server, DB_NAME -> database
    const normalized = { ...connConfig };
    if (!normalized.server && (normalized.host || process.env.DB_HOST)) {
        normalized.server = normalized.host || process.env.DB_HOST;
    }
    if (!normalized.database && (normalized.dbname || normalized.name || process.env.DB_NAME)) {
        normalized.database = normalized.dbname || normalized.name || process.env.DB_NAME;
    }
    if (!normalized.user && process.env.DB_USER) normalized.user = process.env.DB_USER;
    if (!normalized.password && process.env.DB_PASSWORD) normalized.password = process.env.DB_PASSWORD;

    if (detectedType === 'postgres') {
        return new PostgresProvider(normalized);
    }
    return new MssqlProvider(normalized);
}

module.exports = { createProvider };
