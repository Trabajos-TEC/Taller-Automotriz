import { fetchApi, ApiResponse } from './api';

// Interfaz para Servicio
export interface Servicio {
  id?: number;
  vehiculo_id: number;
  tipo_servicio: string;
  descripcion: string;
  fecha_entrada: Date;
  fecha_salida?: Date;
  costo: number;
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado';
}

// Servicios para Servicios del taller
export const servicioService = {
  // Obtener todos los servicios
  async getServicios(): Promise<ApiResponse<Servicio[]>> {
    return fetchApi<Servicio[]>('/servicios');
  },

  // Obtener servicios por vehículo
  async getServiciosByVehiculo(vehiculoId: number): Promise<ApiResponse<Servicio[]>> {
    return fetchApi<Servicio[]>(`/vehiculos/${vehiculoId}/servicios`);
  },

  // Crear un nuevo servicio
  async createServicio(servicio: Omit<Servicio, 'id'>): Promise<ApiResponse<Servicio>> {
    return fetchApi<Servicio>('/servicios', {
      method: 'POST',
      body: JSON.stringify(servicio),
    });
  },

  // Actualizar un servicio
  async updateServicio(id: number, servicio: Partial<Servicio>): Promise<ApiResponse<Servicio>> {
    return fetchApi<Servicio>(`/servicios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(servicio),
    });
  },

  // Eliminar un servicio
  async deleteServicio(id: number): Promise<ApiResponse<{ message: string }>> {
    return fetchApi<{ message: string }>(`/servicios/${id}`, {
      method: 'DELETE',
    });
  },
};

export default servicioService;
