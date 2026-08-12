import { Router } from 'express';
import {
  register,
  login,
  getMe,
  registerPosyandu,
  updateProfile,
  forgotPassword,
  verifyResetToken,
  resetPassword,
} from './auth.controller';
import { authenticate } from '../../shared/middlewares/auth.middleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.schema';

const router = Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// POST /api/auth/register-posyandu  (publik — buat posyandu baru + owner)
router.post('/register-posyandu', registerPosyandu);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

// GET /api/auth/verify-reset-token/:token
router.get('/verify-reset-token/:token', verifyResetToken);

// POST /api/auth/reset-password
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// GET /api/auth/me  (dilindungi JWT)
router.get('/me', authenticate, getMe);

// PUT /api/auth/profile (dilindungi JWT)
router.put('/profile', authenticate, updateProfile);

export default router;
