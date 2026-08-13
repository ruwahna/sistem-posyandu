import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './modules/auth/auth.routes';
import posyanduRoutes from './modules/posyandu/posyandu.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import balitaRoutes from './modules/balita/balita.routes';
import lansiaRoutes from './modules/lansia/lansia.routes';
import notificationRoutes from './modules/notification/notification.routes';
import ownerRoutes from './modules/owner/owner.routes';
import { errorHandler, notFound } from './shared/middlewares/error.middleware';

const app = express();

// ─────────────────────────────────────────────────────────────
// GLOBAL MIDDLEWARES
// ─────────────────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
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
// API ROUTES (MODULAR MONOLITH)
// ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/posyandu', posyanduRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/owner', ownerRoutes);

// Nested tenant routes
app.use('/api/posyandu/:posyanduId/balita', balitaRoutes);
app.use('/api/posyandu/:posyanduId/lansia', lansiaRoutes);
app.use('/api/posyandu/:posyanduId/notifications', notificationRoutes);

// ─────────────────────────────────────────────────────────────
// ERROR HANDLING (harus di akhir)
// ─────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
