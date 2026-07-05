const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

/**
 * POST /api/auth/register
 * Mendaftarkan user baru dengan role 'user'
 */
exports.register = async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Nama, email, dan password wajib diisi." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password minimal 6 karakter." });
  }

  try {
    // Cek apakah email sudah terdaftar
    User.findByEmail(email, async (err, results) => {
      if (err) return res.status(500).json({ message: "Gagal memeriksa email.", error: err.message });

      if (results.length > 0) {
        return res.status(409).json({ message: "Email sudah terdaftar. Silakan gunakan email lain." });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      User.create({ name, email, password: hashedPassword, role: "user" }, (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Gagal mendaftarkan akun.", error: err.message });
        }

        res.status(201).json({
          message: "Registrasi berhasil! Silakan login.",
          userId: result.insertId,
        });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
  }
};

/**
 * POST /api/auth/login
 * Login dengan email & password, return JWT token
 */
exports.login = (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi." });
  }

  User.findByEmail(email, async (err, results) => {
    if (err) return res.status(500).json({ message: "Gagal mencari akun.", error: err.message });

    if (results.length === 0) {
      return res.status(401).json({ message: "Email atau password salah." });
    }

    const user = results[0];

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email atau password salah." });
    }

    // Buat JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      message: "Login berhasil!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  });
};

/**
 * GET /api/auth/profile
 * Ambil profil user yang sedang login (memerlukan token)
 */
exports.getProfile = (req, res) => {
  User.findById(req.user.id, (err, results) => {
    if (err) return res.status(500).json({ message: "Gagal mengambil profil.", error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    res.json({ user: results[0] });
  });
};
