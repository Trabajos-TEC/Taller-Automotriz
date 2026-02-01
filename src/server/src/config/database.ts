import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuraci�n del pool de conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Funci�n para probar la conexi�n
export const testConnection = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('? Conexi�n a PostgreSQL (Neon) establecida correctamente');
    
    // Probar consulta b�sica
    const result = await client.query('SELECT NOW()');
    console.log('? Hora actual de la base de datos:', result.rows[0].now);
    
    client.release();
  } catch (error) {
    console.error('? Error al conectar a la base de datos:', error);
    throw error;
  }
};

export default pool;
