import { Router } from "express";
import { pool } from "../../db";
import bcrypt from "bcrypt";

const router = Router();

/* ===== RUTA DE PRUEBA (GET) ===== */
router.get("/test", (req, res) => {
  res.json({ message: "Auth API funcionando correctamente" });
});

/* ===== LOGIN (POST) ===== */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT id, email, password, role, name
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // nunca enviar password
    delete user.password;

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

export default router;
