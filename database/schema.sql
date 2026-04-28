-- ============================================
-- NutriScan AI - MySQL Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS nutriscan_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nutriscan_db;

-- -------------------------------------------
-- Tabel Users
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email)
) ENGINE=InnoDB;

-- -------------------------------------------
-- Tabel Scan Records
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS scan_records (
    id              CHAR(36) PRIMARY KEY,
    user_id         INT NOT NULL,
    image_path      VARCHAR(500) DEFAULT NULL,
    kalori          INT DEFAULT 0,
    gula            INT DEFAULT 0,
    garam           INT DEFAULT 0,
    lemak           INT DEFAULT 0,
    karbo           INT DEFAULT 0,
    protein         INT DEFAULT 0,
    serat           INT DEFAULT 0,
    serving         INT DEFAULT 1,
    takaran_satuan  INT DEFAULT 0,
    nutri_score     CHAR(1) NOT NULL,
    raw_ocr_data    JSON DEFAULT NULL,
    scanned_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_nutri_score (nutri_score),
    INDEX idx_scanned_at (scanned_at DESC)
) ENGINE=InnoDB;
