const db = require("../config/db");

const Participant = {
  getAll: (callback) => {
    db.query(
      `SELECT p.*, e.title AS event_title
       FROM participants p
       LEFT JOIN events e ON p.event_id = e.id
       ORDER BY p.registered_at DESC`,
      callback
    );
  },

  getById: (id, callback) => {
    db.query(
      `SELECT p.*, e.title AS event_title
       FROM participants p
       LEFT JOIN events e ON p.event_id = e.id
       WHERE p.id = ?`,
      [id],
      callback
    );
  },

  // Ambil peserta berdasarkan event_id (untuk admin dashboard per-event)
  getByEventId: (eventId, callback) => {
    db.query(
      `SELECT p.*, e.title AS event_title
       FROM participants p
       LEFT JOIN events e ON p.event_id = e.id
       WHERE p.event_id = ?
       ORDER BY p.registered_at DESC`,
      [eventId],
      callback
    );
  },

  // Ambil semua pendaftaran berdasarkan email (untuk user melihat riwayatnya sendiri)
  getByEmail: (email, callback) => {
    db.query(
      `SELECT p.*, e.title AS event_title, e.location AS event_location,
              e.event_date, e.category
       FROM participants p
       LEFT JOIN events e ON p.event_id = e.id
       WHERE p.email = ?
       ORDER BY p.registered_at DESC`,
      [email],
      callback
    );
  },

  create: (data, callback) => {
    const sql = `
      INSERT INTO participants (event_id, name, email, phone, status)
      VALUES (?, ?, ?, ?, 'pending')
    `;
    db.query(
      sql,
      [data.event_id, data.name, data.email, data.phone],
      callback
    );
  },

  update: (id, data, callback) => {
    const sql = `
      UPDATE participants
      SET event_id=?, name=?, email=?, phone=?
      WHERE id=?
    `;
    db.query(
      sql,
      [data.event_id, data.name, data.email, data.phone, id],
      callback
    );
  },

  // Update status: pending / approved / rejected
  updateStatus: (id, status, callback) => {
    db.query(
      "UPDATE participants SET status=? WHERE id=?",
      [status, id],
      callback
    );
  },

  delete: (id, callback) => {
    db.query("DELETE FROM participants WHERE id=?", [id], callback);
  },
};

module.exports = Participant;