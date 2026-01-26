import { Router } from 'express';
import { InventarioController } from '../controllers/inventario.controller';

const router = Router();

/**
 * @route   GET /api/inventario
 * @desc    Obtener todos los productos del inventario
 * @access  Public
 */
router.get('/', InventarioController.getAll);

/**
 * @route   GET /api/inventario/:codigo
 * @desc    Obtener un producto por código
 * @access  Public
 */
router.get('/:codigo', InventarioController.getByCodigo);

/**
 * @route   GET /api/inventario/check/:codigo
 * @desc    Verificar si un código existe
 * @access  Public
 */
router.get('/check/:codigo', InventarioController.checkCodigo);

/**
 * @route   POST /api/inventario
 * @desc    Crear un nuevo producto
 * @access  Public
 */
router.post('/', InventarioController.create);

/**
 * @route   PUT /api/inventario/:codigo
 * @desc    Actualizar un producto
 * @access  Public
 */
router.put('/:codigo', InventarioController.update);

/**
 * @route   DELETE /api/inventario/:codigo
 * @desc    Eliminar un producto
 * @access  Public
 */
router.delete('/:codigo', InventarioController.delete);

export default router;