// FILE: backend/src/services/ocr.service.js
// Server-side OCR menggunakan Tesseract.js
// Port dari ModelRunner.jsx

import { createWorker, PSM } from 'tesseract.js';
import sharp from 'sharp';

const UPSCALE_FACTOR = 5;

/**
 * processAndOCR - Crop, upscale, grayscale, kontras, lalu OCR
 * @param {string} imagePath - Path ke file gambar asli
 * @param {Object} detections - Deteksi dari inference { className: { left, top, width, height } }
 * @returns {Object} - { className: "raw text" }
 */
export async function processAndOCR(imagePath, detections) {
    const worker = await createWorker('eng');
    const extracted = {};

    try {
        await worker.setParameters({
            tessedit_pageseg_mode: PSM.SINGLE_LINE,
            tessedit_char_whitelist: '0123456789.,gmlkca% ',
        });

        const keys = Object.keys(detections);

        for (const key of keys) {
            const det = detections[key];

            // Crop + Upscale + Grayscale + Kontras menggunakan sharp
            const targetW = det.width * UPSCALE_FACTOR;
            const targetH = det.height * UPSCALE_FACTOR;

            const processedBuffer = await sharp(imagePath)
                .extract({
                    left: det.left,
                    top: det.top,
                    width: det.width,
                    height: det.height,
                })
                .resize(targetW, targetH)
                .grayscale()
                .linear(1.4, -40) // Kontras: val * 1.4 - 40
                .jpeg({ quality: 100 })
                .toBuffer();

            // OCR pada buffer
            const { data: { text } } = await worker.recognize(processedBuffer);

            const cleanedText = text.trim().replace(/\n/g, ' ').replace(/\|/g, 'l');
            extracted[key] = cleanedText;
        }
    } finally {
        await worker.terminate();
    }

    return extracted;
}

export default { processAndOCR };
