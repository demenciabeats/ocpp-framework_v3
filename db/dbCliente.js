import pkg from 'pg';
const { Client } = pkg;

function getDbConfig() {
  return {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
}

export async function executeQuery(queryText, params = []) {
  const config = getDbConfig();
  const client = new Client(config);
  try {
    await client.connect();
    const res = await client.query(queryText, params);
    return res.rows;
  } catch (error) {
    console.error("Error ejecutando query:", error);
    throw error;
  } finally {
    await client.end();
  }
}

export function compareResults(expected, actual) {

  return JSON.stringify(expected) === JSON.stringify(actual);
}