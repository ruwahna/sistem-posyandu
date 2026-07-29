import { Router } from 'express';
import { register, login, getMe, registerPosyandu } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '../lib/schemas';

const router = Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// POST /api/auth/register-posyandu  (publik — buat posyandu baru + owner)
router.post('/register-posyandu', registerPosyandu);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// GET /api/auth/me  (dilindungi JWT)
router.get('/me', authenticate, getMe);

export default router;
