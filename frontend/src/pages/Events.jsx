import { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = {
  title: "",
  description: "",
  location: "",
  event_date: "",
};

export default function Events({ onBack }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getEvents();
  }, []);

  const getEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/events");
      setEvents(Array.isArray(response) ? response : []);
      setMessage("");
    } catch (error) {
      console.error("Gagal mengambil data event:", error);
      setMessage(error.message || "Gagal mengambil data event.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing && editingId) {
        await api.put(`/events/${editingId}`, form);
        setMessage("Event berhasil diperbarui!");
      } else {
        await api.post("/events", form);
        setMessage("Event berhasil ditambahkan!");
      }

      resetForm();
      await getEvents();
    } catch (error) {
      console.error(error);
      setMessage(error.message || (isEditing ? "Gagal memperbarui event." : "Gagal menambahkan event."));
    }
  };

  const handleEdit = (event) => {
    setForm({
      title: event.title,
      description: event.description,
      location: event.location,
      event_date: event.event_date,
    });
    setIsEditing(true);
    setEditingId(event.id);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Apakah Anda yakin ingin menghapus event ini?");
    if (!confirmed) return;

    try {
      await api.delete(`/events/${id}`);
      setMessage("Event berhasil dihapus!");
      await getEvents();
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Gagal menghapus event.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <h1 className="text-4xl font-bold text-blue-600">📅 EventHub</h1>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
            >
              Kembali ke Dashboard
            </button>
          )}
        </div>

        {message && (
          <div className={`mb-6 rounded-lg p-3 text-sm ${message.includes("berhasil") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-xl p-6 mb-8"
        >
          <h2 className="text-2xl font-semibold mb-5">
            {isEditing ? "Perbarui Event" : "Tambah Event"}
          </h2>

          <input
            type="text"
            name="title"
            placeholder="Judul Event"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 mb-4"
            required
          />

          <textarea
            name="description"
            placeholder="Deskripsi Event"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 mb-4"
            rows="4"
            required
          />

          <input
            type="text"
            name="location"
            placeholder="Lokasi Event"
            value={form.location}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 mb-4"
            required
          />

          <input
            type="date"
            name="event_date"
            value={form.event_date}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 mb-4"
            required
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >
              {isEditing ? "Simpan Perubahan" : "Simpan Event"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg"
              >
                Batal
              </button>
            )}
          </div>
        </form>

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-3xl font-bold">Daftar Event</h2>
          <span className="text-sm text-gray-500">{events.length} event</span>
        </div>

        {loading ? (
          <div className="bg-white p-6 rounded-xl shadow">Memuat data...</div>
        ) : events.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow">Belum ada event.</div>
        ) : (
          <div className="grid gap-5">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold">{event.title}</h3>
                    <p className="mt-2 text-gray-600">{event.description}</p>
                    <p className="mt-4"><strong>📍 Lokasi:</strong> {event.location}</p>
                    <p><strong>📅 Tanggal:</strong> {event.event_date}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(event)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(event.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}