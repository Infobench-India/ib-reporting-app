const sqlConnectionString = process.env.SQL_CONFIG_DB || '';
module.exports = {
    sqlUri: sqlConnectionString,
    port: process.env.PORT || 3052,
};
