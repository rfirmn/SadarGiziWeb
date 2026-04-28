// FILE: vite.config.js
// Konfigurasi Vite untuk project NutriScan
// Menggunakan plugin React untuk JSX support

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [
        react(),
    ],
    publicDir: 'public',
    server: {
        port: 3000,
        open: true,
        // Proxy API requests ke backend
        proxy: {
            '/api': {
                target: 'http://localhost:5001',
                changeOrigin: true,
            },
        },
    },
    build: {
        assetsInlineLimit: 0
    }
})
