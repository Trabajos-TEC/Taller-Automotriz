import { fetchApi } from './api';
import type { ApiResponse } from './api';

export interface Usuario {
  id?: number;
  nombre: string;
  correo: string;
  cedula: string;
  roles: string;
  activo?: boolean;
  password_hash?: string;
  created_at?: string;
  updated_at?: string;
}

export const usuarioService = {
  // Crear un nuevo usuario
  async createUsuario(usuario: Omit<Usuario, 'id'>): Promise<ApiResponse<Usuario>> {
    return fetchApi<Usuario>('/usuarios', {
      method: 'POST',
      body: JSON.stringify(usuario),
    });
  },

  // Verificar si un correo ya existe
  async checkEmail(email: string): Promise<ApiResponse<{ exists: boolean; data: Usuario | null }>> {
    return fetchApi<{ exists: boolean; data: Usuario | null }>(`/usuarios/check-email/${email}`);
  },

  // Verificar si una cédula ya existe
  async checkCedula(cedula: string): Promise<ApiResponse<{ exists: boolean; data: Usuario | null }>> {
    return fetchApi<{ exists: boolean; data: Usuario | null }>(`/usuarios/check-cedula/${cedula}`);
  },

  // Obtener todos los usuarios
  async getUsuarios(): Promise<ApiResponse<Usuario[]>> {
    return fetchApi<Usuario[]>('/usuarios');
  },

  // Obtener usuario por ID
  async getUsuarioById(id: number): Promise<ApiResponse<Usuario>> {
    return fetchApi<Usuario>(`/usuarios/${id}`);
  },

  // Obtener usuario por cédula
  async getUsuarioByCedula(cedula: string): Promise<ApiResponse<Usuario>> {
    return fetchApi<Usuario>(`/usuarios/cedula/${cedula}`);
  },

  // Obtener usuario por correo
  async getUsuarioByEmail(email: string): Promise<ApiResponse<Usuario>> {
    return fetchApi<Usuario>(`/usuarios/email/${email}`);
  },

  // Obtener usuarios por rol
  async getUsuariosByRole(role: string): Promise<ApiResponse<Usuario[]>> {
    return fetchApi<Usuario[]>(`/usuarios/role/${role}`);
  },

  // Actualizar usuario
  async updateUsuario(id: number, usuario: Partial<Usuario>): Promise<ApiResponse<Usuario>> {
    return fetchApi<Usuario>(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(usuario),
    });
  },

  // Actualizar estado de usuario (activo/inactivo)
  async updateUsuarioEstado(id: number, activo: boolean): Promise<ApiResponse<Usuario>> {
    return fetchApi<Usuario>(`/usuarios/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ activo }),
    });
  },

  // Eliminar usuario (soft delete)
  async deleteUsuario(id: number): Promise<ApiResponse<{ message: string }>> {
    return fetchApi<{ message: string }>(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  },

  // Restaurar usuario
  async restoreUsuario(id: number): Promise<ApiResponse<Usuario>> {
    return fetchApi<Usuario>(`/usuarios/${id}/restore`, {
      method: 'PATCH',
    });
  },

  // Cambiar contraseña
  async changePassword(id: number, oldPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return fetchApi<{ message: string }>(`/usuarios/${id}/change-password`, {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },

  // Resetear contraseña (para administrador)
  async resetPassword(id: number): Promise<ApiResponse<{ newPassword: string }>> {
    return fetchApi<{ newPassword: string }>(`/usuarios/${id}/reset-password`, {
      method: 'POST',
    });
  }
};