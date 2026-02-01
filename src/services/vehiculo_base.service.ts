import { fetchApi } from './api';
import type { ApiResponse } from './api';

export interface VehiculoBase {
  id?: number;
  marca: string;
  modelo: string;
  anio: number;
  tipo: string;
  created_at?: string;
}

export const vehiculoBaseService = {
  // Obtener todos los vehículos base
  async getVehiculosBase(search?: string): Promise<ApiResponse<VehiculoBase[]>> {
    const endpoint = search ? `/vehiculos-base?search=${encodeURIComponent(search)}` : '/vehiculos-base';
    return fetchApi<VehiculoBase[]>(endpoint);
  },

  // Obtener un vehículo base por ID
  async getVehiculoBaseById(id: number): Promise<ApiResponse<VehiculoBase>> {
    return fetchApi<VehiculoBase>(`/vehiculos-base/${id}`);
  },

  // Crear un nuevo vehículo base
  async createVehiculoBase(vehiculo: Omit<VehiculoBase, 'id'>): Promise<ApiResponse<VehiculoBase>> {
    return fetchApi<VehiculoBase>('/vehiculos-base', {
      method: 'POST',
      body: JSON.stringify(vehiculo),
    });
  },

  // Actualizar un vehículo base
  async updateVehiculoBase(id: number, vehiculo: Partial<VehiculoBase>): Promise<ApiResponse<VehiculoBase>> {
    return fetchApi<VehiculoBase>(`/vehiculos-base/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehiculo),
    });
  },

  // Eliminar un vehículo base
  async deleteVehiculoBase(id: number): Promise<ApiResponse<{ message: string }>> {
    return fetchApi<{ message: string }>(`/vehiculos-base/${id}`, {
      method: 'DELETE',
    });
  }
};