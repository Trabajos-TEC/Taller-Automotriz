import { Request, Response } from 'express';
import { ClienteModel } from '../models/cliente.model';
import { Cliente } from '../types';

export class ClienteController {
  // Obtener todos los clientes (con búsqueda opcional)
  static async getClientes(req: Request, res: Response): Promise<Response> {
    try {
      const { search } = req.query;
      const searchTerm = typeof search === 'string' ? search : undefined;
      
      const clientes = await ClienteModel.findAll(searchTerm);
      const total = await ClienteModel.count();
      
      return res.json({
        success: true,
        data: clientes,
        meta: {
          total,
          showing: clientes.length
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener clientes',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener un cliente por cédula
  static async getClienteByCedula(req: Request, res: Response): Promise<Response> {
    try {
      const cedulaParam = req.params.cedula;
      const cedula = Array.isArray(cedulaParam) ? cedulaParam[0] : cedulaParam;
      
      if (!cedula || cedula.length !== 9) {
        return res.status(400).json({
          success: false,
          message: 'La cédula debe tener 9 dígitos'
        });
      }

      const cliente = await ClienteModel.findByCedula(cedula);
      
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      return res.json({
        success: true,
        data: cliente
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener cliente',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Crear un nuevo cliente
  static async createCliente(req: Request, res: Response): Promise<Response> {
    try {
      const { nombre, cedula, correo, numero } = req.body;

      // Validaciones (igual que el frontend)
      const errors: string[] = [];

      if (!nombre || nombre.trim().length === 0) {
        errors.push('El nombre es obligatorio');
      }

      if (!cedula || cedula.trim().length === 0) {
        errors.push('La cédula es obligatoria');
      } else if (!/^\d+$/.test(cedula.trim())) {
        errors.push('La cédula solo puede contener números');
      } else if (cedula.trim().length !== 9) {
        errors.push('La cédula debe tener 9 dígitos');
      }

      if (numero && !/^\d+$/.test(numero.trim())) {
        errors.push('El número telefónico solo puede contener números');
      } else if (numero && numero.trim().length < 8) {
        errors.push('El número telefónico debe tener al menos 8 dígitos');
      }

      if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
        errors.push('Formato de correo electrónico inválido');
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors
        });
      }

      // Crear el cliente
      const nuevoCliente: Omit<Cliente, 'id'> = {
        nombre: nombre.trim(),
        cedula: cedula.trim(),
        correo: correo ? correo.trim() : undefined,
        numero: numero ? numero.trim() : undefined
      };

      const clienteCreado = await ClienteModel.create(nuevoCliente);

      return res.status(201).json({
        success: true,
        message: 'Cliente creado exitosamente',
        data: clienteCreado
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('ya está registrada')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error al crear cliente',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Actualizar un cliente por cédula
  static async updateCliente(req: Request, res: Response): Promise<Response> {
    try {
      const cedulaParam = req.params.cedula;
      const cedula = Array.isArray(cedulaParam) ? cedulaParam[0] : cedulaParam;
      const { nombre, correo, numero } = req.body;

      // Validaciones
      const errors: string[] = [];

      if (!cedula || cedula.length !== 9) {
        return res.status(400).json({
          success: false,
          message: 'La cédula debe tener 9 dígitos'
        });
      }

      if (nombre && nombre.trim().length === 0) {
        errors.push('El nombre no puede estar vacío');
      }

      if (numero && !/^\d+$/.test(numero.trim())) {
        errors.push('El número telefónico solo puede contener números');
      } else if (numero && numero.trim().length < 8) {
        errors.push('El número telefónico debe tener al menos 8 dígitos');
      }

      if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
        errors.push('Formato de correo electrónico inválido');
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors
        });
      }

      // Actualizar el cliente
      const datosActualizados: Partial<Cliente> = {};
      if (nombre) datosActualizados.nombre = nombre.trim();
      if (correo !== undefined) datosActualizados.correo = correo ? correo.trim() : null;
      if (numero !== undefined) datosActualizados.numero = numero ? numero.trim() : null;

      const clienteActualizado = await ClienteModel.update(cedula, datosActualizados);

      if (!clienteActualizado) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      return res.json({
        success: true,
        message: 'Cliente actualizado exitosamente',
        data: clienteActualizado
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar cliente',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Eliminar un cliente por cédula
  static async deleteCliente(req: Request, res: Response): Promise<Response> {
    try {
      const cedulaParam = req.params.cedula;
      const cedula = Array.isArray(cedulaParam) ? cedulaParam[0] : cedulaParam;

      if (!cedula || cedula.length !== 9) {
        return res.status(400).json({
          success: false,
          message: 'La cédula debe tener 9 dígitos'
        });
      }

      const eliminado = await ClienteModel.delete(cedula);

      if (!eliminado) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }

      return res.json({
        success: true,
        message: 'Cliente eliminado exitosamente'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar cliente',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Verificar si una cédula existe
  static async checkCedula(req: Request, res: Response): Promise<Response> {
    try {
      const cedulaParam = req.params.cedula;
      const cedula = Array.isArray(cedulaParam) ? cedulaParam[0] : cedulaParam;

      if (!cedula || cedula.length !== 9) {
        return res.status(400).json({
          success: false,
          message: 'La cédula debe tener 9 dígitos'
        });
      }

      const cliente = await ClienteModel.findByCedula(cedula);

      return res.json({
        success: true,
        exists: !!cliente,
        data: cliente || null
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al verificar cédula',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}
