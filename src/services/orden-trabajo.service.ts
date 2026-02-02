// src/services/ordenesTrabajo.service.ts
import { fetchApi } from './api';
import type { ApiResponse } from './api';

// Interfaces basadas en tus tablas de BD
export interface RepuestoUtilizadoBD {
  id?: number;
  orden_trabajo_id: number;
  producto_codigo: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  created_at?: string;
}

export interface ServicioRealizadoBD {
  id?: number;
  orden_trabajo_id: number;
  servicio_codigo: string;
  precio: number;
  descripcion?: string;
  created_at?: string;
}

export interface NotaDiagnosticoBD {
  id?: number;
  orden_trabajo_id: number;
  texto: string;
  fecha: string;
  usuario_id?: number;
  created_at?: string;
}

export interface OrdenTrabajoBD {
  id?: number;
  codigo_orden: string;
  cliente_id: number;
  vehiculo_id: number;
  cita_id?: number;
  fecha_creacion: string;
  estado: 'Pendiente' | 'En proceso' | 'Finalizada' | 'Cancelada';
  observaciones_iniciales: string;
  total: number;
  created_at?: string;
  updated_at?: string;
  
  // Relaciones (pueden venir expandidas de la API)
  cliente_nombre?: string;
  cliente_cedula?: string;
  vehiculo_placa?: string;
  vehiculo_marca?: string;
  vehiculo_modelo?: string;
}

export interface OrdenTrabajoCompleta extends OrdenTrabajoBD {
  repuestos_utilizados?: RepuestoUtilizadoBD[];
  servicios_realizados?: ServicioRealizadoBD[];
  notas_diagnostico?: NotaDiagnosticoBD[];
}

export interface EstadisticasOrdenes {
  total: number;
  pendientes: number;
  en_proceso: number;
  finalizadas: number;
  canceladas: number;
  total_ingresos: number;
  ingreso_promedio: number;
}

export const ordenesTrabajoService = {
  // Obtener todas las órdenes de trabajo
  async getOrdenes(search?: string, estado?: string): Promise<ApiResponse<OrdenTrabajoCompleta[]>> {
    let endpoint = '/ordenes-trabajo';
    const params = [];
    
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (estado) params.push(`estado=${encodeURIComponent(estado)}`);
    
    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }
    
    return fetchApi<OrdenTrabajoCompleta[]>(endpoint);
  },

  // Obtener una orden por ID
  async getOrdenById(id: number): Promise<ApiResponse<OrdenTrabajoCompleta>> {
    return fetchApi<OrdenTrabajoCompleta>(`/ordenes-trabajo/${id}`);
  },

  // Obtener una orden por código
  async getOrdenByCodigo(codigo: string): Promise<ApiResponse<OrdenTrabajoCompleta>> {
    return fetchApi<OrdenTrabajoCompleta>(`/ordenes-trabajo/codigo/${codigo}`);
  },

  // Obtener órdenes por cliente
  async getOrdenesByCliente(clienteId: number): Promise<ApiResponse<OrdenTrabajoCompleta[]>> {
    return fetchApi<OrdenTrabajoCompleta[]>(`/ordenes-trabajo/cliente/${clienteId}`);
  },

  // Obtener órdenes por estado
  async getOrdenesByEstado(estado: string): Promise<ApiResponse<OrdenTrabajoCompleta[]>> {
    return fetchApi<OrdenTrabajoCompleta[]>(`/ordenes-trabajo/estado/${estado}`);
  },

  // Obtener estadísticas
  async getEstadisticas(): Promise<ApiResponse<EstadisticasOrdenes>> {
    return fetchApi<EstadisticasOrdenes>('/ordenes-trabajo/estadisticas');
  },

  // Crear nueva orden de trabajo
  async createOrden(orden: Omit<OrdenTrabajoBD, 'id' | 'codigo_orden' | 'fecha_creacion' | 'total' | 'created_at' | 'updated_at'>): Promise<ApiResponse<OrdenTrabajoBD>> {
    return fetchApi<OrdenTrabajoBD>('/ordenes-trabajo', {
      method: 'POST',
      body: JSON.stringify(orden),
    });
  },

  // Crear orden desde cita
  async createOrdenFromCita(citaId: number, observaciones: string, usuarioId?: number): Promise<ApiResponse<OrdenTrabajoBD>> {
    const data: any = { observaciones_iniciales: observaciones };
    if (usuarioId) data.usuario_id = usuarioId;
    
    return fetchApi<OrdenTrabajoBD>(`/ordenes-trabajo/from-cita/${citaId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Actualizar orden
  async updateOrden(id: number, orden: Partial<OrdenTrabajoBD>): Promise<ApiResponse<OrdenTrabajoBD>> {
    return fetchApi<OrdenTrabajoBD>(`/ordenes-trabajo/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orden),
    });
  },

  // Actualizar solo el estado de una orden
  async updateEstadoOrden(id: number, estado: string): Promise<ApiResponse<OrdenTrabajoBD>> {
    return fetchApi<OrdenTrabajoBD>(`/ordenes-trabajo/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
  },

  // Agregar repuesto a orden
  async addRepuestoOrden(id: number, repuesto: Omit<RepuestoUtilizadoBD, 'id' | 'orden_trabajo_id' | 'subtotal' | 'created_at'>): Promise<ApiResponse<RepuestoUtilizadoBD>> {
    return fetchApi<RepuestoUtilizadoBD>(`/ordenes-trabajo/${id}/repuestos`, {
      method: 'POST',
      body: JSON.stringify(repuesto),
    });
  },

  // Eliminar repuesto de orden
  async deleteRepuestoOrden(id: number, repuestoId: number): Promise<ApiResponse<{ message: string }>> {
    return fetchApi<{ message: string }>(`/ordenes-trabajo/${id}/repuestos/${repuestoId}`, {
      method: 'DELETE',
    });
  },

  // Agregar servicio a orden
  async addServicioOrden(id: number, servicio: Omit<ServicioRealizadoBD, 'id' | 'orden_trabajo_id' | 'created_at'>): Promise<ApiResponse<ServicioRealizadoBD>> {
    return fetchApi<ServicioRealizadoBD>(`/ordenes-trabajo/${id}/servicios`, {
      method: 'POST',
      body: JSON.stringify(servicio),
    });
  },

  // Eliminar servicio de orden
  async deleteServicioOrden(id: number, servicioId: number): Promise<ApiResponse<{ message: string }>> {
    return fetchApi<{ message: string }>(`/ordenes-trabajo/${id}/servicios/${servicioId}`, {
      method: 'DELETE',
    });
  },

  // Agregar nota de diagnóstico
  async addNotaDiagnostico(id: number, nota: Omit<NotaDiagnosticoBD, 'id' | 'orden_trabajo_id' | 'fecha' | 'created_at'>): Promise<ApiResponse<NotaDiagnosticoBD>> {
    return fetchApi<NotaDiagnosticoBD>(`/ordenes-trabajo/${id}/notas`, {
      method: 'POST',
      body: JSON.stringify(nota),
    });
  },

  // Eliminar nota de diagnóstico
  async deleteNotaDiagnostico(id: number, notaId: number): Promise<ApiResponse<{ message: string }>> {
    return fetchApi<{ message: string }>(`/ordenes-trabajo/${id}/notas/${notaId}`, {
      method: 'DELETE',
    });
  },

  // Eliminar orden
  async deleteOrden(id: number): Promise<ApiResponse<{ message: string }>> {
    return fetchApi<{ message: string }>(`/ordenes-trabajo/${id}`, {
      method: 'DELETE',
    });
  },

  // Obtener citas disponibles para crear órdenes
  async getCitasDisponiblesParaOrden(usuarioId?: number): Promise<ApiResponse<any[]>> {
    let endpoint = '/ordenes-trabajo/citas-disponibles';
    if (usuarioId) {
      endpoint += `?usuario_id=${usuarioId}`;
    }
    return fetchApi<any[]>(endpoint);
  },
};