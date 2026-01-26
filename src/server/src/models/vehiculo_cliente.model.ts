// src/models/vehiculo_cliente.model.ts - VERSIÓN CORREGIDA
import pool from '../config/database';

export interface VehiculoCliente {
  id: number;
  placa: string;
  cliente_id: number;
  vehiculo_base_id: number;
  color?: string;
  kilometraje?: number;
  anio_matricula?: string;
  vin?: string;
  notas?: string;
  created_at?: string;
}

export interface VehiculoClienteCompleto extends VehiculoCliente {
  cliente_cedula: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_correo: string;
  // NOTA: cliente_direccion NO existe en la tabla, por eso se removió
  vehiculo_marca: string;
  vehiculo_modelo: string;
  vehiculo_anio: number;
  vehiculo_tipo: string;
}

export const VehiculoClienteModel = {
  // Obtener todos los vehículos de clientes con información completa
  async getAll(search?: string): Promise<VehiculoClienteCompleto[]> {
    let query = `
      SELECT 
        vc.*,
        c.cedula as cliente_cedula,
        c.nombre as cliente_nombre,
        c.numero as cliente_telefono,
        c.correo as cliente_correo,
        vb.marca as vehiculo_marca,
        vb.modelo as vehiculo_modelo,
        vb.anio as vehiculo_anio,
        vb.tipo as vehiculo_tipo
      FROM vehiculos_clientes vc
      INNER JOIN clientes c ON vc.cliente_id = c.id
      INNER JOIN vehiculos_base vb ON vc.vehiculo_base_id = vb.id
    `;
    
    const params: string[] = [];

    if (search && search.trim() !== '') {
      query += ` WHERE 
        vc.placa ILIKE $1 OR 
        c.cedula ILIKE $1 OR 
        c.nombre ILIKE $1 OR 
        vb.marca ILIKE $1 OR 
        vb.modelo ILIKE $1 OR
        vc.vin ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY vc.placa';
    
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Obtener por ID
  async getById(id: number): Promise<VehiculoClienteCompleto | null> {
    const result = await pool.query(
      `SELECT 
        vc.*,
        c.cedula as cliente_cedula,
        c.nombre as cliente_nombre,
        c.numero as cliente_telefono,
        c.correo as cliente_correo,
        vb.marca as vehiculo_marca,
        vb.modelo as vehiculo_modelo,
        vb.anio as vehiculo_anio,
        vb.tipo as vehiculo_tipo
      FROM vehiculos_clientes vc
      INNER JOIN clientes c ON vc.cliente_id = c.id
      INNER JOIN vehiculos_base vb ON vc.vehiculo_base_id = vb.id
      WHERE vc.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Obtener por placa
  async getByPlaca(placa: string): Promise<VehiculoClienteCompleto | null> {
    const result = await pool.query(
      `SELECT 
        vc.*,
        c.cedula as cliente_cedula,
        c.nombre as cliente_nombre,
        c.numero as cliente_telefono,
        c.correo as cliente_correo,
        vb.marca as vehiculo_marca,
        vb.modelo as vehiculo_modelo,
        vb.anio as vehiculo_anio,
        vb.tipo as vehiculo_tipo
      FROM vehiculos_clientes vc
      INNER JOIN clientes c ON vc.cliente_id = c.id
      INNER JOIN vehiculos_base vb ON vc.vehiculo_base_id = vb.id
      WHERE vc.placa = $1`,
      [placa]
    );
    return result.rows[0] || null;
  },

  // Verificar si placa existe
  async checkPlaca(placa: string): Promise<{ exists: boolean; data: VehiculoCliente | null }> {
    const result = await pool.query(
      'SELECT * FROM vehiculos_clientes WHERE placa = $1',
      [placa]
    );
    return {
      exists: result.rows.length > 0,
      data: result.rows[0] || null
    };
  },

  // Verificar si VIN existe
  async checkVin(vin: string): Promise<{ exists: boolean; data: VehiculoCliente | null }> {
    const result = await pool.query(
      'SELECT * FROM vehiculos_clientes WHERE vin = $1',
      [vin]
    );
    return {
      exists: result.rows.length > 0,
      data: result.rows[0] || null
    };
  },

  // Crear nuevo vehículo de cliente
  async create(vehiculo: Omit<VehiculoCliente, 'id'>): Promise<VehiculoCliente> {
    const result = await pool.query(
      `INSERT INTO vehiculos_clientes 
       (placa, cliente_id, vehiculo_base_id) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [
        vehiculo.placa,
        vehiculo.cliente_id,
        vehiculo.vehiculo_base_id
      ]
    );
    return result.rows[0];
  },

  // Actualizar vehículo de cliente
  async update(id: number, vehiculo: Partial<VehiculoCliente>): Promise<VehiculoCliente | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (vehiculo.cliente_id !== undefined) {
      fields.push(`cliente_id = $${paramCount}`);
      values.push(vehiculo.cliente_id);
      paramCount++;
    }
    if (vehiculo.vehiculo_base_id !== undefined) {
      fields.push(`vehiculo_base_id = $${paramCount}`);
      values.push(vehiculo.vehiculo_base_id);
      paramCount++;
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE vehiculos_clientes 
      SET ${fields.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  // Eliminar vehículo de cliente
  async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM vehiculos_clientes WHERE id = $1',
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }
};