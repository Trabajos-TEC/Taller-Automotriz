import { Handler } from '@netlify/functions';
import { getConnection, corsHeaders, successResponse, errorResponse } from './utils/db';

/**
 * Función Netlify para gestionar clientes
 * Endpoint: /.netlify/functions/clientes
 * Soporta: GET (todos/búsqueda), POST, PUT, DELETE
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const sql = getConnection();
    const pathParts = event.path.split('/').filter(Boolean);
    const cedula = pathParts[pathParts.length - 1] !== 'clientes' ? pathParts[pathParts.length - 1] : null;

    // GET - Obtener clientes
    if (event.httpMethod === 'GET') {
      const search = event.queryStringParameters?.search || '';

      // GET /clientes/:cedula - Cliente específico
      if (cedula && cedula !== 'clientes' && !cedula.includes('check')) {
        const cliente = await sql`
          SELECT * FROM clientes WHERE cedula = ${cedula} LIMIT 1
        `;
        
        if (cliente.length === 0) {
          return errorResponse('Cliente no encontrado', 404);
        }
        
        return successResponse(cliente[0]);
      }

      // GET /clientes/check/:cedula - Verificar existencia
      if (event.path.includes('/check/')) {
        const cedulaCheck = pathParts[pathParts.length - 1];
        const exists = await sql`
          SELECT * FROM clientes WHERE cedula = ${cedulaCheck} LIMIT 1
        `;
        
        return successResponse({
          exists: exists.length > 0,
          data: exists.length > 0 ? exists[0] : null
        });
      }

      // GET /clientes - Todos los clientes con búsqueda opcional
      let clientes;
      if (search) {
        clientes = await sql`
          SELECT * FROM clientes 
          WHERE nombre ILIKE ${'%' + search + '%'} 
             OR cedula ILIKE ${'%' + search + '%'}
             OR correo ILIKE ${'%' + search + '%'}
          ORDER BY nombre
        `;
      } else {
        clientes = await sql`
          SELECT * FROM clientes 
          ORDER BY nombre
        `;
      }

      return successResponse(clientes);
    }

    // POST - Crear cliente
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { nombre, cedula, correo, numero } = body;

      if (!nombre || !cedula) {
        return errorResponse('Nombre y cédula son requeridos', 400);
      }

      // Verificar si la cédula ya existe
      const existing = await sql`
        SELECT id FROM clientes WHERE cedula = ${cedula} LIMIT 1
      `;
      
      if (existing.length > 0) {
        return errorResponse('La cédula ya está registrada', 409);
      }

      const result = await sql`
        INSERT INTO clientes (nombre, cedula, correo, numero)
        VALUES (${nombre}, ${cedula}, ${correo || null}, ${numero || null})
        RETURNING *
      `;

      return successResponse(result[0], 201);
    }

    // PUT - Actualizar cliente
    if (event.httpMethod === 'PUT' && cedula) {
      const body = JSON.parse(event.body || '{}');
      const { nombre, correo, numero } = body;

      const result = await sql`
        UPDATE clientes
        SET nombre = COALESCE(${nombre}, nombre),
            correo = COALESCE(${correo}, correo),
            numero = COALESCE(${numero}, numero)
        WHERE cedula = ${cedula}
        RETURNING *
      `;

      if (result.length === 0) {
        return errorResponse('Cliente no encontrado', 404);
      }

      return successResponse(result[0]);
    }

    // DELETE - Eliminar cliente
    if (event.httpMethod === 'DELETE' && cedula) {
      const result = await sql`
        DELETE FROM clientes WHERE cedula = ${cedula} RETURNING id
      `;

      if (result.length === 0) {
        return errorResponse('Cliente no encontrado', 404);
      }

      return successResponse({ message: 'Cliente eliminado exitosamente' });
    }

    return errorResponse('Método no permitido', 405);

  } catch (error) {
    console.error('Error en clientes:', error);
    return errorResponse(error instanceof Error ? error : 'Error interno del servidor');
  }
};
