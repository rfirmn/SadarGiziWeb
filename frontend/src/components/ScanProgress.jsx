// FILE: frontend/src/components/ScanProgress.jsx
// Komponen progress scanning via API dengan proteksi Double-Fetch

import { useState, useEffect, useCallback, useRef } from 'react'; // Menambahkan useRef
import { apiScan } from '../services/api.js';

/**
 * ScanProgress - Komponen yang mengirim gambar ke backend API dan menampilkan progress
 *
 * Props:
 * @param {File|Blob} imageFile - File gambar untuk di-scan
 * @param {string} imagePreviewUrl - URL preview gambar (untuk tampilan)
 * @param {Function} onResult - Callback ketika scan selesai
 * @param {Function} onCancel - Callback untuk cancel
 */
export default function ScanProgress({ imageFile, imagePreviewUrl, onResult, onCancel }) {
    const [status, setStatus] = useState('uploading'); // uploading, processing, done, error
    const [error, setError] = useState(null);
    const [logs, setLogs] = useState([]);
    
    // SOLUSI: Gunakan ref untuk menyimpan Promise dari API call
    // Ini memastikan API hanya dipanggil 1 kali, tapi hasilnya bisa ditangkap oleh render kedua di Strict Mode
    const scanPromiseRef = useRef(null);

    const addLog = useCallback((msg, isErr = false) => {
        setLogs(prev => [...prev, { msg, time: new Date().toLocaleTimeString(), isErr }]);
    }, []);

    // Jalankan scan saat mount
    useEffect(() => {
        let cancelled = false;

        async function runScan() {
            try {
                // Jika belum ada promise yang berjalan, panggil API
                if (!scanPromiseRef.current) {
                    addLog('Mengunggah gambar ke server...');
                    setStatus('uploading');

                    // Simulasi transisi UI agar user melihat progress
                    addLog('Memulai analisis AI (ONNX + OCR)...');
                    setStatus('processing');

                    // Simpan promise ke dalam ref agar tidak ter-reset saat Strict Mode
                    scanPromiseRef.current = apiScan(imageFile);
                }

                // Menunggu hasil dari promise (bisa dari eksekusi pertama atau kedua)
                const result = await scanPromiseRef.current;

                if (cancelled) return;

                addLog(`✅ Selesai! Nutri-Score: ${result.nutriScore}`);
                setStatus('done');

                if (onResult) {
                    onResult({
                        cleanedData: result.nutritionData,
                        totalNutrients: result.totalNutrients,
                        nutriScore: result.nutriScore,
                        rawData: result.rawData,
                    });
                }
            } catch (err) {
                if (cancelled) return;
                console.error('Scan error:', err);
                setError(err.message);
                setStatus('error');
                addLog(err.message, true);
            }
        }

        runScan();

        return () => { 
            cancelled = true; 
        };
    }, [imageFile, addLog, onResult]);

    return (
        <div className="w-full max-w-2xl mx-auto bg-gray-900 text-white rounded-xl overflow-hidden shadow-2xl p-6 border border-gray-800">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    {(status === 'uploading' || status === 'processing') && <span className="animate-spin">⚙️</span>}
                    {status === 'done' && <span className="text-green-400">✅</span>}
                    {status === 'error' && <span className="text-red-400">❌</span>}
                    <span className="text-gray-200">
                        {status === 'uploading' ? 'Mengunggah gambar...' :
                            status === 'processing' ? 'Menganalisis nutrisi...' :
                                status === 'done' ? 'Analisis Selesai' : 'Gagal'}
                    </span>
                </h2>
                {(status === 'uploading' || status === 'processing') && (
                    <button onClick={onCancel} className="bg-red-500/10 text-red-400 px-4 py-1.5 rounded-lg hover:bg-red-500/20 transition text-sm font-medium">
                        Batalkan
                    </button>
                )}
            </div>

            {/* Progress Bar */}
            <div className="relative pt-1 mb-6">
                <div className="flex mb-2 items-center justify-between">
                    <span className="text-xs font-semibold inline-block text-primary-400 uppercase">
                        Progress
                    </span>
                    <span className="text-xs font-semibold inline-block text-primary-400">
                        {status === 'done' ? '100%' : status === 'error' ? 'Error' : 'Memproses...'}
                    </span>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                    <div
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-1000 ease-out ${
                            status === 'uploading' ? 'w-1/4' :
                            status === 'processing' ? 'w-3/4' :
                            status === 'done' ? 'w-full' : 'w-1/2 bg-red-500'
                        }`}
                    ></div>
                </div>
            </div>

            {/* Image Preview */}
            {imagePreviewUrl && (
                <div className="mb-6 bg-black/40 rounded-lg p-4 border border-gray-700 flex justify-center items-center">
                    <img src={imagePreviewUrl} alt="Preview" className="max-h-64 object-contain rounded opacity-90" />
                </div>
            )}

            {/* Logs Console */}
            <div className="bg-black/90 rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs border border-gray-700 shadow-inner">
                {logs.length === 0 && <p className="text-gray-600 italic">Menunggu log sistem...</p>}
                {logs.map((log, idx) => (
                    <div key={idx} className={`mb-1.5 border-l-2 pl-2 ${log.isErr ? 'border-red-500 text-red-400' : 'border-blue-500 text-gray-300'}`}>
                        <span className="text-gray-500 mr-2">[{log.time}]</span>
                        {log.msg}
                    </div>
                ))}
                {error && (
                    <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded text-red-300 font-bold">
                        CRITICAL ERROR: {error}
                    </div>
                )}
            </div>
        </div>
    );
}