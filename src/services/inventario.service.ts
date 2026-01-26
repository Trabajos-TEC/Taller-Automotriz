import { fetchApi } from './api';
import type { ApiResponse } from './api';

export interface VehiculoAsociado {
  id: number;
  marca: string;
  modelo: string;
  anio: number;
  tipo: string;
}

export interface Producto {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  cantidad: number;
  cantidad_minima: number;
  precio_compra: number;
  precio_venta: number;
  proveedor?: string;
  vehiculos_asociados?: VehiculoAsociado[];
  created_at?: string;
}

export const inventarioService = {
  // Obtener todos los productos
  async getProductos(search?: string): Promise<ApiResponse<Producto[]>> {
    const endpoint = search ? `/inventario?search=${encodeURIComponent(search)}` : '/inventario';
    return fetchApi<Producto[]>(endpoint);
  },

  // Obtener un producto por código
  async getProductoByCodigo(codigo: string): Promise<ApiResponse<Producto>> {
    return fetchApi<Producto>(`/inventario/${codigo}`);
  },

  // Verificar si un código existe
  async checkCodigo(codigo: string): Promise<ApiResponse<{ exists: boolean; data: Producto | null }>> {
    return fetchApi<{ exists: boolean; data: Producto | null }>(`/inventario/check/${codigo}`);
  },

  // Crear un nuevo producto
  async createProducto(producto: Omit<Producto, 'id'>, vehiculosIds: number[] = []): Promise<ApiResponse<Producto>> {
    const productoConVehiculos = {
      ...producto,
      vehiculos_ids: vehiculosIds
    };
    
    return fetchApi<Producto>('/inventario', {
      method: 'POST',
      body: JSON.stringify(productoConVehiculos),
    });
  },

  // Actualizar un producto
  async updateProducto(codigo: string, producto: Partial<Producto>, vehiculosIds?: number[]): Promise<ApiResponse<Producto>> {
    const datosActualizar: any = { ...producto };
    
    if (vehiculosIds !== undefined) {
      datosActualizar.vehiculos_ids = vehiculosIds;
    }
    
    return fetchApi<Producto>(`/inventario/${codigo}`, {
      method: 'PUT',
      body: JSON.stringify(datosActualizar),
    });
  },

  // Eliminar un producto
  async deleteProducto(codigo: string): Promise<ApiResponse<{ message: string }>> {
    return fetchApi<{ message: string }>(`/inventario/${codigo}`, {
      method: 'DELETE',
    });
  }
};