// FILE: src/context/HistoryContext.jsx
// React Context untuk history scan - sekarang fetch dari API
// Data persisten di MySQL melalui backend

import { createContext, useContext, useState, useCallback } from 'react';
import { apiGetHistory, apiDeleteRecord, apiClearHistory } from '../services/api.js';

// Buat context untuk history
const HistoryContext = createContext(null);

/**
 * HistoryProvider - Provider component untuk history context
 * Fetch data dari backend API (bukan lagi in-memory)
 */
export function HistoryProvider({ children }) {
    const [history, setHistory] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * fetchHistory - Fetch riwayat dari API
     */
    const fetchHistory = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            const data = await apiGetHistory(page, 20);
            setHistory(data.records);
            setTotalRecords(data.total);
            setCurrentPage(data.page);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error('Failed to fetch history:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * removeRecord - Menghapus satu record via API
     */
    const removeRecord = useCallback(async (id) => {
        try {
            await apiDeleteRecord(id);
            // Refresh data
            await fetchHistory(currentPage);
        } catch (err) {
            console.error('Failed to delete record:', err);
        }
    }, [fetchHistory, currentPage]);

    /**
     * clearHistory - Menghapus semua record via API
     */
    const clearHistory = useCallback(async () => {
        try {
            await apiClearHistory();
            setHistory([]);
            setTotalRecords(0);
            setCurrentPage(1);
            setTotalPages(1);
        } catch (err) {
            console.error('Failed to clear history:', err);
        }
    }, []);

    // Value yang akan di-provide ke children
    const value = {
        history,
        totalRecords,
        currentPage,
        totalPages,
        isLoading,
        fetchHistory,
        removeRecord,
        clearHistory,
    };

    return (
        <HistoryContext.Provider value={value}>
            {children}
        </HistoryContext.Provider>
    );
}

/**
 * useHistory - Custom hook untuk mengakses history context
 */
export function useHistory() {
    const context = useContext(HistoryContext);
    if (!context) {
        throw new Error('useHistory must be used within a HistoryProvider');
    }
    return context;
}

export default HistoryContext;
