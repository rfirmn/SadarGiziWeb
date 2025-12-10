// FILE: src/pages/Home.jsx
// Halaman utama untuk scan nutrisi
// Flow: Pilih sumber -> Ambil/Upload gambar -> Scan -> Lihat hasil -> Accept/Decline

import { useState, useCallback } from 'react';
import CameraCapture from '../components/CameraCapture.jsx';
import ImageUpload from '../components/ImageUpload.jsx';
import ModelRunner from '../components/ModelRunner.jsx';
import NutriScoreDisplay from '../components/NutriScoreDisplay.jsx';
import { useHistory } from '../context/HistoryContext.jsx';

// Enum untuk state flow
const STATES = {
    SELECT_SOURCE: 'select_source',   // Pilih kamera atau upload
    CAMERA: 'camera',                 // Mode kamera
    UPLOAD: 'upload',                 // Mode upload
    PREVIEW: 'preview',               // Preview gambar sebelum scan
    SCANNING: 'scanning',             // Sedang scanning
    RESULT: 'result',                 // Menampilkan hasil
    ERROR: 'error'                    // Error state
};

/**
 * Home - Halaman utama NutriScan
 */
export default function Home() {
    // State management
    const [currentState, setCurrentState] = useState(STATES.SELECT_SOURCE);
    const [capturedImage, setCapturedImage] = useState(null);
    const [scanResult, setScanResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    // History context untuk menyimpan hasil
    const { addRecord } = useHistory();

    /**
     * handleCameraSelect - User memilih mode kamera
     */
    const handleCameraSelect = useCallback(() => {
        setCurrentState(STATES.CAMERA);
    }, []);

    /**
     * handleUploadSelect - User memilih mode upload
     */
    const handleUploadSelect = useCallback(() => {
        setCurrentState(STATES.UPLOAD);
    }, []);

    /**
     * handleImageCapture - Callback ketika gambar diambil/dipilih
     */
    const handleImageCapture = useCallback((imageDataUrl) => {
        setCapturedImage(imageDataUrl);
        setCurrentState(STATES.PREVIEW);
    }, []);

    /**
     * handleStartScan - Memulai proses scanning
     */
    const handleStartScan = useCallback(() => {
        setCurrentState(STATES.SCANNING);
    }, []);

    /**
     * handleScanComplete - Callback ketika scan selesai
     */
    const handleScanComplete = useCallback((result) => {
        setScanResult(result);
        setCurrentState(STATES.RESULT);
    }, []);

    /**
     * handleScanError - Callback ketika terjadi error
     */
    const handleScanError = useCallback((message) => {
        setErrorMessage(message);
        setCurrentState(STATES.ERROR);
    }, []);

    /**
     * handleAccept - User menerima hasil scan
     */
    const handleAccept = useCallback(() => {
        if (scanResult) {
            // Simpan ke history
            addRecord(scanResult.nutritionData, scanResult.nutriScore);

            // Reset ke awal
            resetToStart();
        }
    }, [scanResult, addRecord]);

    /**
     * handleDecline - User menolak hasil scan
     */
    const handleDecline = useCallback(() => {
        // Tidak simpan, langsung reset
        resetToStart();
    }, []);

    /**
     * resetToStart - Reset semua state ke awal
     */
    const resetToStart = useCallback(() => {
        setCapturedImage(null);
        setScanResult(null);
        setErrorMessage('');
        setCurrentState(STATES.SELECT_SOURCE);
    }, []);

    /**
     * handleBack - Kembali ke state sebelumnya
     */
    const handleBack = useCallback(() => {
        switch (currentState) {
            case STATES.CAMERA:
            case STATES.UPLOAD:
                setCurrentState(STATES.SELECT_SOURCE);
                break;
            case STATES.PREVIEW:
                setCapturedImage(null);
                setCurrentState(STATES.SELECT_SOURCE);
                break;
            case STATES.SCANNING:
            case STATES.ERROR:
                setCurrentState(STATES.PREVIEW);
                break;
            case STATES.RESULT:
                resetToStart();
                break;
            default:
                setCurrentState(STATES.SELECT_SOURCE);
        }
    }, [currentState, resetToStart]);

    // Render berdasarkan state
    return (
        <div className="min-h-screen">
            {/* State: Pilih sumber gambar */}
            {currentState === STATES.SELECT_SOURCE && (
                <div className="container-app flex flex-col items-center justify-center min-h-[80vh] animate-fade-in">
                    {/* Hero section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            Scan Nutrisi
                        </h1>
                        <p className="text-gray-400 text-lg max-w-md mx-auto">
                            Arahkan kamera atau upload foto label nutrisi untuk mendapatkan Nutri-Score instan
                        </p>
                    </div>

                    {/* Tombol pilihan */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg">
                        {/* Tombol Kamera */}
                        <button
                            onClick={handleCameraSelect}
                            className="card hover:border-secondary group transition-all duration-300 flex flex-col items-center gap-4 py-8"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-white mb-1">Gunakan Kamera</h3>
                                <p className="text-gray-500 text-sm">Ambil foto langsung dari device</p>
                            </div>
                        </button>

                        {/* Tombol Upload */}
                        <button
                            onClick={handleUploadSelect}
                            className="card hover:border-secondary group transition-all duration-300 flex flex-col items-center gap-4 py-8"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-white mb-1">Upload Gambar</h3>
                                <p className="text-gray-500 text-sm">Pilih dari galeri atau file</p>
                            </div>
                        </button>
                    </div>

                    {/* Info */}
                    <div className="mt-12 text-center">
                        <p className="text-gray-600 text-sm">
                            📱 Didukung di semua browser modern dengan akses kamera
                        </p>
                    </div>
                </div>
            )}

            {/* State: Kamera */}
            {currentState === STATES.CAMERA && (
                <div className="container-app">
                    <CameraCapture
                        onCapture={handleImageCapture}
                        onClose={handleBack}
                    />
                </div>
            )}

            {/* State: Upload */}
            {currentState === STATES.UPLOAD && (
                <div className="container-app">
                    <ImageUpload
                        onImageSelect={handleImageCapture}
                        onClose={handleBack}
                    />
                </div>
            )}

            {/* State: Preview gambar sebelum scan */}
            {currentState === STATES.PREVIEW && capturedImage && (
                <div className="container-app flex flex-col items-center animate-fade-in">
                    <h2 className="text-2xl font-semibold mb-6">Preview Gambar</h2>

                    {/* Preview image */}
                    <img
                        src={capturedImage}
                        alt="Preview"
                        className="image-preview mb-8"
                    />

                    {/* Action buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleBack}
                            className="btn-secondary"
                        >
                            Ambil Ulang
                        </button>
                        <button
                            onClick={handleStartScan}
                            className="btn-primary flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Mulai Scan
                        </button>
                    </div>
                </div>
            )}

            {/* State: Scanning */}
            {currentState === STATES.SCANNING && capturedImage && (
                <div className="container-app">
                    <ModelRunner
                        imageDataUrl={capturedImage}
                        onResult={(result) => {
                            // Map result dari ModelRunner baru ke format yang diharapkan
                            handleScanComplete({
                                nutritionData: result.cleanedData || result.totalNutrients,
                                nutriScore: result.nutriScore
                            });
                        }}
                        onCancel={handleBack}
                    />
                </div>
            )}

            {/* State: Hasil */}
            {currentState === STATES.RESULT && scanResult && (
                <NutriScoreDisplay
                    score={scanResult.nutriScore}
                    nutritionData={scanResult.nutritionData}
                    onAccept={handleAccept}
                    onDecline={handleDecline}
                />
            )}

            {/* State: Error */}
            {currentState === STATES.ERROR && (
                <div className="container-app flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                    <div className="card max-w-md text-center">
                        {/* Error icon */}
                        <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <h2 className="text-xl font-semibold text-white mb-2">Terjadi Kesalahan</h2>
                        <p className="text-gray-400 mb-6">{errorMessage}</p>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={resetToStart}
                                className="btn-secondary"
                            >
                                Kembali ke Awal
                            </button>
                            <button
                                onClick={() => setCurrentState(STATES.PREVIEW)}
                                className="btn-primary"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
