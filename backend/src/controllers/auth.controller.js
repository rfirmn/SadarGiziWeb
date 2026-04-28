// FILE: backend/src/controllers/auth.controller.js
// Controller untuk autentikasi (register, login, me)

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import db from '../config/database.js';
import env from '../config/env.js';

const SALT_ROUNDS = 12;

/**
 * Validation rules
 */
export const registerValidation = [
    body('name').trim().notEmpty().withMessage('Nama wajib diisi').isLength({ max: 100 }),
    body('email').trim().isEmail().withMessage('Email tidak valid').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
];

export const loginValidation = [
    body('email').trim().isEmail().withMessage('Email tidak valid').normalizeEmail(),
    body('password').notEmpty().withMessage('Password wajib diisi'),
];

/**
 * generateToken - Buat JWT token
 */
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
    );
}

/**
 * register - Registrasi user baru
 */
export async function register(req, res, next) {
    try {
        // Validasi input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { name, email, password } = req.body;

        // Cek apakah email sudah terdaftar
        const existing = await db('users').where({ email }).first();
        if (existing) {
            return res.status(409).json({ error: 'Email sudah terdaftar.' });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert user
        const [id] = await db('users').insert({ name, email, password_hash });

        // Generate token
        const user = { id, name, email };
        const token = generateToken(user);

        res.status(201).json({
            token,
            user: { id, name, email },
        });
    } catch (err) {
        next(err);
    }
}

/**
 * login - Login user
 */
export async function login(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { email, password } = req.body;

        // Cari user
        const user = await db('users').where({ email }).first();
        if (!user) {
            return res.status(401).json({ error: 'Email atau password salah.' });
        }

        // Verifikasi password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Email atau password salah.' });
        }

        // Generate token
        const token = generateToken(user);

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (err) {
        next(err);
    }
}

/**
 * me - Mendapatkan data user yang sedang login
 */
export async function me(req, res, next) {
    try {
        const user = await db('users')
            .select('id', 'name', 'email', 'created_at')
            .where({ id: req.user.id })
            .first();

        if (!user) {
            return res.status(404).json({ error: 'User tidak ditemukan.' });
        }

        res.json({ user });
    } catch (err) {
        next(err);
    }
}
