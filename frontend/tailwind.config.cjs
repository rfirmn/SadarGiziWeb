// FILE: tailwind.config.cjs
// Konfigurasi TailwindCSS untuk project NutriScan
// Tema: biru, hitam, putih dengan gaya dashboard modern

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // Warna kustom untuk NutriScore
            colors: {
                'nutri-a': '#1b5e20',      // Hijau tua untuk skor A
                'nutri-b': '#66bb6a',      // Hijau muda untuk skor B
                'nutri-c': '#ffeb3b',      // Kuning untuk skor C
                'nutri-d': '#ff9800',      // Oren untuk skor D
                'nutri-e': '#e53935',      // Merah untuk skor E
                'primary': '#1e40af',      // Biru utama
                'secondary': '#3b82f6',    // Biru sekunder
                'dark': '#0f172a',         // Hitam/gelap
                'darker': '#020617',       // Lebih gelap
            },
            // Animasi kustom
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'bounce-slow': 'bounce 2s infinite',
            }
        },
    },
    plugins: [],
}
