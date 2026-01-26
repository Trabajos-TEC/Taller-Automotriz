// src/routes/vehiculos_clientes.routes.ts
import { Router } from 'express';
import { VehiculoClienteController } from '../controllers/vehiculo_cliente.controller';

const router = Router();

/**
 * @route   GET /api/vehiculos-clientes
 * @desc    Obtener todos los vehículos de clientes
 * @access  Public
 */
router.get('/', VehiculoClienteController.getAll);

/**
 * @route   GET /api/vehiculos-clientes/:id
 * @desc    Obtener un vehículo de cliente por ID
 * @access  Public
 */
router.get('/:id', VehiculoClienteController.getById);

/**
 * @route   GET /api/vehiculos-clientes/placa/:placa
 * @desc    Obtener un vehículo de cliente por placa
 * @access  Public
 */
router.get('/placa/:placa', VehiculoClienteController.getByPlaca);

/**
 * @route   GET /api/vehiculos-clientes/check/placa/:placa
 * @desc    Verificar si una placa existe
 * @access  Public
 */
router.get('/check/placa/:placa', VehiculoClienteController.checkPlaca);

/**
 * @route   GET /api/vehiculos-clientes/check/vin/:vin
 * @desc    Verificar si un VIN existe
 * @access  Public
 */
router.get('/check/vin/:vin', VehiculoClienteController.checkVin);

/**
 * @route   POST /api/vehiculos-clientes
 * @desc    Crear un nuevo vehículo de cliente
 * @access  Public
 */
router.post('/', VehiculoClienteController.create);

/**
 * @route   PUT /api/vehiculos-clientes/:id
 * @desc    Actualizar un vehículo de cliente
 * @access  Public
 */
router.put('/:id', VehiculoClienteController.update);

/**
 * @route   DELETE /api/vehiculos-clientes/:id
 * @desc    Eliminar un vehículo de cliente
 * @access  Public
 */
router.delete('/:id', VehiculoClienteController.delete);

export default router;