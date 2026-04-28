// FILE: backend/src/app.js
// Express application setup

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import env from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import scanRoutes from './routes/scan.routes.js';
import historyRoutes from './routes/history.routes.js';

const app = express();

// --- Middleware ---

// CORS: izinkan frontend
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
}));

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting untuk auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 20, // Maksimal 20 request per window
    message: { error: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' },
});

// Static file serving untuk uploads
app.use('/api/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

// --- Routes ---
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/history', historyRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Error Handler ---
app.use(errorHandler);

export default app;
