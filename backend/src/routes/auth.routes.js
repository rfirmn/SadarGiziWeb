// FILE: backend/src/routes/auth.routes.js
import { Router } from 'express';
import { register, login, me, registerValidation, loginValidation } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authMiddleware, me);

export default router;
