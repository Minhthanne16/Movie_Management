import { useEffect, useState } from "react";
import { ArrowLeft, Clock, MapPin, DollarSign } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import BookingSteps from "./components/BookingSteps.tsx";
import { showtimeService } from "../../services/showtime.service";
import { useBooking } from "../../contexts/BookingContext";
import type { Showtime } from "../../types/showtime";

const STEPS = [
  { id: 1, label: "Movies" },
  { id: 2, label: "Theater" },
  { id: 3, label: "Seats" },
  { id: 4, label: "Snacks" },
  { id: 5, label: "Payment" },
  { id: 6, label: "Confirmation" },
];

function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

export default function Theater() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setShowtime, setMovieTitle } = useBooking();
  const { movieId, movieTitle } = (location.state as { movieId?: number; movieTitle?: string }) ?? {};

  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId) {
      navigate("/movies");
      return;
    }
    showtimeService.getAll(movieId)
      .then(setShowtimes)
      .catch(err => setError(typeof err === "string" ? err : "Failed to load showtimes"))
      .finally(() => setLoading(false));
  }, [movieId, navigate]);

  const handleSelect = (showtimeId: number) => {
    setShowtime(showtimeId);
    setMovieTitle(movieTitle ?? "");
    navigate("/seats");
  };

  return (
    <div className="pb-20">
      <BookingSteps currentStep={2} steps={STEPS} />

      <div className="px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">
              Select Showtime
            </h1>
            <p className="text-gray-500 font-medium">
              {movieTitle ?? "Select a movie first"}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/movies")}
              className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Movies
            </button>
            {movieTitle && (
              <div className="hidden md:block">
                <p className="text-[10px] font-bold text-tickify-pink uppercase tracking-widest">
                  Selected Movie
                </p>
                <p className="text-sm font-bold">{movieTitle}</p>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-tickify-card border border-white/5 rounded-4xl p-8 h-48" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-400 font-bold py-12">{error}</div>
        ) : showtimes.length === 0 ? (
          <div className="text-center text-gray-400 font-bold py-12">No showtimes available for this movie.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {showtimes.map((showtime) => (
              <motion.div
                key={showtime.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-tickify-card border border-white/5 rounded-4xl p-8 flex flex-col hover:border-tickify-pink/30 transition-all duration-500 group"
              >
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={16} className="text-tickify-pink shrink-0" />
                  <h3 className="text-xl font-display font-bold group-hover:text-tickify-pink transition-colors">
                    {showtime.roomName}
                  </h3>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock size={14} className="text-tickify-cyan shrink-0" />
                    <span>{formatTime(showtime.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <DollarSign size={14} className="text-green-400 shrink-0" />
                    <span className="font-bold text-white">₫{showtime.basePrice.toLocaleString()}</span>
                    <span className="text-xs">base price</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSelect(showtime.id)}
                  className="w-full bg-tickify-pink hover:bg-tickify-pink/90 text-white py-4 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,0,128,0.3)] hover:shadow-[0_0_30px_rgba(255,0,128,0.5)]"
                >
                  Select This Showtime
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
