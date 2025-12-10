// FILE: src/App.jsx
// Komponen utama aplikasi dengan routing
// Routes: Home (scan) dan History (riwayat)

import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home.jsx'
import History from './pages/History.jsx'

// Komponen Navigation untuk header
function Navigation() {
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
                    {/* Home page - scan nutrisi */}
                    <Route path="/" element={<Home />} />

                    {/* History page - riwayat scan */}
                    <Route path="/history" element={<History />} />
                </Routes>
            </main>

            {/* Footer */}
            <footer className="bg-dark/50 border-t border-gray-800 py-4 text-center text-gray-500 text-sm">
                <p>© 2024 NutriScan - Powered by AI</p>
            </footer>
        </div>
    )
}
