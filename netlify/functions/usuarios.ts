import { Handler } from '@netlify/functions';
import { getConnection, corsHeaders, successResponse, errorResponse } from './utils/db';
import { requireAuth } from './utils/requireAuth';

/**
 * Función Netlify para gestionar usuarios del sistema
 * Endpoint: /.netlify/functions/usuarios
 * Soporta: GET, POST, PUT, DELETE
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const user = requireAuth(event);
    const TALLER_ID = user.taller_id;
    
    const sql = getConnection();
    const pathParts = event.path.split('/').filter(Boolean);
    const id = pathParts[pathParts.length - 1] !== 'usuarios' ? pathParts[pathParts.length - 1] : null;

    // GET - Obtener usuarios
    if (event.httpMethod === 'GET') {
      // GET /usuarios - Todos los usuarios del taller (sin password_hash)
      const usuarios = await sql`
        SELECT id, nombre, correo, cedula, roles as rol, activo, created_at, updated_at, taller_id
        FROM usuarios
        WHERE activo = true
          AND taller_id = ${TALLER_ID}
        ORDER BY nombre
      `;

      return successResponse(usuarios);
    }

    // POST - Crear usuario
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { nombre, correo, cedula, roles, password } = body;

      if (!nombre || !correo || !cedula || !roles) {
        return errorResponse('Nombre, correo, cédula y rol son requeridos', 400);
      }

      // Verificar si correo o cédula ya existen
      const existing = await sql`
        SELECT id FROM usuarios 
        WHERE correo = ${correo} OR cedula = ${cedula}
        LIMIT 1
      `;
      
      if (existing.length > 0) {
        return errorResponse('El correo o cédula ya están registrados', 409);
      }

      // Por ahora, usar la cédula como password si no se proporciona
      const passwordHash = password || cedula;

      const result = await sql`
        INSERT INTO usuarios (nombre, correo, cedula, password_hash, roles, activo, taller_id)
        VALUES (${nombre}, ${correo}, ${cedula}, ${passwordHash}, ${roles}, true, ${TALLER_ID})
        RETURNING id, nombre, correo, cedula, roles, activo, created_at, taller_id
      `;

      return successResponse(result[0], 201);
    }

    // PUT - Actualizar usuario
    if (event.httpMethod === 'PUT' && id) {
      const body = JSON.parse(event.body || '{}');
      const { nombre, correo, roles, activo } = body;

      const result = await sql`
        UPDATE usuarios
        SET nombre = COALESCE(${nombre}, nombre),
            correo = COALESCE(${correo}, correo),
            roles = COALESCE(${roles}, roles),
            activo = COALESCE(${activo}, activo),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${parseInt(id)}
          AND taller_id = ${TALLER_ID}
        RETURNING id, nombre, correo, cedula, roles, activo, created_at, updated_at, taller_id
      `;

      if (result.length === 0) {
        return errorResponse('Usuario no encontrado', 404);
      }

      return successResponse(result[0]);
    }

    // DELETE - Desactivar usuario (soft delete)
    if (event.httpMethod === 'DELETE' && id) {
      const result = await sql`
        UPDATE usuarios
        SET activo = false
        WHERE id = ${parseInt(id)}
          AND taller_id = ${TALLER_ID}
        RETURNING id
      `;

      if (result.length === 0) {
        return errorResponse('Usuario no encontrado', 404);
      }

      return successResponse({ message: 'Usuario desactivado exitosamente' });
    }

    return errorResponse('Método no permitido', 405);

  } catch (error) {
    console.error('Error en usuarios:', error);
    
    if (error instanceof Error) {
      if (error.message === 'NO_TOKEN') {
        return errorResponse('No se proporcionó token de autenticación', 401);
      }
      if (error.message === 'INVALID_TOKEN') {
        return errorResponse('Token de autenticación inválido', 401);
      }
      return errorResponse(error.message);
    }
    
    return errorResponse('Error interno del servidor');
  }
};
