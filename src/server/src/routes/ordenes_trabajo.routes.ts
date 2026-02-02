// src/server/src/routes/ordenes_trabajo.routes.ts
import { Router } from 'express';
import { OrdenesTrabajoController } from '../controllers/ordenes_trabajo.controller';

const router = Router();

console.log('✅ Rutas de órdenes de trabajo cargadas');

/**
 * @route   GET /api/ordenes-trabajo
 * @desc    Obtener todas las órdenes de trabajo con opción de búsqueda
 * @access  Public
 */
router.get('/', OrdenesTrabajoController.getAll);



/**
 * @route   GET /api/ordenes-trabajo/vehiculo-cliente/:vehiculoClienteId
 * @desc    Obtener órdenes por ID de vehículo-cliente
 * @access  Public
 */
router.get('/vehiculo-cliente/:vehiculoClienteId', OrdenesTrabajoController.getByVehiculoClienteId);

/**
 * @route   GET /api/ordenes-trabajo/mecanico/:mecanicoId
 * @desc    Obtener órdenes por ID de mecánico
 * @access  Public
 */
router.get('/mecanico/:mecanicoId', OrdenesTrabajoController.getByMecanicoId);

/**
 * @route   GET /api/ordenes-trabajo/estado/:estado
 * @desc    Obtener órdenes por estado
 * @access  Public
 */
router.get('/estado/:estado', OrdenesTrabajoController.getByEstado);

/**
 * @route   GET /api/ordenes-trabajo/fecha/:fecha_desde/:fecha_hasta
 * @desc    Obtener órdenes por rango de fechas
 * @access  Public
 */
router.get('/fecha/:fecha_desde/:fecha_hasta', OrdenesTrabajoController.getByFechaRango);

/**
 * @route   GET /api/ordenes-trabajo/estadisticas
 * @desc    Obtener estadísticas de órdenes de trabajo
 * @access  Public
 */
router.get('/estadisticas', OrdenesTrabajoController.getEstadisticas);

/**
 * @route   POST /api/ordenes-trabajo
 * @desc    Crear una nueva orden de trabajo
 * @access  Public
 */
router.post('/', OrdenesTrabajoController.create);

/**
 * @route   PUT /api/ordenes-trabajo/:id
 * @desc    Actualizar una orden de trabajo completa
 * @access  Public
 */
router.put('/:id', OrdenesTrabajoController.update);

/**
 * @route   PATCH /api/ordenes-trabajo/:id/estado
 * @desc    Actualizar solo el estado de una orden de trabajo
 * @access  Public
 */
router.patch('/:id/estado', OrdenesTrabajoController.updateEstado);

/**
 * @route   PATCH /api/ordenes-trabajo/:id/asignar-mecanico
 * @desc    Asignar mecánico a una orden de trabajo
 * @access  Public
 */
router.patch('/:id/asignar-mecanico', OrdenesTrabajoController.asignarMecanico);

/**
 * @route   PATCH /api/ordenes-trabajo/:id/notas
 * @desc    Agregar notas a una orden de trabajo
 * @access  Public
 */
router.patch('/:id/notas', OrdenesTrabajoController.agregarNotas);

/**
 * @route   DELETE /api/ordenes-trabajo/:id
 * @desc    Eliminar una orden de trabajo
 * @access  Public
 */
router.delete('/:id', OrdenesTrabajoController.delete);

/**
 * @route   GET /api/ordenes-trabajo/:id
 * @desc    Obtener una orden de trabajo por ID
 * @access  Public
 */
router.get('/:id', OrdenesTrabajoController.getById);

export default router;