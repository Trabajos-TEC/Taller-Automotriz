import { pool } from "./db";

async function testConnection() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Conectado a NEON:", res.rows[0]);
  } catch (error) {
    console.error("Error de conexión:", error);
  } finally {
    await pool.end();
  }
}

testConnection();
