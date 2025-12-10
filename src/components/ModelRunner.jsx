import * as ort from 'onnxruntime-web';

// Konfigurasi path WASM - gunakan node_modules path
// Vite akan serve file dari node_modules dengan benar
ort.env.wasm.wasmPaths = '/node_modules/onnxruntime-web/dist/';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createWorker, PSM } from 'tesseract.js';
import { cleanAndTransformData, calculateTotalNutrients, CLASS_TO_KEY_MAP } from '../utils/clean';
import { calculateNutriScoreSimplified } from '../utils/nutriscore';

// --- KONFIGURASI SESUAI NODE SCRIPT ---
const MODEL_PATH = '/my_model/my_model.onnx'; // Pastikan file ada di folder public/my_model/
const CONF_THRESHOLD = 0.25;
const IOU_THRESHOLD = 0.45;
const UPSCALE_FACTOR = 5;
const MODEL_INPUT_SIZE = 640;

const CLASS_NAMES = [
    'garam',            // 0
    'gula',             // 1
    'kalori',           // 2
    'karbo',            // 3
    'lemak',            // 4
    'nutrition-fact',   // 5
    'protein',          // 6
    'serat',            // 7
    'serving',          // 8
    'takaran-satuan'    // 9
];

function ModelRunner({ imageDataUrl, onResult, onCancel }) {
    const [status, setStatus] = useState('idle');
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('');
    const [error, setError] = useState(null);
    const [logs, setLogs] = useState([]);

    const sessionRef = useRef(null);
    const isProcessingRef = useRef(false);

    // Helper: Logger
    const addLog = useCallback((msg, isErr = false) => {
        setLogs(prev => [...prev, { msg, time: new Date().toLocaleTimeString(), isErr }]);
    }, []);

    // --- 1. LOAD MODEL ONNX ---
    // const loadModel = useCallback(async () => {
    //     if (sessionRef.current) return;

    //     setCurrentStep('Memuat Model ONNX...');
    //     addLog('Loading model session...');

    //     try {
    //         // Set path wasm jika perlu, biasanya otomatis handled by onnxruntime-web di public
    //         // ort.env.wasm.wasmPaths = "/"; 

    //         const session = await ort.InferenceSession.create(MODEL_PATH, {
    //             executionProviders: ['wasm'], // Gunakan CPU/WASM agar kompatibel luas
    //         });
    //         sessionRef.current = session;
    //         addLog('✅ Model ONNX berhasil dimuat.');
    //     } catch (err) {
    //         throw new Error(`Gagal memuat model ONNX: ${err.message}`);
    //     }
    // }, [addLog]);
    const loadModel = useCallback(async () => {
        if (sessionRef.current) return;

        setCurrentStep('Mengunduh Model (105 MB)...');
        addLog('Mulai mengunduh model...');

        try {
            // A. DOWNLOAD MANUAL
            // Gunakan path absolut dari root public
            const modelUrl = '/my_model/my_model.onnx';

            const response = await fetch(modelUrl);
            if (!response.ok) {
                throw new Error(`Gagal download model. Status: ${response.status} ${response.statusText}`);
            }

            // Baca sebagai ArrayBuffer (Binary data)
            const modelData = await response.arrayBuffer();

            addLog(`Download selesai. Ukuran: ${(modelData.byteLength / 1024 / 1024).toFixed(2)} MB`);

            // B. BUAT SESI DARI BUFFER
            setCurrentStep('Membuat Sesi ONNX...');

            // Opsional: Konfigurasi sesi untuk performa file besar
            const sessionOptions = {
                executionProviders: ['wasm'],
                graphOptimizationLevel: 'all', // Optimasi graph
            };

            // Masukkan data binary langsung ke create()
            const session = await ort.InferenceSession.create(modelData, sessionOptions);

            sessionRef.current = session;
            addLog('✅ Model ONNX berhasil dimuat dan siap!');

        } catch (err) {
            console.error("Detail Error:", err);
            // Cek apakah error karena memori (OOM)
            if (err.message && err.message.includes('memory')) {
                throw new Error("Browser kehabisan memori (OOM). Coba tutup tab lain atau gunakan model yang lebih kecil (Quantized).");
            }
            throw new Error(`Error: ${err.message}`);
        }
    }, [addLog]);

    // --- 2. PREPROCESSING: LETTERBOX & NCHW ---
    const preprocessImage = (imgElement) => {
        const w = imgElement.naturalWidth;
        const h = imgElement.naturalHeight;

        // Hitung Scale Letterbox
        const scale = Math.min(MODEL_INPUT_SIZE / w, MODEL_INPUT_SIZE / h);
        const nw = Math.round(w * scale);
        const nh = Math.round(h * scale);
        const dw = (MODEL_INPUT_SIZE - nw) / 2;
        const dh = (MODEL_INPUT_SIZE - nh) / 2;

        // Buat Canvas 640x640
        const canvas = document.createElement('canvas');
        canvas.width = MODEL_INPUT_SIZE;
        canvas.height = MODEL_INPUT_SIZE;
        const ctx = canvas.getContext('2d');

        // Fill Hitam (Padding)
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);

        // Gambar Image di Tengah (Resize)
        ctx.drawImage(imgElement, dw, dh, nw, nh);

        // Ambil Data Pixel (RGBA)
        const imgData = ctx.getImageData(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE);
        const { data } = imgData;

        // Konversi ke Float32Array NCHW [1, 3, 640, 640]
        const float32Data = new Float32Array(3 * MODEL_INPUT_SIZE * MODEL_INPUT_SIZE);

        for (let i = 0; i < MODEL_INPUT_SIZE * MODEL_INPUT_SIZE; i++) {
            // Normalisasi 0-255 -> 0.0-1.0
            // data layout: [r, g, b, a, r, g, b, a, ...]
            float32Data[i] = data[i * 4] / 255.0; // Red
            float32Data[i + MODEL_INPUT_SIZE * MODEL_INPUT_SIZE] = data[i * 4 + 1] / 255.0; // Green
            float32Data[i + MODEL_INPUT_SIZE * MODEL_INPUT_SIZE * 2] = data[i * 4 + 2] / 255.0; // Blue
        }

        const tensor = new ort.Tensor('float32', float32Data, [1, 3, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]);

        return {
            tensor,
            dims: { w, h, scale, dw, dh } // Info untuk restore koordinat nanti
        };
    };

    // --- 3. UTILS: IOU & NMS ---
    const iou = (box1, box2) => {
        const x1 = Math.max(box1[0], box2[0]);
        const y1 = Math.max(box1[1], box2[1]);
        const x2 = Math.min(box1[2], box2[2]);
        const y2 = Math.min(box1[3], box2[3]);

        const interArea = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
        const box1Area = (box1[2] - box1[0]) * (box1[3] - box1[1]);
        const box2Area = (box2[2] - box2[0]) * (box2[3] - box2[1]);

        return interArea / (box1Area + box2Area - interArea);
    };

    const nonMaxSuppression = (boxes, scores, classes, iouThresh) => {
        const indices = scores.map((s, i) => ({ s, i }))
            .sort((a, b) => b.s - a.s)
            .map(d => d.i);
        const keep = [];

        while (indices.length > 0) {
            const current = indices.shift();
            keep.push(current);

            for (let i = indices.length - 1; i >= 0; i--) {
                if (iou(boxes[current], boxes[indices[i]]) > iouThresh) {
                    indices.splice(i, 1);
                }
            }
        }
        return keep;
    };

    // --- 4. INFERENCE & POST-PROCESSING ---
    const runInference = async (tensor, dims) => {
        // Run Session
        const feeds = { images: tensor };
        const results = await sessionRef.current.run(feeds);

        // Output YOLO biasanya flattened [Batch, Channels, Anchors] -> [1, 84, 8400]
        const output = results.output0.data;
        const numAnchors = 8400;

        let boxes = [];
        let scores = [];
        let classIndices = [];

        // Parsing Output
        for (let i = 0; i < numAnchors; i++) {
            let maxScore = 0;
            let classIdx = -1;

            // Cari class score tertinggi (mulai index 5)
            for (let c = 0; c < CLASS_NAMES.length; c++) {
                const score = output[(5 + c) * numAnchors + i];
                if (score > maxScore) {
                    maxScore = score;
                    classIdx = c;
                }
            }

            if (maxScore >= CONF_THRESHOLD) {
                if (CLASS_NAMES[classIdx] === 'nutrition-fact') continue;

                const xc = output[0 * numAnchors + i];
                const yc = output[1 * numAnchors + i];
                let w = output[2 * numAnchors + i];
                let h = output[3 * numAnchors + i];

                // Padding 10%
                w *= 1.1;
                h *= 1.1;

                // Un-Letterbox (Mapping ke koordinat asli)
                const origXc = (xc - dims.dw) / dims.scale;
                const origYc = (yc - dims.dh) / dims.scale;
                const origW = w / dims.scale;
                const origH = h / dims.scale;

                // [x1, y1, x2, y2]
                boxes.push([
                    origXc - origW / 2,
                    origYc - origH / 2,
                    origXc + origW / 2,
                    origYc + origH / 2
                ]);
                scores.push(maxScore);
                classIndices.push(classIdx);
            }
        }

        // NMS
        const keepIndices = nonMaxSuppression(boxes, scores, classIndices, IOU_THRESHOLD);

        const bestDetections = {};
        keepIndices.forEach(idx => {
            const clsName = CLASS_NAMES[classIndices[idx]];
            const score = scores[idx];
            const box = boxes[idx];

            const left = Math.max(0, Math.floor(box[0]));
            const top = Math.max(0, Math.floor(box[1]));
            const right = Math.min(dims.w, Math.floor(box[2]));
            const bottom = Math.min(dims.h, Math.floor(box[3]));

            const width = right - left;
            const height = bottom - top;

            if (width > 5 && height > 5) {
                if (!bestDetections[clsName] || score > bestDetections[clsName].score) {
                    bestDetections[clsName] = { left, top, width, height, score, clsName };
                }
            }
        });

        return bestDetections;
    };

    // --- 5. IMAGE PROCESSING UNTUK OCR (Replikasi Sharp di Browser) ---
    const processImageForOCR = (sourceImg, det) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 1. Upscale
        const targetW = det.width * UPSCALE_FACTOR;
        const targetH = det.height * UPSCALE_FACTOR;
        canvas.width = targetW;
        canvas.height = targetH;

        // Draw crop dengan scaling (Browser default bicubic/bilinear smoothing)
        ctx.drawImage(sourceImg, det.left, det.top, det.width, det.height, 0, 0, targetW, targetH);

        // 2. Grayscale & Contrast Increase (Linear 1.4, -40)
        const imageData = ctx.getImageData(0, 0, targetW, targetH);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // Grayscale
            const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;

            // Linear Contrast: val * 1.4 - 40
            let contrast = (gray * 1.4) - 40;

            // Normalize (Clamp 0-255)
            if (contrast < 0) contrast = 0;
            if (contrast > 255) contrast = 255;

            data[i] = contrast;     // R
            data[i + 1] = contrast;   // G
            data[i + 2] = contrast;   // B
            // Alpha tetap
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL('image/jpeg', 1.0); // High quality JPEG
    };

    // --- 6. OCR EXECUTION ---
    const runOCR = async (detections, imgElement) => {
        const worker = await createWorker('eng');
        const extracted = {};

        try {
            // Params sesuai script Node
            await worker.setParameters({
                tessedit_pageseg_mode: PSM.SINGLE_LINE,
                tessedit_char_whitelist: '0123456789.,gmlkca% ',
            });

            const keys = Object.keys(detections);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const det = detections[key];

                // Update Progress
                const pct = 50 + Math.round(((i) / keys.length) * 40);
                setProgress(pct);
                setCurrentStep(`Membaca: ${key}...`);

                // Proses Gambar
                const processedImgUrl = processImageForOCR(imgElement, det);

                // Recognize
                const { data: { text } } = await worker.recognize(processedImgUrl);

                // Clean Text
                const cleanedText = text.trim().replace(/\n/g, ' ').replace(/\|/g, 'l');
                addLog(`OCR [${key}]: "${cleanedText}"`);
                extracted[key] = cleanedText;
            }
        } finally {
            await worker.terminate();
        }
        return extracted;
    };

    // --- 7. MAIN PIPELINE ---
    const runPipeline = useCallback(async () => {
        if (isProcessingRef.current || !imageDataUrl) return;
        isProcessingRef.current = true;

        setStatus('processing');
        setProgress(0);
        setLogs([]);
        setError(null);

        try {
            // A. Init Model
            await loadModel();
            setProgress(10);

            // B. Load Image Element
            setCurrentStep('Memuat Gambar...');
            const img = new Image();
            img.src = imageDataUrl;
            await new Promise((resolve) => { img.onload = resolve; });

            // C. Preprocessing
            setCurrentStep('Preprocessing...');
            const { tensor, dims } = preprocessImage(img);
            setProgress(30);

            // D. Inference
            setCurrentStep('Deteksi Objek (ONNX)...');
            const detections = await runInference(tensor, dims);
            const detCount = Object.keys(detections).length;
            addLog(`Deteksi selesai. Ditemukan ${detCount} label nutrisi.`);

            if (detCount === 0) {
                addLog("⚠️ Tidak ada label nutrisi terdeteksi.", true);
                // Kita tetap lanjut agar tidak crash, tapi data kosong
            }
            setProgress(50);

            // E. OCR
            setCurrentStep('Membaca Teks (OCR)...');
            const rawData = await runOCR(detections, img);

            // F. Kalkulasi
            setCurrentStep('Kalkulasi Nutri-Score...');
            setProgress(90);

            const cleanedData = cleanAndTransformData(rawData);
            const totalNutrients = calculateTotalNutrients(cleanedData);
            const nutriScore = calculateNutriScoreSimplified(cleanedData);

            addLog(`Selesai! Nutri-Score: ${nutriScore}`);

            // G. Finish
            setProgress(100);
            setStatus('done');
            if (onResult) {
                onResult({
                    cleanedData,
                    totalNutrients,
                    nutriScore,
                    rawData,
                    logs
                });
            }

        } catch (err) {
            console.error(err);
            setError(err.message);
            setStatus('error');
            addLog(err.message, true);
        } finally {
            isProcessingRef.current = false;
        }
    }, [imageDataUrl, loadModel, addLog, onResult]);

    // Trigger otomatis saat gambar berubah
    useEffect(() => {
        if (imageDataUrl && status === 'idle') {
            runPipeline();
        }
    }, [imageDataUrl, status, runPipeline]);

    return (
        <div className="w-full max-w-2xl mx-auto bg-gray-900 text-white rounded-xl overflow-hidden shadow-2xl p-6 border border-gray-800">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    {status === 'processing' && <span className="animate-spin">⚙️</span>}
                    {status === 'done' && <span className="text-green-400">✅</span>}
                    {status === 'error' && <span className="text-red-400">❌</span>}
                    <span className="text-gray-200">
                        {status === 'idle' ? 'Menunggu...' :
                            status === 'processing' ? currentStep :
                                status === 'done' ? 'Analisis Selesai' : 'Gagal'}
                    </span>
                </h2>
                {status === 'processing' && (
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
                        {progress}%
                    </span>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                    <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300 ease-out"></div>
                </div>
            </div>

            {/* Image Preview */}
            {imageDataUrl && (
                <div className="mb-6 bg-black/40 rounded-lg p-4 border border-gray-700 flex justify-center items-center">
                    <img src={imageDataUrl} alt="Preview" className="max-h-64 object-contain rounded opacity-90" />
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

export default ModelRunner;