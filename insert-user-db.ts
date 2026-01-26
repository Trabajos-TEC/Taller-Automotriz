import { pool } from "./db";
import bcrypt from "bcrypt";

async function insertUser(
  email: string,
  cedula: string,
  role: "admin" | "mecanico" | "cliente"
) {
  try {
    const hashedPassword = await bcrypt.hash(cedula, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password, role)
       VALUES ($1, $2, $3)
       RETURNING id, email, role`,
      [email, hashedPassword, role]
    );

    console.log("Usuario insertado:", result.rows[0]);
  } catch (error) {
    console.error("Error insertando usuario:", error);
  } finally {
    await pool.end();
  }
}

insertUser("kawo@gmail.com", "123456789", "cliente");
