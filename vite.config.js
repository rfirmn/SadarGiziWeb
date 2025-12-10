// FILE: vite.config.js
// Konfigurasi Vite untuk project NutriScan
// Menggunakan plugin React untuk JSX support

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
    plugins: [
        react(),
        // Copy WASM files dari node_modules ke dist saat build
        viteStaticCopy({
            targets: [
                {
                    src: 'node_modules/onnxruntime-web/dist/*.wasm',
                    dest: '.'
                }
            ]
        })
    ],
    publicDir: 'public',
    server: {
        port: 3000,
        open: true,
        // Allow serving files from node_modules for dev
        fs: {
            allow: ['..']
        }
    },
    // Exclude onnxruntime-web from optimization to avoid issues
    optimizeDeps: {
        exclude: ['onnxruntime-web']
    },
    build: {
        // Don't minify WASM files
        assetsInlineLimit: 0
    }
})
