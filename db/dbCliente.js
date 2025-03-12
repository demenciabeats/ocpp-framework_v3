import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const { Client } = pkg;

// Obtener la ruta absoluta al archivo .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');

// Cargar variables de entorno desde el archivo .env
if (fs.existsSync(envPath)) {
  console.log(`Cargando variables de entorno desde: ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.warn(`No se encontró .env en ${envPath}`);
}

function getDbConfig() {
  // Datos hardcoded para el caso en que las variables de entorno no estén disponibles
  const dbConfig = {
    host: String(process.env.DB_HOST || 'dhemax-devs-pg.cxwlliri0kws.us-east-1.rds.amazonaws.com').replace(/['"]+/g, ''),
    port: parseInt(process.env.DB_PORT || '5432'),
    user: String(process.env.DB_USER || 'qatester@dhemax.com').replace(/['"]+/g, ''),
    password: String(process.env.DB_PASSWORD || 'jldarOxat=chlst_c30s').replace(/['"]+/g, ''),
    database: String(process.env.DB_NAME || 'qa-pge-legacy').replace(/['"]+/g, '')
  };
  
  console.log("Configuración DB (sin password):", { 
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database 
  });
  
  return dbConfig;
}

export async function executeQuery(queryText, params = []) {
  const config = getDbConfig();
  
  const client = new Client(config);
  try {
    await client.connect();
    console.log("Conexión a la base de datos establecida.");
    const res = await client.query(queryText, params);
    return res.rows;
  } catch (error) {
    console.error("Error ejecutando query:", error);
    throw error;
  } finally {
    await client.end();
    console.log("Conexión a la base de datos cerrada.");
  }
}

export function compareResults(expected, actual) {
  return JSON.stringify(expected) === JSON.stringify(actual);
}