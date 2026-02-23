const sql = require('mssql');
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
  const userMatch = sqlUri.match(/(?:User ID|Uid)=([^;]+)/i);
  const pwdMatch = sqlUri.match(/(?:Password|Pwd)=([^;]+)/i);

  const server = (serverMatch ? serverMatch[1].trim() : '').replace(/\\\\/g, '\\');
  const database = dbMatch ? dbMatch[1].trim() : '';
  const user = userMatch ? userMatch[1].trim() : '';
  const password = pwdMatch ? pwdMatch[1].trim() : '';

  return { sqlUri, isTrusted, server, database, user, password };
}

const getPool = async (connString = null) => {
  const targetConnStr = connString || config.sqlUri;

  if (!connString && pool) return pool;

  try {
    const { database, server, isTrusted, user, password } = prepareConnectionString(targetConnStr);

    // Split ServerName\Instance for tedious compatibility
    let [host, instanceName] = server.split('\\');

    if (isTrusted) {
      logger.warn('Windows Authentication (Trusted_Connection) detected. The standalone driver often requires SQL Authentication (User ID & Password) to work correctly in the packaged .exe.');
    }

    // Try to resolve host to local IP if it looks like the current machine
    const cleanHost = (host.toLowerCase() === 'desktop-n16jdj5' || host.toLowerCase() === 'localhost') ? '127.0.0.1' : host;

    logger.info(`Attempting DB Connection: Host=[${cleanHost}], Instance=[${instanceName || 'default'}], Database=[${database}]`);

    const newPool = await new sql.ConnectionPool({
      server: host,
      database: database,
      user: user,
      password: password,
      options: {
        encrypt: false,
        trustServerCertificate: true, // Trust the server certificate regardless of trust chain
        instanceName: instanceName,
        connectTimeout: 30000 // 30 seconds
      }
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
