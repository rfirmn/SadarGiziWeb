// FILE: src/components/ImageUpload.jsx
// Komponen untuk upload gambar dari galeri/file
// Menggunakan input type="file" untuk memilih gambar

import { useState, useRef, useCallback } from 'react';

/**
 * ImageUpload - Komponen upload gambar
 * 
 * Props:
 * @param {Function} onImageSelect - Callback ketika gambar dipilih, menerima image data URL
 * @param {Function} onClose - Callback untuk menutup/cancel
 */
export default function ImageUpload({ onImageSelect, onClose }) {
    // Ref untuk hidden file input
    const fileInputRef = useRef(null);

    // State
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);

    /**
     * handleFileChange - Handler ketika file dipilih
     * @param {Event} e - Change event dari input
     */
    const handleFileChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    }, []);

    /**
     * processFile - Memproses file gambar menjadi data URL
     * @param {File} file - File gambar yang dipilih
     */
    const processFile = useCallback((file) => {
        // Validasi tipe file
        if (!file.type.startsWith('image/')) {
            setError('File harus berupa gambar (JPG, PNG, dll)');
            return;
        }

        // Validasi ukuran file (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            setError('Ukuran file terlalu besar. Maksimal 10MB.');
            return;
        }

        setError(null);

        // Baca file sebagai data URL
        const reader = new FileReader();

        reader.onload = (event) => {
            const imageDataUrl = event.target?.result;
            if (imageDataUrl) {
                onImageSelect(imageDataUrl);
            }
        };

        reader.onerror = () => {
            setError('Gagal membaca file. Silakan coba lagi.');
        };

        reader.readAsDataURL(file);
    }, [onImageSelect]);

    /**
     * handleDrop - Handler untuk drag & drop
     */
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer?.files?.[0];
        if (file) {
            processFile(file);
        }
    }, [processFile]);

    /**
     * handleDragOver - Handler saat drag over area
     */
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    /**
     * handleDragLeave - Handler saat drag leave area
     */
    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    /**
     * triggerFileInput - Membuka dialog file picker
     */
    const triggerFileInput = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    return (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between w-full max-w-md">
                <h2 className="text-xl font-semibold">Upload Gambar</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors p-2"
                    aria-label="Tutup"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Drop zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={triggerFileInput}
                className={`
          w-full max-w-md aspect-video rounded-2xl border-2 border-dashed
          flex flex-col items-center justify-center gap-4 cursor-pointer
          transition-all duration-200
          ${isDragging
                        ? 'border-secondary bg-secondary/10'
                        : 'border-gray-600 hover:border-gray-500 bg-dark/50 hover:bg-dark/70'
                    }
        `}
            >
                {/* Icon upload */}
                <div className={`
          w-16 h-16 rounded-full flex items-center justify-center
          ${isDragging ? 'bg-secondary/20' : 'bg-gray-700'}
        `}>
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>

                {/* Text instruksi */}
                <div className="text-center">
                    <p className="text-gray-300 font-medium">
                        {isDragging ? 'Lepaskan untuk upload' : 'Drop gambar di sini'}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                        atau klik untuk memilih file
                    </p>
                </div>

                {/* Supported formats */}
                <p className="text-gray-600 text-xs">
                    Mendukung: JPG, PNG, WebP (maks. 10MB)
                </p>
            </div>

            {/* Error message */}
            {error && (
                <div className="w-full max-w-md p-4 bg-red-900/30 border border-red-500 rounded-xl">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Pilih file gambar"
            />

            {/* Tombol alternatif */}
            <button
                onClick={triggerFileInput}
                className="btn-primary flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Pilih dari Galeri
            </button>
        </div>
    );
}
