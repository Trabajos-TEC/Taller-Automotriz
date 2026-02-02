// src/services/servicios.service.ts (versión mockeada temporal - CORREGIDA)
import type { ApiResponse } from './api';

export interface Servicio {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precio_base: number;
  tiempo_estimado_minutos: number;
  estado: 'Activo' | 'Inactivo';
  created_at?: string;
  updated_at?: string;
}

// Datos mockeados temporalmente
const SERVICIOS_MOCK: Servicio[] = [
  { codigo: 'S001', nombre: 'Cambio de Aceite', precio_base: 15000, categoria: 'Mantenimiento', tiempo_estimado_minutos: 30, estado: 'Activo', descripcion: 'Cambio completo de aceite' },
  { codigo: 'S002', nombre: 'Revisión de Frenos', precio_base: 20000, categoria: 'Seguridad', tiempo_estimado_minutos: 45, estado: 'Activo', descripcion: 'Revisión completa del sistema de frenos' },
  { codigo: 'S003', nombre: 'Cambio de Pastillas', precio_base: 15000, categoria: 'Seguridad', tiempo_estimado_minutos: 60, estado: 'Activo', descripcion: 'Cambio de pastillas delanteras' },
  { codigo: 'S004', nombre: 'Alineación', precio_base: 12000, categoria: 'Suspensión', tiempo_estimado_minutos: 45, estado: 'Activo', descripcion: 'Alineación de las 4 ruedas' },
  { codigo: 'S005', nombre: 'Balanceo', precio_base: 10000, categoria: 'Suspensión', tiempo_estimado_minutos: 30, estado: 'Activo', descripcion: 'Balanceo de ruedas' },
  { codigo: 'S006', nombre: 'Cambio de Batería', precio_base: 10000, categoria: 'Eléctrico', tiempo_estimado_minutos: 20, estado: 'Activo', descripcion: 'Cambio e instalación de batería' },
  { codigo: 'S007', nombre: 'Cambio de Filtro de Aire', precio_base: 8000, categoria: 'Mantenimiento', tiempo_estimado_minutos: 15, estado: 'Activo', descripcion: 'Cambio de filtro de aire' },
  { codigo: 'S008', nombre: 'Revisión General', precio_base: 25000, categoria: 'Diagnóstico', tiempo_estimado_minutos: 90, estado: 'Activo', descripcion: 'Revisión general del vehículo' },
];

export const serviciosService = {
  // Obtener todos los servicios (mockeado temporalmente)
  async getServicios(search?: string, categoria?: string): Promise<ApiResponse<Servicio[]>> {
    let servicios = SERVICIOS_MOCK;
    
    if (search) {
      const searchLower = search.toLowerCase();
      servicios = servicios.filter(s => 
        s.codigo.toLowerCase().includes(searchLower) ||
        s.nombre.toLowerCase().includes(searchLower) ||
        s.descripcion?.toLowerCase().includes(searchLower)
      );
    }
    
    if (categoria) {
      servicios = servicios.filter(s => s.categoria === categoria);
    }
    
    // Simular respuesta de API
    return Promise.resolve({
      success: true,
      data: servicios,
      message: 'Servicios obtenidos exitosamente'
    });
  },

  // Obtener un servicio por código (mockeado)
  async getServicioByCodigo(codigo: string): Promise<ApiResponse<Servicio>> {
    const servicio = SERVICIOS_MOCK.find(s => s.codigo === codigo);
    
    if (!servicio) {
      return Promise.resolve({
        success: false,
        data: {} as Servicio,
        message: 'Servicio no encontrado',
        errors: ['Servicio no encontrado']
      });
    }
    
    return Promise.resolve({
      success: true,
      data: servicio,
      message: 'Servicio obtenido exitosamente'
    });
  },
};