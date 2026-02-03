// src/functions/servicios.ts
import { Handler } from '@netlify/functions';
import { 
  getConnection, 
  corsHeaders, 
  successResponse, 
  errorResponse 
} from './utils/db';
import { requireAuth } from './utils/requireAuth';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const user = requireAuth(event);
    // Servicios es una tabla global sin taller_id

    const sql = getConnection();
    const pathParts = event.path.split('/').filter(Boolean);
    const codigo = pathParts[pathParts.length - 1];

    // GET /servicios
    if (event.httpMethod === 'GET') {
      // GET /servicios/:id o /servicios/codigo/:codigo
      if (pathParts.length > 1) {
        if (pathParts[1] === 'codigo') {
          // GET /servicios/codigo/:codigo
          const servicio = await sql`
            SELECT * FROM servicios 
            WHERE codigo = ${codigo} 
              AND activo = true
            LIMIT 1
          `;
          
          if (servicio.length === 0) {
            return errorResponse('Servicio no encontrado', 404);
          }
          
          return successResponse(servicio[0]);
        } else {
          // GET /servicios/:id
          const id = parseInt(codigo);
          
          if (isNaN(id)) {
            return errorResponse('ID inválido', 400);
          }
          
          const servicio = await sql`
            SELECT * FROM servicios 
            WHERE id = ${id} 
              AND activo = true
            LIMIT 1
          `;
          
          if (servicio.length === 0) {
            return errorResponse('Servicio no encontrado', 404);
          }
          
          return successResponse(servicio[0]);
        }
      }
      
      // GET /servicios (todos los servicios activos)
      const servicios = await sql`
        SELECT * FROM servicios 
        WHERE activo = true
        ORDER BY nombre
      `;
      
      return successResponse(servicios);
    }

    return errorResponse('Método no permitido', 405);

  } catch (err: any) {
    // Manejar errores de auth
    if (err.message === 'NO_TOKEN' || err.message === 'INVALID_TOKEN') {
      return errorResponse('Token inválido o faltante', 401);
    }
    
    console.error('Error en servicios:', err);
    return errorResponse('Error interno del servidor', 500);
  }
};