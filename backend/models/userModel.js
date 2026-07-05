const db = require("../config/db");

const User = {
  /**
   * Cari user berdasarkan email (untuk login)
   */
  findByEmail: (email, callback) => {
    db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email], callback);
  },

  /**
   * Cari user berdasarkan ID (untuk profile / middleware)
   */
  findById: (id, callback) => {
    db.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1",
      [id],
      callback
    );
  },

  /**
   * Buat user baru (register)
   */
  create: (data, callback) => {
    const sql = `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `;
    db.query(sql, [data.name, data.email, data.password, data.role || "user"], callback);
  },

  /**
   * Ambil semua user (untuk admin)
   */
  getAll: (callback) => {
    db.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC",
      callback
    );
  },
};

module.exports = User;
