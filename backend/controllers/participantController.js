const Participant = require("../models/participantModel");

// Menampilkan semua participant (admin only)
exports.getAllParticipants = (req, res) => {
  Participant.getAll((err, results) => {
    if (err) return res.status(500).json({ message: "Gagal mengambil data peserta.", error: err.message });
    res.json(results);
  });
};

// Menampilkan pendaftaran milik user yang sedang login (berdasarkan email dari JWT)
exports.getMyRegistrations = (req, res) => {
  const email = req.user?.email;
  if (!email) return res.status(400).json({ message: "Email tidak ditemukan di token." });

  Participant.getByEmail(email, (err, results) => {
    if (err) return res.status(500).json({ message: "Gagal mengambil data pendaftaran.", error: err.message });
    res.json(results);
  });
};

// Menampilkan participant berdasarkan ID
exports.getParticipantById = (req, res) => {
  Participant.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ message: "Gagal mengambil data peserta.", error: err.message });
    if (results.length === 0) return res.status(404).json({ message: "Peserta tidak ditemukan." });
    res.json(results[0]);
  });
};

// Menampilkan peserta berdasarkan event_id (admin only)
exports.getByEventId = (req, res) => {
  Participant.getByEventId(req.params.eventId, (err, results) => {
    if (err) return res.status(500).json({ message: "Gagal mengambil peserta event.", error: err.message });
    res.json(results);
  });
};

// Menambahkan participant (publik — user daftar event)
exports.createParticipant = (req, res) => {
  const { event_id, name, email, phone } = req.body || {};

  if (!event_id || !name || !email || !phone) {
    return res.status(400).json({ message: "Semua field wajib diisi." });
  }

  const parsedEventId = parseInt(event_id, 10);
  if (isNaN(parsedEventId)) {
    return res.status(400).json({ message: "ID event harus berupa angka." });
  }

  Participant.create({ ...req.body, event_id: parsedEventId }, (err, results) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "Email ini sudah terdaftar untuk event yang sama.",
        });
      }
      console.error("Participant create error:", err);
      return res.status(500).json({ message: "Gagal mendaftar.", error: err.message });
    }

    res.status(201).json({
      message: "Pendaftaran berhasil! Silakan tunggu konfirmasi dari admin.",
      id: results.insertId,
    });
  });
};

// Mengubah data participant (admin only)
exports.updateParticipant = (req, res) => {
  Participant.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ message: "Gagal memperbarui peserta.", error: err.message });
    res.json({ message: "Data peserta berhasil diperbarui" });
  });
};

// Update status: approve / reject (admin only)
exports.updateStatus = (req, res) => {
  const { status } = req.body || {};
  const allowed = ["pending", "approved", "rejected"];

  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ message: "Status harus: pending, approved, atau rejected." });
  }

  Participant.updateStatus(req.params.id, status, (err) => {
    if (err) return res.status(500).json({ message: "Gagal memperbarui status.", error: err.message });
    res.json({ message: `Status peserta berhasil diubah menjadi '${status}'.` });
  });
};

// Menghapus participant (admin only)
exports.deleteParticipant = (req, res) => {
  Participant.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ message: "Gagal menghapus peserta.", error: err.message });
    res.json({ message: "Peserta berhasil dihapus" });
  });
};