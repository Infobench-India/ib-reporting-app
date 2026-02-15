const sql = require('mssql/msnodesqlv8');
const config = require('../config');
const logger = require('../main/common/logger');

let pool;
const dynamicPools = new Map();

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

    // 2. Detect Windows auth
    const isTrusted =
        lowerUri.includes('trusted_connection=true') ||
        lowerUri.includes('trusted_connection=yes') ||
        lowerUri.includes('integrated security=sspi') ||
        (!lowerUri.includes('user id=') && !lowerUri.includes('uid='));

    // 3. Ensure ODBC driver clause (only if you still want the ODBC string)
    if (isTrusted && !lowerUri.includes('driver=')) {
        sqlUri = `Driver={ODBC Driver 17 for SQL Server};${sqlUri}`;
    }

    // 4. Normalize Trusted_Connection=yes
    if (lowerUri.includes('trusted_connection=true')) {
        sqlUri = sqlUri.replace(/trusted_connection=true/gi, 'Trusted_Connection=yes');
    } else if (isTrusted &&
        !lowerUri.includes('trusted_connection=') &&
        !lowerUri.includes('integrated security=')) {
        if (!sqlUri.endsWith(';')) sqlUri += ';';
        sqlUri += 'Trusted_Connection=yes;';
    }

    // 5. Extract Server and Database
    const serverMatch = sqlUri.match(/(?:Server|Data Source)=([^;]+)/i);
    const dbMatch = sqlUri.match(/(?:Database|Initial Catalog)=([^;]+)/i);

    const server = (serverMatch ? serverMatch[1].trim() : '').replace(/\\\\/g, '\\');
    const database = dbMatch ? dbMatch[1].trim() : '';

    return { sqlUri, isTrusted, server, database };
}

const getPool = async (connString = null) => {
    // If no connString provided, use default config URI
    const targetConnStr = connString || config.sqlUri;
    // Check main pool if using default
    if (!connString && pool) return pool;
    // Check dynamic pools
    if (connString && dynamicPools.has(connString)) return dynamicPools.get(connString);

    try {
        const { sqlUri, isTrusted, database, server } = prepareConnectionString(targetConnStr);

        const newPool = await new sql.ConnectionPool({
            server: server,
            database: database,
            options: {
                trustedConnection: true,
                encrypt: false,
                requestTimeout: 60000, // 60 seconds
                connectionTimeout: 60000 // 60 seconds
            },
            requestTimeout: 60000, // Also set at pool level for good measure
            connectionTimeout: 60000
        }).connect();

        if (!connString) {
            pool = newPool;
            logger.info(`Connected to Config SQL Database (${isTrusted ? 'Windows Auth' : 'SQL Auth'})`);
        } else {
            dynamicPools.set(connString, newPool);
            logger.info(`New dynamic pool created for report (${isTrusted ? 'Windows Auth' : 'SQL Auth'})`);
        }

        return newPool;
    } catch (err) {
        logger.error(`Database Connection Failed for ${connString ? 'dynamic pool' : 'Config DB'}: `, err);
        throw err;
    }
};

const ensureReportTable = async (pool, tableName, columnsString) => {
    try {
        let cleanTableName = (tableName || '').trim();
        // Strip existing brackets if any for normalized check
        if (cleanTableName.startsWith('[') && cleanTableName.endsWith(']')) {
            cleanTableName = cleanTableName.slice(1, -1);
        }

        const lowerTableName = cleanTableName.toLowerCase();
        if (!lowerTableName) return;

        // Skip check for core tables
        if (['reportsettings', 'reportconfigs', 'reportsumitems'].includes(lowerTableName)) {
            return;
        }

        const checkRes = await pool.request()
            .input('tableName', sql.NVarChar, tableName)
            .query("SELECT * FROM sys.tables WHERE name = @tableName");

        if (checkRes.recordset.length === 0) {
            logger.info(`Creating missing report data table: ${tableName}`);

            // Expected columns format: "Col1,Col2,Col3"
            const columns = (columnsString || '').split(',')
                .map(col => col.trim())
                .filter(col => col.length > 0);

            if (columns.length === 0) {
                logger.warn(`No columns defined for table ${cleanTableName}. Cannot create.`);
                return;
            }

            // Create table with NVARCHAR(MAX) for all columns to be safe
            const colDefs = columns.map(col => `[${col}] NVARCHAR(MAX)`).join(', ');
            const createQuery = `CREATE TABLE [${cleanTableName}] (id INT PRIMARY KEY IDENTITY(1,1), ${colDefs})`;

            await pool.request().query(createQuery);
            logger.info(`Table ${cleanTableName} created successfully.`);
        }
    } catch (err) {
        logger.error(`Error ensuring report table ${tableName}:`, err);
        // We don't throw here to avoid blocking execution if it's just a check failure, 
        // but the calling function might fail later if table is truly missing.
    }
};

const ensureTables = async (ConnectionString) => {
    try {
        const configPool = await getPool(ConnectionString); // Gets default pool
        logger.info('Ensuring database tables exist...');

        await configPool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ReportSettings')
            BEGIN
                CREATE TABLE ReportSettings (
                    id INT PRIMARY KEY IDENTITY(1,1),
                    exportFolder NVARCHAR(MAX),
                    ConnectionString NVARCHAR(MAX),
                    ConnectionString1 NVARCHAR(MAX),
                    ConnectionString2 NVARCHAR(MAX),
                    AlarmReportConnectionString NVARCHAR(MAX)
                );
            END

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ReportConfigs')
            BEGIN
                CREATE TABLE ReportConfigs (
                    id INT PRIMARY KEY IDENTITY(1,1),
                    category NVARCHAR(255) NOT NULL,
                    name NVARCHAR(255) NOT NULL UNIQUE,
                    tableName NVARCHAR(255) NOT NULL,
                    templateName NVARCHAR(255) NOT NULL,
                    columns NVARCHAR(MAX),
                    connectionString NVARCHAR(MAX) NOT NULL,
                    query NVARCHAR(MAX) NOT NULL,
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
                    isGraphSupported BIT DEFAULT 0,
                    isTabularSupported BIT DEFAULT 0,
                    createdAt DATETIME DEFAULT GETDATE(),
                    updatedAt DATETIME DEFAULT GETDATE()
                );
            END

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ReportSumItems')
            BEGIN
                CREATE TABLE ReportSumItems (
                    id INT PRIMARY KEY IDENTITY(1,1),
                    reportId INT FOREIGN KEY REFERENCES ReportConfigs(id) ON DELETE CASCADE,
                    query NVARCHAR(MAX) NOT NULL,
                    dataRow INT NOT NULL,
                    dataColumn INT NOT NULL
                );
            END

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ReportCharts')
            BEGIN
                CREATE TABLE ReportCharts (
                    id INT PRIMARY KEY IDENTITY(1,1),
                    reportId INT FOREIGN KEY REFERENCES ReportConfigs(id) ON DELETE CASCADE,
                    chartType NVARCHAR(50) NOT NULL, -- e.g., 'bar', 'line', 'pie'
                    chartTitle NVARCHAR(255),
                    xAxisColumn NVARCHAR(255),
                    yAxisColumns NVARCHAR(MAX), -- Comma-separated list of columns for y-axis
                    xAxisLabel NVARCHAR(255),
                    yAxisLabel NVARCHAR(255),
                    createdAt DATETIME DEFAULT GETDATE(),
                    updatedAt DATETIME DEFAULT GETDATE()
                );
            END

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ReportSchedules')
            BEGIN
                CREATE TABLE ReportSchedules (
    id INT PRIMARY KEY IDENTITY(1,1),
    reportId INT FOREIGN KEY REFERENCES ReportConfigs(id) ON DELETE CASCADE UNIQUE,
    name NVARCHAR(255) NOT NULL,
    startDateTime DATETIME NOT NULL,
    endDateTime DATETIME NOT NULL,
    scheduleTime NVARCHAR(50) NOT NULL, -- "HH:mm"
    recipients NVARCHAR(MAX) NOT NULL, -- Comma-separated emails
    status NVARCHAR(50) DEFAULT 'Active', -- 'Active', 'Inactive'
    nextExecution DATETIME,
    createdAt DATETIME DEFAULT GETDATE(),
    updatedAt DATETIME DEFAULT GETDATE()
);
            END

            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ReportScheduleHistory')
            BEGIN
                CREATE TABLE ReportScheduleHistory (
                    id INT PRIMARY KEY IDENTITY(1,1),
                    scheduleId INT FOREIGN KEY REFERENCES ReportSchedules(id) ON DELETE CASCADE,
                    executionTime DATETIME DEFAULT GETDATE(),
                    status NVARCHAR(50), -- 'Success', 'Failure'
                    attachment VARBINARY(MAX),
                    fileName NVARCHAR(255),
                    errorMessage NVARCHAR(MAX),
                    createdAt DATETIME DEFAULT GETDATE()
                );
            END
        `);
        logger.info('Database tables verified/created successfully.');
    } catch (err) {
        logger.error('Error ensuring database tables:', err);
        throw err;
    }
};

module.exports = {
    getPool,
    ensureTables,
    ensureReportTable,
    sql
};
