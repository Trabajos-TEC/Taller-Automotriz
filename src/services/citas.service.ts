// services/citas.service.ts - VERSIÓN ACTUALIZADA
import { fetchApi } from './api';
import type { ApiResponse } from './api';

export interface Cita {
  id: number;
  vehiculo_cliente_id: number;
  fecha: string;
  hora: string;
  descripcion: string;
  usuario_id: number | null;
  estado: string;
  created_at: string;
  updated_at: string;
}

export interface EstadisticasCitas {
  total: number;
  en_espera: number;
  aceptadas: number;
  completadas: number;
  canceladas: number;
  hoy: number;
}

export interface DisponibilidadResponse {
  vehiculoClienteDisponible: boolean;
  usuarioDisponible: boolean;
  citaExistente: Cita | null;
}

export interface CheckDisponibilidadData {
  vehiculoClienteId: number;
  fecha: string;
  hora: string;
  usuarioId?: number;
  excludeId?: number;
}

export const citasService = {
  // Obtener todas las citas
  async getCitas(search?: string): Promise<ApiResponse<Cita[]>> {
    const endpoint = search ? `/citas?search=${encodeURIComponent(search)}` : '/citas';
    return fetchApi<Cita[]>(endpoint);
  },

  // Obtener una cita por ID
  async getCitaById(id: number): Promise<ApiResponse<Cita>> {
    return fetchApi<Cita>(`/citas/${id}`);
  },

  // Obtener citas por vehiculo_cliente_id
  async getCitasByVehiculoClienteId(vehiculoClienteId: number): Promise<ApiResponse<Cita[]>> {
    return fetchApi<Cita[]>(`/citas/vehiculo-cliente/${vehiculoClienteId}`);
  },

  // Obtener citas por usuario_id
  async getCitasByUsuarioId(usuarioId: number): Promise<ApiResponse<Cita[]>> {
    return fetchApi<Cita[]>(`/citas/usuario/${usuarioId}`);
  },

  // Obtener citas por estado
  async getCitasByEstado(estado: string): Promise<ApiResponse<Cita[]>> {
    return fetchApi<Cita[]>(`/citas/estado/${encodeURIComponent(estado)}`);
  },

  // Obtener citas por fecha
  async getCitasByFecha(fecha: string): Promise<ApiResponse<Cita[]>> {
    return fetchApi<Cita[]>(`/citas/fecha/${fecha}`);
  },

  // Obtener estadísticas
  async getEstadisticas(): Promise<ApiResponse<EstadisticasCitas>> {
    return fetchApi<EstadisticasCitas>('/citas/estadisticas/totales');
  },

  // Obtener citas próximas
  async getProximasCitas(limit?: number): Promise<ApiResponse<Cita[]>> {
    const endpoint = limit ? `/citas/proximas?limit=${limit}` : '/citas/proximas';
    return fetchApi<Cita[]>(endpoint);
  },

  // Verificar disponibilidad
  async checkDisponibilidad(data: CheckDisponibilidadData): Promise<ApiResponse<DisponibilidadResponse>> {
    return fetchApi<DisponibilidadResponse>('/citas/check-disponibilidad', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Crear nueva cita
  async createCita(cita: Omit<Cita, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Cita>> {
    return fetchApi<Cita>('/citas', {
      method: 'POST',
      body: JSON.stringify(cita),
    });
  },

  // Actualizar cita completa
  async updateCita(id: number, cita: Partial<Cita>): Promise<ApiResponse<Cita>> {
    return fetchApi<Cita>(`/citas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cita),
    });
  },

  // Actualizar solo el estado de una cita
  async updateEstadoCita(id: number, estado: string): Promise<ApiResponse<Cita>> {
    return fetchApi<Cita>(`/citas/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
  },

  // Asignar usuario a una cita
  async asignarUsuario(id: number, usuarioId: number): Promise<ApiResponse<Cita>> {
    return fetchApi<Cita>(`/citas/${id}/asignar-usuario`, {
      method: 'PATCH',
      body: JSON.stringify({ usuario_id: usuarioId }),
    });
  },

  // Eliminar cita
  async deleteCita(id: number): Promise<ApiResponse<{ message: string }>> {
    return fetchApi<{ message: string }>(`/citas/${id}`, {
      method: 'DELETE',
    });
  }
};