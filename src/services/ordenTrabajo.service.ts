import { fetchApi, type ApiResponse } from './api';

// Interfaz para Orden de Trabajo
export interface OrdenTrabajo {
  id?: number;
  vehiculo_cliente_id: number;
  servicio_id?: number | null;
  tipo_servicio: string;
  descripcion: string;
  fecha_entrada: string;
  fecha_salida?: string | null;
  costo: number;
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
  mecanico_id?: number | null;
  notas?: string | null;
  created_at?: string;
  updated_at?: string;
  // Campos relacionados (cuando se hace JOIN)
  vehiculo_placa?: string;
  vehiculo_marca?: string;
  vehiculo_modelo?: string;
  cliente_nombre?: string;
  cliente_cedula?: string;
  mecanico_nombre?: string;
  servicio_nombre?: string;
  servicio_precio?: number;
}

// Servicio para gestión de órdenes de trabajo
export const ordenTrabajoService = {
  // Obtener todas las órdenes
  async getOrdenes(vehiculoId?: number): Promise<ApiResponse<OrdenTrabajo[]>> {
    const query = vehiculoId ? `?vehiculo_id=${vehiculoId}` : '';
    return fetchApi<OrdenTrabajo[]>(`/ordenes-trabajo${query}`);
  },

  // Obtener una orden por ID
  async getOrdenById(id: number): Promise<ApiResponse<OrdenTrabajo>> {
    return fetchApi<OrdenTrabajo>(`/ordenes-trabajo/${id}`);
  },

  // Crear una nueva orden de trabajo
  async createOrden(orden: Omit<OrdenTrabajo, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<OrdenTrabajo>> {
    return fetchApi<OrdenTrabajo>('/ordenes-trabajo', {
      method: 'POST',
      body: JSON.stringify(orden),
    });
  },

  // Actualizar una orden de trabajo
  async updateOrden(id: number, orden: Partial<OrdenTrabajo>): Promise<ApiResponse<OrdenTrabajo>> {
    return fetchApi<OrdenTrabajo>(`/ordenes-trabajo/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orden),
    });
  },

  // Eliminar una orden de trabajo
  async deleteOrden(id: number): Promise<ApiResponse<{ message: string }>> {
    return fetchApi<{ message: string }>(`/ordenes-trabajo/${id}`, {
      method: 'DELETE',
    });
  },

  // Actualizar solo el estado de una orden
  async updateEstado(id: number, estado: OrdenTrabajo['estado']): Promise<ApiResponse<OrdenTrabajo>> {
    return this.updateOrden(id, { estado });
  },

  // Asignar mecánico a una orden
  async asignarMecanico(id: number, mecanico_id: number): Promise<ApiResponse<OrdenTrabajo>> {
    return this.updateOrden(id, { mecanico_id, estado: 'en_proceso' });
  },

  // Completar orden
  async completarOrden(id: number, fecha_salida: string): Promise<ApiResponse<OrdenTrabajo>> {
    return this.updateOrden(id, { 
      estado: 'completado',
      fecha_salida
    });
  },
};
