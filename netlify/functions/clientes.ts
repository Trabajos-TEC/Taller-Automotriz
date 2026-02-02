import { Handler } from '@netlify/functions';
import {
  getConnection,
  corsHeaders,
  successResponse,
  errorResponse
} from './utils/db';
import { requireAuth } from './utils/requireAuth';

/**
 * Función Netlify para gestionar clientes
 * Endpoint: /.netlify/functions/clientes
 * Soporta: GET, POST, PUT, DELETE
 */
export const handler: Handler = async (event) => {

  // ✅ CORS primero (antes de auth)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    // 🔐 AUTH DENTRO DEL TRY (CLAVE)
    const user = requireAuth(event);
    const TALLER_ID = user.taller_id;

    const sql = getConnection();
    const pathParts = event.path.split('/').filter(Boolean);
    const cedula =
      pathParts[pathParts.length - 1] !== 'clientes'
        ? pathParts[pathParts.length - 1]
        : null;

    /* =======================
       GET
    ======================= */
    if (event.httpMethod === 'GET') {
      const search = event.queryStringParameters?.search || '';

      // GET /clientes/:cedula
      if (cedula && !cedula.includes('check')) {
        const cliente = await sql`
          SELECT *
          FROM clientes
          WHERE cedula = ${cedula}
            AND taller_id = ${TALLER_ID}
          LIMIT 1
        `;

        if (cliente.length === 0) {
          return errorResponse('Cliente no encontrado', 404);
        }

        return successResponse(cliente[0]);
      }

      // GET /clientes/check/:cedula
      if (event.path.includes('/check/')) {
        const cedulaCheck = pathParts[pathParts.length - 1];

        const exists = await sql`
          SELECT *
          FROM clientes
          WHERE cedula = ${cedulaCheck}
            AND taller_id = ${TALLER_ID}
          LIMIT 1
        `;

        return successResponse({
          exists: exists.length > 0,
          data: exists.length > 0 ? exists[0] : null
        });
      }

      // GET /clientes
      const clientes = search
        ? await sql`
            SELECT *
            FROM clientes
            WHERE taller_id = ${TALLER_ID}
              AND (
                nombre ILIKE ${'%' + search + '%'}
                OR cedula ILIKE ${'%' + search + '%'}
                OR correo ILIKE ${'%' + search + '%'}
              )
            ORDER BY nombre
          `
        : await sql`
            SELECT *
            FROM clientes
            WHERE taller_id = ${TALLER_ID}
            ORDER BY nombre
          `;

      return successResponse(clientes);
    }

    /* =======================
       POST
    ======================= */
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { nombre, cedula, correo, numero } = body;

      if (!nombre || !cedula) {
        return errorResponse('Nombre y cédula son requeridos', 400);
      }

      const existing = await sql`
        SELECT id
        FROM clientes
        WHERE cedula = ${cedula}
          AND taller_id = ${TALLER_ID}
        LIMIT 1
      `;

      if (existing.length > 0) {
        return errorResponse('La cédula ya está registrada', 409);
      }

      const result = await sql`
        INSERT INTO clientes
          (nombre, cedula, correo, numero, taller_id)
        VALUES
          (${nombre}, ${cedula}, ${correo || null}, ${numero || null}, ${TALLER_ID})
        RETURNING *
      `;

      return successResponse(result[0], 201);
    }

    /* =======================
       PUT
    ======================= */
    if (event.httpMethod === 'PUT' && cedula) {
      const body = JSON.parse(event.body || '{}');
      const { nombre, correo, numero } = body;

      const result = await sql`
        UPDATE clientes
        SET nombre = COALESCE(${nombre}, nombre),
            correo = COALESCE(${correo}, correo),
            numero = COALESCE(${numero}, numero)
        WHERE cedula = ${cedula}
          AND taller_id = ${TALLER_ID}
        RETURNING *
      `;

      if (result.length === 0) {
        return errorResponse('Cliente no encontrado', 404);
      }

      return successResponse(result[0]);
    }

    /* =======================
       DELETE
    ======================= */
    if (event.httpMethod === 'DELETE' && cedula) {
      const result = await sql`
        DELETE FROM clientes
        WHERE cedula = ${cedula}
          AND taller_id = ${TALLER_ID}
        RETURNING id
      `;

      if (result.length === 0) {
        return errorResponse('Cliente no encontrado', 404);
      }

      return successResponse({ message: 'Cliente eliminado exitosamente' });
    }

    return errorResponse('Método no permitido', 405);

  } catch (err: any) {
    // 🔐 ERRORES DE AUTH (NO MÁS 502)
    if (err.message === 'NO_TOKEN') {
      return errorResponse('Token requerido', 401);
    }

    if (err.message === 'INVALID_TOKEN') {
      return errorResponse('Token inválido', 401);
    }

    console.error('Error en clientes:', err);
    return errorResponse('Error interno del servidor', 500);
  }
};
