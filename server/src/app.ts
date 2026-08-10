import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes';
import posyanduRoutes from './routes/posyandu.routes';
import dashboardRoutes from './routes/dashboard.routes';
import balitaRoutes from './routes/balita.routes';
import lansiaRoutes from './routes/lansia.routes';
import notificationRoutes from './routes/notification.routes';
import { errorHandler, notFound } from './middlewares/error.middleware';

const app = express();

// ─────────────────────────────────────────────────────────────
// GLOBAL MIDDLEWARES
// ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/posyandu', posyanduRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Nested routes: /api/posyandu/:posyanduId/balita
app.use('/api/posyandu/:posyanduId/balita', balitaRoutes);

// Nested routes: /api/posyandu/:posyanduId/lansia
app.use('/api/posyandu/:posyanduId/lansia', lansiaRoutes);

// Nested routes: /api/posyandu/:posyanduId/notifications
app.use('/api/posyandu/:posyanduId/notifications', notificationRoutes);

// ─────────────────────────────────────────────────────────────
// ERROR HANDLING (harus di akhir)
// ─────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
