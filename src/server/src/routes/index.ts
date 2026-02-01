import { Router } from 'express';
import clientesRoutes from './clientes.routes';
import vehiculosBaseRoutes from './vehiculos_base.routes';  
import inventarioRoutes from './inventario.routes';       
import vehiculosClientesRoutes from './vehiculos_clientes.routes';
import authRoutes from './auth.routes'
import usuariosRoutes from './usuario.routes';
import ordenesTrabajoRoutes from './ordenes_trabajo.routes';
import citasRoutes from './citas.routes';

const router = Router();

// Rutas de clientes
router.use('/clientes', clientesRoutes);

// Ruta de  para vehiculos_base
router.use('/vehiculos-base', vehiculosBaseRoutes);  // Nueva

// Ruta de  para inventario
router.use('/inventario', inventarioRoutes);        // Nueva

// Rutas para vehiculos_clientes - NUEVA
router.use('/vehiculos-clientes', vehiculosClientesRoutes);

//
router.use('/auth', authRoutes);

//
router.use('/usuarios', usuariosRoutes);

export default router;
