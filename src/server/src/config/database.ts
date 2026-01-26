import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del pool de conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Función para probar la conexión
export const testConnection = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('? Conexión a PostgreSQL (Neon) establecida correctamente');
    
    // Probar consulta básica
    const result = await client.query('SELECT NOW()');
    console.log('? Hora actual de la base de datos:', result.rows[0].now);
    
    client.release();
  } catch (error) {
    console.error('? Error al conectar a la base de datos:', error);
    throw error;
  }
};

export default pool;
