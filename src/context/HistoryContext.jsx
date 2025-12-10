// FILE: src/context/HistoryContext.jsx
// React Context untuk menyimpan history scan secara in-memory
// Data akan hilang setelah page reload (sesuai requirement)

import { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Buat context untuk history
const HistoryContext = createContext(null);

/**
 * HistoryProvider - Provider component untuk history context
 * Menyimpan array record scan nutrisi di state React
 * 
 * Struktur record:
 * {
 *   id: string (uuid),
 *   date: string (ISO format),
 *   garam: number,
 *   gula: number,
 *   kalori: number,
 *   karbo: number,
 *   lemak: number,
 *   protein: number,
 *   serat: number,
 *   nutri_score: "A" | "B" | "C" | "D" | "E"
 * }
 */
export function HistoryProvider({ children }) {
    // State untuk menyimpan semua record history
    const [history, setHistory] = useState([]);

    /**
     * addRecord - Menambahkan record baru ke history
     * Dipanggil ketika user menekan tombol "Accept"
     * 
     * @param {Object} nutritionData - Data nutrisi dari hasil scan
     * @param {string} nutriScore - Grade Nutri-Score (A-E)
     */
    const addRecord = useCallback((nutritionData, nutriScore) => {
        const newRecord = {
            id: uuidv4(),                        // Generate unique ID
            date: new Date().toISOString(),      // Timestamp saat ini
            garam: nutritionData.garam || 0,
            gula: nutritionData.gula || 0,
            kalori: nutritionData.kalori || 0,
            karbo: nutritionData.karbo || 0,
            lemak: nutritionData.lemak || 0,
            protein: nutritionData.protein || 0,
            serat: nutritionData.serat || 0,
            nutri_score: nutriScore
        };

        // Tambahkan ke awal array (terbaru di atas)
        setHistory(prev => [newRecord, ...prev]);

        return newRecord;
    }, []);

    /**
     * clearHistory - Menghapus semua record history
     */
    const clearHistory = useCallback(() => {
        setHistory([]);
    }, []);

    /**
     * removeRecord - Menghapus satu record berdasarkan ID
     * 
     * @param {string} id - ID record yang akan dihapus
     */
    const removeRecord = useCallback((id) => {
        setHistory(prev => prev.filter(record => record.id !== id));
    }, []);

    // Value yang akan di-provide ke children
    const value = {
        history,          // Array semua record
        addRecord,        // Function untuk menambah record
        clearHistory,     // Function untuk menghapus semua
        removeRecord,     // Function untuk menghapus satu
        totalRecords: history.length  // Jumlah total record
    };

    return (
        <HistoryContext.Provider value={value}>
            {children}
        </HistoryContext.Provider>
    );
}

/**
 * useHistory - Custom hook untuk mengakses history context
 * 
 * @returns {Object} - Context value (history, addRecord, dll)
 * @throws {Error} - Jika digunakan di luar HistoryProvider
 */
export function useHistory() {
    const context = useContext(HistoryContext);

    if (!context) {
        throw new Error('useHistory must be used within a HistoryProvider');
    }

    return context;
}

export default HistoryContext;
