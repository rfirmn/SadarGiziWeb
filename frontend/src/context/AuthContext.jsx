// FILE: frontend/src/context/AuthContext.jsx
// React Context untuk autentikasi user

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiGetMe, apiLogin, apiRegister, removeToken, setToken } from '../services/api.js';

const AuthContext = createContext(null);

/**
 * AuthProvider - Provider component untuk auth context
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check token saat mount
    useEffect(() => {
        const token = localStorage.getItem('nutriscan_token');
        if (token) {
            apiGetMe()
                .then(data => setUser(data.user))
                .catch(() => {
                    removeToken();
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email, password) => {
        const data = await apiLogin(email, password);
        setUser(data.user);
        return data;
    }, []);

    const register = useCallback(async (name, email, password) => {
        const data = await apiRegister(name, email, password);
        setUser(data.user);
        return data;
    }, []);

    const logout = useCallback(() => {
        removeToken();
        setUser(null);
    }, []);

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * useAuth - Custom hook untuk mengakses auth context
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
