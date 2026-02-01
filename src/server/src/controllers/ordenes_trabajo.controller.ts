// src/server/src/controllers/ordenes_trabajo.controller.ts - VERSIÓN CORREGIDA
import { Request, Response } from 'express';
import { OrdenesTrabajoModel } from '../models/ordenes_trabajo.model';

// Helper para obtener IDs de parámetros
const getParamId = (param: string | string[]): number => {
  const value = Array.isArray(param) ? param[0] : param;
  return parseInt(value);
};

const getParamString = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

export const OrdenesTrabajoController = {
  // Obtener todas las órdenes de trabajo
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { search, estado, fecha_desde, fecha_hasta } = req.query;
      
      const searchTerm = typeof search === 'string' ? search : undefined;
      const estadoTerm = typeof estado === 'string' ? estado : undefined;
      const fechaDesde = typeof fecha_desde === 'string' ? fecha_desde : undefined;
      const fechaHasta = typeof fecha_hasta === 'string' ? fecha_hasta : undefined;

      const ordenes = await OrdenesTrabajoModel.getAll(
        searchTerm, 
        estadoTerm, 
        fechaDesde, 
        fechaHasta
      );
      
      return res.json({
        success: true,
        data: ordenes,
        message: 'Órdenes de trabajo obtenidas exitosamente'
      });
    } catch (error: any) {
      console.error('Error en OrdenesTrabajoController.getAll:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener órdenes de trabajo',
        error: error.message
      });
    }
  },

  // Obtener una orden por ID
  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = getParamId(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const orden = await OrdenesTrabajoModel.getById(id);
      
      if (!orden) {
        return res.status(404).json({
          success: false,
          message: 'Orden de trabajo no encontrada'
        });
      }

      return res.json({
        success: true,
        data: orden,
        message: 'Orden de trabajo obtenida exitosamente'
      });
    } catch (error: any) {
      console.error('Error en OrdenesTrabajoController.getById:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener orden de trabajo',
        error: error.message
      });
    }
  },

  // Obtener órdenes por vehiculo_cliente_id
  async getByVehiculoClienteId(req: Request, res: Response): Promise<Response> {
    try {
      const vehiculoClienteId = getParamId(req.params.vehiculoClienteId);
      
      if (isNaN(vehiculoClienteId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de vehículo-cliente inválido'
        });
      }

      const ordenes = await OrdenesTrabajoModel.getByVehiculoClienteId(vehiculoClienteId);
      
      return res.json({
        success: true,
        data: ordenes,
        message: `Órdenes del vehículo-cliente ${vehiculoClienteId} obtenidas exitosamente`
      });
    } catch (error: any) {
      console.error('Error en OrdenesTrabajoController.getByVehiculoClienteId:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener órdenes del vehículo-cliente',
        error: error.message
      });
    }
  },

  // Obtener órdenes por mecánico
  async getByMecanicoId(req: Request, res: Response): Promise<Response> {
    try {
      const mecanicoId = getParamId(req.params.mecanicoId);
      
      if (isNaN(mecanicoId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de mecánico inválido'
        });
      }

      const ordenes = await OrdenesTrabajoModel.getByMecanicoId(mecanicoId);
      
      return res.json({
        success: true,
        data: ordenes,
        message: `Órdenes del mecánico ${mecanicoId} obtenidas exitosamente`
      });
    } catch (error: any) {
      console.error('Error en OrdenesTrabajoController.getByMecanicoId:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener órdenes del mecánico',
        error: error.message
      });
    }
  },

  // Obtener órdenes por estado
  async getByEstado(req: Request, res: Response): Promise<Response> {
    try {
      const estado = getParamString(req.params.estado);
      
      if (!estado) {
        return res.status(400).json({
          success: false,
          message: 'Estado requerido'
        });
      }

      const ordenes = await OrdenesTrabajoModel.getByEstado(estado);
      
      return res.json({
        success: true,
        data: ordenes,
        message: `Órdenes en estado ${estado} obtenidas exitosamente`
      });
    } catch (error: any) {
      console.error('Error en OrdenesTrabajoController.getByEstado:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener órdenes por estado',
        error: error.message
      });
    }
  },

  // Obtener órdenes por rango de fechas
  async getByFechaRango(req: Request, res: Response): Promise<Response> {
    try {
      const fecha_desde = getParamString(req.params.fecha_desde);
      const fecha_hasta = getParamString(req.params.fecha_hasta);
      
      if (!fecha_desde || !fecha_hasta) {
        return res.status(400).json({
          success: false,
          message: 'Fechas desde y hasta requeridas'
        });
      }

      // Validar formato de fecha YYYY-MM-DD
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(fecha_desde) || !fechaRegex.test(fecha_hasta)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de fecha inválido. Use YYYY-MM-DD'
        });
      }

      const ordenes = await OrdenesTrabajoModel.getByFechaRango(fecha_desde, fecha_hasta);
      
      return res.json({
        success: true,
        data: ordenes,
        message: `Órdenes del ${fecha_desde} al ${fecha_hasta} obtenidas exitosamente`
      });
    } catch (error: any) {
      console.error('Error en OrdenesTrabajoController.getByFechaRango:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener órdenes por fecha',
        error: error.message
      });
    }
  },

  // Obtener estadísticas
  async getEstadisticas(_req: Request, res: Response): Promise<Response> {
    try {
      const estadisticas = await OrdenesTrabajoModel.getEstadisticas();
      
      return res.json({
        success: true,
        data: estadisticas,
        message: 'Estadísticas obtenidas exitosamente'
      });
    } catch (error: any) {
      console.error('Error en OrdenesTrabajoController.getEstadisticas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  },

  // Crear nueva orden de trabajo
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const {
        vehiculo_cliente_id,
        servicio_id,
        tipo_servicio,
        descripcion,
        fecha_entrada,
        fecha_salida,
        costo,
        estado = 'pendiente',
        mecanico_id,
        notas
      } = req.body;

      // Validaciones básicas
      if (!vehiculo_cliente_id || !tipo_servicio || !descripcion || costo === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: vehiculo_cliente_id, tipo_servicio, descripcion, costo'
        });
      }

      // Validar costo positivo
      const costoNum = parseFloat(costo);
      if (isNaN(costoNum) || costoNum < 0) {
        return res.status(400).json({
          success: false,
          message: 'El costo debe ser un valor numérico positivo'
        });
      }

      // Crear la orden
      const nuevaOrden = await OrdenesTrabajoModel.create({
        vehiculo_cliente_id: parseInt(vehiculo_cliente_id),
        servicio_id: servicio_id ? parseInt(servicio_id) : null,
        tipo_servicio,
        descripcion,
        fecha_entrada: fecha_entrada ? new Date(fecha_entrada) : new Date(),
        fecha_salida: fecha_salida ? new Date(fecha_salida) : null,
        costo: costoNum,
        estado,
        mecanico_id: mecanico_id ? parseInt(mecanico_id) : null,
        notas: notas || null
      });

      return res.status(201).json({
        success: true,
        data: nuevaOrden,
        message: 'Orden de trabajo creada exitosamente'
      });
    } catch (error: any) {
      console.error('Error en OrdenesTrabajoController.create:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al crear orden de trabajo',
        error: error.message
      });
    }
  },

  // Actualizar orden
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = getParamId(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const {
        vehiculo_cliente_id,
        servicio_id,
        tipo_servicio,
        descripcion,
        fecha_entrada,
        fecha_salida,
        costo,
        estado,
        mecanico_id,
        notas
      } = req.body;

      // Verificar si la orden existe
      const ordenExistente = await OrdenesTrabajoModel.getById(id);
      if (!ordenExistente) {
        return res.status(404).json({
          success: false,
          message: 'Orden de trabajo no encontrada'
        });
      }

      // Validar costo si se actualiza
      if (costo !== undefined) {
        const costoNum = parseFloat(costo);
        if (isNaN(costoNum) || costoNum < 0) {
          return res.status(400).json({
            success: false,
            message: 'El costo debe ser un valor numérico positivo'
          });
        }
      }

      // Actualizar la orden
      const ordenActualizada = await OrdenesTrabajoModel.update(id, {
        vehiculo_cliente_id: vehiculo_cliente_id ? parseInt(vehiculo_cliente_id) : undefined,
        servicio_id: servicio_id !== undefined ? (servicio_id ? parseInt(servicio_id) : null) : undefined,
        tipo_servicio,
        descripcion,
        fecha_entrada: fecha_entrada ? new Date(fecha_entrada) : undefined,
        fecha_salida: fecha_salida !== undefined ? (fecha_salida ? new Date(fecha_salida) : null) : undefined,
        costo: costo !== undefined ? parseFloat(costo) : undefined,
        estado,
        mecanico_id: mecanico_id !== undefined ? (mecanico_id ? parseInt(mecanico_id) : null) : undefined,
        notas
      });

      if (!ordenActualizada) {
        return res.status(404).json({
          success: false,
          message: 'Error al actualizar orden de trabajo'
        });
      }

      return res.json({
        success: true,
        data: ordenActualizada,
        message: 'Orden de trabajo actualizada exitosamente'
      });
    } catch (error: any) {
      console.error('Error en OrdenesTrabajoController.update:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar orden de trabajo',
        error: error.message
      });
    }
  },

  // Actualizar solo el estado de una orden
  async updateEstado(req: Request, res: Response): Promise<Response> {
    try {
      const id = getParamId(req.params.id);
      const { estado } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      if (!estado) {
        return res.status(400).json({
          success: false,
          message: 'Estado requerido'
        });
      }

      // Verificar si la orden existe
      const ordenExistente = await OrdenesTrabajoModel.getById(id);
      if (!ordenExistente) {
        return res.status(404).json({
          success: false,
          message: 'Orden de trabajo no encontrada'
        });
      }

      // Validar estados posibles
      const estadosValidos = ['pendiente', 'en_proceso', 'completada', 'cancelada'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: `Estado inválido. Use: ${estadosValidos.join(', ')}`
        });
      }

      // Actualizar el estado
      const ordenActualizada = await OrdenesTrabajoModel.updateEstado(id, estado);

      if (!ordenActualizada) {
        return res.status(404).json({
          success: false,
          message: 'Error al actualizar estado'
        });
      }

      return res.json({
        success: true,
        data: ordenActualizada,
        message: 'Estado de la orden actualizado exitosamente'
      });
    } catch (error: any) {
      console.error('Error en OrdenesTrabajoController.updateEstado:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar estado',
        error: error.message
      });
    }
  },

  // Asignar mecánico a una orden
  async asignarMecanico(req: Request, res: Response): Promise<Response> {
    try {
      const id = getParamId(req.params.id);
      const { mecanico_id } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      if (!mecanico_id) {
        return res.status(400).json({
          success: false,
          message: 'ID de mecánico requerido'
        });
      }

      // Verificar si la orden existe
      const ordenExistente = await OrdenesTrabajoModel.getById(id);
      if (!ordenExistente) {
        return res.status(404).json({
          success: false,
          message: 'Orden de trabajo no encontrada'
        });
      }

      // Asignar el mecánico
      const ordenActualizada = await OrdenesTrabajoModel.asignarMecanico(id, parseInt(mecanico_id));

      if (!ordenActualizada) {
        return res.status(404).json({
          success: false,
          message: 'Error al asignar mecánico'
        });
      }

      return res.json({
        success: true,
        data: ordenActualizada,
        message: 'Mecánico asignado exitosamente'
      });
    } catch (error: any) {
      console.error('Error en OrdenesTrabajoController.asignarMecanico:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al asignar mecánico',
        error: error.message
      });
    }
  },

  // Agregar notas a una orden
  async agregarNotas(req: Request, res: Response): Promise<Response> {
    try {
      const id = getParamId(req.params.id);
      const { notas } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      if (!notas) {
        return res.status(400).json({
          success: false,
          message: 'Notas requeridas'
        });
      }

      // Verificar si la orden existe
      const ordenExistente = await OrdenesTrabajoModel.getById(id);
      if (!ordenExistente) {
        return res.status(404).json({
          success: false,
          message: 'Orden de trabajo no encontrada'
        });
      }

      // Agregar notas
      const ordenActualizada = await OrdenesTrabajoModel.agregarNotas(id, notas);

      if (!ordenActualizada) {
        return res.status(404).json({
          success: false,
          message: 'Error al agregar notas'
        });
      }

      return res.json({
        success: true,
        data: ordenActualizada,
        message: 'Notas agregadas exitosamente'
      });
    } catch (error: any) {
      console.error('Error en OrdenesTrabajoController.agregarNotas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al agregar notas',
        error: error.message
      });
    }
  },

  // Eliminar orden de trabajo
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = getParamId(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      // Verificar si la orden existe
      const ordenExistente = await OrdenesTrabajoModel.getById(id);
      if (!ordenExistente) {
        return res.status(404).json({
          success: false,
          message: 'Orden de trabajo no encontrada'
        });
      }

      const eliminado = await OrdenesTrabajoModel.delete(id);
      
      if (!eliminado) {
        return res.status(404).json({
          success: false,
          message: 'Error al eliminar orden de trabajo'
        });
      }

      return res.json({
        success: true,
        message: 'Orden de trabajo eliminada exitosamente'
      });
    } catch (error: any) {
      console.error('Error en OrdenesTrabajoController.delete:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar orden de trabajo',
        error: error.message
      });
    }
  }
};