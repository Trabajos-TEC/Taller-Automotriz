import pool from '../config/database';

export interface VehiculoBase {
  id: number;
  marca: string;
  modelo: string;
  anio: number;
  tipo: string;
  created_at?: string;
}

export const VehiculoBaseModel = {
  // Obtener todos los vehículos base
  async getAll(search?: string): Promise<VehiculoBase[]> {
    let query = 'SELECT * FROM vehiculos_base';
    const params: string[] = [];

    if (search && typeof search === 'string' && search.trim() !== '') {
      query += ' WHERE marca ILIKE $1 OR modelo ILIKE $1 OR tipo ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY marca, modelo, anio';
    
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Obtener por ID
  async getById(id: number): Promise<VehiculoBase | null> {
    const result = await pool.query(
      'SELECT * FROM vehiculos_base WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Crear nuevo vehículo base
  async create(vehiculo: Omit<VehiculoBase, 'id'>): Promise<VehiculoBase> {
    const result = await pool.query(
      `INSERT INTO vehiculos_base (marca, modelo, anio, tipo) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [vehiculo.marca, vehiculo.modelo, vehiculo.anio, vehiculo.tipo]
    );
    return result.rows[0];
  },

  // Actualizar vehículo base
  async update(id: number, vehiculo: Partial<VehiculoBase>): Promise<VehiculoBase | null> {
    const fields: string[] = [];
    const values: (string | number)[] = [];
    let paramCount = 1;

    if (vehiculo.marca) {
      fields.push(`marca = $${paramCount}`);
      values.push(vehiculo.marca);
      paramCount++;
    }
    if (vehiculo.modelo) {
      fields.push(`modelo = $${paramCount}`);
      values.push(vehiculo.modelo);
      paramCount++;
    }
    if (vehiculo.anio !== undefined) {
      fields.push(`anio = $${paramCount}`);
      values.push(vehiculo.anio);
      paramCount++;
    }
    if (vehiculo.tipo) {
      fields.push(`tipo = $${paramCount}`);
      values.push(vehiculo.tipo);
      paramCount++;
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE vehiculos_base 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  // Eliminar vehículo base - CORREGIDO
  async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM vehiculos_base WHERE id = $1',
      [id]
    );
    // Manejo seguro de rowCount que puede ser null
    return result.rowCount !== null && result.rowCount > 0;
  }
};