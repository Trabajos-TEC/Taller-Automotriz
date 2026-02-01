import { verifyToken } from './auth';
import { errorResponse } from './db';

export function requireAuth(event: any) {
  const authHeader = event.headers.authorization;

  if (!authHeader) {
    throw errorResponse('Token requerido', 401);
  }

  const token = authHeader.replace('Bearer ', '');
  return verifyToken(token);
}
