const db = require("../config/db");

const Event = {
  getAll: (callback) => {
    db.query(
      `SELECT e.*, u.name AS creator_name
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       ORDER BY e.event_date DESC`,
      callback
    );
  },

  getById: (id, callback) => {
    db.query(
      `SELECT e.*, u.name AS creator_name
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = ?`,
      [id],
      callback
    );
  },

  create: (data, callback) => {
    const sql = `
      INSERT INTO events (title, description, location, event_date, quota, category, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [
        data.title,
        data.description,
        data.location,
        data.event_date,
        data.quota || 0,
        data.category || "Umum",
        data.created_by || null,
      ],
      callback
    );
  },

  update: (id, data, callback) => {
    const sql = `
      UPDATE events
      SET title=?, description=?, location=?, event_date=?, quota=?, category=?
      WHERE id=?
    `;
    db.query(
      sql,
      [
        data.title,
        data.description,
        data.location,
        data.event_date,
        data.quota || 0,
        data.category || "Umum",
        id,
      ],
      callback
    );
  },

  delete: (id, callback) => {
    db.query("DELETE FROM events WHERE id=?", [id], callback);
  },

  // Statistik ringkas untuk Admin Dashboard
  getStats: (callback) => {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM events) AS total_events,
        (SELECT COUNT(*) FROM participants) AS total_participants,
        (SELECT COUNT(*) FROM participants WHERE status = 'pending') AS pending_participants,
        (SELECT COUNT(*) FROM events WHERE event_date = CURDATE()) AS events_today
    `;
    db.query(sql, callback);
  },
};

module.exports = Event;