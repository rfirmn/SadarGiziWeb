// FILE: backend/src/controllers/scan.controller.js
// Controller untuk scan nutrisi (upload + AI pipeline)

import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';
import { runInference } from '../services/inference.service.js';
import { processAndOCR } from '../services/ocr.service.js';
import { cleanAndTransformData, calculateTotalNutrients } from '../utils/clean.js';
import { calculateNutriScoreSimplified } from '../utils/nutriscore.js';

/**
 * scan - Upload gambar dan jalankan full AI pipeline
 * POST /api/scan
 */
export async function scan(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'File gambar wajib diunggah.' });
        }

        const imagePath = req.file.path;
        const imageFilename = req.file.filename;

        console.log(`🔍 Starting scan for user ${req.user.id}: ${imageFilename}`);

        // 1. Inference (ONNX)
        console.log('  → Running ONNX inference...');
        const detections = await runInference(imagePath);
        const detCount = Object.keys(detections).length;
        console.log(`  → Found ${detCount} nutrition labels`);

        // 2. OCR
        let rawData = {};
        if (detCount > 0) {
            console.log('  → Running OCR...');
            rawData = await processAndOCR(imagePath, detections);
        }

        // 3. Clean & Calculate
        console.log('  → Calculating Nutri-Score...');
        const cleanedData = cleanAndTransformData(rawData);
        const totalNutrients = calculateTotalNutrients(cleanedData);
        const nutriScore = calculateNutriScoreSimplified(cleanedData);

        // 4. Save to database
        const recordId = uuidv4();
        await db('scan_records').insert({
            id: recordId,
            user_id: req.user.id,
            image_path: imageFilename,
            kalori: cleanedData.kalori,
            gula: cleanedData.gula,
            garam: cleanedData.garam,
            lemak: cleanedData.lemak,
            karbo: cleanedData.karbo || 0,
            protein: cleanedData.protein,
            serat: cleanedData.serat,
            serving: cleanedData.serving,
            takaran_satuan: cleanedData['takaran-satuan'] || 0,
            nutri_score: nutriScore,
            raw_ocr_data: JSON.stringify(rawData),
        });

        console.log(`  ✅ Scan complete. Nutri-Score: ${nutriScore}`);

        res.status(201).json({
            id: recordId,
            nutritionData: cleanedData,
            totalNutrients,
            nutriScore,
            imagePath: imageFilename,
            rawData,
        });
    } catch (err) {
        console.error('❌ Scan error:', err);
        next(err);
    }
}

/**
 * getScan - Mendapatkan detail satu scan
 * GET /api/scan/:id
 */
export async function getScan(req, res, next) {
    try {
        const record = await db('scan_records')
            .where({ id: req.params.id, user_id: req.user.id })
            .first();

        if (!record) {
            return res.status(404).json({ error: 'Record tidak ditemukan.' });
        }

        res.json({ record });
    } catch (err) {
        next(err);
    }
}
