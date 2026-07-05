const Event = require("../models/eventModel");

exports.getAllEvents = (req, res) => {
  Event.getAll((err, results) => {
    if (err) return res.status(500).json({ message: "Gagal mengambil event.", error: err.message });
    res.json(results);
  });
};

exports.getEventById = (req, res) => {
  Event.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ message: "Gagal mengambil event.", error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Event tidak ditemukan." });
    res.json(results[0]);
  });
};

exports.createEvent = (req, res) => {
  const { title, description, location, event_date } = req.body || {};

  if (!title || !description || !location || !event_date) {
    return res.status(400).json({ message: "Field title, description, location, dan event_date wajib diisi." });
  }

  // Sisipkan created_by dari user yang sedang login (admin)
  const data = { ...req.body, created_by: req.user?.id || null };

  Event.create(data, (err, results) => {
    if (err) {
      console.error("Create event error:", err);
      return res.status(500).json({ message: "Gagal menambahkan event.", error: err.message });
    }
    res.status(201).json({ message: "Event berhasil ditambahkan", id: results.insertId });
  });
};

exports.updateEvent = (req, res) => {
  const { title, description, location, event_date } = req.body || {};

  if (!title || !description || !location || !event_date) {
    return res.status(400).json({ message: "Field title, description, location, dan event_date wajib diisi." });
  }

  Event.update(req.params.id, req.body, (err) => {
    if (err) {
      console.error("Update event error:", err);
      return res.status(500).json({ message: "Gagal memperbarui event.", error: err.message });
    }
    res.json({ message: "Event berhasil diperbarui" });
  });
};

exports.deleteEvent = (req, res) => {
  Event.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ message: "Gagal menghapus event.", error: err.message });
    res.json({ message: "Event berhasil dihapus" });
  });
};

// GET /api/events/stats — Statistik ringkas untuk Admin Dashboard
exports.getStats = (req, res) => {
  Event.getStats((err, results) => {
    if (err) return res.status(500).json({ message: "Gagal mengambil statistik.", error: err.message });
    res.json(results[0]);
  });
};