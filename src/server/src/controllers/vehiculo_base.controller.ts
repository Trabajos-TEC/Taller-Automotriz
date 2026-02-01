import { Request, Response } from 'express';
import { VehiculoBaseModel } from '../models/vehiculo_base.model';

export const VehiculoBaseController = {
  // Obtener todos los vehículos base
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { search } = req.query;
      const searchTerm = typeof search === 'string' ? search : undefined;
      
      const vehiculos = await VehiculoBaseModel.getAll(searchTerm);
      
      return res.json({
        success: true,
        data: vehiculos,
        message: 'Vehículos base obtenidos exitosamente'
      });
    } catch (error: any) {
      console.error('Error en VehiculoBaseController.getAll:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener vehículos base',
        error: error.message
      });
    }
  },

  // Obtener un vehículo base por ID
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

      const vehiculo = await VehiculoBaseModel.getById(id);
      
      if (!vehiculo) {
        return res.status(404).json({
          success: false,
          message: 'Vehículo base no encontrado'
        });
      }

      return res.json({
        success: true,
        data: vehiculo,
        message: 'Vehículo base obtenido exitosamente'
      });
    } catch (error: any) {
      console.error('Error en VehiculoBaseController.getById:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener vehículo base',
        error: error.message
      });
    }
  },

  // Crear un nuevo vehículo base
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { marca, modelo, anio, tipo } = req.body;

      // Validaciones
      if (!marca || !modelo || !anio || !tipo) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos: marca, modelo, año, tipo'
        });
      }

      // Convertir año a número si viene como string
      const anioNum = typeof anio === 'string' ? parseInt(anio, 10) : anio;
      
      if (typeof anioNum !== 'number' || isNaN(anioNum) || anioNum < 1900 || anioNum > new Date().getFullYear() + 1) {
        return res.status(400).json({
          success: false,
          message: 'Año inválido'
        });
      }

      const nuevoVehiculo = await VehiculoBaseModel.create({
        marca: marca.trim(),
        modelo: modelo.trim(),
        anio: anioNum,
        tipo: tipo.trim()
      });

      return res.status(201).json({
        success: true,
        data: nuevoVehiculo,
        message: 'Vehículo base creado exitosamente'
      });
    } catch (error: any) {
      console.error('Error en VehiculoBaseController.create:', error);
      
      // Manejar error de duplicado (UNIQUE constraint)
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un vehículo base con esa combinación de marca, modelo, año y tipo'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error al crear vehículo base',
        error: error.message
      });
    }
  },

  // Actualizar un vehículo base
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

      const { marca, modelo, anio, tipo } = req.body;

      // Validar que haya al menos un campo para actualizar
      if (!marca && !modelo && !anio && !tipo) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar al menos un campo para actualizar'
        });
      }

      // Validar año si se proporciona
      if (anio !== undefined) {
        const anioNum = typeof anio === 'string' ? parseInt(anio, 10) : anio;
        if (typeof anioNum !== 'number' || isNaN(anioNum) || anioNum < 1900 || anioNum > new Date().getFullYear() + 1) {
          return res.status(400).json({
            success: false,
            message: 'Año inválido'
          });
        }
      }

      const datosActualizar: any = {};
      if (marca) datosActualizar.marca = marca.trim();
      if (modelo) datosActualizar.modelo = modelo.trim();
      if (anio !== undefined) datosActualizar.anio = typeof anio === 'string' ? parseInt(anio, 10) : anio;
      if (tipo) datosActualizar.tipo = tipo.trim();

      const vehiculoActualizado = await VehiculoBaseModel.update(id, datosActualizar);

      if (!vehiculoActualizado) {
        return res.status(404).json({
          success: false,
          message: 'Vehículo base no encontrado'
        });
      }

      return res.json({
        success: true,
        data: vehiculoActualizado,
        message: 'Vehículo base actualizado exitosamente'
      });
    } catch (error: any) {
      console.error('Error en VehiculoBaseController.update:', error);
      
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un vehículo base con esa combinación de marca, modelo, año y tipo'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error al actualizar vehículo base',
        error: error.message
      });
    }
  },

  // Eliminar un vehículo base
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

      const eliminado = await VehiculoBaseModel.delete(id);
      
      if (!eliminado) {
        return res.status(404).json({
          success: false,
          message: 'Vehículo base no encontrado'
        });
      }

      return res.json({
        success: true,
        message: 'Vehículo base eliminado exitosamente'
      });
    } catch (error: any) {
      console.error('Error en VehiculoBaseController.delete:', error);
      
      // Manejar error de clave foránea
      if (error.code === '23503') {
        return res.status(409).json({
          success: false,
          message: 'No se puede eliminar el vehículo base porque tiene repuestos asociados'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error al eliminar vehículo base',
        error: error.message
      });
    }
  }
};