// FILE: backend/src/routes/scan.routes.js
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { scan, getScan } from '../controllers/scan.controller.js';

const router = Router();

router.post('/', authMiddleware, upload.single('image'), scan);
router.get('/:id', authMiddleware, getScan);

export default router;
