import { Router } from 'express';
import clientesRoutes from './clientes.routes';
import vehiculosBaseRoutes from './vehiculos_base.routes';  
import inventarioRoutes from './inventario.routes';       
import vehiculosClientesRoutes from './vehiculos_clientes.routes';
import authRoutes from './auth.routes'
import usuariosRoutes from './usuario.routes';
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

// Rutas de autenticaci�n
router.use('/auth', authRoutes);

// Rutas de usuarios
router.use('/usuarios', usuariosRoutes);

// Rutas de citas
router.use('/citas', citasRoutes);

export default router;
