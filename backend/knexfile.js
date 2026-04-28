// FILE: backend/knexfile.js
// Konfigurasi Knex untuk migrations

import env from './src/config/env.js';

export default {
    client: 'mysql2',
    connection: {
        host: env.DB_HOST,
        port: env.DB_PORT,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME,
        charset: 'utf8mb4',
    },
    migrations: {
        directory: './migrations',
    },
};
