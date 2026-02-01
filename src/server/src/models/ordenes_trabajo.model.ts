// src/server/src/models/ordenes_trabajo.model.ts
import pool from '../config/database';

export interface OrdenTrabajo {
  id: number;
  vehiculo_cliente_id: number;
  servicio_id: number | null;
  tipo_servicio: string;
  descripcion: string;
  fecha_entrada: Date;
  fecha_salida: Date | null;
  costo: number;
  estado: string;
  mecanico_id: number | null;
  notas: string | null;
  created_at: Date;
  updated_at: Date;
}

export const OrdenesTrabajoModel = {
  // Obtener todas las órdenes con filtros
  async getAll(
    search?: string,
    estado?: string,
    fechaDesde?: string,
    fechaHasta?: string
  ): Promise<OrdenTrabajo[]> {
    let query = `
      SELECT 
        ot.*,
        vc.placa,
        v.marca,
        v.modelo,
        c.nombre as cliente_nombre,
        u.nombre as mecanico_nombre,
        s.nombre as servicio_nombre
      FROM ordenes_trabajo ot
      JOIN vehiculos_clientes vc ON ot.vehiculo_cliente_id = vc.id
      JOIN vehiculos v ON vc.vehiculo_id = v.id
      JOIN clientes c ON vc.cliente_id = c.id
      LEFT JOIN usuarios u ON ot.mecanico_id = u.id
      LEFT JOIN servicios s ON ot.servicio_id = s.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (
        vc.placa ILIKE $${paramCount} OR
        v.marca ILIKE $${paramCount} OR
        v.modelo ILIKE $${paramCount} OR
        c.nombre ILIKE $${paramCount} OR
        ot.descripcion ILIKE $${paramCount} OR
        ot.tipo_servicio ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (estado) {
      query += ` AND ot.estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    if (fechaDesde) {
      query += ` AND ot.fecha_entrada >= $${paramCount}::DATE`;
      params.push(fechaDesde);
      paramCount++;
    }

    if (fechaHasta) {
      query += ` AND ot.fecha_entrada <= $${paramCount}::DATE`;
      params.push(fechaHasta);
      paramCount++;
    }

    query += ' ORDER BY ot.fecha_entrada DESC, ot.id DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Obtener orden por ID
  async getById(id: number): Promise<OrdenTrabajo | null> {
    const result = await pool.query(
      `SELECT 
        ot.*,
        vc.placa,
        v.marca,
        v.modelo,
        c.nombre as cliente_nombre,
        c.cedula as cliente_cedula,
        c.telefono as cliente_telefono,
        u.nombre as mecanico_nombre,
        u.email as mecanico_email,
        s.nombre as servicio_nombre,
        s.descripcion as servicio_descripcion
      FROM ordenes_trabajo ot
      JOIN vehiculos_clientes vc ON ot.vehiculo_cliente_id = vc.id
      JOIN vehiculos v ON vc.vehiculo_id = v.id
      JOIN clientes c ON vc.cliente_id = c.id
      LEFT JOIN usuarios u ON ot.mecanico_id = u.id
      LEFT JOIN servicios s ON ot.servicio_id = s.id
      WHERE ot.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Obtener órdenes por vehículo-cliente
  async getByVehiculoClienteId(vehiculoClienteId: number): Promise<OrdenTrabajo[]> {
    const result = await pool.query(
      `SELECT ot.*
       FROM ordenes_trabajo ot
       WHERE ot.vehiculo_cliente_id = $1
       ORDER BY ot.fecha_entrada DESC`,
      [vehiculoClienteId]
    );
    return result.rows;
  },

  // Obtener órdenes por mecánico
  async getByMecanicoId(mecanicoId: number): Promise<OrdenTrabajo[]> {
    const result = await pool.query(
      `SELECT ot.*, vc.placa, v.marca, v.modelo
       FROM ordenes_trabajo ot
       JOIN vehiculos_clientes vc ON ot.vehiculo_cliente_id = vc.id
       JOIN vehiculos v ON vc.vehiculo_id = v.id
       WHERE ot.mecanico_id = $1
       ORDER BY ot.fecha_entrada DESC`,
      [mecanicoId]
    );
    return result.rows;
  },

  // Obtener órdenes por estado
  async getByEstado(estado: string): Promise<OrdenTrabajo[]> {
    const result = await pool.query(
      `SELECT ot.*, vc.placa, v.marca, v.modelo, c.nombre as cliente_nombre
       FROM ordenes_trabajo ot
       JOIN vehiculos_clientes vc ON ot.vehiculo_cliente_id = vc.id
       JOIN vehiculos v ON vc.vehiculo_id = v.id
       JOIN clientes c ON vc.cliente_id = c.id
       WHERE ot.estado = $1
       ORDER BY ot.fecha_entrada DESC`,
      [estado]
    );
    return result.rows;
  },

  // Crear nueva orden
  async create(orden: Omit<OrdenTrabajo, 'id' | 'created_at' | 'updated_at'>): Promise<OrdenTrabajo> {
    const result = await pool.query(
      `INSERT INTO ordenes_trabajo (
        vehiculo_cliente_id,
        servicio_id,
        tipo_servicio,
        descripcion,
        fecha_entrada,
        fecha_salida,
        costo,
        estado,
        mecanico_id,
        notas
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        orden.vehiculo_cliente_id,
        orden.servicio_id || null,
        orden.tipo_servicio,
        orden.descripcion,
        orden.fecha_entrada,
        orden.fecha_salida || null,
        orden.costo,
        orden.estado,
        orden.mecanico_id || null,
        orden.notas || null
      ]
    );
    return result.rows[0];
  },

  // Actualizar orden
  async update(id: number, orden: Partial<OrdenTrabajo>): Promise<OrdenTrabajo | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const addField = (field: string, value: any) => {
      fields.push(`${field} = $${paramCount}`);
      values.push(value);
      paramCount++;
    };

    if (orden.vehiculo_cliente_id !== undefined) addField('vehiculo_cliente_id', orden.vehiculo_cliente_id);
    if (orden.servicio_id !== undefined) addField('servicio_id', orden.servicio_id);
    if (orden.tipo_servicio) addField('tipo_servicio', orden.tipo_servicio);
    if (orden.descripcion) addField('descripcion', orden.descripcion);
    if (orden.fecha_entrada) addField('fecha_entrada', orden.fecha_entrada);
    if (orden.fecha_salida !== undefined) addField('fecha_salida', orden.fecha_salida);
    if (orden.costo !== undefined) addField('costo', orden.costo);
    if (orden.estado) addField('estado', orden.estado);
    if (orden.mecanico_id !== undefined) addField('mecanico_id', orden.mecanico_id);
    if (orden.notas !== undefined) addField('notas', orden.notas);

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE ordenes_trabajo 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  // Actualizar estado de orden
  async updateEstado(id: number, estado: string): Promise<OrdenTrabajo | null> {
    const result = await pool.query(
      `UPDATE ordenes_trabajo 
       SET estado = $1, 
           updated_at = CURRENT_TIMESTAMP,
           fecha_salida = CASE 
             WHEN $1 = 'completada' THEN CURRENT_TIMESTAMP 
             ELSE fecha_salida 
           END
       WHERE id = $2 
       RETURNING *`,
      [estado, id]
    );
    return result.rows[0] || null;
  },

  // Asignar mecánico a orden
  async asignarMecanico(id: number, mecanicoId: number): Promise<OrdenTrabajo | null> {
    const result = await pool.query(
      `UPDATE ordenes_trabajo 
       SET mecanico_id = $1, 
           estado = 'en_proceso',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 
       RETURNING *`,
      [mecanicoId, id]
    );
    return result.rows[0] || null;
  },

  // Agregar notas a orden
  async agregarNotas(id: number, notas: string): Promise<OrdenTrabajo | null> {
    const result = await pool.query(
      `UPDATE ordenes_trabajo 
       SET notas = COALESCE(notas, '') || '\n' || $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 
       RETURNING *`,
      [notas, id]
    );
    return result.rows[0] || null;
  },

  // Eliminar orden
  async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM ordenes_trabajo WHERE id = $1',
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  },

  // Obtener estadísticas
  async getEstadisticas(): Promise<{
    total: number;
    pendientes: number;
    en_proceso: number;
    completadas: number;
    canceladas: number;
    total_ganancias: number;
    promedio_costo: number;
  }> {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE estado = 'pendiente') as pendientes,
        COUNT(*) FILTER (WHERE estado = 'en_proceso') as en_proceso,
        COUNT(*) FILTER (WHERE estado = 'completada') as completadas,
        COUNT(*) FILTER (WHERE estado = 'cancelada') as canceladas,
        COALESCE(SUM(CASE WHEN estado = 'completada' THEN costo ELSE 0 END), 0) as total_ganancias,
        COALESCE(AVG(CASE WHEN estado = 'completada' THEN costo ELSE NULL END), 0) as promedio_costo
      FROM ordenes_trabajo
    `);
    
    return {
      total: parseInt(result.rows[0].total),
      pendientes: parseInt(result.rows[0].pendientes),
      en_proceso: parseInt(result.rows[0].en_proceso),
      completadas: parseInt(result.rows[0].completadas),
      canceladas: parseInt(result.rows[0].canceladas),
      total_ganancias: parseFloat(result.rows[0].total_ganancias),
      promedio_costo: parseFloat(result.rows[0].promedio_costo)
    };
  },

  // Buscar órdenes por fechas
  async getByFechaRango(fechaDesde: string, fechaHasta: string): Promise<OrdenTrabajo[]> {
    const result = await pool.query(
      `SELECT ot.*, vc.placa, v.marca, v.modelo, c.nombre as cliente_nombre
       FROM ordenes_trabajo ot
       JOIN vehiculos_clientes vc ON ot.vehiculo_cliente_id = vc.id
       JOIN vehiculos v ON vc.vehiculo_id = v.id
       JOIN clientes c ON vc.cliente_id = c.id
       WHERE ot.fecha_entrada BETWEEN $1 AND $2
       ORDER BY ot.fecha_entrada DESC`,
      [fechaDesde, fechaHasta]
    );
    return result.rows;
  }
};