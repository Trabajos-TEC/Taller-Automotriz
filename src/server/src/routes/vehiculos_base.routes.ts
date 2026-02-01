import { Router } from 'express';
import { VehiculoBaseController } from '../controllers/vehiculo_base.controller';

const router = Router();

/**
 * @route   GET /api/vehiculos-base
 * @desc    Obtener todos los vehículos base
 * @access  Public
 */
router.get('/', VehiculoBaseController.getAll);

/**
 * @route   GET /api/vehiculos-base/:id
 * @desc    Obtener un vehículo base por ID
 * @access  Public
 */
router.get('/:id', VehiculoBaseController.getById);

/**
 * @route   POST /api/vehiculos-base
 * @desc    Crear un nuevo vehículo base
 * @access  Public
 */
router.post('/', VehiculoBaseController.create);

/**
 * @route   PUT /api/vehiculos-base/:id
 * @desc    Actualizar un vehículo base
 * @access  Public
 */
router.put('/:id', VehiculoBaseController.update);

/**
 * @route   DELETE /api/vehiculos-base/:id
 * @desc    Eliminar un vehículo base
 * @access  Public
 */
router.delete('/:id', VehiculoBaseController.delete);

export default router;