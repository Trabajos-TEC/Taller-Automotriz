
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import errorHandler from './middlewares/errorHandler';
import routes from './routes';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Servidor del taller automotriz funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Rutas de la API
app.use('/api', routes);

// Manejo de errores global
app.use(errorHandler);

// Ruta para 404
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada'
  });
});

// Iniciar servidor y probar conexi�n a la base de datos
const startServer = async () => {
  try {
    // Probar conexi�n a la base de datos
    await testConnection();
    
    app.listen(PORT, () => {
      console.log('Servidor iniciado en http://localhost:' + PORT);
      console.log('Health check disponible en http://localhost:' + PORT + '/api/health');
      console.log('API disponible en http://localhost:' + PORT + '/api');
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
