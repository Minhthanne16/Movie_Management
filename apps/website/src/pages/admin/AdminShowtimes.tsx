import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  X,
  AlertTriangle,
  Clock,
  Film,
  DollarSign,
  Building2,
  CalendarDays,
  Edit,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { showtimeService } from "../../services/showtime.service";
import { movieService } from "../../services/movie.service";
import { theaterRoomService } from "../../services/theaterRoom.service";
import type { Movie } from "../../types/movie";
import type { TheaterRoom } from "../../types/cinema";

// ─────────────── Display type for calendar UI ───────────────
interface ShowtimeDisplay {
  id: number;
  movie: string;
  room: string;
  day: number; // 0=Mon … 6=Sun
  startHour: number; // e.g. 14 for 14:00
  durationH: number; // height in hours
  color: string;
  // keep real IDs for API calls
  movieId: number;
  roomId: number;
  startTime: string;
  endTime: string;
  basePrice: number;
}

const BLOCK_COLORS = [
  "from-pink-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-orange-500 to-pink-600",
  "from-green-500 to-teal-600",
  "from-violet-500 to-indigo-600",
];

const HOURS = Array.from({ length: 17 }, (_, i) => i + 8); // 08..24
const DAYS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_H = 64; // px per hour

// Helper to get week dates
function getWeekDates(offset: number) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
  return DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

// ─────────────── Main Component ───────────────
export default function AdminShowtimes() {
  const [weekOffset, setWeekOffset]     = useState(0);
  const [showtimes, setShowtimes]       = useState<ShowtimeDisplay[]>([]);
  const [movies, setMovies]             = useState<Movie[]>([]);
  const [rooms, setRooms]               = useState<TheaterRoom[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [showModal, setShowModal]       = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<ShowtimeDisplay | null>(null);

  // Modal form state
  const [selMovieId, setSelMovieId] = useState<number | "">("");
  const [selRoomId, setSelRoomId]   = useState<number | "">("");
  const [selDate, setSelDate]       = useState("");
  const [selTime, setSelTime]       = useState("");
  const [price, setPrice]           = useState("");
  const [timeError, setTimeError]   = useState(false);
  const [movieDropOpen, setMovieDropOpen] = useState(false);

  const weekDates = getWeekDates(weekOffset);

  // Helper to convert a real Showtime to display format
  const toDisplay = (s: { id: number; movieTitle: string; roomName: string; startTime: string; endTime: string; basePrice: number; movieId: number; roomId: number }, idx: number): ShowtimeDisplay => {
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);
    const dayOfWeek = start.getDay(); // 0=Sun
    const day = (dayOfWeek + 6) % 7; // convert to Mon=0
    const startHour = start.getHours();
    const durationH = Math.max(1, Math.round((end.getTime() - start.getTime()) / 3600000));
    return {
      id: s.id,
      movie: s.movieTitle,
      room: s.roomName,
      day,
      startHour,
      durationH,
      color: BLOCK_COLORS[idx % BLOCK_COLORS.length],
      movieId: s.movieId,
      roomId: s.roomId,
      startTime: s.startTime,
      endTime: s.endTime,
      basePrice: s.basePrice,
    };
  };

  useEffect(() => {
    Promise.all([
      showtimeService.getAll(),
      movieService.getAll(),
      theaterRoomService.getAll(),
    ]).then(([s, m, r]) => {
      setShowtimes(s.map((st, i) => toDisplay(st, i)));
      setMovies(m);
      setRooms(r);
    }).catch(err => setError(typeof err === "string" ? err : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this showtime? This cannot be undone.")) return;
    try {
      await showtimeService.delete(id);
      setShowtimes(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to delete showtime");
    }
  };

  const handleEdit = (st: ShowtimeDisplay) => {
    setEditingShowtime(st);
    setSelMovieId(st.movieId);
    setSelRoomId(st.roomId);
    const d = new Date(st.startTime);
    const dateStr = d.toISOString().slice(0, 10);
    const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    setSelDate(dateStr);
    setSelTime(timeStr);
    setPrice(String(st.basePrice));
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selMovieId || !selRoomId || !selDate || !selTime) {
      setTimeError(true);
      return;
    }
    setTimeError(false);

    const startTime = `${selDate}T${selTime}:00`;
    const endDate = new Date(`${selDate}T${selTime}:00`);
    endDate.setHours(endDate.getHours() + 2);
    const endTime = endDate.toISOString().slice(0, 19);
    const req = {
      movieId: Number(selMovieId),
      roomId: Number(selRoomId),
      startTime,
      endTime,
      basePrice: price ? Number(price) : 0,
    };

    try {
      if (editingShowtime) {
        const updated = await showtimeService.update(editingShowtime.id, req);
        setShowtimes(prev => prev.map(s => s.id === editingShowtime.id ? toDisplay(updated, 0) : s));
      } else {
        const created = await showtimeService.create(req);
        setShowtimes(prev => [...prev, toDisplay(created, prev.length)]);
      }
      handleCloseModal();
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to save showtime");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingShowtime(null);
    setSelMovieId(""); setSelRoomId(""); setSelDate(""); setSelTime(""); setPrice("");
    setTimeError(false); setMovieDropOpen(false);
  };

  const selectedMovie = movies.find(m => m.id === selMovieId);

  return (
    <AdminLayout>
      <div className="space-y-8 pb-20 relative">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-1">Showtime Management</h1>
            <p className="text-slate-400 font-medium">Schedule and manage movie screenings</p>
          </div>

          {/* ADD button */}
          <button
            id="btn-add-showtime"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-sm shadow-[0_0_30px_rgba(236,72,153,0.45)] hover:shadow-[0_0_45px_rgba(236,72,153,0.65)] hover:scale-105 transition-all"
          >
            <Plus size={18} />
            ADD NEW SHOWTIME
          </button>
        </div>

        {/* ── Top Bar ── */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Week Navigator */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3">
            <button onClick={() => setWeekOffset(w => w - 1)} className="p-1 hover:text-pink-400 text-slate-400 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2 px-2">
              <CalendarDays size={16} className="text-pink-400" />
              <span className="text-sm font-bold text-white whitespace-nowrap">
                {weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {" – "}
                {weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <button onClick={() => setWeekOffset(w => w + 1)} className="p-1 hover:text-pink-400 text-slate-400 transition-colors">
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="ml-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              Today
            </button>
          </div>

        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        {/* ── AD-601: Weekly Calendar Grid ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          {/* Day headers */}
          <div className="grid grid-cols-8 border-b border-slate-800 bg-slate-950/60">
            <div className="border-r border-slate-800 py-4 px-3 text-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Time</span>
            </div>
            {weekDates.map((date, i) => {
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div key={i} className={`py-4 text-center border-r border-slate-800 last:border-0 ${isToday ? "bg-pink-500/5" : ""}`}>
                  <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isToday ? "text-pink-400" : "text-slate-500"}`}>{DAYS[i]}</p>
                  <p className={`text-xl font-display font-bold ${isToday ? "text-pink-400" : "text-white"}`}>{date.getDate()}</p>
                </div>
              );
            })}
          </div>

          {/* Time rows + events */}
          <div className="relative overflow-y-auto" style={{ maxHeight: "600px" }}>
            <div className="relative" style={{ height: `${HOURS.length * HOUR_H}px` }}>
              {/* Hour lines */}
              {HOURS.map((hour, hi) => (
                <div
                  key={hour}
                  className="absolute w-full grid grid-cols-8 border-t border-slate-800/60"
                  style={{ top: `${hi * HOUR_H}px`, height: `${HOUR_H}px` }}
                >
                  <div className="border-r border-slate-800 px-3 flex items-start pt-2">
                    <span className="text-[10px] font-bold text-slate-600">{`${String(hour).padStart(2, "0")}:00`}</span>
                  </div>
                  {DAYS.map((_, di) => (
                    <div key={di} className="border-r border-slate-800/30 last:border-0" />
                  ))}
                </div>
              ))}

              {/* Showtime blocks */}
              {showtimes.map(st => {
                const topPx = (st.startHour - 8) * HOUR_H;
                const heightPx = st.durationH * HOUR_H - 6;
                const colW = 100 / 8;
                const leftPct = colW + st.day * colW;
                return (
                  <div
                    key={st.id}
                    className={`absolute rounded-xl bg-gradient-to-br ${st.color} shadow-lg group cursor-pointer overflow-hidden`}
                    style={{
                      top: `${topPx + 4}px`,
                      height: `${heightPx}px`,
                      left: `calc(${leftPct}% + 4px)`,
                      width: `calc(${colW}% - 8px)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
                    <div className="relative p-2 flex flex-col h-full justify-between">
                      <div>
                        <p className="text-[10px] font-black text-white leading-tight truncate">{st.movie}</p>
                        <p className="text-[9px] text-white/70 font-medium truncate">{st.room}</p>
                      </div>
                      <p className="text-[9px] text-white/60 font-bold">
                        {String(st.startHour).padStart(2,"0")}:00 – {String(st.startHour + st.durationH).padStart(2,"0")}:00
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(st); }}
                      className="absolute top-1.5 left-1.5 w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blue-500/60 transition-all"
                    >
                      <Edit size={10} className="text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(st.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/60 transition-all"
                    >
                      <Trash2 size={10} className="text-white" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── AD-602/603: Add Showtime Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-3xl shadow-[0_0_80px_rgba(236,72,153,0.2)] overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.4)]">
                    <Clock size={16} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-white">
                      {editingShowtime ? "Edit Showtime" : "Create New Showtime"}
                    </h2>
                    <p className="text-xs text-slate-500">Fill in the screening details below</p>
                  </div>
                </div>
                <button onClick={handleCloseModal} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                  <X size={18} />
                </button>
              </div>

              {/* Modal body */}
              <div className="px-8 py-6 space-y-5">

                {/* Select Movie */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                    <Film size={11} className="inline mr-1" />Select Movie
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMovieDropOpen(v => !v)}
                      className="w-full flex items-center justify-between gap-3 bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-left hover:border-pink-500/50 transition-all"
                    >
                      {selectedMovie ? (
                        <span className="font-bold text-white">{selectedMovie.title}</span>
                      ) : (
                        <span className="text-slate-500">Choose a movie...</span>
                      )}
                      <ChevronLeft size={14} className={`text-slate-500 transition-transform ${movieDropOpen ? "-rotate-90" : "rotate-90"}`} />
                    </button>
                    <AnimatePresence>
                      {movieDropOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-10 p-2 max-h-48 overflow-y-auto"
                        >
                          {movies.map(m => (
                            <button
                              key={m.id}
                              onClick={() => { setSelMovieId(m.id); setMovieDropOpen(false); }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                            >
                              <img src={m.posterUrl} alt={m.title} className="w-8 h-12 object-cover rounded-md flex-shrink-0" />
                              <span className="text-sm font-bold text-white text-left">{m.title}</span>
                            </button>
                          ))}
                          {movies.length === 0 && (
                            <p className="text-xs text-slate-500 text-center py-3">No movies available</p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Select Room */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                    <Building2 size={11} className="inline mr-1" />Select Room
                  </label>
                  <select
                    value={selRoomId}
                    onChange={e => setSelRoomId(Number(e.target.value) || "")}
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white hover:border-pink-500/50 focus:outline-none focus:border-pink-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Choose a room...</option>
                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                      <CalendarDays size={11} className="inline mr-1" />Date
                    </label>
                    <input
                      type="date"
                      value={selDate}
                      onChange={e => setSelDate(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-pink-500 transition-all [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                      <Clock size={11} className="inline mr-1" />Start Time
                    </label>
                    <input
                      type="time"
                      value={selTime}
                      onChange={e => { setSelTime(e.target.value); setTimeError(false); }}
                      className={`w-full bg-slate-950/80 border rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none transition-all [color-scheme:dark] ${
                        timeError
                          ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                          : "border-slate-700 focus:border-pink-500"
                      }`}
                    />
                    {/* AD-603: Validation error */}
                    {timeError && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-2 mt-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30"
                      >
                        <AlertTriangle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-red-400 leading-snug">
                          Please fill in all required fields (movie, room, date, time)
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Ticket Price */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                    <DollarSign size={11} className="inline mr-1" />Ticket Price (₫)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="e.g. 250"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:border-pink-500 transition-all"
                  />
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 px-8 py-5 border-t border-slate-800">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_35px_rgba(236,72,153,0.6)] hover:scale-105 transition-all"
                >
                  <Clock size={15} />
                  Save Showtime
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
