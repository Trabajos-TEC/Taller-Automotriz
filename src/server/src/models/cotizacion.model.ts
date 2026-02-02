// src/models/cotizacion.model.ts
import pool from '../config/database';

export class CotizacionModel {
  static async getAll() {
    const { rows } = await pool.query(
      `SELECT * FROM cotizaciones ORDER BY fecha_creacion DESC`
    );
    return rows;
  }

  static async getByCodigo(codigo: string) {
    const { rows } = await pool.query(
      `SELECT * FROM cotizaciones WHERE codigo = $1`,
      [codigo]
    );
    return rows[0] || null;
  }

  static async create(data: any) {
    const query = `
      INSERT INTO cotizaciones (
        codigo, cliente_nombre, cliente_cedula, vehiculo_placa,
        descuento_mano_obra, subtotal_repuestos, subtotal_mano_obra,
        iva, total, estado, es_proforma,
        codigo_orden_trabajo, mecanico_orden_trabajo
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
      )
      RETURNING *
    `;

    const values = [
      data.codigo,
      data.clienteNombre,
      data.clienteCedula,
      data.vehiculoPlaca,
      data.descuentoManoObra,
      data.subtotalRepuestos,
      data.subtotalManoObra,
      data.iva,
      data.total,
      data.estado,
      data.esProforma,
      data.codigoOrdenTrabajo,
      data.mecanicoOrdenTrabajo,
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async updateEstado(codigo: string, estado: string) {
    const { rows } = await pool.query(
      `UPDATE cotizaciones SET estado=$1 WHERE codigo=$2 RETURNING *`,
      [estado, codigo]
    );
    return rows[0];
  }

  static async delete(codigo: string) {
    await pool.query(`DELETE FROM cotizaciones WHERE codigo=$1`, [codigo]);
    return true;
  }
}
