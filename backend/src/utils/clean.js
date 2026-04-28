// FILE: src/utils/clean.js
// Fungsi untuk membersihkan dan mentransformasi data hasil OCR
// Port dari logika Python ke JavaScript

/**
 * REQUIRED_KEYS - Daftar key nutrisi yang diperlukan
 * Semua key ini harus ada di hasil output dengan default value
 */
const REQUIRED_KEYS = [
    "garam",
    "gula",
    "kalori",
    "karbo",
    "lemak",
    "protein",
    "serving",
    "takaran-satuan",
    "serat"
];

/**
 * cleanAndTransformData - Membersihkan data ekstraksi OCR menjadi angka
 * 
 * Logika (port dari Python):
 * 1. Inisialisasi semua key dengan 0, kecuali 'serving' = 1
 * 2. Untuk setiap key di extractedData:
 *    - Jika key termasuk REQUIRED_KEYS: hapus semua karakter non-digit
 *    - Ambil hanya maksimal 3 karakter pertama
 *    - Parse ke integer
 *    - Jika value > 0 atau key !== 'serving', set ke hasil
 * 3. Return objek dengan semua nilai numerik
 * 
 * @param {Record<string, string>} extractedData - Data mentah dari OCR
 * @returns {Record<string, number>} - Data yang sudah dibersihkan (numerik)
 */
export function cleanAndTransformData(extractedData) {
    // Inisialisasi hasil dengan default values
    // Semua 0 kecuali serving = 1 (default 1 porsi)
    const result = {
        garam: 0,
        gula: 0,
        kalori: 0,
        karbo: 0,
        lemak: 0,
        protein: 0,
        serving: 1,           // Default 1 porsi
        "takaran-satuan": 0,  // Default 0, akan jadi 100 di nutriscore jika <= 0
        serat: 0
    };

    // Iterasi setiap key-value dari data yang diekstrak
    for (const [key, rawValue] of Object.entries(extractedData)) {
        // Skip jika key tidak ada di REQUIRED_KEYS
        if (!REQUIRED_KEYS.includes(key)) {
            continue;
        }

        // Pastikan rawValue adalah string
        const valueStr = String(rawValue || '');

        // Hapus semua karakter non-digit menggunakan regex
        // \D = semua karakter yang bukan digit (0-9)
        let cleanedValue = valueStr.replace(/\D/g, '');

        // Ambil maksimal 3 karakter pertama
        // Untuk mencegah nilai yang terlalu besar dari kesalahan OCR
        cleanedValue = cleanedValue.slice(0, 3);

        // Parse ke integer, default 0 jika tidak valid
        const numericValue = parseInt(cleanedValue, 10) || 0;

        // Set value ke result
        // Untuk 'serving': hanya set jika > 0 (gunakan default 1 jika 0)
        // Untuk key lain: selalu set value yang sudah di-parse
        if (key === 'serving') {
            if (numericValue > 0) {
                result[key] = numericValue;
            }
            // Jika 0, tetap gunakan default 1
        } else {
            result[key] = numericValue;
        }
    }

    return result;
}

/**
 * parseOcrTextToData - Parse teks OCR mentah menjadi key-value pairs
 * Mencoba mencocokkan keyword nutrisi dengan nilai di sebelahnya
 * 
 * @param {string} ocrText - Teks mentah dari Tesseract OCR
 * @param {string} expectedLabel - Label yang diharapkan (dari class detection)
 * @returns {Record<string, string>} - Mapping label ke value mentah
 */
export function parseOcrTextToData(ocrText, expectedLabel) {
    const result = {};
    const text = ocrText.toLowerCase();

    // Jika ada expected label dari detection, gunakan seluruh teks sebagai value
    if (expectedLabel && REQUIRED_KEYS.includes(expectedLabel)) {
        result[expectedLabel] = ocrText;
        return result;
    }

    // Keyword mapping untuk mencocokkan teks OCR dengan key nutrisi
    const keywordMap = {
        'garam': ['garam', 'natrium', 'sodium', 'salt', 'na'],
        'gula': ['gula', 'sugar', 'gula total', 'sugars'],
        'kalori': ['kalori', 'energi', 'energy', 'calories', 'kcal', 'kkal'],
        'karbo': ['karbohidrat', 'carbohydrate', 'carbs', 'karbo'],
        'lemak': ['lemak', 'fat', 'lemak total', 'total fat'],
        'protein': ['protein'],
        'serving': ['serving', 'porsi', 'sajian', 'takaran saji'],
        'takaran-satuan': ['takaran', 'per', 'gram', 'g', 'ml'],
        'serat': ['serat', 'fiber', 'dietary fiber']
    };

    // Cari setiap keyword di teks
    for (const [key, keywords] of Object.entries(keywordMap)) {
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                // Coba ekstrak angka yang dekat dengan keyword
                const regex = new RegExp(keyword + '[:\\s]*([\\d.,]+)', 'i');
                const match = text.match(regex);
                if (match) {
                    result[key] = match[1];
                }
                break;
            }
        }
    }

    return result;
}

export default cleanAndTransformData;

/**
 * CLASS_TO_KEY_MAP - Mapping dari class detection ke key nutrisi
 * Digunakan untuk mencocokkan hasil detection dengan key di cleanedData
 */
export const CLASS_TO_KEY_MAP = {
    'garam': 'garam',
    'gula': 'gula',
    'kalori': 'kalori',
    'karbo': 'karbo',
    'lemak': 'lemak',
    'protein': 'protein',
    'serving': 'serving',
    'takaran-satuan': 'takaran-satuan',
    'serat': 'serat'
};

/**
 * calculateTotalNutrients - Menghitung total nutrisi berdasarkan serving
 * 
 * @param {Record<string, number>} cleanedData - Data nutrisi yang sudah dibersihkan
 * @returns {Record<string, number>} - Data nutrisi total (dikalikan serving)
 */
export function calculateTotalNutrients(cleanedData) {
    const serving = cleanedData.serving || 1;

    return {
        garam: cleanedData.garam * serving,
        gula: cleanedData.gula * serving,
        kalori: cleanedData.kalori * serving,
        karbo: cleanedData.karbo * serving,
        lemak: cleanedData.lemak * serving,
        protein: cleanedData.protein * serving,
        serat: cleanedData.serat * serving,
        serving: serving,
        'takaran-satuan': cleanedData['takaran-satuan']
    };
}

