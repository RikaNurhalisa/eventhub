import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

/* ─── Constants ──────────────────────────────────────────── */
const emptyForm = { event_id: "", name: "", email: "", phone: "" };

const CATEGORY_COLORS = {
  "Teknologi":     "bg-blue-50 text-blue-700 border-blue-200",
  "Seni & Budaya": "bg-pink-50 text-pink-700 border-pink-200",
  "Olahraga":      "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Bisnis":        "bg-amber-50 text-amber-700 border-amber-200",
  "Pendidikan":    "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Hiburan":       "bg-purple-50 text-purple-700 border-purple-200",
  "Kesehatan":     "bg-teal-50 text-teal-700 border-teal-200",
  "Umum":          "bg-slate-50 text-slate-600 border-slate-200",
};

const STATUS_CONFIG = {
  pending:  { label: "Menunggu",  dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Disetujui", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Ditolak",  dot: "bg-rose-500",   badge: "bg-rose-50 text-rose-700 border-rose-200" },
};

/* ─── Tiny reusable components ───────────────────────────── */
function CalendarIcon({ cls = "w-4 h-4" }) {
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
function LocationIcon({ cls = "w-4 h-4" }) {
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function TicketIcon({ cls = "w-5 h-5" }) {
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  );
}

function fmtDate(raw) {
  if (!raw) return "-";
  return new Date(raw).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

/* ─── Main Component ─────────────────────────────────────── */
export default function Dashboard() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Events
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [expandedId, setExpandedId] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // Registration form
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [registered, setRegistered] = useState(false);

  // My Registrations (for logged-in users)
  const [myRegs, setMyRegs] = useState([]);
  const [loadingMyRegs, setLoadingMyRegs] = useState(false);
  const [activeTab, setActiveTab] = useState("events"); // "events" | "myregs"

  /* ── Data fetching ── */
  const getEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const data = await api.get("/events");
      const list = Array.isArray(data) ? data : [];
      setEvents(list);
      if (list[0] && !form.event_id) setForm(f => ({ ...f, event_id: String(list[0].id) }));
    } catch (e) { console.error("Gagal mengambil event:", e); }
    finally { setLoadingEvents(false); }
  }, []);

  const getMyRegs = useCallback(async () => {
    if (!isAuthenticated()) return;
    setLoadingMyRegs(true);
    try {
      const data = await api.get("/participants/my");
      setMyRegs(Array.isArray(data) ? data : []);
    } catch (e) { console.error("Gagal mengambil riwayat:", e); }
    finally { setLoadingMyRegs(false); }
  }, [isAuthenticated]);

  useEffect(() => { getEvents(); }, [getEvents]);
  useEffect(() => { if (isAuthenticated()) getMyRegs(); }, [isAuthenticated, getMyRegs]);

  /* ── Handlers ── */
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });
    try {
      await api.post("/participants", { ...form, event_id: Number(form.event_id) });
      setMessage({ type: "success", text: "Pendaftaran berhasil! Silakan tunggu konfirmasi admin." });
      setForm(f => ({ ...emptyForm, event_id: f.event_id }));
      setRegistered(true);
      getMyRegs();
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Gagal mendaftar. Coba lagi." });
    } finally { setSubmitting(false); }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const toggleFav = (event) => {
    setFavorites(prev =>
      prev.some(i => i.id === event.id) ? prev.filter(i => i.id !== event.id) : [...prev, event]
    );
  };
  const isFav = id => favorites.some(i => i.id === id);

  /* ── Derived state ── */
  const filteredEvents = events.filter(e => {
    const q = searchQuery.toLowerCase();
    const matchSearch = e.title?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q);
    const matchCat = selectedCategory === "Semua" || e.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const categories = ["Semua", ...new Set(events.map(e => e.category).filter(Boolean))];

  const today = new Date();
  const myPending  = myRegs.filter(r => r.status === "pending").length;
  const myApproved = myRegs.filter(r => r.status === "approved").length;

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans">
      {/* ══ NAVBAR ════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 focus:outline-none">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-500/20">
              <CalendarIcon cls="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">EventHub</span>
          </button>

          <div className="flex items-center gap-4">
            {isAuthenticated() ? (
              <>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-none">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 leading-none mt-0.5">{user?.email}</p>
                  </div>
                </div>
                <button id="user-logout" onClick={handleLogout}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-800 transition px-2 py-1.5 rounded-lg hover:bg-slate-100">
                  Keluar
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition">Masuk</Link>
                <Link to="/register" className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm shadow-blue-600/10">Daftar</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      {isAuthenticated() ? (
        /* ── Logged-in hero: personalised greeting + stats ─ */
        <section className="bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.12),transparent_55%)]" />
          <div className="absolute bottom-0 left-0 w-72 h-48 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-3">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                  {today.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Selamat datang, <span className="text-blue-400">{user?.name?.split(" ")[0]}</span>!
                </h1>
                <p className="text-slate-400 text-sm">Berikut adalah ringkasan aktivitas pendaftaran Anda di EventHub.</p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3 flex-shrink-0 min-w-[280px]">
                {[
                  { label: "Total Daftar", value: myRegs.length, color: "text-blue-400" },
                  { label: "Disetujui", value: myApproved, color: "text-emerald-400" },
                  { label: "Menunggu", value: myPending, color: "text-amber-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tab bar inside hero */}
            <div className="flex items-center gap-1 mt-8 border-b border-slate-800">
              {[
                { id: "events", label: "Jelajahi Event" },
                { id: "myregs", label: "Riwayat Pendaftaran" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 text-sm font-semibold transition-all relative border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? "text-white border-blue-500"
                      : "text-slate-500 border-transparent hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                  {tab.id === "myregs" && myPending > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-[9px] font-bold text-white">
                      {myPending}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : (
        /* ── Guest hero ───────────────────────────────────── */
        <section className="bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[450px] h-[300px] bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-[300px] h-[200px] bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="max-w-6xl mx-auto px-6 py-20 md:py-24 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Platform Event Terpercaya
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                Temukan Pengalaman Baru Lewat Event Pilihan.
              </h1>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                Jelajahi berbagai event terbaik, simpan favorit Anda, dan daftar dengan mudah dalam satu platform.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button id="hero-btn-events" type="button"
                  onClick={() => document.getElementById("main-content")?.scrollIntoView({ behavior: "smooth" })}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition shadow-sm">
                  Jelajahi Event
                </button>
                <Link to="/register"
                  className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg text-sm font-semibold border border-slate-700 transition">
                  Buat Akun Gratis
                </Link>
              </div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 md:w-60 flex-shrink-0 shadow-xl space-y-4 backdrop-blur-sm">
              <div>
                <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Event Aktif</span>
                <span className="text-4xl font-bold text-white mt-1 block">{events.length} Acara</span>
              </div>
              <div className="h-px bg-slate-700/50" />
              <div>
                <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block">Per Hari Ini</span>
                <span className="text-sm font-semibold text-slate-200 mt-1 block">
                  {today.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ MAIN CONTENT ══════════════════════════════════════ */}
      <div id="main-content" className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* ── MY REGISTRATIONS TAB ───────────────────────── */}
        {isAuthenticated() && activeTab === "myregs" && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Riwayat Pendaftaran Saya</h2>
                <p className="text-slate-500 text-xs mt-1">Semua event yang pernah Anda daftarkan.</p>
              </div>
              <button onClick={getMyRegs}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-2 bg-white transition hover:border-slate-300">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Perbarui
              </button>
            </div>

            {loadingMyRegs ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-7 h-7 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : myRegs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-16 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 border border-slate-200">
                  <TicketIcon />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Belum Ada Pendaftaran</h3>
                  <p className="text-slate-500 text-xs mt-1 max-w-xs mx-auto">Anda belum mendaftar ke event apapun. Jelajahi event yang tersedia dan daftarkan diri Anda sekarang!</p>
                </div>
                <button onClick={() => setActiveTab("events")}
                  className="text-xs text-blue-600 font-bold hover:underline">
                  Lihat Event Tersedia →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myRegs.map(reg => {
                  const sc = STATUS_CONFIG[reg.status] || STATUS_CONFIG.pending;
                  return (
                    <div key={reg.id} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 hover:shadow-sm transition">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                          <CalendarIcon cls="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {reg.category && (
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${CATEGORY_COLORS[reg.category] || CATEGORY_COLORS["Umum"]}`}>
                                {reg.category}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm">{reg.event_title}</h3>
                          <div className="flex items-center gap-4 text-slate-400 text-xs flex-wrap">
                            <span className="flex items-center gap-1">
                              <LocationIcon cls="w-3 h-3" />
                              {reg.event_location || "-"}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarIcon cls="w-3 h-3" />
                              {fmtDate(reg.event_date)}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span>Terdaftar: {fmtDate(reg.registered_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:flex-shrink-0">
                        <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${sc.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── EVENTS BROWSE TAB ──────────────────────────── */}
        {(!isAuthenticated() || activeTab === "events") && (
          <section className="space-y-8">
            {/* Search + filter row */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Event Pilihan</h2>
                  <p className="text-slate-500 text-sm mt-0.5">Cari dan pilih event yang ingin Anda ikuti.</p>
                </div>
                <div className="relative w-full md:w-72">
                  <input
                    type="text" placeholder="Cari judul atau lokasi..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
                  />
                  <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Category filter chips */}
              {categories.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition ${
                        selectedCategory === cat
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/20"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Two-column layout: events grid + form */}
            <div className="grid gap-8 lg:grid-cols-12 items-start">
              {/* Events grid */}
              <div className="lg:col-span-7 space-y-4">
                {loadingEvents ? (
                  <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
                    <div className="w-7 h-7 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-16 text-center">
                    <svg className="w-10 h-10 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-slate-500 text-sm font-medium">Tidak ada event yang ditemukan.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {filteredEvents.map(event => {
                      const catColor = CATEGORY_COLORS[event.category] || CATEGORY_COLORS["Umum"];
                      const isExpanded = expandedId === event.id;
                      return (
                        <div key={event.id}
                          className={`bg-white rounded-xl border flex flex-col transition-all duration-200 cursor-pointer ${
                            isExpanded ? "border-blue-600 ring-2 ring-blue-600/10 shadow-md" : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                          }`}
                          onClick={() => setExpandedId(isExpanded ? null : event.id)}
                        >
                          {/* Card top */}
                          <div className="p-5 flex-1 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${catColor}`}>
                                {event.category || "Umum"}
                              </span>
                              <button type="button"
                                onClick={e => { e.stopPropagation(); toggleFav(event); }}
                                className={`p-1.5 rounded-lg border transition flex-shrink-0 ${
                                  isFav(event.id) ? "bg-red-50 text-red-500 border-red-200" : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                                }`}>
                                <svg className="w-3.5 h-3.5" fill={isFav(event.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </button>
                            </div>

                            <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">{event.title}</h3>

                            {isExpanded && (
                              <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">{event.description}</p>
                            )}

                            <div className="space-y-1.5 text-slate-400 text-xs pt-1">
                              <p className="flex items-center gap-1.5">
                                <LocationIcon cls="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{event.location}</span>
                              </p>
                              <p className="flex items-center gap-1.5">
                                <CalendarIcon cls="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{fmtDate(event.event_date)}</span>
                              </p>
                            </div>
                          </div>

                          {/* Card footer */}
                          <div className={`px-5 py-3 border-t border-slate-100 flex items-center justify-between ${isExpanded ? "bg-blue-50/30" : "bg-slate-50/50"}`}>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {event.quota > 0 ? `Kuota ${event.quota} orang` : "Kuota tidak terbatas"}
                            </span>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setForm(f => ({ ...f, event_id: String(event.id) }));
                                document.getElementById("register-section")?.scrollIntoView({ behavior: "smooth" });
                              }}
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                            >
                              Daftar
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Registration Form */}
              <div id="register-section" className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-[73px]">
                {/* Form header strip */}
                <div className="bg-slate-900 text-white px-6 py-4">
                  <h2 className="font-bold text-base">Form Pendaftaran</h2>
                  <p className="text-slate-400 text-[11px] mt-0.5">Isi formulir berikut untuk mendaftar ke event pilihan.</p>
                </div>

                <div className="p-6">
                  {!isAuthenticated() ? (
                    <div className="text-center space-y-4 py-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">Masuk untuk Mendaftar</p>
                        <p className="text-xs text-slate-500 mt-1">Anda perlu login terlebih dahulu sebelum mendaftar event.</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link to="/login" state={{ from: { pathname: "/" } }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold text-xs transition text-center shadow-sm">
                          Masuk Sekarang
                        </Link>
                        <Link to="/register"
                          className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 py-2 rounded-lg font-semibold text-xs transition text-center">
                          Buat Akun Baru
                        </Link>
                      </div>
                    </div>
                  ) : registered ? (
                    <div className="text-center space-y-4 py-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Pendaftaran Terkirim!</p>
                        <p className="text-xs text-slate-500 mt-1">Formulir Anda berhasil dikirim dan sedang menunggu verifikasi admin.</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => { setRegistered(false); setMessage({ type: "", text: "" }); }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold text-xs transition">
                          Daftar Event Lain
                        </button>
                        <button onClick={() => setActiveTab("myregs")}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-semibold text-xs transition">
                          Lihat Riwayat Saya
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {[
                        { label: "Pilih Event", id: "form-event-select", type: "select" },
                        { label: "Nama Lengkap", id: "form-participant-name", name: "name", type: "text", placeholder: "Masukkan nama lengkap" },
                        { label: "Email", id: "form-participant-email", name: "email", type: "email", placeholder: "nama@email.com" },
                        { label: "No. Telepon", id: "form-participant-phone", name: "phone", type: "tel", placeholder: "08xxxxxxxxxx" },
                      ].map(field => (
                        <div key={field.id} className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{field.label}</label>
                          {field.type === "select" ? (
                            <select id={field.id} name="event_id" value={form.event_id} onChange={handleChange}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition" required>
                              <option value="">— Pilih salah satu —</option>
                              {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                            </select>
                          ) : (
                            <input id={field.id} type={field.type} name={field.name} placeholder={field.placeholder}
                              value={form[field.name]} onChange={handleChange}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition"
                              required />
                          )}
                        </div>
                      ))}

                      <button id="form-participant-submit" type="submit" disabled={submitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
                        {submitting
                          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Memproses...</>
                          : "Kirim Pendaftaran"}
                      </button>

                      {message.text && (
                        <div className={`rounded-lg px-4 py-3 text-xs border ${
                          message.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {message.text}
                        </div>
                      )}
                    </form>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ══ FOOTER ════════════════════════════════════════════ */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <CalendarIcon cls="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">EventHub</span>
          </div>
          <p className="text-slate-500 text-xs">© {new Date().getFullYear()} EventHub. Semua hak cipta dilindungi.</p>
          {!isAuthenticated() && (
            <Link to="/login" className="text-slate-400 hover:text-white transition text-xs font-semibold">Login Administrator</Link>
          )}
        </div>
      </footer>
    </div>
  );
}