import { Request, Response } from 'express';
import { UsuarioModel } from '../models/usuario.model';
//import bcrypt from 'bcrypt';


export class AuthController {
  static async login(req: Request, res: Response): Promise<Response> {
    console.log('BODY RECIBIDO:', req.body);

    const { correo, password } = req.body;

    const usuario = await UsuarioModel.findByEmail(correo);

    console.log('USUARIO ENCONTRADO:', usuario);

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    console.log('PASSWORD INGRESADO:', password);
    console.log('CEDULA EN DB:', usuario.cedula);
   
    console.log('BODY:', req.body);

    if (password !== usuario.cedula) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    return res.json({
      id: usuario.id,
      correo: usuario.correo,
      role: usuario.roles
    });
  }
}
