import { fetchApi, type ApiResponse } from './api';

// Interfaz para Taller
export interface Taller {
  id?: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  ruc: string;
}

// Servicios para Talleres
export const tallerService = {
  // Obtener todos los talleres
  async getTalleres(): Promise<ApiResponse<Taller[]>> {
    return fetchApi<Taller[]>('/talleres');
  },

  // Obtener un taller por ID
  async getTallerById(id: number): Promise<ApiResponse<Taller>> {
    return fetchApi<Taller>(`/talleres/${id}`);
  },

  // Crear un nuevo taller
  async createTaller(taller: Omit<Taller, 'id'>): Promise<ApiResponse<Taller>> {
    return fetchApi<Taller>('/talleres', {
      method: 'POST',
      body: JSON.stringify(taller),
    });
  },

  // Actualizar un taller
  async updateTaller(id: number, taller: Partial<Taller>): Promise<ApiResponse<Taller>> {
    return fetchApi<Taller>(`/talleres/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taller),
    });
  },

  // Eliminar un taller
  async deleteTaller(id: number): Promise<ApiResponse<{ message: string }>> {
    return fetchApi<{ message: string }>(`/talleres/${id}`, {
      method: 'DELETE',
    });
  },
};

export default tallerService;
