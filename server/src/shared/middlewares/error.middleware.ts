import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler middleware.
 * Harus didaftarkan sebagai middleware terakhir di app.ts.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.stack);

  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan pada server',
    ...(process.env.NODE_ENV === 'development' && { error: err.message }),
  });
};

/**
 * 404 Not Found handler untuk route yang tidak terdaftar.
 */
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
};
