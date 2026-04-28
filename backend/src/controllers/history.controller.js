// FILE: backend/src/controllers/history.controller.js
// Controller untuk riwayat scan (list, delete, clear)

import db from '../config/database.js';
import fs from 'fs/promises';
import path from 'path';
import env from '../config/env.js';

/**
 * getHistory - Mendapatkan riwayat scan user dengan pagination
 * GET /api/history?page=1&limit=20
 */
export async function getHistory(req, res, next) {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const offset = (page - 1) * limit;

        // Query data
        const records = await db('scan_records')
            .where({ user_id: req.user.id })
            .orderBy('scanned_at', 'desc')
            .limit(limit)
            .offset(offset);

        // Count total
        const [{ total }] = await db('scan_records')
            .where({ user_id: req.user.id })
            .count('* as total');

        res.json({
            records: records.map(r => ({
                id: r.id,
                date: r.scanned_at,
                kalori: r.kalori,
                gula: r.gula,
                garam: r.garam,
                lemak: r.lemak,
                karbo: r.karbo,
                protein: r.protein,
                serat: r.serat,
                nutri_score: r.nutri_score,
                image_path: r.image_path,
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        next(err);
    }
}

/**
 * deleteRecord - Hapus satu record
 * DELETE /api/history/:id
 */
export async function deleteRecord(req, res, next) {
    try {
        // Cari record dulu untuk hapus file
        const record = await db('scan_records')
            .where({ id: req.params.id, user_id: req.user.id })
            .first();

        if (!record) {
            return res.status(404).json({ error: 'Record tidak ditemukan.' });
        }

        // Hapus file gambar jika ada
        if (record.image_path) {
            const filePath = path.join(env.UPLOAD_DIR, record.image_path);
            try {
                await fs.unlink(filePath);
            } catch (e) {
                // File mungkin sudah tidak ada, lanjutkan
            }
        }

        // Hapus dari database
        await db('scan_records')
            .where({ id: req.params.id, user_id: req.user.id })
            .delete();

        res.json({ success: true });
    } catch (err) {
        next(err);
    }
}

/**
 * clearHistory - Hapus semua record user
 * DELETE /api/history
 */
export async function clearHistory(req, res, next) {
    try {
        // Ambil semua image paths untuk dihapus
        const records = await db('scan_records')
            .where({ user_id: req.user.id })
            .select('image_path');

        // Hapus file-file gambar
        for (const record of records) {
            if (record.image_path) {
                const filePath = path.join(env.UPLOAD_DIR, record.image_path);
                try {
                    await fs.unlink(filePath);
                } catch (e) {
                    // Lanjutkan jika file tidak ditemukan
                }
            }
        }

        // Hapus semua record dari database
        const deletedCount = await db('scan_records')
            .where({ user_id: req.user.id })
            .delete();

        res.json({ success: true, deletedCount });
    } catch (err) {
        next(err);
    }
}
