import { Handler } from '@netlify/functions';
import { getConnection, corsHeaders, successResponse, errorResponse } from './utils/db';
import { requireAuth } from './utils/requireAuth';

/**
 * Función Netlify para gestionar inventario
 * Endpoint: /.netlify/functions/inventario
 * Soporta: GET, POST, PUT, DELETE
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const user = requireAuth(event);
    const TALLER_ID = user.taller_id;
    TALLER_ID; // Usado para futuras extensiones
    
    const sql = getConnection();
    const pathParts = event.path.split('/').filter(Boolean);
    const codigo = pathParts[pathParts.length - 1] !== 'inventario' ? pathParts[pathParts.length - 1] : null;

    // GET - Obtener inventario
    if (event.httpMethod === 'GET') {
      const search = event.queryStringParameters?.search || '';

      // GET /inventario/:codigo - Producto específico
      if (codigo && codigo !== 'inventario' && !codigo.includes('check')) {
        const producto = await sql`
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
          WHERE i.codigo = ${codigo}
          GROUP BY i.id
          LIMIT 1
        `;
        
        if (producto.length === 0) {
          return errorResponse('Producto no encontrado', 404);
        }
        
        return successResponse(producto[0]);
      }

      // GET /inventario/check/:codigo - Verificar existencia
      if (event.path.includes('/check/')) {
        const codigoCheck = pathParts[pathParts.length - 1];
        const exists = await sql`
          SELECT * FROM inventario WHERE codigo = ${codigoCheck} LIMIT 1
        `;
        
        return successResponse({
          exists: exists.length > 0,
          data: exists.length > 0 ? exists[0] : null
        });
      }

      // GET /inventario - Todos los productos con búsqueda opcional
      let inventario;
      if (search) {
        inventario = await sql`
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
          WHERE 
            i.codigo ILIKE ${'%' + search + '%'} OR 
            i.nombre ILIKE ${'%' + search + '%'} OR 
            i.descripcion ILIKE ${'%' + search + '%'}
          GROUP BY i.id 
          ORDER BY i.codigo
        `;
      } else {
        inventario = await sql`
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
          GROUP BY i.id 
          ORDER BY i.codigo
        `;
      }

      return successResponse(inventario);
    }

    // POST - Crear producto
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { codigo, nombre, descripcion, categoria, cantidad, cantidad_minima, precio_compra, precio_venta, proveedor, vehiculos_ids } = body;

      if (!codigo || !nombre || !categoria) {
        return errorResponse('Código, nombre y categoría son requeridos', 400);
      }

      // Verificar código único
      const existing = await sql`
        SELECT id FROM inventario WHERE codigo = ${codigo} LIMIT 1
      `;
      
      if (existing.length > 0) {
        return errorResponse('El código ya está registrado', 409);
      }

      const result = await sql`
        INSERT INTO inventario 
          (codigo, nombre, descripcion, categoria, cantidad, cantidad_minima, precio_compra, precio_venta, proveedor)
        VALUES 
          (${codigo}, ${nombre}, ${descripcion || null}, ${categoria}, ${cantidad || 0}, ${cantidad_minima || 0}, ${precio_compra || 0}, ${precio_venta || 0}, ${proveedor || null})
        RETURNING *
      `;

      // Asociar con vehículos si se proporcionan
      if (vehiculos_ids && Array.isArray(vehiculos_ids) && vehiculos_ids.length > 0) {
        for (const vehiculoId of vehiculos_ids) {
          await sql`
            INSERT INTO inventario_vehiculos (inventario_id, vehiculo_base_id)
            VALUES (${result[0].id}, ${vehiculoId})
            ON CONFLICT DO NOTHING
          `;
        }
      }

      return successResponse(result[0], 201);
    }

    // PUT - Actualizar producto
    if (event.httpMethod === 'PUT' && codigo) {
      const body = JSON.parse(event.body || '{}');
      const { nombre, descripcion, categoria, cantidad, cantidad_minima, precio_compra, precio_venta, proveedor } = body;

      const result = await sql`
        UPDATE inventario
        SET nombre = COALESCE(${nombre}, nombre),
            descripcion = COALESCE(${descripcion}, descripcion),
            categoria = COALESCE(${categoria}, categoria),
            cantidad = COALESCE(${cantidad}, cantidad),
            cantidad_minima = COALESCE(${cantidad_minima}, cantidad_minima),
            precio_compra = COALESCE(${precio_compra}, precio_compra),
            precio_venta = COALESCE(${precio_venta}, precio_venta),
            proveedor = COALESCE(${proveedor}, proveedor)
        WHERE codigo = ${codigo}
        RETURNING *
      `;

      if (result.length === 0) {
        return errorResponse('Producto no encontrado', 404);
      }

      return successResponse(result[0]);
    }

    // DELETE - Eliminar producto
    if (event.httpMethod === 'DELETE' && codigo) {
      // Primero eliminar asociaciones
      await sql`
        DELETE FROM inventario_vehiculos 
        WHERE inventario_id = (SELECT id FROM inventario WHERE codigo = ${codigo})
      `;

      const result = await sql`
        DELETE FROM inventario WHERE codigo = ${codigo} RETURNING id
      `;

      if (result.length === 0) {
        return errorResponse('Producto no encontrado', 404);
      }

      return successResponse({ message: 'Producto eliminado exitosamente' });
    }

    return errorResponse('Método no permitido', 405);

  } catch (error) {
    console.error('Error en inventario:', error);
    
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
