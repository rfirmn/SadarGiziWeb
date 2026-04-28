// FILE: backend/server.js
// Entry point - start the Express server

import app from './src/app.js';
import env from './src/config/env.js';
import { testConnection } from './src/config/database.js';
import fs from 'fs';

// Pastikan folder uploads ada
if (!fs.existsSync(env.UPLOAD_DIR)) {
    fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
    console.log(`📁 Created upload directory: ${env.UPLOAD_DIR}`);
}

// Start server
async function start() {
    // Test koneksi database
    await testConnection();

    app.listen(env.PORT, () => {
        console.log(`\n🚀 NutriScan API Server running on http://localhost:${env.PORT}`);
        console.log(`   Environment: ${env.NODE_ENV}`);
        console.log(`   Database: ${env.DB_NAME}@${env.DB_HOST}:${env.DB_PORT}\n`);
    });
}

start().catch(err => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
});
