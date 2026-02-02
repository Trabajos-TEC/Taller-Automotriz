// src/services/orden.service.ts
import { fetchApi } from './api';
import type { ApiResponse } from './api';

export interface RepuestoUtilizado {
  codigo: string;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export interface ServicioRealizado {
  codigo: string;
  nombre: string;
  precio: number;
  descripcion: string;
}

export interface NotaDiagnostico {
  id: number;
  texto: string;
  fecha: string;
}

export interface OrdenTrabajo {
  id?: number;
  codigoOrden: string;
  clienteNombre: string;
  clienteCedula: string;
  placa: string;
  fechaCreacion: string;
  estado: 'Pendiente' | 'En proceso' | 'Finalizada' | 'Cancelada';
  observacionesIniciales: string;
  repuestosUtilizados?: RepuestoUtilizado[];
  serviciosRealizados?: ServicioRealizado[];
  notasDiagnostico?: NotaDiagnostico[];
  idCita?: string;
  vehiculo_cliente_id?: number;
  mecanico_id?: number;
  costo?: number;
  fecha_entrada?: string;
  fecha_salida?: string;
  vehiculo_placa?: string;
  vehiculo_marca?: string;
  vehiculo_modelo?: string;
  mecanico_nombre?: string;
  servicio_nombre?: string;
}

export const ordenService = {
  async getOrdenes(search?: string): Promise<ApiResponse<OrdenTrabajo[]>> {
    const endpoint = search ? `/ordenes-trabajo?search=${encodeURIComponent(search)}` : '/ordenes-trabajo';
    return fetchApi<OrdenTrabajo[]>(endpoint);
  },

  async getOrdenById(id: number): Promise<ApiResponse<OrdenTrabajo>> {
    return fetchApi<OrdenTrabajo>(`/ordenes-trabajo/${id}`);
  },

  async createOrden(orden: Omit<OrdenTrabajo, 'id'>): Promise<ApiResponse<OrdenTrabajo>> {
    return fetchApi<OrdenTrabajo>('/ordenes-trabajo', {
      method: 'POST',
      body: JSON.stringify(orden),
    });
  },

  async updateOrden(id: number, orden: Partial<OrdenTrabajo>): Promise<ApiResponse<OrdenTrabajo>> {
    return fetchApi<OrdenTrabajo>(`/ordenes-trabajo/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orden),
    });
  },

  async deleteOrden(id: number): Promise<ApiResponse<{ message: string }>> {
    return fetchApi<{ message: string }>(`/ordenes-trabajo/${id}`, {
      method: 'DELETE',
    });
  },
};