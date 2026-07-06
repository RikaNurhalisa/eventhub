# EventHub

EventHub merupakan aplikasi berbasis web yang digunakan untuk mengelola informasi dan pendaftaran event secara online. Aplikasi ini menyediakan dua jenis pengguna, yaitu **Admin** dan **User**. Admin dapat mengelola data event serta memantau peserta yang telah mendaftar, sedangkan User dapat melihat daftar event, melakukan pendaftaran, dan melihat riwayat event yang telah diikuti.

Website ini dibangun menggunakan **React** sebagai frontend, **Express.js** sebagai backend REST API, serta **MySQL** sebagai database.

---

# Fitur Utama

## Autentikasi

- Login menggunakan email dan password
- Registrasi akun User
- Autentikasi menggunakan JSON Web Token (JWT)
- Password disimpan menggunakan bcrypt
- Hak akses berdasarkan role (Admin dan User)

## Dashboard Admin

- Melihat statistik event
- Mengelola seluruh data event
- Menambah event baru
- Mengubah informasi event
- Menghapus event
- Melihat seluruh peserta yang telah mendaftar pada setiap event

## Dashboard User

- Melihat daftar event yang tersedia
- Melihat detail event
- Mendaftar pada event
- Melihat daftar event yang telah diikuti

## Manajemen Event

- Menampilkan seluruh event
- Menampilkan detail event
- Menambahkan event
- Mengubah data event
- Menghapus event

## Manajemen Peserta

- Pendaftaran peserta pada event
- Melihat data peserta berdasarkan event
- Melihat riwayat pendaftaran milik pengguna
- Validasi agar email tidak dapat mendaftar pada event yang sama lebih dari satu kali

---

# Teknologi yang Digunakan

## Frontend

- React
- Vite
- React Router DOM
- Tailwind CSS

## Backend

- Node.js
- Express.js
- JWT Authentication
- bcryptjs
- CORS
- dotenv

## Database

- MySQL

---

# Struktur Project

```text
EventHub
│
├── frontend/        # React + Vite
├── backend/         # Express REST API
├── database/        # Database MySQL
└── docs/            # Dokumentasi Project
```

---

# Cara Menjalankan Project

## 1. Clone Repository

```bash
git clone <repository-url>
```

## 2. Menjalankan Backend

Masuk ke folder backend.

```bash
cd backend
```

Install dependency.

```bash
npm install
```

Buat file `.env`.

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=eventhub

JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

Import database MySQL dari folder `database`.

Jalankan backend.

```bash
npm run dev
```

atau

```bash
npm start
```

Backend akan berjalan pada:

```
http://localhost:5000
```

## 3. Menjalankan Frontend

Masuk ke folder frontend.

```bash
cd frontend
```

Install dependency.

```bash
npm install
```

Jalankan aplikasi.

```bash
npm run dev
```

Frontend akan berjalan pada:

```
http://localhost:5173
```

> Jika port 5173 digunakan aplikasi lain, Vite dapat otomatis menggunakan port lain seperti 5174.

---

# Cara Menggunakan Aplikasi

## 1. Login

Masuk menggunakan akun yang telah terdaftar.

- Admin dapat mengelola seluruh data event dan peserta.
- User dapat melihat serta mendaftar event.

## 2. Registrasi

Apabila belum memiliki akun, lakukan registrasi terlebih dahulu sebagai User.

## 3. Mengelola Event (Admin)

Admin dapat:

- Menambahkan event
- Mengubah data event
- Menghapus event
- Melihat statistik event
- Melihat data peserta

## 4. Mengikuti Event (User)

User dapat:

- Melihat daftar event
- Membuka detail event
- Mengisi formulir pendaftaran
- Melihat riwayat event yang telah diikuti

---

# REST API

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

## Event

```http
GET    /api/events
GET    /api/events/:id
POST   /api/events
PUT    /api/events/:id
DELETE /api/events/:id
GET    /api/events/stats
```

## Participant

```http
GET    /api/participants
GET    /api/participants/my
GET    /api/participants/:id
GET    /api/participants/event/:eventId
POST   /api/participants
```

---

# Persyaratan Sistem

- Node.js 18+
- npm
- MySQL
- Git

---

# Arsitektur Sistem

```text
              User
                │
                ▼
        React Frontend
                │
         REST API (Express)
                │
                ▼
          MySQL Database
```

---

# Pengembang

EventHub dikembangkan sebagai aplikasi manajemen event berbasis web untuk memudahkan proses pengelolaan event dan pendaftaran peserta secara online menggunakan React, Express.js, dan MySQL.