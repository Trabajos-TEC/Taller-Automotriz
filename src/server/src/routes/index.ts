import { Router } from 'express';
import clientesRoutes from './clientes.routes';

const router = Router();

// Rutas de clientes
router.use('/clientes', clientesRoutes);

// Ruta de ejemplo para vehículos (próximamente)
router.get('/vehiculos', (_req, res) => {
  res.json({
    message: 'Lista de vehículos (próximamente)',
    data: []
  });
});

// Ruta de ejemplo para servicios (próximamente)
router.get('/servicios', (_req, res) => {
  res.json({
    message: 'Lista de servicios (próximamente)',
    data: []
  });
});

export default router;
