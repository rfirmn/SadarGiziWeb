// FILE: frontend/src/pages/Register.jsx
// Halaman registrasi - desain konsisten dengan tema dark/blue NutriScan

import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError('');

        // Validasi password match
        if (password !== confirmPassword) {
            setError('Password dan konfirmasi password tidak cocok.');
            return;
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter.');
            return;
        }

        setIsLoading(true);

        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [name, email, password, confirmPassword, register, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 animate-fade-in">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl font-bold text-white">N</span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                        NutriScan
                    </h1>
                    <p className="text-gray-400 mt-2">Buat akun baru</p>
                </div>

                {/* Form */}
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error */}
                        {error && (
                            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Nama Lengkap
                            </label>
                            <input
                                id="register-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-darker border border-gray-700 rounded-xl px-4 py-3 text-white
                                           placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1
                                           focus:ring-secondary transition-colors"
                                placeholder="Nama Anda"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Email
                            </label>
                            <input
                                id="register-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-darker border border-gray-700 rounded-xl px-4 py-3 text-white
                                           placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1
                                           focus:ring-secondary transition-colors"
                                placeholder="nama@email.com"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Password
                            </label>
                            <input
                                id="register-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-darker border border-gray-700 rounded-xl px-4 py-3 text-white
                                           placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1
                                           focus:ring-secondary transition-colors"
                                placeholder="Minimal 6 karakter"
                                required
                                minLength={6}
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Konfirmasi Password
                            </label>
                            <input
                                id="register-confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-darker border border-gray-700 rounded-xl px-4 py-3 text-white
                                           placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1
                                           focus:ring-secondary transition-colors"
                                placeholder="Ulangi password"
                                required
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="spinner w-5 h-5 border-2"></div>
                                    Memproses...
                                </>
                            ) : (
                                'Daftar'
                            )}
                        </button>
                    </form>

                    {/* Login link */}
                    <p className="text-center text-gray-400 text-sm mt-6">
                        Sudah punya akun?{' '}
                        <Link to="/login" className="text-secondary hover:text-blue-400 font-medium transition-colors">
                            Masuk di sini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
