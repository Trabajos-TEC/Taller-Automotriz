import { fetchApi, type ApiResponse } from './api';

// Interfaz para Cita
export interface Cita {
  id?: number;
  vehiculo_cliente_id: number;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM:SS
  descripcion: string;
  usuario_id?: number | null;
  estado: 'En Espera' | 'Aceptada' | 'Cancelada' | 'Completada';
  created_at?: string;
  updated_at?: string;
  // Campos relacionados (cuando se hace JOIN)
  vehiculo_placa?: string;
  vehiculo_marca?: string;
  vehiculo_modelo?: string;
  cliente_nombre?: string;
  cliente_cedula?: string;
  cliente_correo?: string;
  cliente_telefono?: string;
  mecanico_nombre?: string;
}

// Servicio para gestión de citas
export const citaService = {
  // Obtener todas las citas
  async getCitas(filtros?: { estado?: string; fecha?: string }): Promise<ApiResponse<Cita[]>> {
    const params = new URLSearchParams();
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.fecha) params.append('fecha', filtros.fecha);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<Cita[]>(`/citas${query}`);
  },

  // Obtener una cita por ID
  async getCitaById(id: number): Promise<ApiResponse<Cita>> {
    return fetchApi<Cita>(`/citas/${id}`);
  },

  // Crear una nueva cita
  async createCita(cita: Omit<Cita, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Cita>> {
    return fetchApi<Cita>('/citas', {
      method: 'POST',
      body: JSON.stringify(cita),
    });
  },

  // Actualizar una cita
  async updateCita(id: number, cita: Partial<Cita>): Promise<ApiResponse<Cita>> {
    return fetchApi<Cita>(`/citas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cita),
    });
  },

  // Eliminar una cita
  async deleteCita(id: number): Promise<ApiResponse<{ id: number; deleted: boolean }>> {
    return fetchApi<{ id: number; deleted: boolean }>(`/citas/${id}`, {
      method: 'DELETE',
    });
  },

  // Actualizar solo el estado de una cita
  async updateEstado(id: number, estado: Cita['estado']): Promise<ApiResponse<Cita>> {
    return this.updateCita(id, { estado });
  },

  // Asignar mecánico a una cita
  async asignarMecanico(id: number, usuario_id: number): Promise<ApiResponse<Cita>> {
    return this.updateCita(id, { usuario_id, estado: 'Aceptada' });
  },
};
