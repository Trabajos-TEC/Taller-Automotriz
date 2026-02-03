import { Handler } from '@netlify/functions';
import { 
  getConnection, 
  corsHeaders, 
  successResponse, 
  errorResponse 
} from './utils/db';
import { requireAuth } from './utils/requireAuth';

export const handler: Handler = async (event) => {
  // CORS primero
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    // Autenticación
    const user = requireAuth(event);
    const TALLER_ID = user.taller_id;

    const sql = getConnection();
    
    // Analizar la ruta correctamente
    const basePath = '/.netlify/functions/servicios';
    const path = event.path.startsWith(basePath) 
      ? event.path.substring(basePath.length)
      : event.path;
    
    const segments = path.split('/').filter(Boolean);

    // Solo soportamos GET por ahora
    if (event.httpMethod !== 'GET') {
      return errorResponse('Método no permitido', 405);
    }

    // CASO 1: GET /servicios/codigo/:codigo
    if (segments[0] === 'codigo' && segments[1]) {
      const codigo = segments[1];
      
      const servicio = await sql`
        SELECT * FROM servicios 
        WHERE codigo = ${codigo} 
          AND taller_id = ${TALLER_ID}
          AND activo = true
        LIMIT 1
      `;
      
      if (servicio.length === 0) {
        return errorResponse('Servicio no encontrado', 404);
      }
      
      return successResponse(servicio[0]);
    }
    // CASO 2: GET /servicios/:id
    else if (segments[0] && !isNaN(parseInt(segments[0]))) {
      const id = parseInt(segments[0]);
      
      const servicio = await sql`
        SELECT * FROM servicios 
        WHERE id = ${id} 
          AND taller_id = ${TALLER_ID}
          AND activo = true
        LIMIT 1
      `;
      
      if (servicio.length === 0) {
        return errorResponse('Servicio no encontrado', 404);
      }
      
      return successResponse(servicio[0]);
    }
    // CASO 3: GET /servicios (todos los servicios)
    else {
      const servicios = await sql`
        SELECT * FROM servicios 
        WHERE taller_id = ${TALLER_ID}
          AND activo = true
        ORDER BY nombre
      `;
      
      return successResponse(servicios);
    }

  } catch (err: any) {
    // Errores de autenticación
    if (err.message === 'NO_TOKEN' || err.message === 'INVALID_TOKEN') {
      return errorResponse('Token inválido o faltante', 401);
    }
    
    console.error('Error en endpoint de servicios:', err);
    return errorResponse('Error interno del servidor', 500);
  }
};