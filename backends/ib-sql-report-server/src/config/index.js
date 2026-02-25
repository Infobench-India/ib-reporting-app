const sqlConnectionString = process.env.SQL_CONFIG_DB || '';
module.exports = {
    sqlUri: sqlConnectionString,
    port: process.env.PORT || 3052,
    dbType: process.env.DB_TYPE || 'mssql',
    dbConfig: {
        server: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        options: {
            encrypt: process.env.DB_ENCRYPT === 'true',
            trustServerCertificate: true
        }
    }
};
