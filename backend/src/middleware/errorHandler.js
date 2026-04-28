// FILE: backend/src/middleware/errorHandler.js
// Global error handling middleware

/**
 * errorHandler - Menangani semua error yang tidak tertangkap
 */
export function errorHandler(err, req, res, next) {
    console.error('❌ Error:', err.message);

    // Multer file size error
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            error: 'Ukuran file terlalu besar. Maksimal 10MB.',
        });
    }

    // Multer file type error
    if (err.message && err.message.includes('Tipe file')) {
        return res.status(400).json({ error: err.message });
    }

    // Validation errors
    if (err.type === 'validation') {
        return res.status(400).json({ error: err.message, details: err.details });
    }

    // Default server error
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: statusCode === 500 ? 'Terjadi kesalahan internal server.' : err.message,
    });
}

export default errorHandler;
