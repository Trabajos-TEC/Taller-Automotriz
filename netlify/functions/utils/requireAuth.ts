import { verifyToken } from './auth';

export function requireAuth(event: any) {
  const authHeader =
    event.headers.authorization ||
    event.headers.Authorization;

  if (!authHeader) {
    throw new Error('NO_TOKEN');
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    return verifyToken(token);
  } catch {
    throw new Error('INVALID_TOKEN');
  }
}
