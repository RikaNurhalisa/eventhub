-- ============================================================
-- EventHub Database Schema
-- Versi: 2.0 (Role-based: ADMIN & USER)
-- ============================================================

CREATE DATABASE IF NOT EXISTS eventhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE eventhub;

-- Hapus tabel lama untuk menghindari struktur kolom yang tertinggal/tidak lengkap
DROP TABLE IF EXISTS participants;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

-- ============================================================
-- 1. Tabel: users
-- ============================================================
CREATE TABLE users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)            NOT NULL,
  email       VARCHAR(100)            NOT NULL UNIQUE,
  password    VARCHAR(255)            NOT NULL,
  role        ENUM('admin', 'user')   NOT NULL DEFAULT 'user',
  created_at  TIMESTAMP               DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. Tabel: events
-- ============================================================
CREATE TABLE events (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(150)            NOT NULL,
  description TEXT,
  location    VARCHAR(200),
  event_date  DATE,
  quota       INT                     DEFAULT 0,
  category    VARCHAR(50)             DEFAULT 'Umum',
  created_by  INT,
  created_at  TIMESTAMP               DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- 3. Tabel: participants (registrations)
-- ============================================================
CREATE TABLE participants (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  event_id        INT           NOT NULL,
  name            VARCHAR(100)  NOT NULL,
  email           VARCHAR(100)  NOT NULL,
  phone           VARCHAR(20),
  status          ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  registered_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE KEY unique_registration (email, event_id)
);

-- ============================================================
-- 4. Seed: Admin default & Demo Event
-- Email   : admin@eventhub.com
-- Password: admin123  (bcrypt hash rounds=10)
-- ============================================================
INSERT INTO users (name, email, password, role) VALUES
(
  'Admin EventHub',
  'admin@eventhub.com',
  '$2b$10$7UHBikUsSdvng0eY4mIlhOpQ9infd9XSuJaUPy8vpTCacMdAoiLbK',
  'admin'
);

INSERT INTO events (title, description, location, event_date, quota, category, created_by) VALUES
(
  'Workshop Web Development dengan React',
  'Belajar membuat aplikasi web modern dengan React 19, TailwindCSS, dan Express.',
  'Online via Zoom',
  CURDATE() + INTERVAL 5 DAY,
  50,
  'Teknologi',
  1
),
(
  'Seminar Kewirausahaan Muda',
  'Strategi membangun startup dan bisnis mandiri di era digital.',
  'Gedung Rapat Utama Lantai 3',
  CURDATE() + INTERVAL 12 DAY,
  100,
  'Bisnis',
  1
);
