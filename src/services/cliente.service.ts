// src/services/cliente.service.ts - VERSIÓN SIN DIRECCIÓN
import { fetchApi } from './api';
import type { ApiResponse } from './api';

export interface Cliente {
  id?: number;
  nombre: string;
  cedula: string;
  correo?: string;
  numero?: string;
  created_at?: string;
}

export const clienteService = {
  // Obtener todos los clientes
  async getClientes(search?: string): Promise<ApiResponse<Cliente[]>> {
    const endpoint = search ? `/clientes?search=${encodeURIComponent(search)}` : '/clientes';
    return fetchApi<Cliente[]>(endpoint);
  },

  // Obtener un cliente por cédula
  async getClienteByCedula(cedula: string): Promise<ApiResponse<Cliente>> {
    return fetchApi<Cliente>(`/clientes/${cedula}`);
  },

  // Verificar si una cédula existe
  async checkCedula(cedula: string): Promise<ApiResponse<{ exists: boolean; data: Cliente | null }>> {
    return fetchApi<{ exists: boolean; data: Cliente | null }>(`/clientes/check/${cedula}`);
  },

  // Crear un nuevo cliente
  async createCliente(cliente: Omit<Cliente, 'id'>): Promise<ApiResponse<Cliente>> {
    return fetchApi<Cliente>('/clientes', {
      method: 'POST',
      body: JSON.stringify(cliente),
    });
  },

  // Actualizar un cliente
  async updateCliente(cedula: string, cliente: Partial<Cliente>): Promise<ApiResponse<Cliente>> {
    return fetchApi<Cliente>(`/clientes/${cedula}`, {
      method: 'PUT',
      body: JSON.stringify(cliente),
    });
  },

  // Eliminar un cliente
  async deleteCliente(cedula: string): Promise<ApiResponse<{ message: string }>> {
    return fetchApi<{ message: string }>(`/clientes/${cedula}`, {
      method: 'DELETE',
    });
  },
};