// FILE: backend/src/middleware/auth.js
// JWT authentication middleware

import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * authMiddleware - Verifikasi JWT token dari header Authorization
 * Format: "Bearer <token>"
 */
export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Akses ditolak. Token tidak ditemukan.',
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.user = decoded; // { id, email }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token sudah expired. Silakan login ulang.' });
        }
        return res.status(401).json({ error: 'Token tidak valid.' });
    }
}

export default authMiddleware;
