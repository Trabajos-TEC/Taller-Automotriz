import { Router } from 'express';
import { UsuarioController } from '../controllers/usuario.controller';

const router = Router();

router.post('/', UsuarioController.create);

export default router;
