import { fetchApi, type ApiResponse } from './api';

// Interfaz para Cotización
export interface Cotizacion {
  id?: number;
  codigo: string;
  cliente_nombre: string;
  cliente_cedula: string;
  vehiculo_placa: string;
  fecha_creacion?: string;
  descuento_mano_obra: number;
  subtotal_repuestos: number;
  subtotal_mano_obra: number;
  iva: number;
  total: number;
  estado: 'borrador' | 'pendiente' | 'aprobada' | 'rechazada';
  es_proforma: boolean;
  codigo_orden_trabajo?: string | null;
  mecanico_orden_trabajo?: string | null;
  repuestos?: any[]; // Array de repuestos
  mano_obra?: any[]; // Array de servicios
}

// Servicio para gestión de cotizaciones
export const cotizacionService = {
  // Obtener todas las cotizaciones
  async getCotizaciones(filtros?: { 
    estado?: string; 
    mecanico?: string; 
    cliente?: string 
  }): Promise<ApiResponse<Cotizacion[]>> {
    const params = new URLSearchParams();
    if (filtros?.estado) params.append('estado', filtros.estado);
    if (filtros?.mecanico) params.append('mecanico', filtros.mecanico);
    if (filtros?.cliente) params.append('cliente', filtros.cliente);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<Cotizacion[]>(`/cotizaciones${query}`);
  },

  // Obtener una cotización por ID
  async getCotizacionById(id: number): Promise<ApiResponse<Cotizacion>> {
    return fetchApi<Cotizacion>(`/cotizaciones/${id}`);
  },

  // Crear una nueva cotización
  async createCotizacion(cotizacion: Omit<Cotizacion, 'id' | 'fecha_creacion'>): Promise<ApiResponse<Cotizacion>> {
    return fetchApi<Cotizacion>('/cotizaciones', {
      method: 'POST',
      body: JSON.stringify(cotizacion),
    });
  },

  // Actualizar una cotización
  async updateCotizacion(id: number, cotizacion: Partial<Cotizacion>): Promise<ApiResponse<Cotizacion>> {
    return fetchApi<Cotizacion>(`/cotizaciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cotizacion),
    });
  },

  // Eliminar una cotización
  async deleteCotizacion(id: number): Promise<ApiResponse<{ id: number; deleted: boolean }>> {
    return fetchApi<{ id: number; deleted: boolean }>(`/cotizaciones/${id}`, {
      method: 'DELETE',
    });
  },

  // Actualizar solo el estado de una cotización
  async updateEstado(id: number, estado: Cotizacion['estado']): Promise<ApiResponse<Cotizacion>> {
    return this.updateCotizacion(id, { estado });
  },

  // Convertir cotización en orden de trabajo
  async vincularOrdenTrabajo(id: number, codigo_orden_trabajo: string, mecanico: string): Promise<ApiResponse<Cotizacion>> {
    return this.updateCotizacion(id, { 
      codigo_orden_trabajo, 
      mecanico_orden_trabajo: mecanico,
      estado: 'aprobada'
    });
  },
};
