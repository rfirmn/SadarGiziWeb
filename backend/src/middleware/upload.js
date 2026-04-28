// FILE: backend/src/middleware/upload.js
// Multer configuration untuk file upload

import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import env from '../config/env.js';

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, env.UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: uuid + original extension
        const ext = path.extname(file.originalname).toLowerCase();
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
    },
});

// File filter: hanya gambar
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipe file tidak didukung. Gunakan JPG, PNG, atau WebP.'), false);
    }
};

// Export multer instance
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: env.MAX_FILE_SIZE,
    },
});

export default upload;
