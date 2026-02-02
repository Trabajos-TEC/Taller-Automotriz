import { Request, Response } from 'express';
import { CitasModel } from '../models/citas.model';

export const CitasController = {
  // Obtener todas las citas
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { search } = req.query;
      const searchTerm = typeof search === 'string' ? search : undefined;
      
      const citas = await CitasModel.getAll(searchTerm);
      
      return res.json({
        success: true,
        data: citas,
        message: 'Citas obtenidas exitosamente'
      });
    } catch (error: any) {
      console.error('Error en CitasController.getAll:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener citas',
        error: error.message
      });
    }
  },

  // Obtener una cita por ID
  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? parseInt(idParam[0]) : parseInt(idParam);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const cita = await CitasModel.getById(id);
      
      if (!cita) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }

      return res.json({
        success: true,
        data: cita,
        message: 'Cita obtenida exitosamente'
      });
    } catch (error: any) {
      console.error('Error en CitasController.getById:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener cita',
        error: error.message
      });
    }
  },

  // Obtener citas por vehiculo_cliente_id (antes era por cliente)
  async getByVehiculoClienteId(req: Request, res: Response): Promise<Response> {
    try {
      const idParam = req.params.vehiculoClienteId;
      const vehiculoClienteId = Array.isArray(idParam) ? parseInt(idParam[0]) : parseInt(idParam);
      
      if (isNaN(vehiculoClienteId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de vehículo-cliente inválido'
        });
      }

      const citas = await CitasModel.getByVehiculoClienteId(vehiculoClienteId);
      
      return res.json({
        success: true,
        data: citas,
        message: `Citas del vehículo-cliente ${vehiculoClienteId} obtenidas exitosamente`
      });
    } catch (error: any) {
      console.error('Error en CitasController.getByVehiculoClienteId:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener citas del vehículo-cliente',
        error: error.message
      });
    }
  },

  // Obtener citas por usuario_id (antes era por mecánico)
  async getByUsuarioId(req: Request, res: Response): Promise<Response> {
    try {
      const idParam = req.params.usuarioId;
      const usuarioId = Array.isArray(idParam) ? parseInt(idParam[0]) : parseInt(idParam);
      
      if (isNaN(usuarioId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
      }

      const citas = await CitasModel.getByUsuarioId(usuarioId);
      
      return res.json({
        success: true,
        data: citas,
        message: `Citas del usuario ${usuarioId} obtenidas exitosamente`
      });
    } catch (error: any) {
      console.error('Error en CitasController.getByUsuarioId:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener citas del usuario',
        error: error.message
      });
    }
  },

  // Obtener citas por estado
  async getByEstado(req: Request, res: Response): Promise<Response> {
    try {
      const estadoParam = req.params.estado;
      const estado = Array.isArray(estadoParam) ? estadoParam[0] : estadoParam;
      
      if (!estado) {
        return res.status(400).json({
          success: false,
          message: 'Estado requerido'
        });
      }

      const citas = await CitasModel.getByEstado(estado);
      
      return res.json({
        success: true,
        data: citas,
        message: `Citas en estado ${estado} obtenidas exitosamente`
      });
    } catch (error: any) {
      console.error('Error en CitasController.getByEstado:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener citas por estado',
        error: error.message
      });
    }
  },

  // Obtener citas por fecha
  async getByFecha(req: Request, res: Response): Promise<Response> {
    try {
      const fechaParam = req.params.fecha;
      const fecha = Array.isArray(fechaParam) ? fechaParam[0] : fechaParam;
      
      if (!fecha) {
        return res.status(400).json({
          success: false,
          message: 'Fecha requerida'
        });
      }

      // Validar formato de fecha YYYY-MM-DD
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(fecha)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de fecha inválido. Use YYYY-MM-DD'
        });
      }

      const citas = await CitasModel.getByFecha(fecha);
      
      return res.json({
        success: true,
        data: citas,
        message: `Citas para la fecha ${fecha} obtenidas exitosamente`
      });
    } catch (error: any) {
      console.error('Error en CitasController.getByFecha:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener citas por fecha',
        error: error.message
      });
    }
  },

  // Obtener estadísticas
  async getEstadisticas(_req: Request, res: Response): Promise<Response> {
    try {
      const estadisticas = await CitasModel.getEstadisticas();
      
      return res.json({
        success: true,
        data: estadisticas,
        message: 'Estadísticas obtenidas exitosamente'
      });
    } catch (error: any) {
      console.error('Error en CitasController.getEstadisticas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  },

  // Obtener citas próximas
  async getProximasCitas(req: Request, res: Response): Promise<Response> {
    try {
        const { limit } = req.query;
        const limitNumber = limit ? parseInt(limit as string) : undefined;
        
        if (limit && (isNaN(limitNumber!) || limitNumber! <= 0)) {
        return res.status(400).json({
            success: false,
            message: 'El límite debe ser un número positivo'
        });
        }

        const citas = await CitasModel.getProximasCitas(limitNumber);
        
        return res.json({
        success: true,
        data: citas,
        message: 'Citas próximas obtenidas exitosamente'
        });
    } catch (error: any) {
        console.error('Error en CitasController.getProximasCitas:', error);
        return res.status(500).json({
        success: false,
        message: 'Error al obtener citas próximas',
        error: error.message
        });
    }
  },

  // Verificar disponibilidad
  async checkDisponibilidad(req: Request, res: Response): Promise<Response> {
    try {
      const { vehiculoClienteId, fecha, hora, usuarioId, excludeId } = req.body;
      
      if (!vehiculoClienteId || !fecha || !hora) {
        return res.status(400).json({
          success: false,
          message: 'Datos incompletos: se requieren vehiculoClienteId, fecha y hora'
        });
      }

      // Verificar si el vehículo-cliente ya tiene cita en esa fecha y hora
      const citaExistente = await CitasModel.checkCitaExistente(
        parseInt(vehiculoClienteId), 
        fecha, 
        hora,
        excludeId ? parseInt(excludeId) : undefined
      );

      let disponibilidadUsuario = true;
      
      // Verificar disponibilidad del usuario si se proporciona
      if (usuarioId && usuarioId !== 0) {
        disponibilidadUsuario = await CitasModel.checkDisponibilidadUsuario(
          parseInt(usuarioId),
          fecha,
          hora,
          excludeId ? parseInt(excludeId) : undefined
        );
      }

      return res.json({
        success: true,
        data: {
          vehiculoClienteDisponible: !citaExistente.exists,
          usuarioDisponible: disponibilidadUsuario,
          citaExistente: citaExistente.data
        },
        message: 'Disponibilidad verificada'
      });
    } catch (error: any) {
      console.error('Error en CitasController.checkDisponibilidad:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar disponibilidad',
        error: error.message
      });
    }
  },

  // Crear nueva cita
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const {
        vehiculo_cliente_id,
        fecha,
        hora,
        descripcion,
        estado = 'En Espera'
      } = req.body;

      // Validaciones básicas
      if (!vehiculo_cliente_id || !fecha || !hora || !descripcion) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: vehiculo_cliente_id, fecha, hora, descripcion'
        });
      }

      // Validar formato de fecha
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(fecha)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de fecha inválido. Use YYYY-MM-DD'
        });
      }

      // Validar formato de hora
      const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!horaRegex.test(hora)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de hora inválido. Use HH:MM'
        });
      }

      // Verificar si la fecha es futura
      const fechaCita = new Date(fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaCita < hoy) {
        return res.status(400).json({
          success: false,
          message: 'No se pueden agendar citas en fechas pasadas'
        });
      }

      // Verificar disponibilidad del vehículo-cliente
      const citaExistente = await CitasModel.checkCitaExistente(
        parseInt(vehiculo_cliente_id), 
        fecha, 
        hora
      );
      
      if (citaExistente.exists) {
        return res.status(409).json({
          success: true,
          data: citaExistente.data,
          message: 'El vehículo-cliente ya tiene una cita programada en esa fecha y hora'
        });
      }

      // Crear la cita (CORREGIDO: agregado usuario_id: null)
      const nuevaCita = await CitasModel.create({
        vehiculo_cliente_id: parseInt(vehiculo_cliente_id),
        fecha,
        hora,
        descripcion,
        estado,
        usuario_id: null  // <--- CORRECIÓN AQUÍ
      });

      return res.status(201).json({
        success: true,
        data: nuevaCita,
        message: 'Cita creada exitosamente'
      });
    } catch (error: any) {
      console.error('Error en CitasController.create:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al crear cita',
        error: error.message
      });
    }
  },

  // Actualizar cita
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? parseInt(idParam[0]) : parseInt(idParam);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const {
        vehiculo_cliente_id,
        fecha,
        hora,
        descripcion,
        usuario_id,
        estado
      } = req.body;

      // Validar que haya al menos un campo para actualizar
      const campos = [
        vehiculo_cliente_id, fecha, hora, descripcion, usuario_id, estado
      ];
      
      if (campos.every(campo => campo === undefined)) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar al menos un campo para actualizar'
        });
      }

      // Verificar si la cita existe
      const citaExistente = await CitasModel.getById(id);
      if (!citaExistente) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }

      // Si se cambia fecha, hora o vehiculo_cliente_id, verificar disponibilidad
      if ((fecha && fecha !== citaExistente.fecha) || 
          (hora && hora !== citaExistente.hora) || 
          (vehiculo_cliente_id && parseInt(vehiculo_cliente_id) !== citaExistente.vehiculo_cliente_id)) {
        
        const fechaFinal = fecha || citaExistente.fecha;
        const horaFinal = hora || citaExistente.hora;
        const vehiculoClienteIdFinal = vehiculo_cliente_id ? parseInt(vehiculo_cliente_id) : citaExistente.vehiculo_cliente_id;

        const disponibilidad = await CitasModel.checkCitaExistente(
          vehiculoClienteIdFinal, 
          fechaFinal, 
          horaFinal, 
          id
        );
        
        if (disponibilidad.exists) {
          return res.status(409).json({
            success: false,
            message: 'El vehículo-cliente ya tiene otra cita en esa fecha y hora'
          });
        }
      }

      // Si se cambia usuario_id, verificar disponibilidad
      if (usuario_id && parseInt(usuario_id) !== citaExistente.usuario_id && parseInt(usuario_id) !== 0) {
        const fechaFinal = fecha || citaExistente.fecha;
        const horaFinal = hora || citaExistente.hora;
        
        const usuarioDisponible = await CitasModel.checkDisponibilidadUsuario(
          parseInt(usuario_id),
          fechaFinal,
          horaFinal,
          id
        );
        
        if (!usuarioDisponible) {
          return res.status(409).json({
            success: false,
            message: 'El usuario ya tiene una cita asignada en ese horario'
          });
        }
      }

      // Actualizar la cita
      const citaActualizada = await CitasModel.update(id, {
        vehiculo_cliente_id: vehiculo_cliente_id ? parseInt(vehiculo_cliente_id) : undefined,
        fecha,
        hora,
        descripcion,
        usuario_id: usuario_id ? parseInt(usuario_id) : undefined,
        estado
      });

      if (!citaActualizada) {
        return res.status(404).json({
          success: false,
          message: 'Error al actualizar cita'
        });
      }

      return res.json({
        success: true,
        data: citaActualizada,
        message: 'Cita actualizada exitosamente'
      });
    } catch (error: any) {
      console.error('Error en CitasController.update:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar cita',
        error: error.message
      });
    }
  },

  // Actualizar solo el estado de una cita
  async updateEstado(req: Request, res: Response): Promise<Response> {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? parseInt(idParam[0]) : parseInt(idParam);
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

      // Verificar si la cita existe
      const citaExistente = await CitasModel.getById(id);
      if (!citaExistente) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }

      // Validar transición de estado
      if (citaExistente.estado === 'Cancelada' && estado !== 'Cancelada') {
        return res.status(400).json({
          success: false,
          message: 'Una cita cancelada no puede cambiar a otro estado'
        });
      }

      if (citaExistente.estado === 'Completada' && estado !== 'Completada') {
        return res.status(400).json({
          success: false,
          message: 'Una cita completada no puede cambiar de estado'
        });
      }

      // Actualizar el estado
      const citaActualizada = await CitasModel.updateEstado(id, estado);

      if (!citaActualizada) {
        return res.status(404).json({
          success: false,
          message: 'Error al actualizar estado'
        });
      }

      return res.json({
        success: true,
        data: citaActualizada,
        message: 'Estado de la cita actualizado exitosamente'
      });
    } catch (error: any) {
      console.error('Error en CitasController.updateEstado:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar estado',
        error: error.message
      });
    }
  },

  // Asignar usuario a una cita
  async asignarUsuario(req: Request, res: Response): Promise<Response> {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? parseInt(idParam[0]) : parseInt(idParam);
      const { usuario_id } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      if (!usuario_id) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario requerido'
        });
      }

      // Verificar si la cita existe
      const citaExistente = await CitasModel.getById(id);
      if (!citaExistente) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }

      // Validar que la cita esté en estado "En Espera"
      if (citaExistente.estado !== 'En Espera') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden asignar usuarios a citas en estado "En Espera"'
        });
      }

      // Verificar disponibilidad del usuario
      const usuarioDisponible = await CitasModel.checkDisponibilidadUsuario(
        parseInt(usuario_id),
        citaExistente.fecha,
        citaExistente.hora,
        id
      );
      
      if (!usuarioDisponible) {
        return res.status(409).json({
          success: false,
          message: 'El usuario ya tiene una cita asignada en ese horario'
        });
      }

      // Asignar el usuario
      const citaActualizada = await CitasModel.asignarUsuario(id, parseInt(usuario_id));

      if (!citaActualizada) {
        return res.status(404).json({
          success: false,
          message: 'Error al asignar usuario'
        });
      }

      return res.json({
        success: true,
        data: citaActualizada,
        message: 'Usuario asignado exitosamente'
      });
    } catch (error: any) {
      console.error('Error en CitasController.asignarUsuario:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al asignar usuario',
        error: error.message
      });
    }
  },

  // Eliminar cita
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? parseInt(idParam[0]) : parseInt(idParam);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      // Verificar si la cita existe
      const citaExistente = await CitasModel.getById(id);
      if (!citaExistente) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }

      // Solo permitir eliminar citas canceladas
      if (citaExistente.estado !== 'Cancelada') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden eliminar citas en estado "Cancelada"'
        });
      }

      const eliminado = await CitasModel.delete(id);
      
      if (!eliminado) {
        return res.status(404).json({
          success: false,
          message: 'Error al eliminar cita'
        });
      }

      return res.json({
        success: true,
        message: 'Cita eliminada exitosamente'
      });
    } catch (error: any) {
      console.error('Error en CitasController.delete:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar cita',
        error: error.message
      });
    }
  }
};