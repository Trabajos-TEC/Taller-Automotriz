import pool from '../config/database';
import { Usuario } from '../types';
import bcrypt from 'bcrypt';
export class UsuarioModel {
        static async findByEmail(email: string) {
        const { rows } = await pool.query(
            `SELECT id, nombre, correo, cedula, password_hash, roles
            FROM usuarios
            WHERE correo = $1 AND activo = true`,
            [email]
        );
        return rows[0] || null;
        }

  static async create(data: {
      nombre: string;
      correo: string;
      cedula: string;
      roles: string;
    }) {
      const passwordHash = await bcrypt.hash(data.cedula, 10);

      const { rows } = await pool.query(
        `INSERT INTO usuarios (nombre, correo, cedula, password_hash, roles)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, nombre, correo, roles`,
        [data.nombre, data.correo, data.cedula, passwordHash, data.roles]
      );

      return rows[0];
    }

  static async findByCedula(cedula: string): Promise<Usuario | null> {
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE cedula = $1 AND activo = true',
      [cedula]
    );
    return rows[0] || null;
  }
}
