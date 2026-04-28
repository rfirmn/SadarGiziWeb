// FILE: frontend/src/pages/Login.jsx
// Halaman login - desain konsisten dengan tema dark/blue NutriScan

import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [email, password, login, navigate]);

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
                    <p className="text-gray-400 mt-2">Masuk ke akun Anda</p>
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

                        {/* Email */}
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Email
                            </label>
                            <input
                                id="login-email"
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
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-darker border border-gray-700 rounded-xl px-4 py-3 text-white
                                           placeholder-gray-500 focus:outline-none focus:border-secondary focus:ring-1
                                           focus:ring-secondary transition-colors"
                                placeholder="Masukkan password"
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
                                'Masuk'
                            )}
                        </button>
                    </form>

                    {/* Register link */}
                    <p className="text-center text-gray-400 text-sm mt-6">
                        Belum punya akun?{' '}
                        <Link to="/register" className="text-secondary hover:text-blue-400 font-medium transition-colors">
                            Daftar di sini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
