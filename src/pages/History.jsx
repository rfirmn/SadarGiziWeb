// FILE: src/pages/History.jsx
// Halaman riwayat scan nutrisi
// Menampilkan semua entry yang tersimpan di state (in-memory)

import { useMemo } from 'react';
import { useHistory } from '../context/HistoryContext.jsx';
import { getScoreColor, getScoreTextColor } from '../utils/nutriscore.js';

/**
 * formatDate - Format tanggal ISO ke format yang mudah dibaca
 * @param {string} isoString - Tanggal dalam format ISO
 * @returns {string} - Tanggal yang diformat
 */
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * NutriBadge - Komponen badge untuk Nutri-Score
 */
function NutriBadge({ score }) {
    const bgColor = getScoreColor(score);
    const textColor = getScoreTextColor(score);

    return (
        <span
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold text-lg shadow-md"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            {score}
        </span>
    );
}

/**
 * HistoryCard - Komponen card untuk satu entry history
 */
function HistoryCard({ record, onDelete }) {
    return (
        <div className="card flex items-start gap-4 animate-fade-in">
            {/* Nutri-Score badge */}
            <NutriBadge score={record.nutri_score} />

            {/* Info utama */}
            <div className="flex-1 min-w-0">
                {/* Tanggal */}
                <p className="text-gray-400 text-sm mb-2">
                    {formatDate(record.date)}
                </p>

                {/* Nutrisi grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                        <span className="text-gray-500">Kalori:</span>{' '}
                        <span className="text-white font-medium">{record.kalori} kkal</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Gula:</span>{' '}
                        <span className="text-white font-medium">{record.gula} g</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Garam:</span>{' '}
                        <span className="text-white font-medium">{record.garam} mg</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Lemak:</span>{' '}
                        <span className="text-white font-medium">{record.lemak} g</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Protein:</span>{' '}
                        <span className="text-white font-medium">{record.protein} g</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Karbo:</span>{' '}
                        <span className="text-white font-medium">{record.karbo} g</span>
                    </div>
                    <div>
                        <span className="text-gray-500">Serat:</span>{' '}
                        <span className="text-white font-medium">{record.serat} g</span>
                    </div>
                </div>
            </div>

            {/* Delete button */}
            <button
                onClick={() => onDelete(record.id)}
                className="text-gray-500 hover:text-red-500 transition-colors p-2"
                aria-label="Hapus entry"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    );
}

/**
 * History - Halaman riwayat scan
 */
export default function History() {
    const { history, removeRecord, clearHistory, totalRecords } = useHistory();

    // Hitung statistik
    const stats = useMemo(() => {
        if (history.length === 0) return null;

        const scores = { A: 0, B: 0, C: 0, D: 0, E: 0 };
        let totalKalori = 0;

        history.forEach(record => {
            scores[record.nutri_score]++;
            totalKalori += record.kalori;
        });

        const avgKalori = Math.round(totalKalori / history.length);
        const bestScore = Object.entries(scores).find(([_, count]) => count > 0)?.[0] || '-';

        return { scores, avgKalori, bestScore };
    }, [history]);

    return (
        <div className="container-app animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Riwayat Scan</h1>
                    <p className="text-gray-400">
                        {totalRecords > 0
                            ? `${totalRecords} produk telah discan`
                            : 'Belum ada riwayat scan'
                        }
                    </p>
                </div>

                {/* Clear all button */}
                {history.length > 0 && (
                    <button
                        onClick={clearHistory}
                        className="btn-secondary text-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Hapus Semua
                    </button>
                )}
            </div>

            {/* Stats cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {/* Total scans */}
                    <div className="card-glass text-center py-4">
                        <p className="text-3xl font-bold text-white">{totalRecords}</p>
                        <p className="text-gray-400 text-sm">Total Scan</p>
                    </div>

                    {/* Average kalori */}
                    <div className="card-glass text-center py-4">
                        <p className="text-3xl font-bold text-white">{stats.avgKalori}</p>
                        <p className="text-gray-400 text-sm">Rata-rata Kalori</p>
                    </div>

                    {/* Best score count */}
                    <div className="card-glass text-center py-4">
                        <p className="text-3xl font-bold text-nutri-a">{stats.scores.A + stats.scores.B}</p>
                        <p className="text-gray-400 text-sm">Produk Sehat (A/B)</p>
                    </div>

                    {/* Warning count */}
                    <div className="card-glass text-center py-4">
                        <p className="text-3xl font-bold text-nutri-e">{stats.scores.D + stats.scores.E}</p>
                        <p className="text-gray-400 text-sm">Perlu Perhatian (D/E)</p>
                    </div>
                </div>
            )}

            {/* Score distribution */}
            {stats && (
                <div className="card mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4">Distribusi Nutri-Score</h3>
                    <div className="flex gap-4 justify-center">
                        {['A', 'B', 'C', 'D', 'E'].map(grade => (
                            <div key={grade} className="text-center">
                                <NutriBadge score={grade} />
                                <p className="text-white font-semibold mt-2">{stats.scores[grade]}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* History list */}
            {history.length > 0 ? (
                <div className="space-y-4">
                    {history.map(record => (
                        <HistoryCard
                            key={record.id}
                            record={record}
                            onDelete={removeRecord}
                        />
                    ))}
                </div>
            ) : (
                /* Empty state */
                <div className="card text-center py-16">
                    <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Riwayat</h3>
                    <p className="text-gray-400 mb-6">
                        Mulai scan produk makanan untuk melihat riwayat Nutri-Score di sini
                    </p>
                    <a href="/" className="btn-primary inline-flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Mulai Scan
                    </a>
                </div>
            )}

            {/* Info notice */}
            <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-xl">
                <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <p className="text-yellow-500 font-medium text-sm">Catatan Penyimpanan</p>
                        <p className="text-yellow-600/80 text-sm mt-1">
                            Data riwayat disimpan secara sementara (in-memory) dan akan hilang setelah halaman di-refresh.
                            Untuk penyimpanan permanen, diperlukan integrasi dengan localStorage atau database.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
