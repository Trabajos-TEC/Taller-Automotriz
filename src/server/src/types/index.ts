// Tipos/interfaces para el sistema de taller automotriz
// Basado en la estructura real de la base de datos

export interface Taller {
  id?: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  ruc: string;
}

export interface Cliente {
  id?: number;
  nombre: string;
  cedula: string;
  correo?: string;
  numero?: string;
}

export interface Trabajador {
  id?: number;
  taller_id: number;
  nombre: string;
  cedula: string;
  correo: string;
  numero?: string;
  contrasena: string;
  rol: 'mecanico' | 'administrador' | 'supervisor';
}

export interface ClienteTaller {
  cliente_id: number;
  taller_id: number;
}

// Interfaces para relaciones (JOINs)
export interface ClienteConTalleres extends Cliente {
  talleres?: Taller[];
}

export interface TallerConClientes extends Taller {
  clientes?: Cliente[];
}

export interface TrabajadorConTaller extends Trabajador {
  taller?: Taller;
}
