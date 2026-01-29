import { Handler } from '@netlify/functions';

/**
 * Función Netlify para gestionar reportes del sistema
 * Endpoint: /.netlify/functions/reportes
 * 
 * Por ahora retorna datos de ejemplo hasta que se implemente la tabla en la DB
 */
export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // GET - Obtener reportes
    if (event.httpMethod === 'GET') {
      const orden = event.queryStringParameters?.orden || 'nuevo';
      const usuario = event.queryStringParameters?.usuario || '';

      // Datos de ejemplo (temporal - reemplazar con query a DB cuando se implemente tabla reportes)
      let reportes = [
        {
          id: 1,
          tipo: 'Clientes',
          usuario: 'Juan Pérez',
          descripcion: 'Error al actualizar información de cliente ABC-123',
          fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          estado: 'pendiente' as const,
          detalles: { cliente_id: 123, placa: 'ABC-123' }
        },
        {
          id: 2,
          tipo: 'Vehiculos',
          usuario: 'María González',
          descripcion: 'No se puede agregar vehículo nuevo',
          fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          estado: 'en-proceso' as const,
          detalles: { error: 'VIN duplicado' }
        },
        {
          id: 3,
          tipo: 'Inventario',
          usuario: 'Admin Sistema',
          descripcion: 'Stock bajo en filtros de aceite',
          fecha: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          estado: 'pendiente' as const,
          detalles: { producto: 'FIL-001', cantidad: 5 }
        },
        {
          id: 4,
          tipo: 'Sistema',
          usuario: 'Juan Pérez',
          descripcion: 'Lentitud en carga de reportes',
          fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          estado: 'atendido' as const,
          detalles: { tiempo_carga: '5s' }
        }
      ];

      // Filtrar por usuario si se proporciona
      if (usuario) {
        reportes = reportes.filter(r => 
          r.usuario.toLowerCase().includes(usuario.toLowerCase())
        );
      }

      // Ordenar
      reportes.sort((a, b) => {
        const dateA = new Date(a.fecha).getTime();
        const dateB = new Date(b.fecha).getTime();
        return orden === 'nuevo' ? dateB - dateA : dateA - dateB;
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: reportes,
          count: reportes.length,
        }),
      };
    }

    // PUT - Actualizar estado de reporte
    if (event.httpMethod === 'PUT') {
      const pathParts = event.path.split('/');
      const id = parseInt(pathParts[pathParts.length - 1]);
      const body = JSON.parse(event.body || '{}');
      const { estado } = body;

      if (!estado || !['pendiente', 'en-proceso', 'atendido'].includes(estado)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Estado inválido'
          }),
        };
      }

      // Por ahora solo retorna éxito (cuando se implemente DB, hacer UPDATE)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            id,
            estado,
            updated_at: new Date().toISOString()
          },
          message: 'Reporte actualizado correctamente'
        }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };

  } catch (error) {
    console.error('Error en reportes:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido',
      }),
    };
  }
};
