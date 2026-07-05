const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

/**
 * Middleware: Verifikasi JWT token dari header Authorization.
 * Menyisipkan req.user jika token valid.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Akses ditolak. Token tidak ditemukan." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid atau sudah kedaluwarsa." });
  }
};

/**
 * Middleware: Hanya izinkan role 'admin'.
 * Harus digunakan setelah `authenticate`.
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Akses ditolak. Hanya admin yang diizinkan." });
  }
  next();
};

/**
 * Middleware: Hanya izinkan role 'user'.
 * Harus digunakan setelah `authenticate`.
 */
const requireUser = (req, res, next) => {
  if (req.user?.role !== "user") {
    return res.status(403).json({ message: "Akses ditolak. Hanya user biasa yang diizinkan." });
  }
  next();
};

module.exports = { authenticate, requireAdmin, requireUser };
