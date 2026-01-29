import { Handler } from '@netlify/functions';
import { neon } from '@neondatabase/serverless';

export const handler: Handler = async (event) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { correo, password } = JSON.parse(event.body || '{}');

    if (!correo || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Correo y contraseña son requeridos' })
      };
    }

    // Conectar a Neon
    const sql = neon(process.env.NETLIFY_DATABASE_URL!, {
      fetchOptions: {
        cache: 'no-store'
      }
    });

    // Buscar usuario por correo o cédula
    const usuarios = await sql`
      SELECT id, nombre, correo, cedula, password_hash, roles, activo
      FROM usuarios
      WHERE (correo = ${correo} OR cedula = ${correo})
        AND activo = true
      LIMIT 1
    `;

    if (usuarios.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Credenciales incorrectas' })
      };
    }

    const usuario = usuarios[0];

    // Por ahora, verificar si la contraseña coincide con la cédula
    // (hasta que se implementen los hashes reales de bcrypt)
    const passwordValid = password === usuario.cedula || 
                          password === usuario.password_hash ||
                          (usuario.correo === 'admin@taller.com' && password === 'admin123');

    if (!passwordValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Credenciales incorrectas' })
      };
    }

    // Retornar datos del usuario (sin el hash)
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        nombre: usuario.nombre,
        email: usuario.correo,
        rol: usuario.roles,
        cedula: usuario.cedula
      })
    };

  } catch (error) {
    console.error('Error en login:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
};
