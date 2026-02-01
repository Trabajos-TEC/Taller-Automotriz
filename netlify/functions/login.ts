import { Handler } from '@netlify/functions';
import { getConnection, corsHeaders, errorResponse } from './utils/db';
import { signToken } from './utils/auth';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: 'Method not allowed' };
  }

  try {
    const { correo, password } = JSON.parse(event.body || '{}');
    const sql = getConnection();

    const usuarios = await sql`
      SELECT id, nombre, correo, cedula, password_hash, roles, activo, taller_id
      FROM usuarios
      WHERE (correo = ${correo} OR cedula = ${correo})
        AND activo = true
      LIMIT 1
    `;

    if (usuarios.length === 0) {
      return errorResponse('Credenciales incorrectas', 401);
    }

    const usuario = usuarios[0];

    const passwordValid =
      password === usuario.cedula ||
      password === usuario.password_hash;

    if (!passwordValid) {
      return errorResponse('Credenciales incorrectas', 401);
    }

    // 👉 JWT con taller_id
    const token = signToken({
      userId: usuario.id,
      rol: usuario.roles,
      taller_id: usuario.taller_id
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        token,
        usuario: {
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.roles
        }
      })
    };

  } catch (err) {
    return errorResponse('Error interno', 500);
  }
};
