// FILE: src/utils/nutriscore.js
// Fungsi untuk menghitung Nutri-Score berdasarkan data nutrisi
// Port dari logika Python - versi simplified

/**
 * Thresholds untuk A_score (poin negatif)
 * Semakin tinggi nilai, semakin banyak poin negatif
 */
const ENERGY_THRESHOLDS = [335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350];  // kJ
const SUGAR_THRESHOLDS = [4.5, 9, 13.5, 18, 22.5, 27, 31, 36, 40, 45];                  // g
const FAT_THRESHOLDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];                                  // g (saturated)
const SODIUM_THRESHOLDS = [90, 180, 270, 360, 450, 540, 630, 720, 810, 900];            // mg

/**
 * Thresholds untuk C_score (poin positif)
 * Semakin tinggi nilai, semakin banyak poin positif
 */
const FIBER_THRESHOLDS = [0.9, 1.9, 2.8, 3.7, 4.7];   // g
const PROTEIN_THRESHOLDS = [1.6, 3.2, 4.8, 6.4, 8.0]; // g

/**
 * Konversi kcal ke kJ (1 kcal = 4.184 kJ)
 */
const KCAL_TO_KJ = 4.184;

/**
 * getScoreFromThresholds - Menghitung skor berdasarkan nilai dan thresholds
 * 
 * @param {number} value - Nilai nutrisi
 * @param {number[]} thresholds - Array threshold
 * @returns {number} - Skor (0 hingga jumlah thresholds)
 */
function getScoreFromThresholds(value, thresholds) {
    let score = 0;
    for (const threshold of thresholds) {
        if (value > threshold) {
            score++;
        } else {
            break;
        }
    }
    return score;
}

/**
 * calculateNutriScoreSimplified - Menghitung Nutri-Score dari data nutrisi
 * 
 * Logika (port dari Python):
 * 1. Normalisasi semua nilai ke per 100g menggunakan takaran-satuan
 * 2. Hitung A_score (poin negatif) dari energi, gula, lemak, garam
 * 3. Hitung C_score (poin positif) dari serat dan protein
 * 4. final_score = A_score - C_score
 * 5. Map final_score ke grade A/B/C/D/E
 * 
 * @param {Record<string, number>} cleanedData - Data nutrisi yang sudah dibersihkan
 * @returns {string} - Grade Nutri-Score (A, B, C, D, atau E)
 */
export function calculateNutriScoreSimplified(cleanedData) {
    // Ambil takaran satuan untuk normalisasi ke per 100g
    // Default 100 jika tidak ada atau <= 0
    let takaranSatuan = cleanedData['takaran-satuan'] || 0;
    if (takaranSatuan <= 0) {
        takaranSatuan = 100;  // Default 100g
    }

    // Faktor normalisasi: berapa kali takaran untuk mencapai 100g
    const normFactor = 100 / takaranSatuan;

    // Normalisasi nilai nutrisi ke per 100g
    const energiKcal = (cleanedData.kalori || 0) * normFactor;
    const gulaG = (cleanedData.gula || 0) * normFactor;
    const lemakG = (cleanedData.lemak || 0) * normFactor;
    const garamMg = (cleanedData.garam || 0) * normFactor;  // Asumsi sudah dalam mg
    const seratG = (cleanedData.serat || 0) * normFactor;
    const proteinG = (cleanedData.protein || 0) * normFactor;

    // Konversi energi dari kcal ke kJ untuk thresholds
    const energiKj = energiKcal * KCAL_TO_KJ;

    // === Hitung A_score (poin negatif) ===
    // Semakin tinggi A_score, semakin buruk
    const energyScore = getScoreFromThresholds(energiKj, ENERGY_THRESHOLDS);
    const sugarScore = getScoreFromThresholds(gulaG, SUGAR_THRESHOLDS);
    const fatScore = getScoreFromThresholds(lemakG, FAT_THRESHOLDS);
    const sodiumScore = getScoreFromThresholds(garamMg, SODIUM_THRESHOLDS);

    const A_score = energyScore + sugarScore + fatScore + sodiumScore;

    // === Hitung C_score (poin positif) ===
    // Semakin tinggi C_score, semakin baik (mengurangi final score)
    const fiberScore = getScoreFromThresholds(seratG, FIBER_THRESHOLDS);
    const proteinScore = getScoreFromThresholds(proteinG, PROTEIN_THRESHOLDS);

    const C_score = fiberScore + proteinScore;

    // === Hitung final score ===
    const finalScore = A_score - C_score;

    // === Map ke grade Nutri-Score ===
    // Thresholds berdasarkan sistem Nutri-Score resmi
    let grade;
    if (finalScore <= -1) {
        grade = 'A';  // Sangat baik
    } else if (finalScore <= 2) {
        grade = 'B';  // Baik
    } else if (finalScore <= 10) {
        grade = 'C';  // Sedang
    } else if (finalScore <= 18) {
        grade = 'D';  // Kurang baik
    } else {
        grade = 'E';  // Buruk
    }

    return grade;
}

/**
 * getScoreColor - Mendapatkan warna background berdasarkan grade
 * 
 * @param {string} grade - Grade Nutri-Score (A-E)
 * @returns {string} - Hex color code
 */
export function getScoreColor(grade) {
    const colors = {
        'A': '#1b5e20',  // Hijau tua
        'B': '#66bb6a',  // Hijau muda
        'C': '#ffeb3b',  // Kuning
        'D': '#ff9800',  // Oren
        'E': '#e53935',  // Merah
    };
    return colors[grade] || '#6b7280';  // Default abu-abu
}

/**
 * getScoreTextColor - Mendapatkan warna teks berdasarkan grade
 * Untuk grade C dan D yang background-nya terang, gunakan teks gelap
 * 
 * @param {string} grade - Grade Nutri-Score (A-E)
 * @returns {string} - Hex color code untuk teks
 */
export function getScoreTextColor(grade) {
    if (grade === 'C' || grade === 'D') {
        return '#1f2937';  // Teks gelap untuk background terang
    }
    return '#ffffff';  // Teks putih untuk background gelap
}

/**
 * getScoreDescription - Mendapatkan deskripsi untuk setiap grade
 * 
 * @param {string} grade - Grade Nutri-Score (A-E)
 * @returns {string} - Deskripsi grade
 */
export function getScoreDescription(grade) {
    const descriptions = {
        'A': 'Sangat Baik - Pilihan terbaik untuk kesehatan',
        'B': 'Baik - Pilihan yang sehat',
        'C': 'Sedang - Konsumsi dalam jumlah wajar',
        'D': 'Kurang Baik - Batasi konsumsi',
        'E': 'Buruk - Hindari konsumsi berlebihan',
    };
    return descriptions[grade] || 'Tidak diketahui';
}

export default calculateNutriScoreSimplified;
