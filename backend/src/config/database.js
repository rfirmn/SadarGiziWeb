// FILE: backend/src/config/database.js
// Konfigurasi koneksi MySQL menggunakan Knex

import knex from 'knex';
import env from './env.js';

const db = knex({
    client: 'mysql2',
    connection: {
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        charset: 'utf8mb4',
    },
    pool: {
        min: 2,
        max: 10,
    },
});

// Test koneksi saat startup
export async function testConnection() {
    try {
        await db.raw('SELECT 1');
        console.log('✅ Database connected successfully');
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    }
}

export default db;
