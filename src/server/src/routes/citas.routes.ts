import { Router } from 'express';
import { CitasController } from '../controllers/citas.controller';

const router = Router();

/**
 * @route   GET /api/citas
 * @desc    Obtener todas las citas con opción de búsqueda
 * @access  Public
 */
router.get('/', CitasController.getAll);

/**
 * @route   GET /api/citas/:id
 * @desc    Obtener una cita por ID
 * @access  Public
 */
router.get('/:id', CitasController.getById);

/**
 * @route   GET /api/citas/vehiculo-cliente/:vehiculoClienteId
 * @desc    Obtener citas por ID de vehículo-cliente
 * @access  Public
 */
router.get('/vehiculo-cliente/:vehiculoClienteId', CitasController.getByVehiculoClienteId);

/**
 * @route   GET /api/citas/usuario/:usuarioId
 * @desc    Obtener citas por ID de usuario (antes mecánico)
 * @access  Public
 */
router.get('/usuario/:usuarioId', CitasController.getByUsuarioId);

/**
 * @route   GET /api/citas/estado/:estado
 * @desc    Obtener citas por estado
 * @access  Public
 */
router.get('/estado/:estado', CitasController.getByEstado);

/**
 * @route   GET /api/citas/fecha/:fecha
 * @desc    Obtener citas por fecha (YYYY-MM-DD)
 * @access  Public
 */
router.get('/fecha/:fecha', CitasController.getByFecha);

/**
 * @route   GET /api/citas/estadisticas/totales
 * @desc    Obtener estadísticas de citas
 * @access  Public
 */
router.get('/estadisticas/totales', CitasController.getEstadisticas);

/**
 * @route   GET /api/citas/proximas
 * @desc    Obtener citas próximas (opcional limit como query param)
 * @access  Public
 */
router.get('/proximas', CitasController.getProximasCitas);

/**
 * @route   POST /api/citas/check-disponibilidad
 * @desc    Verificar disponibilidad de vehículo-cliente/usuario
 * @access  Public
 */
router.post('/check-disponibilidad', CitasController.checkDisponibilidad);

/**
 * @route   POST /api/citas
 * @desc    Crear una nueva cita
 * @access  Public
 */
router.post('/', CitasController.create);

/**
 * @route   PUT /api/citas/:id
 * @desc    Actualizar una cita completa
 * @access  Public
 */
router.put('/:id', CitasController.update);

/**
 * @route   PATCH /api/citas/:id/estado
 * @desc    Actualizar solo el estado de una cita
 * @access  Public
 */
router.patch('/:id/estado', CitasController.updateEstado);

/**
 * @route   PATCH /api/citas/:id/asignar-usuario
 * @desc    Asignar usuario a una cita (antes mecánico)
 * @access  Public
 */
router.patch('/:id/asignar-usuario', CitasController.asignarUsuario);

/**
 * @route   DELETE /api/citas/:id
 * @desc    Eliminar una cita
 * @access  Public
 */
router.delete('/:id', CitasController.delete);

export default router;