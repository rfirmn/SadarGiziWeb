// FILE: src/components/CameraCapture.jsx
// Komponen untuk mengambil gambar dari kamera device
// Menggunakan getUserMedia API untuk akses webcam/kamera

import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * CameraCapture - Komponen capture kamera
 * 
 * Props:
 * @param {Function} onCapture - Callback ketika foto diambil, menerima image data URL
 * @param {Function} onClose - Callback untuk menutup kamera
 */
export default function CameraCapture({ onCapture, onClose }) {
    // Ref untuk video element
    const videoRef = useRef(null);
    // Ref untuk canvas (untuk capture frame)
    const canvasRef = useRef(null);

    // State untuk status kamera
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stream, setStream] = useState(null);

    /**
     * startCamera - Memulai stream kamera
     * Menggunakan getUserMedia untuk akses kamera
     */
    const startCamera = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Request akses kamera dengan preferensi kamera belakang (untuk mobile)
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',  // Preferensi kamera belakang
                    width: { ideal: 1280 },     // Resolusi ideal
                    height: { ideal: 720 }
                },
                audio: false
            });

            // Set stream ke video element
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);
            }

            setIsLoading(false);
        } catch (err) {
            console.error('Camera error:', err);

            // Handle berbagai error permission
            if (err.name === 'NotAllowedError') {
                setError('Akses kamera ditolak. Mohon izinkan akses kamera di browser settings.');
            } else if (err.name === 'NotFoundError') {
                setError('Tidak ada kamera yang ditemukan di device ini.');
            } else if (err.name === 'NotReadableError') {
                setError('Kamera sedang digunakan oleh aplikasi lain.');
            } else {
                setError(`Gagal mengakses kamera: ${err.message}`);
            }

            setIsLoading(false);
        }
    }, []);

    /**
     * stopCamera - Menghentikan stream kamera
     */
    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, [stream]);

    /**
     * takePhoto - Mengambil foto dari video stream
     * Capture frame saat ini ke canvas lalu convert ke data URL
     */
    const takePhoto = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Set ukuran canvas sesuai video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw frame saat ini ke canvas
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);

        // Convert ke data URL (JPEG untuk ukuran file lebih kecil)
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);

        // Stop kamera setelah capture
        stopCamera();

        // Callback dengan hasil capture
        onCapture(imageDataUrl);
    }, [stopCamera, onCapture]);

    /**
     * handleClose - Handler untuk tombol close
     */
    const handleClose = useCallback(() => {
        stopCamera();
        onClose();
    }, [stopCamera, onClose]);

    // Start kamera saat komponen mount
    useEffect(() => {
        startCamera();

        // Cleanup: stop kamera saat unmount
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between w-full max-w-md">
                <h2 className="text-xl font-semibold">Kamera</h2>
                <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-white transition-colors p-2"
                    aria-label="Tutup kamera"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Loading state */}
            {isLoading && (
                <div className="w-full max-w-md aspect-video bg-dark rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                        <div className="spinner-lg mx-auto mb-4"></div>
                        <p className="text-gray-400">Mengakses kamera...</p>
                    </div>
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="w-full max-w-md p-6 bg-red-900/30 border border-red-500 rounded-2xl">
                    <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <p className="text-red-400 font-medium">Error Kamera</p>
                            <p className="text-red-300 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                    <button
                        onClick={startCamera}
                        className="btn-secondary mt-4 w-full text-sm"
                    >
                        Coba Lagi
                    </button>
                </div>
            )}

            {/* Video preview */}
            {!isLoading && !error && (
                <>
                    <div className="relative">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="camera-preview"
                            onLoadedMetadata={() => setIsLoading(false)}
                        />
                        {/* Overlay guide */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-3/4 h-3/4 border-2 border-white/30 rounded-lg"></div>
                        </div>
                    </div>

                    {/* Tombol capture */}
                    <button
                        onClick={takePhoto}
                        className="w-20 h-20 bg-white rounded-full flex items-center justify-center
                       shadow-lg hover:scale-105 active:scale-95 transition-transform"
                        aria-label="Ambil foto"
                    >
                        <div className="w-16 h-16 bg-white border-4 border-dark rounded-full"></div>
                    </button>

                    <p className="text-gray-400 text-sm">Arahkan kamera ke label nutrisi</p>
                </>
            )}

            {/* Hidden canvas untuk capture */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
