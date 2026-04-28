// FILE: backend/src/services/inference.service.js
// Server-side ONNX inference menggunakan onnxruntime-node
// Port dari ModelRunner.jsx

import * as ort from 'onnxruntime-node';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfigurasi
const MODEL_PATH = path.join(__dirname, '../../models/my_model.onnx');
const CONF_THRESHOLD = 0.25;
const IOU_THRESHOLD = 0.45;
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

// Singleton session
let session = null;

/**
 * loadModel - Load ONNX model (singleton)
 */
async function loadModel() {
    if (session) return session;

    console.log('📦 Loading ONNX model...');
    session = await ort.InferenceSession.create(MODEL_PATH, {
        executionProviders: ['cpu'],
    });
    console.log('✅ ONNX model loaded successfully');
    return session;
}

/**
 * preprocessImage - Letterbox + normalisasi gambar
 * @param {string} imagePath - Path ke file gambar
 * @returns {Object} - { tensor, dims }
 */
async function preprocessImage(imagePath) {
    // Baca metadata gambar
    const metadata = await sharp(imagePath).metadata();
    const w = metadata.width;
    const h = metadata.height;

    // Hitung scale letterbox
    const scale = Math.min(MODEL_INPUT_SIZE / w, MODEL_INPUT_SIZE / h);
    const nw = Math.round(w * scale);
    const nh = Math.round(h * scale);
    const dw = Math.round((MODEL_INPUT_SIZE - nw) / 2);
    const dh = Math.round((MODEL_INPUT_SIZE - nh) / 2);

    // Resize dan pad dengan sharp
    const resizedBuffer = await sharp(imagePath)
        .resize(nw, nh, { fit: 'fill' })
        .extend({
            top: dh,
            bottom: MODEL_INPUT_SIZE - nh - dh,
            left: dw,
            right: MODEL_INPUT_SIZE - nw - dw,
            background: { r: 0, g: 0, b: 0 },
        })
        .removeAlpha()
        .raw()
        .toBuffer();

    // Konversi ke Float32 NCHW [1, 3, 640, 640]
    const float32Data = new Float32Array(3 * MODEL_INPUT_SIZE * MODEL_INPUT_SIZE);
    const pixelCount = MODEL_INPUT_SIZE * MODEL_INPUT_SIZE;

    for (let i = 0; i < pixelCount; i++) {
        float32Data[i] = resizedBuffer[i * 3] / 255.0;                     // R
        float32Data[i + pixelCount] = resizedBuffer[i * 3 + 1] / 255.0;     // G
        float32Data[i + pixelCount * 2] = resizedBuffer[i * 3 + 2] / 255.0; // B
    }

    const tensor = new ort.Tensor('float32', float32Data, [1, 3, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE]);

    return { tensor, dims: { w, h, scale, dw, dh } };
}

/**
 * IOU calculation
 */
function iou(box1, box2) {
    const x1 = Math.max(box1[0], box2[0]);
    const y1 = Math.max(box1[1], box2[1]);
    const x2 = Math.min(box1[2], box2[2]);
    const y2 = Math.min(box1[3], box2[3]);

    const interArea = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const box1Area = (box1[2] - box1[0]) * (box1[3] - box1[1]);
    const box2Area = (box2[2] - box2[0]) * (box2[3] - box2[1]);

    return interArea / (box1Area + box2Area - interArea);
}

/**
 * Non-Maximum Suppression
 */
function nonMaxSuppression(boxes, scores, classes, iouThresh) {
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
}

/**
 * runInference - Jalankan inference pada gambar
 * @param {string} imagePath - Path ke file gambar
 * @returns {Object} - Detections per class
 */
export async function runInference(imagePath) {
    const modelSession = await loadModel();

    // Preprocessing
    const { tensor, dims } = await preprocessImage(imagePath);

    // Run inference
    const feeds = { images: tensor };
    const results = await modelSession.run(feeds);

    // Parse output
    const output = results.output0.data;
    const numAnchors = 8400;

    let boxes = [];
    let scores = [];
    let classIndices = [];

    for (let i = 0; i < numAnchors; i++) {
        let maxScore = 0;
        let classIdx = -1;

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

            // Un-Letterbox
            const origXc = (xc - dims.dw) / dims.scale;
            const origYc = (yc - dims.dh) / dims.scale;
            const origW = w / dims.scale;
            const origH = h / dims.scale;

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
}

export default { runInference };
