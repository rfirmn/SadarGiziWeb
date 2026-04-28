// FILE: src/components/NutriScoreDisplay.jsx
// Komponen untuk menampilkan hasil Nutri-Score
// Menampilkan huruf besar, warna background, list nutrisi, dan tombol Accept/Decline

import { useMemo } from 'react';
import { getScoreColor, getScoreTextColor, getScoreDescription } from '../utils/nutriscore.js';

/**
 * NutriScoreDisplay - Komponen display hasil Nutri-Score
 * 
 * Props:
 * @param {string} score - Grade Nutri-Score (A-E)
 * @param {Object} nutritionData - Data nutrisi yang sudah di-clean
 * @param {Function} onAccept - Callback saat tombol Accept ditekan
 * @param {Function} onDecline - Callback saat tombol Decline ditekan
 */
export default function NutriScoreDisplay({ score, nutritionData, onAccept, onDecline }) {
    // Mendapatkan warna berdasarkan score
    const bgColor = useMemo(() => getScoreColor(score), [score]);
    const textColor = useMemo(() => getScoreTextColor(score), [score]);
    const description = useMemo(() => getScoreDescription(score), [score]);

    // Daftar nutrisi untuk ditampilkan
    const nutritionItems = useMemo(() => [
        { key: 'kalori', label: 'Kalori', unit: 'kkal', icon: '🔥' },
        { key: 'gula', label: 'Gula', unit: 'g', icon: '🍬' },
        { key: 'garam', label: 'Garam', unit: 'mg', icon: '🧂' },
        { key: 'lemak', label: 'Lemak', unit: 'g', icon: '🧈' },
        { key: 'karbo', label: 'Karbohidrat', unit: 'g', icon: '🍞' },
        { key: 'protein', label: 'Protein', unit: 'g', icon: '🥩' },
        { key: 'serat', label: 'Serat', unit: 'g', icon: '🥬' },
    ], []);

    // CSS class untuk glow effect berdasarkan score
    const glowClass = `glow-${score.toLowerCase()}`;

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in transition-colors duration-500"
            style={{ backgroundColor: bgColor }}
        >
            {/* Container utama */}
            <div className="max-w-md w-full text-center">

                {/* Huruf Nutri-Score besar */}
                <div className="mb-8">
                    <div
                        className={`text-[180px] font-black leading-none ${glowClass} animate-scale-in`}
                        style={{ color: textColor }}
                    >
                        {score}
                    </div>
                    <p
                        className="text-xl font-medium mt-2 opacity-90"
                        style={{ color: textColor }}
                    >
                        Nutri-Score
                    </p>
                </div>

                {/* Deskripsi score */}
                <div
                    className="mb-8 px-4 py-3 rounded-full inline-block"
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: textColor
                    }}
                >
                    <p className="font-medium">{description}</p>
                </div>

                {/* Card nutrisi */}
                <div className="card-glass mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-white">Detail Nutrisi</h3>

                    <div className="grid grid-cols-2 gap-3">
                        {nutritionItems.map(item => (
                            <div
                                key={item.key}
                                className="flex items-center gap-2 bg-white/10 rounded-lg p-3"
                            >
                                <span className="text-xl">{item.icon}</span>
                                <div className="text-left">
                                    <p className="text-xs text-gray-300">{item.label}</p>
                                    <p className="font-semibold text-white">
                                        {nutritionData[item.key] || 0} {item.unit}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tombol Accept dan Decline */}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={onDecline}
                        className="btn-danger flex items-center gap-2 px-8"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Decline
                    </button>

                    <button
                        onClick={onAccept}
                        className="btn-success flex items-center gap-2 px-8"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Accept
                    </button>
                </div>

                {/* Info tambahan */}
                <p
                    className="mt-6 text-sm opacity-70"
                    style={{ color: textColor }}
                >
                    {score === 'A' || score === 'B'
                        ? '✓ Produk ini baik untuk dikonsumsi'
                        : score === 'C'
                            ? '⚠ Konsumsi dalam jumlah wajar'
                            : '⚠ Batasi konsumsi produk ini'
                    }
                </p>
            </div>
        </div>
    );
}
