import { Request, Response, NextFunction } from 'express';

// Interfaz para errores personalizados
interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction  // Prefijo con _ para indicar que no se usa
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  err.message = err.message || 'Error interno del servidor';

  // Log del error en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      status: err.status,
      statusCode: err.statusCode,
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method
    });
  }

  // Responder al cliente
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
