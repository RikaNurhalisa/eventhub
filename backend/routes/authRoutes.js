const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

// POST /api/auth/register — Daftar akun baru (role: user)
router.post("/register", authController.register);

// POST /api/auth/login — Login dan dapatkan JWT token
router.post("/login", authController.login);

// GET /api/auth/profile — Ambil profil user yang sedang login
router.get("/profile", authenticate, authController.getProfile);

module.exports = router;
