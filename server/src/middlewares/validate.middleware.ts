import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Middleware untuk validasi request body menggunakan Zod schema.
 * Mengembalikan 400 Bad Request dengan detail error field jika gagal.
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      console.log('VALIDATION ERROR:', JSON.stringify({ body: req.body, errors }, null, 2));
      res.status(400).json({
        success: false,
        message: 'Validasi gagal',
        errors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
};
