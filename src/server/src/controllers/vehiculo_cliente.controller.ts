// src/controllers/vehiculo_cliente.controller.ts
import { Request, Response } from 'express';
import { VehiculoClienteModel } from '../models/vehiculo_cliente.model';

export const VehiculoClienteController = {
  // Obtener todos los vehículos de clientes
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { search } = req.query;
      const searchTerm = typeof search === 'string' ? search : undefined;
      
      const vehiculos = await VehiculoClienteModel.getAll(searchTerm);
      
      return res.json({
        success: true,
        data: vehiculos,
        message: 'Vehículos de clientes obtenidos exitosamente'
      });
    } catch (error: any) {
      console.error('Error en VehiculoClienteController.getAll:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener vehículos de clientes',
        error: error.message
      });
    }
  },

  // Obtener un vehículo de cliente por ID
  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const idParam = req.params.id;
      const idString = Array.isArray(idParam) ? idParam[0] : idParam;
      const id = parseInt(idString);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const vehiculo = await VehiculoClienteModel.getById(id);
      
      if (!vehiculo) {
        return res.status(404).json({
          success: false,
          message: 'Vehículo no encontrado'
        });
      }

      return res.json({
        success: true,
        data: vehiculo,
        message: 'Vehículo obtenido exitosamente'
      });
    } catch (error: any) {
      console.error('Error en VehiculoClienteController.getById:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener vehículo',
        error: error.message
      });
    }
  },

  // Obtener un vehículo de cliente por placa
  async getByPlaca(req: Request, res: Response): Promise<Response> {
    try {
      const placaParam = req.params.placa;
      const placa = Array.isArray(placaParam) ? placaParam[0] : placaParam;
      
      if (!placa) {
        return res.status(400).json({
          success: false,
          message: 'Placa requerida'
        });
      }

      const vehiculo = await VehiculoClienteModel.getByPlaca(placa);
      
      if (!vehiculo) {
        return res.status(404).json({
          success: false,
          message: 'Vehículo no encontrado'
        });
      }

      return res.json({
        success: true,
        data: vehiculo,
        message: 'Vehículo obtenido exitosamente'
      });
    } catch (error: any) {
      console.error('Error en VehiculoClienteController.getByPlaca:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener vehículo',
        error: error.message
      });
    }
  },

  // Verificar si una placa existe
  async checkPlaca(req: Request, res: Response): Promise<Response> {
    try {
      const placaParam = req.params.placa;
      const placa = Array.isArray(placaParam) ? placaParam[0] : placaParam;
      
      if (!placa) {
        return res.status(400).json({
          success: false,
          message: 'Placa requerida'
        });
      }

      const resultado = await VehiculoClienteModel.checkPlaca(placa);
      
      return res.json({
        success: true,
        data: resultado,
        message: resultado.exists ? 'Placa ya existe' : 'Placa disponible'
      });
    } catch (error: any) {
      console.error('Error en VehiculoClienteController.checkPlaca:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar placa',
        error: error.message
      });
    }
  },

  // Verificar si un VIN existe
  async checkVin(req: Request, res: Response): Promise<Response> {
    try {
      const vinParam = req.params.vin;
      const vin = Array.isArray(vinParam) ? vinParam[0] : vinParam;
      
      if (!vin) {
        return res.status(400).json({
          success: false,
          message: 'VIN requerido'
        });
      }

      const resultado = await VehiculoClienteModel.checkVin(vin);
      
      return res.json({
        success: true,
        data: resultado,
        message: resultado.exists ? 'VIN ya existe' : 'VIN disponible'
      });
    } catch (error: any) {
      console.error('Error en VehiculoClienteController.checkVin:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar VIN',
        error: error.message
      });
    }
  },

  // Crear un nuevo vehículo de cliente
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const {
        placa,
        cliente_id,
        vehiculo_base_id,
        color,
        kilometraje = 0,
        anio_matricula,
        vin,
        notas
      } = req.body;

      // Validaciones
      if (!placa || !cliente_id || !vehiculo_base_id) {
        return res.status(400).json({
          success: false,
          message: 'Campos requeridos: placa, cliente_id, vehiculo_base_id'
        });
      }

      // Verificar si la placa ya existe
      const placaExiste = await VehiculoClienteModel.checkPlaca(placa);
      if (placaExiste.exists) {
        return res.status(409).json({
          success: false,
          message: 'La placa ya está registrada'
        });
      }

      // Verificar si el VIN ya existe (si se proporciona)
      if (vin) {
        const vinExiste = await VehiculoClienteModel.checkVin(vin);
        if (vinExiste.exists) {
          return res.status(409).json({
            success: false,
            message: 'El VIN ya está registrado'
          });
        }
      }

      // Validar kilometraje
      if (kilometraje < 0) {
        return res.status(400).json({
          success: false,
          message: 'Kilometraje no puede ser negativo'
        });
      }

      // Crear el vehículo
      const nuevoVehiculo = await VehiculoClienteModel.create({
        placa: placa.trim().toUpperCase(),
        cliente_id,
        vehiculo_base_id,
        color: color?.trim(),
        kilometraje,
        anio_matricula: anio_matricula?.trim(),
        vin: vin?.trim(),
        notas: notas?.trim()
      });

      // Obtener el vehículo con información completa
      const vehiculoCompleto = await VehiculoClienteModel.getById(nuevoVehiculo.id);

      return res.status(201).json({
        success: true,
        data: vehiculoCompleto,
        message: 'Vehículo creado exitosamente'
      });
    } catch (error: any) {
      console.error('Error en VehiculoClienteController.create:', error);
      
      // Manejar error de duplicado
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un vehículo con esa placa o VIN'
        });
      }

      // Manejar error de clave foránea
      if (error.code === '23503') {
        return res.status(400).json({
          success: false,
          message: 'Cliente o vehículo base no existe'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error al crear vehículo',
        error: error.message
      });
    }
  },

  // Actualizar un vehículo de cliente
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const idParam = req.params.id;
      const idString = Array.isArray(idParam) ? idParam[0] : idParam;
      const id = parseInt(idString);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const {
        cliente_id,
        vehiculo_base_id,
        color,
        kilometraje,
        anio_matricula,
        vin,
        notas
      } = req.body;

      // Validar que haya al menos un campo para actualizar
      const campos = [cliente_id, vehiculo_base_id, color, kilometraje, anio_matricula, vin, notas];
      if (campos.every(campo => campo === undefined)) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar al menos un campo para actualizar'
        });
      }

      // Validaciones de valores
      if (kilometraje !== undefined && kilometraje < 0) {
        return res.status(400).json({
          success: false,
          message: 'Kilometraje no puede ser negativo'
        });
      }

      // Si se proporciona VIN, verificar que no exista (excepto para este mismo vehículo)
      if (vin !== undefined && vin.trim() !== '') {
        const vinExiste = await VehiculoClienteModel.checkVin(vin);
        if (vinExiste.exists && vinExiste.data?.id !== id) {
          return res.status(409).json({
            success: false,
            message: 'El VIN ya está registrado en otro vehículo'
          });
        }
      }

      // Actualizar el vehículo
      const datosActualizar: any = {};
      if (cliente_id !== undefined) datosActualizar.cliente_id = cliente_id;
      if (vehiculo_base_id !== undefined) datosActualizar.vehiculo_base_id = vehiculo_base_id;
      if (color !== undefined) datosActualizar.color = color.trim();
      if (kilometraje !== undefined) datosActualizar.kilometraje = kilometraje;
      if (anio_matricula !== undefined) datosActualizar.anio_matricula = anio_matricula.trim();
      if (vin !== undefined) datosActualizar.vin = vin.trim();
      if (notas !== undefined) datosActualizar.notas = notas.trim();

      const vehiculoActualizado = await VehiculoClienteModel.update(id, datosActualizar);

      if (!vehiculoActualizado) {
        return res.status(404).json({
          success: false,
          message: 'Vehículo no encontrado'
        });
      }

      // Obtener el vehículo actualizado con información completa
      const vehiculoCompleto = await VehiculoClienteModel.getById(id);

      return res.json({
        success: true,
        data: vehiculoCompleto,
        message: 'Vehículo actualizado exitosamente'
      });
    } catch (error: any) {
      console.error('Error en VehiculoClienteController.update:', error);
      
      // Manejar error de duplicado
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un vehículo con ese VIN'
        });
      }

      // Manejar error de clave foránea
      if (error.code === '23503') {
        return res.status(400).json({
          success: false,
          message: 'Cliente o vehículo base no existe'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error al actualizar vehículo',
        error: error.message
      });
    }
  },

  // Eliminar un vehículo de cliente
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const idParam = req.params.id;
      const idString = Array.isArray(idParam) ? idParam[0] : idParam;
      const id = parseInt(idString);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const eliminado = await VehiculoClienteModel.delete(id);
      
      if (!eliminado) {
        return res.status(404).json({
          success: false,
          message: 'Vehículo no encontrado'
        });
      }

      return res.json({
        success: true,
        message: 'Vehículo eliminado exitosamente'
      });
    } catch (error: any) {
      console.error('Error en VehiculoClienteController.delete:', error);
      
      // Manejar error de clave foránea (si hay registros relacionados)
      if (error.code === '23503') {
        return res.status(409).json({
          success: false,
          message: 'No se puede eliminar el vehículo porque tiene registros relacionados'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error al eliminar vehículo',
        error: error.message
      });
    }
  }
};