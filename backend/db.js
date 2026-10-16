require('dotenv').config();
const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = [oracledb.CLOB];

function config() {
  const { DB_USER, DB_PASSWORD, DB_CONNECT_STRING } = process.env;
  if (!DB_USER || !DB_PASSWORD || !DB_CONNECT_STRING) {
    throw new Error('Oracle settings are missing. Copy backend/.env.example to backend/.env and fill in DB_USER, DB_PASSWORD and DB_CONNECT_STRING.');
  }
  return { user: DB_USER, password: DB_PASSWORD, connectString: DB_CONNECT_STRING };
}
async function withConnection(fn) {
  const connection = await oracledb.getConnection(config());
  try { return await fn(connection); }
  finally { await connection.close(); }
}
async function execute(sql, binds = {}, options = {}) {
  return withConnection(connection => connection.execute(sql, binds, {
    autoCommit: options.autoCommit ?? false,
    outFormat: oracledb.OUT_FORMAT_OBJECT,
    ...options.executeOptions
  }));
}
async function ping() {
  return withConnection(async connection => {
    const result = await connection.execute('SELECT USER AS CURRENT_USER, SYS_CONTEXT(\'USERENV\', \'SERVICE_NAME\') AS SERVICE_NAME, SYSTIMESTAMP AS DATABASE_TIME FROM DUAL');
    return result.rows[0];
  });
}
module.exports = { execute, ping, withConnection, oracledb };
