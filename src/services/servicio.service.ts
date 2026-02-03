// src/services/servicio.service.ts
import { fetchApi, type ApiResponse } from './api';

export interface Servicio {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_estimada_minutos: number;
  taller_id: number;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export const servicioService = {
  // Obtener todos los servicios del taller actual
  async getServicios(): Promise<ApiResponse<Servicio[]>> {
    return fetchApi<Servicio[]>('/servicios'); // ← Esto llama a GET /servicios
  },

  // Obtener un servicio por ID
  async getServicioById(id: number): Promise<ApiResponse<Servicio>> {
    return fetchApi<Servicio>(`/servicios/${id}`); // ← Esto llama a GET /servicios/:id
  },

  // Obtener un servicio por código
  async getServicioByCodigo(codigo: string): Promise<ApiResponse<Servicio>> {
    return fetchApi<Servicio>(`/servicios/codigo/${codigo}`); // ← Esto llama a GET /servicios/codigo/:codigo
  }
};