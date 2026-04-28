// FILE: backend/src/routes/history.routes.js
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getHistory, deleteRecord, clearHistory } from '../controllers/history.controller.js';

const router = Router();

router.get('/', authMiddleware, getHistory);
router.delete('/:id', authMiddleware, deleteRecord);
router.delete('/', authMiddleware, clearHistory);

export default router;
