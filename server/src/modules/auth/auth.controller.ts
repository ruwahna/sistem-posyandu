import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const kader = await authService.register(req.body);
    res.status(201).json({ success: true, message: 'Registrasi berhasil', data: kader });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
};

export const registerPosyandu = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await authService.registerPosyandu(req.body);
    res.status(201).json({
      success: true,
      message: 'Posyandu dan akun berhasil dibuat',
      data,
    });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await authService.login(req.body);
    res.json({
      success: true,
      message: 'Login berhasil',
      data,
    });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const kader = await authService.getMe(req.user!.userId);
    res.json({ success: true, data: kader });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const updatedKader = await authService.updateProfile(req.user!.userId, req.body);
    res.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: updatedKader,
    });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
};

export const verifyResetToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = String(req.params.token);
    const result = await authService.verifyResetToken(token);
    if (!result.valid) {
      res.status(400).json({ success: false, valid: false, message: result.message });
      return;
    }
    res.json({ success: true, valid: true });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = String(req.body.token);
    const { newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    res.json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { idToken } = req.body;
    const data = await authService.googleLogin(idToken);
    res.json({
      success: true,
      message: 'Login Google berhasil',
      data,
    });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
};

