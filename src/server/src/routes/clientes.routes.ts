import { Router } from 'express';
import { ClienteController } from '../controllers/cliente.controller';

const router = Router();

// Ruta para obtener todos los clientes (con búsqueda opcional)
// GET /api/clientes?search=juan
router.get('/', ClienteController.getClientes);

// Ruta para verificar si una cédula existe
// GET /api/clientes/check/123456789
router.get('/check/:cedula', ClienteController.checkCedula);

// Ruta para obtener un cliente por cédula
// GET /api/clientes/123456789
router.get('/:cedula', ClienteController.getClienteByCedula);

// Ruta para crear un nuevo cliente
// POST /api/clientes
router.post('/', ClienteController.createCliente);

// Ruta para actualizar un cliente por cédula
// PUT /api/clientes/123456789
router.put('/:cedula', ClienteController.updateCliente);

// Ruta para eliminar un cliente por cédula
// DELETE /api/clientes/123456789
router.delete('/:cedula', ClienteController.deleteCliente);

export default router;
