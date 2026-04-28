// FILE: frontend/src/services/api.js
// API service layer - Fetch wrapper dengan JWT interceptor

const API_BASE = '/api';

/**
 * getToken - Ambil JWT token dari localStorage
 */
function getToken() {
    return localStorage.getItem('nutriscan_token');
}

/**
 * setToken - Simpan JWT token ke localStorage
 */
export function setToken(token) {
    localStorage.setItem('nutriscan_token', token);
}

/**
 * removeToken - Hapus JWT token
 */
export function removeToken() {
    localStorage.removeItem('nutriscan_token');
}

/**
 * apiRequest - Generic fetch wrapper dengan auth header
 */
async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const headers = { ...options.headers };

    // Tambahkan auth header jika ada token
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Jangan set Content-Type untuk FormData (biarkan browser set boundary)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        // Auto logout jika token expired
        if (response.status === 401) {
            removeToken();
            window.location.href = '/login';
        }
        throw new Error(data.error || 'Terjadi kesalahan');
    }

    return data;
}

// --- Auth API ---

export async function apiRegister(name, email, password) {
    const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    });
    setToken(data.token);
    return data;
}

export async function apiLogin(email, password) {
    const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data;
}

export async function apiGetMe() {
    return apiRequest('/auth/me');
}

// --- Scan API ---

export async function apiScan(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    return apiRequest('/scan', {
        method: 'POST',
        body: formData,
    });
}

// --- History API ---

export async function apiGetHistory(page = 1, limit = 20) {
    return apiRequest(`/history?page=${page}&limit=${limit}`);
}

export async function apiDeleteRecord(id) {
    return apiRequest(`/history/${id}`, { method: 'DELETE' });
}

export async function apiClearHistory() {
    return apiRequest('/history', { method: 'DELETE' });
}
