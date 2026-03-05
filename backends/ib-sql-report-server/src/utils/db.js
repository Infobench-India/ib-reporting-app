const { createProvider } = require('./dbProvider');
const config = require('../config');
const logger = require('../main/common/logger');

let provider;
const dynamicProviders = new Map();

/**
 * Processes connection string to ensure required drivers and trusted connection flags are present
 */
function prepareConnectionString(connStr = '') {
    let sqlUri = (connStr || '').trim();

    // 1. Strip surrounding quotes
    if ((sqlUri.startsWith('"') && sqlUri.endsWith('"')) ||
        (sqlUri.startsWith("'") && sqlUri.endsWith("'"))) {
        sqlUri = sqlUri.slice(1, -1);
    }

    const lowerUri = sqlUri.toLowerCase();

    // Handle Postgres strings early
    if (lowerUri.startsWith('postgres://') || lowerUri.startsWith('postgresql://')) {
        return { isPostgres: true, sqlUri };
    }

    // 2. Detect Windows auth (MSSQL only)
    const isTrusted =
        lowerUri.includes('trusted_connection=true') ||
        lowerUri.includes('trusted_connection=yes') ||
        lowerUri.includes('integrated security=sspi') ||
        (!lowerUri.includes('user id=') && !lowerUri.includes('uid='));

    // 3. Normalize Trusted_Connection=yes
    if (lowerUri.includes('trusted_connection=true')) {
        sqlUri = sqlUri.replace(/trusted_connection=true/gi, 'Trusted_Connection=yes');
    }

    // 5. Extract Server, Database, User and Password
    const serverMatch = sqlUri.match(/(?:Server|Data Source)=([^;]+)/i);
    const dbMatch = sqlUri.match(/(?:Database|Initial Catalog)=([^;]+)/i);
    const userMatch = sqlUri.match(/(?:User ID|Uid)=([^;]+)/i);
    const pwdMatch = sqlUri.match(/(?:Password|Pwd)=([^;]+)/i);

    const server = (serverMatch ? serverMatch[1].trim() : '').replace(/\\\\/g, '\\');
    const database = dbMatch ? dbMatch[1].trim() : '';
    const user = userMatch ? userMatch[1].trim() : '';
    const password = pwdMatch ? pwdMatch[1].trim() : '';

    return { isPostgres: false, sqlUri, isTrusted, server, database, user, password };
}

const getPool = async (connString = null) => {
    const targetConnStr = connString || config.sqlUri;

    if (!connString && provider) return provider;
    if (connString && dynamicProviders.has(connString)) return dynamicProviders.get(connString);

    try {
        let p;
        if (!targetConnStr && config.dbConfig && config.dbConfig.database) {
            // Use discrete config from env vars
            p = createProvider(config.dbConfig);
        } else {
            const info = prepareConnectionString(targetConnStr);
            if (info.isPostgres) {
                p = createProvider({ url: info.sqlUri });
            } else {
                let [host, instanceName] = (info.server || '').split('\\');
                // Keep the original hostname for named instances so that tedious can
                // contact SQL Server Browser (UDP 1434) to resolve the instance port.
                // Replacing with '127.0.0.1' breaks auto-discovery for named instances.
                const cleanHost = host || 'localhost';
                const mssqlConfig = {
                    server: cleanHost,
                    database: info.database,
                    user: info.user,
                    password: info.password,
                    options: {
                        encrypt: false,
                        trustServerCertificate: true,
                    }
                };
                if (instanceName) {
                    mssqlConfig.options.instanceName = instanceName;
                }
                p = createProvider(mssqlConfig);
            }
        }

        await p.connect();

        if (!connString) {
            provider = p;
            logger.info(`Connected to Config Database (${p.type.toUpperCase()})`);
        } else {
            dynamicProviders.set(connString, p);
            logger.info(`New dynamic provider created (${p.type.toUpperCase()})`);
        }

        return p;
    } catch (err) {
        logger.error(`Database Connection Failed: `, err);
        throw err;
    }
};

const ensureReportTable = async (p, tableName, columnsString) => {
    try {
        const cleanTableName = (tableName || '').trim().replace(/[\[\]"]/g, '');
        if (!cleanTableName) return;

        // Dialect specific check
        let query;
        if (p.type === 'mssql') {
            query = "SELECT * FROM sys.tables WHERE name = @tableName";
        } else {
            query = "SELECT table_name FROM information_schema.tables WHERE table_name = @tableName";
        }

        const checkRes = await p.query(query, { tableName: cleanTableName });

        if (checkRes.rows.length === 0) {
            const columns = (columnsString || '').split(',')
                .map(col => col.trim())
                .filter(col => col.length > 0);

            if (columns.length === 0) return;

            const colType = p.type === 'mssql' ? 'NVARCHAR(MAX)' : 'TEXT';
            const colDefs = columns.map(col => `${p.escapeIdentifier(col)} ${colType}`).join(', ');
            const createQuery = `CREATE TABLE ${p.escapeIdentifier(cleanTableName)} (${p.getIdentityType()}, ${colDefs})`;

            await p.query(createQuery);
            logger.info(`Table ${cleanTableName} created successfully (${p.type}).`);
        }
    } catch (err) {
        logger.error(`Error ensuring report table ${tableName}:`, err);
    }
};

const ensureTables = async (ConnectionString) => {
    try {
        const p = await getPool(ConnectionString);
        logger.info(`Ensuring database tables exist (${p.type})...`);

        const isMssql = p.type === 'mssql';
        const type_id = p.getIdentityType();
        const type_text = isMssql ? 'NVARCHAR(MAX)' : 'TEXT';
        const type_string = isMssql ? 'NVARCHAR(255)' : 'VARCHAR(255)';
        const type_timestamp = p.getTimestampType();
        const type_bit = isMssql ? 'BIT' : 'BOOLEAN';

        const tableQuery = (name, schema) => {
            if (isMssql) {
                return `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '${name}') BEGIN ${schema} END`;
            } else {
                return schema.replace('CREATE TABLE', 'CREATE TABLE IF NOT EXISTS');
            }
        };

        // 1. ReportSettings
        await p.query(tableQuery('ReportSettings', `
            CREATE TABLE ReportSettings (
                id ${type_id},
                exportFolder ${type_text},
                ConnectionString ${type_text},
                ConnectionString1 ${type_text},
                ConnectionString2 ${type_text},
                AlarmReportConnectionString ${type_text}
            )
        `));

        // 2. ReportConfigs
        await p.query(tableQuery('ReportConfigs', `
            CREATE TABLE ReportConfigs (
                id ${type_id},
                category ${type_string} NOT NULL,
                name ${type_string} NOT NULL UNIQUE,
                tableName ${type_string} NOT NULL,
                templateName ${type_string} NOT NULL,
                ${p.escapeIdentifier('columns')} ${type_text},
                connectionString ${type_text} NOT NULL,
                ${p.escapeIdentifier('query')} ${type_text} NOT NULL,
                maxRowPerPage INT DEFAULT 0,
                maxAvailableRowPerPage INT DEFAULT 0,
                sumStartColumnNumber INT DEFAULT 0,
                maxSumStartColumnNumber INT DEFAULT 0,
                reportHeaderBlankRowCount INT DEFAULT 0,
                reportHeaderStartRowNo INT DEFAULT 0,
                reportHeaderRowCount INT DEFAULT 0,
                tableHeaderStartRowNo INT DEFAULT 0,
                tableHeaderRowCount INT DEFAULT 0,
                reportDateRow INT DEFAULT 0,
                reportDateColumn INT DEFAULT 0,
                fromDateRow INT DEFAULT 0,
                fromDateColumn INT DEFAULT 0,
                toDateRow INT DEFAULT 0,
                toDateColumn INT DEFAULT 0,
                footerRowCount INT DEFAULT 0,
                isGraphSupported ${type_bit} DEFAULT ${isMssql ? 0 : 'FALSE'},
                isTabularSupported ${type_bit} DEFAULT ${isMssql ? 0 : 'FALSE'},
                createdAt ${type_timestamp},
                updatedAt ${type_timestamp}
            )
        `));

        // 3. ReportSumItems
        await p.query(tableQuery('ReportSumItems', `
            CREATE TABLE ReportSumItems (
                id ${type_id},
                reportId INT ${isMssql ? 'FOREIGN KEY REFERENCES ReportConfigs(id) ON DELETE CASCADE' : 'REFERENCES ReportConfigs(id) ON DELETE CASCADE'},
                ${p.escapeIdentifier('query')} ${type_text} NOT NULL,
                dataRow INT NOT NULL,
                dataColumn INT NOT NULL
            )
        `));

        // 4. ReportCharts
        await p.query(tableQuery('ReportCharts', `
            CREATE TABLE ReportCharts (
                id ${type_id},
                reportId INT ${isMssql ? 'FOREIGN KEY REFERENCES ReportConfigs(id) ON DELETE CASCADE' : 'REFERENCES ReportConfigs(id) ON DELETE CASCADE'},
                chartType ${p.type === 'mssql' ? 'NVARCHAR(50)' : 'VARCHAR(50)'} NOT NULL,
                chartTitle ${type_string},
                xAxisColumn ${type_string},
                yAxisColumns ${type_text},
                xAxisLabel ${type_string},
                yAxisLabel ${type_string},
                createdAt ${type_timestamp},
                updatedAt ${type_timestamp}
            )
        `));

        // 5. ReportSchedules
        await p.query(tableQuery('ReportSchedules', `
            CREATE TABLE ReportSchedules (
                id ${type_id},
                reportId INT ${isMssql ? 'FOREIGN KEY REFERENCES ReportConfigs(id) ON DELETE CASCADE UNIQUE' : 'REFERENCES ReportConfigs(id) ON DELETE CASCADE UNIQUE'},
                name ${type_string} NOT NULL,
                startDateTime ${isMssql ? 'DATETIME' : 'TIMESTAMP'} NOT NULL,
                endDateTime ${isMssql ? 'DATETIME' : 'TIMESTAMP'} NOT NULL,
                scheduleTime ${p.type === 'mssql' ? 'NVARCHAR(50)' : 'VARCHAR(50)'} NOT NULL,
                recipients ${type_text} NOT NULL,
                status ${p.type === 'mssql' ? 'NVARCHAR(50)' : 'VARCHAR(50)'} DEFAULT 'Active',
                nextExecution ${isMssql ? 'DATETIME' : 'TIMESTAMP'},
                createdAt ${type_timestamp},
                updatedAt ${type_timestamp}
            )
        `));

        // 6. ReportScheduleHistory
        await p.query(tableQuery('ReportScheduleHistory', `
    CREATE TABLE ReportScheduleHistory (
        id ${type_id},
        scheduleId INT ${isMssql ? 'FOREIGN KEY REFERENCES ReportSchedules(id) ON DELETE CASCADE' : 'REFERENCES ReportSchedules(id) ON DELETE CASCADE'},
        executionTime ${type_timestamp},
        status ${p.type === 'mssql' ? 'NVARCHAR(50)' : 'VARCHAR(50)'},
        attachment ${p.type === 'mssql' ? 'NVARCHAR(MAX)' : 'TEXT'},
        fileName ${type_string},
        errorMessage ${type_text},
        createdAt ${type_timestamp}
    )
`));

        logger.info('Database tables verified/created successfully.');
    } catch (err) {
        logger.error('Error ensuring database tables:', err);
        throw err;
    }
};

module.exports = {
    getPool,
    ensureTables,
    ensureReportTable
};
