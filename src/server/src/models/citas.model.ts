// En src/server/src/models/citas.model.ts - VERSIÓN CORREGIDA
import pool from '../config/database';

export interface Cita {
  id: number;
  vehiculo_cliente_id: number;  // Cambiado: era cliente_cedula
  fecha: string;
  hora: string;
  descripcion: string;
  usuario_id: number | null;    // Nuevo campo
  estado: string;               // Cambiado: era enum específico
  created_at: string;
  updated_at: string;           // Nuevo campo
}

export const CitasModel = {
  // Obtener todas las citas con búsqueda opcional
  async getAll(search?: string): Promise<Cita[]> {
    let query = `
      SELECT 
        id,
        vehiculo_cliente_id,
        fecha,
        hora,
        descripcion,
        usuario_id,
        estado,
        created_at,
        updated_at
      FROM citas
    `;

    const params: string[] = [];

    if (search && typeof search === 'string' && search.trim() !== '') {
      query += ` WHERE 
        descripcion ILIKE $1 OR 
        estado ILIKE $1 OR
        CAST(vehiculo_cliente_id AS TEXT) ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY fecha DESC, hora DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Obtener cita por ID
  async getById(id: number): Promise<Cita | null> {
    const result = await pool.query(
      'SELECT * FROM citas WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Obtener citas por vehiculo_cliente_id (antes era por cliente cédula)
  async getByVehiculoClienteId(vehiculoClienteId: number): Promise<Cita[]> {
    const result = await pool.query(
      'SELECT * FROM citas WHERE vehiculo_cliente_id = $1 ORDER BY fecha DESC, hora DESC',
      [vehiculoClienteId]
    );
    return result.rows;
  },

  // Obtener citas por fecha
  async getByFecha(fecha: string): Promise<Cita[]> {
    const result = await pool.query(
      'SELECT * FROM citas WHERE fecha = $1 ORDER BY hora',
      [fecha]
    );
    return result.rows;
  },

  // Obtener citas por usuario_id (si necesitas esta funcionalidad)
  async getByUsuarioId(usuarioId: number): Promise<Cita[]> {
    const result = await pool.query(
      'SELECT * FROM citas WHERE usuario_id = $1 ORDER BY fecha DESC, hora DESC',
      [usuarioId]
    );
    return result.rows;
  },

  // Obtener citas por estado
  async getByEstado(estado: string): Promise<Cita[]> {
    const result = await pool.query(
      'SELECT * FROM citas WHERE estado = $1 ORDER BY fecha, hora',
      [estado]
    );
    return result.rows;
  },

  // Verificar si existe una cita en la misma fecha y hora para un vehiculo_cliente_id
  async checkCitaExistente(
    vehiculoClienteId: number,  // Cambiado: era vehiculoPlaca
    fecha: string, 
    hora: string, 
    excludeId?: number
  ): Promise<{ exists: boolean; data: Cita | null }> {
    let query = `
      SELECT * FROM citas 
      WHERE vehiculo_cliente_id = $1 
      AND fecha = $2 
      AND hora = $3
      AND estado NOT IN ('Cancelada', 'Completada')
    `;
    
    const params: any[] = [vehiculoClienteId, fecha, hora];
    
    if (excludeId) {
      query += ` AND id != $4`;
      params.push(excludeId);
    }

    const result = await pool.query(query, params);
    
    return {
      exists: result.rows.length > 0,
      data: result.rows[0] || null
    };
  },

  // Crear nueva cita
  async create(cita: Omit<Cita, 'id' | 'created_at' | 'updated_at'>): Promise<Cita> {
    const result = await pool.query(
      `INSERT INTO citas 
       (vehiculo_cliente_id, fecha, hora, descripcion, estado) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [
        cita.vehiculo_cliente_id,
        cita.fecha,
        cita.hora,
        cita.descripcion,
        cita.estado || 'En Espera'
      ]
    );
    return result.rows[0];
  },

  // Actualizar cita
  async update(id: number, cita: Partial<Cita>): Promise<Cita | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (cita.vehiculo_cliente_id !== undefined) {
      fields.push(`vehiculo_cliente_id = $${paramCount}`);
      values.push(cita.vehiculo_cliente_id);
      paramCount++;
    }
    if (cita.fecha) {
      fields.push(`fecha = $${paramCount}`);
      values.push(cita.fecha);
      paramCount++;
    }
    if (cita.hora) {
      fields.push(`hora = $${paramCount}`);
      values.push(cita.hora);
      paramCount++;
    }
    if (cita.descripcion) {
      fields.push(`descripcion = $${paramCount}`);
      values.push(cita.descripcion);
      paramCount++;
    }
    if (cita.usuario_id !== undefined) {
      fields.push(`usuario_id = $${paramCount}`);
      values.push(cita.usuario_id);
      paramCount++;
    }
    if (cita.estado) {
      fields.push(`estado = $${paramCount}`);
      values.push(cita.estado);
      paramCount++;
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE citas 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount} 
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  },

  // Actualizar estado de cita
  async updateEstado(id: number, estado: string): Promise<Cita | null> {
    const result = await pool.query(
      'UPDATE citas SET estado = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [estado, id]
    );
    return result.rows[0] || null;
  },

  // Asignar usuario a cita (antes era asignar mecánico)
  async asignarUsuario(id: number, usuarioId: number): Promise<Cita | null> {
    const result = await pool.query(
      'UPDATE citas SET usuario_id = $1, estado = \'Aceptada\', updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [usuarioId, id]
    );
    return result.rows[0] || null;
  },

  // Eliminar cita
  async delete(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM citas WHERE id = $1',
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  },

  // Obtener estadísticas
  async getEstadisticas(): Promise<{
    total: number;
    en_espera: number;
    aceptadas: number;
    completadas: number;
    canceladas: number;
    hoy: number;
  }> {
    const hoy = new Date().toISOString().split('T')[0];
    
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE estado = 'En Espera') as en_espera,
        COUNT(*) FILTER (WHERE estado = 'Aceptada') as aceptadas,
        COUNT(*) FILTER (WHERE estado = 'Completada') as completadas,
        COUNT(*) FILTER (WHERE estado = 'Cancelada') as canceladas,
        COUNT(*) FILTER (WHERE fecha = $1) as hoy
      FROM citas
    `, [hoy]);
    
    return result.rows[0];
  },

  // Verificar disponibilidad de usuario en fecha y hora (antes era mecánico)
  async checkDisponibilidadUsuario(
    usuarioId: number,  // Cambiado: era mecanico
    fecha: string, 
    hora: string, 
    excludeId?: number
  ): Promise<boolean> {
    let query = `
      SELECT COUNT(*) as count 
      FROM citas 
      WHERE usuario_id = $1 
      AND fecha = $2 
      AND hora = $3
      AND estado NOT IN ('Cancelada')
    `;
    
    const params: any[] = [usuarioId, fecha, hora];
    
    if (excludeId) {
      query += ` AND id != $4`;
      params.push(excludeId);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count) === 0;
  },

  // Obtener citas próximas (hoy y futuro)
  async getProximasCitas(limit?: number): Promise<Cita[]> {
    const hoy = new Date().toISOString().split('T')[0];
    let query = `
      SELECT * FROM citas 
      WHERE fecha >= $1 
      AND estado IN ('En Espera', 'Aceptada')
      ORDER BY fecha, hora
    `;
    
    const params = [hoy];
    
    if (limit) {
      query += ` LIMIT $2`;
      params.push(limit.toString());
    }
    
    const result = await pool.query(query, params);
    return result.rows;
  }
};