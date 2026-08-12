import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  id?: string;
  posyanduId: string;
  role: string;
  nama?: string;
}

// Extend Express Request to include decoded JWT payload
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware autentikasi JWT.
 * Mengekstrak Bearer token dari header Authorization,
 * memverifikasi, lalu menyimpan payload ke req.user.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET tidak dikonfigurasi');

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token tidak valid atau kadaluarsa' });
  }
};

/**
 * Middleware otorisasi berdasarkan role.
 * Gunakan setelah `authenticate`.
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Akses ditolak: izin tidak cukup' });
      return;
    }
    next();
  };
};

export const authorizeRole = authorize;
