// FILE: backend/src/config/env.js
// Konfigurasi environment variables

import dotenv from 'dotenv';
dotenv.config();

const env = {
    PORT: parseInt(process.env.PORT) || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Database
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT) || 3306,
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME || 'nutriscan_db',

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'nutriscan_default_secret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

    // Upload
    UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
};

export default env;
