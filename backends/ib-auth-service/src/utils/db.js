const { createProvider } = require('./dbProvider');
const config = require('../config');
const logger = require('../main/common/logger');

let provider;

function prepareConnectionString(connStr = '') {
  let sqlUri = (connStr || '').trim();

  if ((sqlUri.startsWith('"') && sqlUri.endsWith('"')) ||
    (sqlUri.startsWith("'") && sqlUri.endsWith("'"))) {
    sqlUri = sqlUri.slice(1, -1);
  }

  const lowerUri = sqlUri.toLowerCase();

  if (lowerUri.startsWith('postgres://') || lowerUri.startsWith('postgresql://')) {
    return { isPostgres: true, sqlUri };
  }

  const isTrusted =
    lowerUri.includes('trusted_connection=true') ||
    lowerUri.includes('trusted_connection=yes') ||
    lowerUri.includes('integrated security=sspi') ||
    (!lowerUri.includes('user id=') && !lowerUri.includes('uid='));

  if (lowerUri.includes('trusted_connection=true')) {
    sqlUri = sqlUri.replace(/trusted_connection=true/gi, 'Trusted_Connection=yes');
  }

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
      logger.info(`Connected to Auth Database (${p.type.toUpperCase()})`);
    }

    return p;
  } catch (err) {
    logger.error(`Database Connection Failed: `, err);
    throw err;
  }
};

const closePool = async () => {
  if (provider && provider.pool && provider.pool.close) {
    await provider.pool.close();
    provider = null;
    logger.info('Database pool closed');
  }
};

module.exports = {
  getPool,
  closePool,
  prepareConnectionString
};
