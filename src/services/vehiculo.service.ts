import { fetchApi, type ApiResponse } from './api';

// Interfaz para Vehículo
export interface Vehiculo {
  id?: number;
  cliente_id: number;
  marca: string;
  modelo: string;
  año: number;
  placa: string;
  vin?: string;
}

// Servicios para Vehículos
export const vehiculoService = {
  // Obtener todos los vehículos
  async getVehiculos(): Promise<ApiResponse<Vehiculo[]>> {
    return fetchApi<Vehiculo[]>('/vehiculos');
  },

  // Obtener vehículos por cliente
  async getVehiculosByCliente(clienteId: number): Promise<ApiResponse<Vehiculo[]>> {
    return fetchApi<Vehiculo[]>(`/clientes/${clienteId}/vehiculos`);
  },

  // Crear un nuevo vehículo
  async createVehiculo(vehiculo: Omit<Vehiculo, 'id'>): Promise<ApiResponse<Vehiculo>> {
    return fetchApi<Vehiculo>('/vehiculos', {
      method: 'POST',
      body: JSON.stringify(vehiculo),
    });
  },

  // Actualizar un vehículo
  async updateVehiculo(id: number, vehiculo: Partial<Vehiculo>): Promise<ApiResponse<Vehiculo>> {
    return fetchApi<Vehiculo>(`/vehiculos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehiculo),
    });
  },

  // Eliminar un vehículo
  async deleteVehiculo(id: number): Promise<ApiResponse<{ message: string }>> {
    return fetchApi<{ message: string }>(`/vehiculos/${id}`, {
      method: 'DELETE',
    });
  },
};

export default vehiculoService;
