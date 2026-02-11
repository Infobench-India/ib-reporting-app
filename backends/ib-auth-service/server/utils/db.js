const sql = require('mssql/msnodesqlv8');
const config = require('../config');
const logger = require('../main/common/logger');

let pool;

function prepareConnectionString(connStr = '') {
  let sqlUri = (connStr || '').trim();

  if ((sqlUri.startsWith('"') && sqlUri.endsWith('"')) ||
    (sqlUri.startsWith("'") && sqlUri.endsWith("'"))) {
    sqlUri = sqlUri.slice(1, -1);
  }

  const lowerUri = sqlUri.toLowerCase();

  const isTrusted =
    lowerUri.includes('trusted_connection=true') ||
    lowerUri.includes('trusted_connection=yes') ||
    lowerUri.includes('integrated security=sspi') ||
    (!lowerUri.includes('user id=') && !lowerUri.includes('uid='));

  if (isTrusted && !lowerUri.includes('driver=')) {
    sqlUri = `Driver={ODBC Driver 17 for SQL Server};${sqlUri}`;
  }

  if (lowerUri.includes('trusted_connection=true')) {
    sqlUri = sqlUri.replace(/trusted_connection=true/gi, 'Trusted_Connection=yes');
  } else if (isTrusted &&
    !lowerUri.includes('trusted_connection=') &&
    !lowerUri.includes('integrated security=')) {
    if (!sqlUri.endsWith(';')) sqlUri += ';';
    sqlUri += 'Trusted_Connection=yes;';
  }

  const serverMatch = sqlUri.match(/(?:Server|Data Source)=([^;]+)/i);
  const dbMatch = sqlUri.match(/(?:Database|Initial Catalog)=([^;]+)/i);

  const server = (serverMatch ? serverMatch[1].trim() : '').replace(/\\\\/g, '\\');
  const database = dbMatch ? dbMatch[1].trim() : '';

  return { sqlUri, isTrusted, server, database };
}

const getPool = async (connString = null) => {
  const targetConnStr = connString || config.sqlUri;

  if (!connString && pool) return pool;

  try {
    const { sqlUri, isTrusted, database, server } = prepareConnectionString(targetConnStr);

    const newPool = await new sql.ConnectionPool({
      server: server,
      database: database,
      options: { trustedConnection: true, encrypt: false }
    }).connect();

    if (!connString) {
      pool = newPool;
      logger.info(`Connected to Auth Service SQL Database (${isTrusted ? 'Windows Auth' : 'SQL Auth'})`);
    }

    return newPool;
  } catch (err) {
    logger.error(`Database Connection Failed: `, err);
    throw err;
  }
};

const closePool = async () => {
  if (pool) {
    await pool.close();
    pool = null;
    logger.info('Database pool closed');
  }
};

module.exports = {
  getPool,
  closePool,
  prepareConnectionString
};
