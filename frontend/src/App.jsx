// FILE: src/App.jsx
// Komponen utama aplikasi dengan routing
// Routes: Home (scan), History (riwayat), Login, Register

import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Home from './pages/Home.jsx'
import History from './pages/History.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'

// Komponen ProtectedRoute - redirect ke login jika belum auth
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner-lg"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

// Komponen GuestRoute - redirect ke home jika sudah auth
function GuestRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner-lg"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}

// Komponen Navigation untuk header
function Navigation() {
    const { isAuthenticated, user, logout } = useAuth();

    if (!isAuthenticated) return null;

    return (
        <nav className="bg-dark/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo dan nama aplikasi */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                        <span className="text-xl font-bold">N</span>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                        NutriScan
                    </span>
                </div>

                {/* Navigation links */}
                <div className="flex items-center gap-2">
                    {/* Link ke Home */}
                    <NavLink
                        to="/"
                        className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}
                    >
                        Scan
                    </NavLink>

                    {/* Link ke History */}
                    <NavLink
                        to="/history"
                        className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}
                    >
                        History
                    </NavLink>

                    {/* User info & Logout */}
                    <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-700">
                        <span className="text-gray-400 text-sm hidden md:block">
                            {user?.name}
                        </span>
                        <button
                            onClick={logout}
                            className="text-gray-400 hover:text-red-400 transition-colors text-sm font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}

// Komponen utama App
export default function App() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header navigation */}
            <Navigation />

            {/* Main content area dengan routes */}
            <main className="flex-1">
                <Routes>
                    {/* Auth routes (guest only) */}
                    <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                    <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

                    {/* Protected routes */}
                    <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                    <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                </Routes>
            </main>

            {/* Footer */}
            <footer className="bg-dark/50 border-t border-gray-800 py-4 text-center text-gray-500 text-sm">
                <p>© 2024 NutriScan - Powered by AI</p>
            </footer>
        </div>
    )
}
