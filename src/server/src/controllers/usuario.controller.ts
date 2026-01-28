import { Request, Response } from 'express';
import { UsuarioModel } from '../models/usuario.model';

export class UsuarioController {
  static async create(req: Request, res: Response) {
    try {
      const { nombre, correo, cedula, roles } = req.body;

      if (!nombre || !correo || !cedula || !roles) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
      }

      if (cedula.length !== 9) {
        return res.status(400).json({ message: 'La cédula debe tener 9 dígitos' });
      }

      const usuario = await UsuarioModel.create({
        nombre,
        correo,
        cedula,
        roles
      });

      return res.status(201).json(usuario);
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(409).json({ message: 'Correo o cédula ya registrados' });
      }
    console.error('ERROR CREANDO USUARIO:', error);
    return res.status(500).json({
        message: 'Error al crear usuario',
        error: error instanceof Error ? error.message : error
    });
    }
  }
}
