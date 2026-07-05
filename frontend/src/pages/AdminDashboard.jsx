import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const TABS = ["overview", "events", "participants"];
const CATEGORY_OPTIONS = ["Umum", "Teknologi", "Seni & Budaya", "Olahraga", "Bisnis", "Pendidikan", "Hiburan", "Kesehatan"];

const emptyEventForm = { title: "", description: "", location: "", event_date: "", quota: "", category: "Umum" };

const STATUS_CONFIG = {
  pending:  { label: "Menunggu",  cls: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Disetujui", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Ditolak",   cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState(null);

  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [filterEventId, setFilterEventId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState({ events: false, participants: false });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    await Promise.all([fetchEvents(), fetchParticipants(), fetchStats()]);
  };

  const fetchEvents = async () => {
    setLoading((l) => ({ ...l, events: true }));
    try {
      const data = await api.get("/events");
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setLoading((l) => ({ ...l, events: false }));
    }
  };

  const fetchParticipants = async () => {
    setLoading((l) => ({ ...l, participants: true }));
    try {
      const data = await api.get("/participants");
      setParticipants(Array.isArray(data) ? data : []);
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setLoading((l) => ({ ...l, participants: false }));
    }
  };

  const fetchStats = async () => {
    try {
      const data = await api.get("/events/stats");
      setStats(data);
    } catch { /* stats non-blocking */ }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  // ── Event CRUD ─────────────────────────────────────────
  const handleEventChange = (e) => setEventForm({ ...eventForm, [e.target.name]: e.target.value });

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/events/${editingId}`, eventForm);
        showMessage("success", "Event berhasil diperbarui!");
      } else {
        await api.post("/events", eventForm);
        showMessage("success", "Event berhasil ditambahkan!");
      }
      resetEventForm();
      await fetchAll();
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleEditEvent = (event) => {
    setEventForm({
      title: event.title,
      description: event.description || "",
      location: event.location || "",
      event_date: event.event_date ? event.event_date.split("T")[0] : "",
      quota: event.quota || "",
      category: event.category || "Umum",
    });
    setIsEditing(true);
    setEditingId(event.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Hapus event ini? Semua data peserta juga akan terhapus.")) return;
    try {
      await api.delete(`/events/${id}`);
      showMessage("success", "Event berhasil dihapus.");
      await fetchAll();
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const resetEventForm = () => { setEventForm(emptyEventForm); setIsEditing(false); setEditingId(null); };

  // ── Participant actions ────────────────────────────────
  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/participants/${id}/status`, { status });
      showMessage("success", `Status peserta diubah menjadi "${STATUS_CONFIG[status].label}".`);
      await fetchParticipants();
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleDeleteParticipant = async (id) => {
    if (!window.confirm("Hapus data peserta ini?")) return;
    try {
      await api.delete(`/participants/${id}`);
      showMessage("success", "Peserta berhasil dihapus.");
      await fetchParticipants();
    } catch (err) {
      showMessage("error", err.message);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  // ── Filtered participants ──────────────────────────────
  const filteredParticipants = participants.filter((p) => {
    const matchEvent = filterEventId ? String(p.event_id) === String(filterEventId) : true;
    const matchSearch = searchQuery
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchEvent && matchSearch;
  });

  // ── Stat cards data ────────────────────────────────────
  const statCards = [
    {
      label: "Total Event",
      value: stats?.total_events ?? events.length,
      color: "border-blue-200 bg-blue-50/20 text-blue-700",
      svg: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      label: "Total Peserta",
      value: stats?.total_participants ?? participants.length,
      color: "border-indigo-200 bg-indigo-50/20 text-indigo-700",
      svg: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      label: "Menunggu Konfirmasi",
      value: stats?.pending_participants ?? participants.filter(p => p.status === "pending").length,
      color: "border-amber-200 bg-amber-50/20 text-amber-700",
      svg: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      label: "Event Hari Ini",
      value: stats?.events_today ?? 0,
      color: "border-emerald-200 bg-emerald-50/20 text-emerald-700",
      svg: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 flex">
      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="p-6 border-b border-slate-850 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-tight">EventHub</p>
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Dashboard Admin</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {[
            {
              id: "overview",
              label: "Ringkasan",
              svg: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )
            },
            {
              id: "events",
              label: "Kelola Event",
              svg: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )
            },
            {
              id: "participants",
              label: "Kelola Peserta",
              svg: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )
            },
          ].map((item) => (
            <button
              key={item.id}
              id={`admin-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.svg}
              {item.label}
            </button>
          ))}
        </nav>

        {/* User profile & Logout */}
        <div className="p-4 border-t border-slate-850 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-semibold truncate leading-none mb-1">{user?.name}</p>
              <p className="text-slate-500 text-[10px] truncate leading-none">{user?.email}</p>
            </div>
          </div>
          <button
            id="admin-logout"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-red-950/20 hover:text-red-400 text-xs font-semibold transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Keluar Sesi
          </button>
        </div>
      </aside>

      {/* ── Main Panel ───────────────────────────────────── */}
      <main className="ml-64 flex-1 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-8 py-4.5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {activeTab === "overview" && "Ringkasan Dashboard"}
              {activeTab === "events" && "Pengelolaan Event"}
              {activeTab === "participants" && "Verifikasi Pendaftar"}
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">Sesi aktif sebagai administrator.</p>
          </div>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Perbarui Data
          </button>
        </header>

        {/* Content Area */}
        <div className="p-8 flex-1">
          {message.text && (
            <div className={`mb-6 flex items-start gap-2.5 px-4 py-3 rounded-lg text-xs font-semibold border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                {message.type === "success"
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                }
              </svg>
              <span>{message.text}</span>
            </div>
          )}

          {/* ──────────────── TAB: RINGKASAN ──────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stat Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{card.label}</p>
                      <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                    </div>
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${card.color}`}>
                      {card.svg}
                    </div>
                  </div>
                ))}
              </div>

              {/* Lists Grid */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Events */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-sm">Event Terakhir</h3>
                    <button onClick={() => setActiveTab("events")} className="text-blue-600 hover:text-blue-700 text-xs font-semibold">Semua →</button>
                  </div>
                  <div className="divide-y divide-slate-100 flex-1">
                    {events.slice(0, 4).map((event) => (
                      <div key={event.id} className="px-5 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs flex-shrink-0">
                          {event.title.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-xs truncate">{event.title}</p>
                          <p className="text-slate-400 text-[10px] truncate">📍 {event.location} · 📅 {event.event_date?.split("T")[0]}</p>
                        </div>
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full flex-shrink-0">
                          {event.category}
                        </span>
                      </div>
                    ))}
                    {events.length === 0 && (
                      <div className="px-5 py-8 text-center text-slate-400 text-xs">Belum ada data event.</div>
                    )}
                  </div>
                </div>

                {/* Recent Registrations */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 text-sm">Registrasi Terbaru</h3>
                    <button onClick={() => setActiveTab("participants")} className="text-blue-600 hover:text-blue-700 text-xs font-semibold">Semua →</button>
                  </div>
                  <div className="divide-y divide-slate-100 flex-1">
                    {participants.slice(0, 4).map((p) => {
                      const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                      return (
                        <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs flex-shrink-0">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-xs truncate">{p.name}</p>
                            <p className="text-slate-400 text-[10px] truncate">{p.event_title}</p>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${sc.cls}`}>
                            {sc.label}
                          </span>
                        </div>
                      );
                    })}
                    {participants.length === 0 && (
                      <div className="px-5 py-8 text-center text-slate-400 text-xs">Belum ada pendaftar baru.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────── TAB: KELOLA EVENT ─────────────── */}
          {activeTab === "events" && (
            <div className="space-y-6">
              {/* Form */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {isEditing ? "Edit Detail Event" : "Buat Event Baru"}
                </h3>
                <form onSubmit={handleEventSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Judul Event *</label>
                    <input
                      id="admin-event-title"
                      name="title" type="text" placeholder="Masukkan judul event" value={eventForm.title}
                      onChange={handleEventChange} required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Deskripsi *</label>
                    <textarea
                      id="admin-event-desc"
                      name="description" placeholder="Masukkan deskripsi lengkap event" value={eventForm.description}
                      onChange={handleEventChange} rows={3} required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 transition resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Lokasi / Tempat *</label>
                    <input
                      id="admin-event-location"
                      name="location" type="text" placeholder="Contoh: Gedung Rapat Utama / Online" value={eventForm.location}
                      onChange={handleEventChange} required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Tanggal Pelaksanaan *</label>
                    <input
                      id="admin-event-date"
                      name="event_date" type="date" value={eventForm.event_date}
                      onChange={handleEventChange} required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Kuota Maksimum</label>
                    <input
                      id="admin-event-quota"
                      name="quota" type="number" min="0" placeholder="0 = Tidak Terbatas" value={eventForm.quota}
                      onChange={handleEventChange}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Kategori</label>
                    <select
                      id="admin-event-category"
                      name="category" value={eventForm.category} onChange={handleEventChange}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 transition"
                    >
                      {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2 flex gap-3 pt-2">
                    <button id="admin-event-submit" type="submit"
                      className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2 rounded-lg text-xs font-semibold transition shadow-sm">
                      {isEditing ? "Simpan Perubahan" : "Buat Event"}
                    </button>
                    {isEditing && (
                      <button type="button" onClick={resetEventForm}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-lg text-xs font-semibold transition">
                        Batal
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 text-sm">Daftar Keseluruhan Event</h3>
                  <span className="text-xs text-slate-500 font-semibold">{events.length} Terdaftar</span>
                </div>
                {loading.events ? (
                  <div className="p-8 text-center text-slate-400 text-xs">Memuat data...</div>
                ) : events.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">Belum ada data event. Gunakan form di atas untuk menambah.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3.5 text-left font-semibold">Judul Event</th>
                          <th className="px-4 py-3.5 text-left font-semibold">Tanggal</th>
                          <th className="px-4 py-3.5 text-left font-semibold">Tempat</th>
                          <th className="px-4 py-3.5 text-left font-semibold">Kategori</th>
                          <th className="px-4 py-3.5 text-left font-semibold">Kuota</th>
                          <th className="px-6 py-3.5 text-right font-semibold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {events.map((event) => (
                          <tr key={event.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-6 py-3.5 font-bold text-slate-900 max-w-[200px] truncate">{event.title}</td>
                            <td className="px-4 py-3.5 text-slate-600">{event.event_date?.split("T")[0] || "-"}</td>
                            <td className="px-4 py-3.5 text-slate-600 max-w-[160px] truncate">{event.location}</td>
                            <td className="px-4 py-3.5">
                              <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">{event.category}</span>
                            </td>
                            <td className="px-4 py-3.5 text-slate-600">{event.quota || "Tidak Terbatas"}</td>
                            <td className="px-6 py-3.5 text-right">
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => handleEditEvent(event)}
                                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition">
                                  Edit
                                </button>
                                <button onClick={() => handleDeleteEvent(event.id)}
                                  className="bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-200 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition">
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ──────────────── TAB: KELOLA PESERTA ───────────── */}
          {activeTab === "participants" && (
            <div className="space-y-6">
              {/* Filter Area */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Penyaringan Event</label>
                  <select
                    id="admin-filter-event"
                    value={filterEventId} onChange={(e) => setFilterEventId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500 transition"
                  >
                    <option value="">Semua Event</option>
                    {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Pencarian Nama/Email</label>
                  <input
                    id="admin-search-participant"
                    type="text" placeholder="Masukkan kata kunci..."
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div className="bg-slate-100 rounded-lg p-2 border border-slate-200 text-center font-bold text-xs text-slate-700">
                  Total Terfilter: {filteredParticipants.length} Orang
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading.participants ? (
                  <div className="p-8 text-center text-slate-400 text-xs">Memuat data pendaftar...</div>
                ) : filteredParticipants.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">Tidak ditemukan data pendaftar yang cocok.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3.5 text-left font-semibold">Nama Lengkap</th>
                          <th className="px-4 py-3.5 text-left font-semibold">Email</th>
                          <th className="px-4 py-3.5 text-left font-semibold">Telepon</th>
                          <th className="px-4 py-3.5 text-left font-semibold">Event</th>
                          <th className="px-4 py-3.5 text-left font-semibold">Tgl Daftar</th>
                          <th className="px-4 py-3.5 text-left font-semibold">Status</th>
                          <th className="px-6 py-3.5 text-right font-semibold">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150">
                        {filteredParticipants.map((p) => {
                          const sc = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition">
                              <td className="px-6 py-3.5 font-bold text-slate-900">{p.name}</td>
                              <td className="px-4 py-3.5 text-slate-600 max-w-[160px] truncate">{p.email}</td>
                              <td className="px-4 py-3.5 text-slate-600">{p.phone || "-"}</td>
                              <td className="px-4 py-3.5 text-slate-600 max-w-[150px] truncate">{p.event_title}</td>
                              <td className="px-4 py-3.5 text-slate-500">
                                {p.registered_at ? new Date(p.registered_at).toLocaleDateString("id-ID") : "-"}
                              </td>
                              <td className="px-4 py-3.5">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${sc.cls}`}>
                                  {sc.label}
                                </span>
                              </td>
                              <td className="px-6 py-3.5 text-right">
                                <div className="flex gap-1.5 justify-end flex-wrap">
                                  {p.status !== "approved" && (
                                    <button onClick={() => handleUpdateStatus(p.id, "approved")}
                                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-250 px-2 py-1 rounded text-[10px] font-bold transition">
                                      Setujui
                                    </button>
                                  )}
                                  {p.status !== "rejected" && (
                                    <button onClick={() => handleUpdateStatus(p.id, "rejected")}
                                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-250 px-2 py-1 rounded text-[10px] font-bold transition">
                                      Tolak
                                    </button>
                                  )}
                                  {p.status !== "pending" && (
                                    <button onClick={() => handleUpdateStatus(p.id, "pending")}
                                      className="bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded text-[10px] font-bold transition">
                                      Reset
                                    </button>
                                  )}
                                  <button onClick={() => handleDeleteParticipant(p.id)}
                                    className="bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-700 border border-slate-200 hover:border-rose-200 px-2 py-1 rounded text-[10px] font-bold transition">
                                    Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
