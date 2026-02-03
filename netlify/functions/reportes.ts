import { Handler } from '@netlify/functions';
import { getConnection, corsHeaders, successResponse, errorResponse } from './utils/db';
import { requireAuth } from './utils/requireAuth';

/**
 * Función Netlify para gestionar reportes del sistema
 * Endpoint: /.netlify/functions/reportes
 * 
 * CRUD completo conectado a tabla reportes en Neon PostgreSQL
 */
export const handler: Handler = async (event) => {
  // Manejar preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const user = requireAuth(event);
    const TALLER_ID = user.taller_id;
    TALLER_ID; // Usado para futuras extensiones
    
    const sql = getConnection();

    // GET - Obtener reportes (todos o por ID)
    if (event.httpMethod === 'GET') {
      const pathParts = event.path.split('/').filter(Boolean);
      const id = pathParts[pathParts.length - 1];

      // GET /reportes/:id - Obtener un reporte específico
      if (id && !isNaN(Number(id))) {
        const result = await sql`
          SELECT * FROM reportes 
          WHERE id = ${id}
        `;

        if (result.length === 0) {
          return errorResponse('Reporte no encontrado', 404);
        }

        return successResponse(result[0]);
      }

      // GET /reportes - Obtener todos los reportes con filtros
      const orden = event.queryStringParameters?.orden || 'nuevo';
      const usuario = event.queryStringParameters?.usuario || '';
      const tipo = event.queryStringParameters?.tipo || '';
      const estado = event.queryStringParameters?.estado || '';

      let query = `SELECT * FROM reportes WHERE 1=1`;
      const params: any[] = [];
      let paramCount = 1;

      // Filtrar por usuario
      if (usuario) {
        query += ` AND LOWER(usuario) LIKE $${paramCount}`;
        params.push(`%${usuario.toLowerCase()}%`);
        paramCount++;
      }

      // Filtrar por tipo
      if (tipo) {
        query += ` AND tipo = $${paramCount}`;
        params.push(tipo);
        paramCount++;
      }

      // Filtrar por estado
      if (estado) {
        query += ` AND estado = $${paramCount}`;
        params.push(estado);
        paramCount++;
      }

      // Ordenar por fecha
      query += ` ORDER BY fecha ${orden === 'nuevo' ? 'DESC' : 'ASC'}`;

      const reportes = await sql(query, params);
      return successResponse(reportes);
    }

    // POST - Crear nuevo reporte
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { tipo, usuario, descripcion, detalles, estado } = body;

      // Validaciones
      if (!tipo || !usuario || !descripcion) {
        return errorResponse('Campos requeridos: tipo, usuario, descripcion', 400);
      }

      const estadoFinal = estado || 'pendiente';
      if (!['pendiente', 'en-proceso', 'atendido'].includes(estadoFinal)) {
        return errorResponse('Estado inválido. Use: pendiente, en-proceso, atendido', 400);
      }

      const result = await sql`
        INSERT INTO reportes (tipo, usuario, descripcion, estado, detalles)
        VALUES (${tipo}, ${usuario}, ${descripcion}, ${estadoFinal}, ${detalles ? JSON.stringify(detalles) : null})
        RETURNING *
      `;

      return successResponse(result[0], 201);
    }

    // PUT - Actualizar reporte
    if (event.httpMethod === 'PUT') {
      const pathParts = event.path.split('/').filter(Boolean);
      const id = pathParts[pathParts.length - 1];

      if (!id || isNaN(Number(id))) {
        return errorResponse('ID de reporte inválido', 400);
      }

      const body = JSON.parse(event.body || '{}');
      const { estado, descripcion, detalles } = body;

      // Validar estado si se proporciona
      if (estado && !['pendiente', 'en-proceso', 'atendido'].includes(estado)) {
        return errorResponse('Estado inválido. Use: pendiente, en-proceso, atendido', 400);
      }

      // Construir UPDATE dinámicamente según campos proporcionados
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (estado) {
        updates.push(`estado = $${paramCount}`);
        values.push(estado);
        paramCount++;
      }

      if (descripcion) {
        updates.push(`descripcion = $${paramCount}`);
        values.push(descripcion);
        paramCount++;
      }

      if (detalles) {
        updates.push(`detalles = $${paramCount}`);
        values.push(JSON.stringify(detalles));
        paramCount++;
      }

      if (updates.length === 0) {
        return errorResponse('No se proporcionaron campos para actualizar', 400);
      }

      values.push(id);
      const query = `
        UPDATE reportes 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await sql(query, values);

      if (result.length === 0) {
        return errorResponse('Reporte no encontrado', 404);
      }

      return successResponse(result[0]);
    }

    // DELETE - Eliminar reporte
    if (event.httpMethod === 'DELETE') {
      const pathParts = event.path.split('/').filter(Boolean);
      const id = pathParts[pathParts.length - 1];

      if (!id || isNaN(Number(id))) {
        return errorResponse('ID de reporte inválido', 400);
      }

      const result = await sql`
        DELETE FROM reportes 
        WHERE id = ${id}
        RETURNING *
      `;

      if (result.length === 0) {
        return errorResponse('Reporte no encontrado', 404);
      }

      return successResponse({ id: Number(id), deleted: true });
    }

    return errorResponse('Método no permitido', 405);

  } catch (error) {
    console.error('Error en reportes:', error);
    
    if (error instanceof Error) {
      if (error.message === 'NO_TOKEN') {
        return errorResponse('No se proporcionó token de autenticación', 401);
      }
      if (error.message === 'INVALID_TOKEN') {
        return errorResponse('Token de autenticación inválido', 401);
      }
      return errorResponse(error.message, 500);
    }
    
    return errorResponse('Error desconocido', 500);
  }
};
