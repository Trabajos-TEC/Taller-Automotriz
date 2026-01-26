// src/services/vehiculo_cliente.service.ts
import { fetchApi } from './api';
import type { ApiResponse } from './api';

export interface VehiculoCliente {
  id?: number;
  placa: string;
  cliente_id: number;
  vehiculo_base_id: number;
  color?: string;
  kilometraje?: number;
  anio_matricula?: string;
  vin?: string;
  notas?: string;
  created_at?: string;
}

export interface VehiculoClienteCompleto extends VehiculoCliente {
  cliente_cedula: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_correo: string;
  cliente_direccion: string;
  vehiculo_marca: string;
  vehiculo_modelo: string;
  vehiculo_anio: number;
  vehiculo_tipo: string;
}

export const vehiculoClienteService = {
  // Obtener todos los vehículos de clientes
  async getVehiculosClientes(search?: string): Promise<ApiResponse<VehiculoClienteCompleto[]>> {
    const endpoint = search ? `/vehiculos-clientes?search=${encodeURIComponent(search)}` : '/vehiculos-clientes';
    return fetchApi<VehiculoClienteCompleto[]>(endpoint);
  },

  // Obtener un vehículo de cliente por ID
  async getVehiculoClienteById(id: number): Promise<ApiResponse<VehiculoClienteCompleto>> {
    return fetchApi<VehiculoClienteCompleto>(`/vehiculos-clientes/${id}`);
  },

  // Obtener un vehículo de cliente por placa
  async getVehiculoClienteByPlaca(placa: string): Promise<ApiResponse<VehiculoClienteCompleto>> {
    return fetchApi<VehiculoClienteCompleto>(`/vehiculos-clientes/placa/${placa}`);
  },

  // Verificar si una placa existe
  async checkPlaca(placa: string): Promise<ApiResponse<{ exists: boolean; data: VehiculoCliente | null }>> {
    return fetchApi<{ exists: boolean; data: VehiculoCliente | null }>(`/vehiculos-clientes/check/placa/${placa}`);
  },

  // Verificar si un VIN existe
  async checkVin(vin: string): Promise<ApiResponse<{ exists: boolean; data: VehiculoCliente | null }>> {
    return fetchApi<{ exists: boolean; data: VehiculoCliente | null }>(`/vehiculos-clientes/check/vin/${vin}`);
  },

  // Crear un nuevo vehículo de cliente
  async createVehiculoCliente(vehiculo: Omit<VehiculoCliente, 'id'>, clienteNombre?: string): Promise<ApiResponse<VehiculoClienteCompleto>> {
    // Agregar nombre del cliente si se proporciona (para mantener compatibilidad)
    const vehiculoData: any = { ...vehiculo };
    if (clienteNombre) {
      vehiculoData.cliente_nombre = clienteNombre;
    }
    
    return fetchApi<VehiculoClienteCompleto>('/vehiculos-clientes', {
      method: 'POST',
      body: JSON.stringify(vehiculoData),
    });
  },

  // Actualizar un vehículo de cliente
  async updateVehiculoCliente(id: number, vehiculo: Partial<VehiculoCliente>): Promise<ApiResponse<VehiculoClienteCompleto>> {
    return fetchApi<VehiculoClienteCompleto>(`/vehiculos-clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehiculo),
    });
  },

  // Eliminar un vehículo de cliente
  async deleteVehiculoCliente(id: number): Promise<ApiResponse<{ message: string }>> {
    return fetchApi<{ message: string }>(`/vehiculos-clientes/${id}`, {
      method: 'DELETE',
    });
  }
};