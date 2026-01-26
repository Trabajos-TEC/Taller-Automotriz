import pool from '../config/database';
import { Cliente } from '../types';

export class ClienteModel {
  // Obtener todos los clientes
  static async findAll(search?: string): Promise<Cliente[]> {
    try {
      let query = 'SELECT * FROM clientes';
      const params = [];

      if (search) {
        query += ' WHERE nombre ILIKE $1 OR cedula ILIKE $1 OR correo ILIKE $1';
        params.push(`%${search}%`);
      }

      query += ' ORDER BY id DESC';
      
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Error al obtener clientes: ${error}`);
    }
  }

  // Obtener un cliente por ID
  static async findById(id: number): Promise<Cliente | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM clientes WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener cliente por ID: ${error}`);
    }
  }

  // Obtener un cliente por cédula
  static async findByCedula(cedula: string): Promise<Cliente | null> {
    try {
      const result = await pool.query(
        'SELECT * FROM clientes WHERE cedula = $1',
        [cedula]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error al obtener cliente por cédula: ${error}`);
    }
  }

  // Crear un nuevo cliente
  static async create(cliente: Omit<Cliente, 'id'>): Promise<Cliente> {
    try {
      const { nombre, cedula, correo, numero } = cliente;
      
      // Verificar si la cédula ya existe
      const existe = await this.findByCedula(cedula);
      if (existe) {
        throw new Error('La cédula ya está registrada');
      }

      const result = await pool.query(
        `INSERT INTO clientes (nombre, cedula, correo, numero)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [nombre, cedula, correo || null, numero || null]
      );
      return result.rows[0];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Error al crear cliente: ${error}`);
    }
  }

  // Actualizar un cliente por cédula
  static async update(cedula: string, cliente: Partial<Cliente>): Promise<Cliente | null> {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (cliente.nombre) {
        fields.push(`nombre = $${paramIndex}`);
        values.push(cliente.nombre);
        paramIndex++;
      }
      if (cliente.correo !== undefined) {
        fields.push(`correo = $${paramIndex}`);
        values.push(cliente.correo || null);
        paramIndex++;
      }
      if (cliente.numero !== undefined) {
        fields.push(`numero = $${paramIndex}`);
        values.push(cliente.numero || null);
        paramIndex++;
      }

      if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      values.push(cedula);

      const result = await pool.query(
        `UPDATE clientes SET ${fields.join(', ')} WHERE cedula = $${paramIndex} RETURNING *`,
        values
      );

      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error al actualizar cliente: ${error}`);
    }
  }

  // Eliminar un cliente por cédula
  static async delete(cedula: string): Promise<boolean> {
    try {
      const result = await pool.query(
        'DELETE FROM clientes WHERE cedula = $1 RETURNING id',
        [cedula]
      );
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      throw new Error(`Error al eliminar cliente: ${error}`);
    }
  }

  // Contar total de clientes
  static async count(): Promise<number> {
    try {
      const result = await pool.query('SELECT COUNT(*) FROM clientes');
      return parseInt(result.rows[0].count, 10);
    } catch (error) {
      throw new Error(`Error al contar clientes: ${error}`);
    }
  }
}
