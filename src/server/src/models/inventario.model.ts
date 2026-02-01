import pool from '../config/database';

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  cantidad: number;
  cantidad_minima: number;
  precio_compra: number;
  precio_venta: number;
  proveedor: string | null;
  created_at?: string;
}

export const InventarioModel = {
  // Obtener todos los productos con sus vehículos asociados
  async getAll(search?: string): Promise<any[]> {
    let query = `
      SELECT 
        i.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', vb.id,
              'marca', vb.marca,
              'modelo', vb.modelo,
              'anio', vb.anio,
              'tipo', vb.tipo
            )
          ) FILTER (WHERE vb.id IS NOT NULL),
          '[]'
        ) as vehiculos_asociados
      FROM inventario i
      LEFT JOIN inventario_vehiculos iv ON i.id = iv.inventario_id
      LEFT JOIN vehiculos_base vb ON iv.vehiculo_base_id = vb.id
    `;

    const params: string[] = [];

    if (search && typeof search === 'string' && search.trim() !== '') {
      query += ` WHERE i.codigo ILIKE $1 OR i.nombre ILIKE $1 OR i.descripcion ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ' GROUP BY i.id ORDER BY i.codigo';
    
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Obtener por código
  async getByCodigo(codigo: string): Promise<Producto | null> {
    const result = await pool.query(
      'SELECT * FROM inventario WHERE codigo = $1',
      [codigo]
    );
    return result.rows[0] || null;
  },

  // Verificar si código existe
  async checkCodigo(codigo: string): Promise<{ exists: boolean; data: Producto | null }> {
    const result = await pool.query(
      'SELECT * FROM inventario WHERE codigo = $1',
      [codigo]
    );
    return {
      exists: result.rows.length > 0,
      data: result.rows[0] || null
    };
  },

  // Crear nuevo producto
  async create(producto: Omit<Producto, 'id'>): Promise<Producto> {
    const result = await pool.query(
      `INSERT INTO inventario 
       (codigo, nombre, descripcion, categoria, cantidad, cantidad_minima, precio_compra, precio_venta, proveedor) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        producto.codigo,
        producto.nombre,
        producto.descripcion,
        producto.categoria,
        producto.cantidad,
        producto.cantidad_minima,
        producto.precio_compra,
        producto.precio_venta,
        producto.proveedor
      ]
    );
    return result.rows[0];
  },

  // Actualizar producto
  async update(codigo: string, producto: Partial<Producto>): Promise<Producto | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (producto.nombre) {
      fields.push(`nombre = $${paramCount}`);
      values.push(producto.nombre);
      paramCount++;
    }
    if (producto.descripcion !== undefined) {
      fields.push(`descripcion = $${paramCount}`);
      values.push(producto.descripcion);
      paramCount++;
    }
    if (producto.categoria) {
      fields.push(`categoria = $${paramCount}`);
      values.push(producto.categoria);
      paramCount++;
    }
    if (producto.cantidad !== undefined) {
      fields.push(`cantidad = $${paramCount}`);
      values.push(producto.cantidad);
      paramCount++;
    }
    if (producto.cantidad_minima !== undefined) {
      fields.push(`cantidad_minima = $${paramCount}`);
      values.push(producto.cantidad_minima);
      paramCount++;
    }
    if (producto.precio_compra !== undefined) {
      fields.push(`precio_compra = $${paramCount}`);
      values.push(producto.precio_compra);
      paramCount++;
    }
    if (producto.precio_venta !== undefined) {
      fields.push(`precio_venta = $${paramCount}`);
      values.push(producto.precio_venta);
      paramCount++;
    }
    if (producto.proveedor !== undefined) {
      fields.push(`proveedor = $${paramCount}`);
      values.push(producto.proveedor);
      paramCount++;
    }

    if (fields.length === 0) return null;

    values.push(codigo);
    const query = `
      UPDATE inventario 
      SET ${fields.join(', ')} 
      WHERE codigo = $${paramCount} 
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  // Eliminar producto
  async delete(codigo: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM inventario WHERE codigo = $1',
      [codigo]
    );
    return result.rowCount !== null && result.rowCount > 0;
  },

  // Asociar vehículo a producto
  async asociarVehiculo(inventarioId: number, vehiculoBaseId: number): Promise<void> {
    await pool.query(
      `INSERT INTO inventario_vehiculos (inventario_id, vehiculo_base_id) 
       VALUES ($1, $2) 
       ON CONFLICT (inventario_id, vehiculo_base_id) DO NOTHING`,
      [inventarioId, vehiculoBaseId]
    );
  },

  // Desasociar vehículo de producto
  async desasociarVehiculo(inventarioId: number, vehiculoBaseId: number): Promise<void> {
    await pool.query(
      'DELETE FROM inventario_vehiculos WHERE inventario_id = $1 AND vehiculo_base_id = $2',
      [inventarioId, vehiculoBaseId]
    );
  }
};