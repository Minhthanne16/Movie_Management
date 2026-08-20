import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock3, User2, Film, MonitorPlay, Timer } from "lucide-react";

import StaffLayout from "../../layouts/StaffLayout";
import ShowtimeSelector from "./components/ShowtimeSelector";
import POSSeatMap from "./components/POSSeatMap";
import CheckoutPanel from "./components/CheckoutPanel";
import PricingPopup from "./components/PircingPopup";
import PaymentSuccessModal from "./components/PaymentSuccessModal";

import { movieService } from "../../services/movie.service";
import { showtimeService } from "../../services/showtime.service";
import { bookingService } from "../../services/booking.service";
import { seatService } from "../../services/seat.service";

import type { Movie } from "../../types/movie";
import type { Showtime } from "../../types/showtime";
import type { Seat, SeatType, SeatTypeConfig } from "../admin/types/adminRoom";
import type { SeatAvailability } from "../../types/cinema";

import {
  ChevronRight,
  Ticket,
  Armchair,
  Wallet,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

// Mock Data for Seats (kept because POSSeatMap/CheckoutPanel use admin-style seat layout)
const DEFAULT_TYPE_CONFIGS: SeatTypeConfig[] = [
  { type: "Regular", color: "#00D2FF", price: 120000 },
  { type: "VIP", color: "#FFB700", price: 180000 },
  { type: "Couple", color: "#7B2CBF", price: 250000 },
  { type: "Blocked", color: "#1f2937", price: 0 },
  { type: "Aisle", color: "#000000", price: 0 },
];

const generateMockSeats = (rowCount: number, colCount: number): Seat[] => {
  const seats: Seat[] = [];
  const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      let type: SeatType = "Regular";
      if (r >= 6) type = "VIP";
      if (r === rowCount - 1) type = "Couple";
      if (c === 3 || c === 8) type = "Aisle";

      seats.push({
        id: `${rowLabels[r]}${c + 1}`,
        row: r,
        col: c,
        type,
        label: `${rowLabels[r]}${c + 1}`,
      });
    }
  }
  return seats;
};

export default function StaffPOS() {
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);

  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [bookingCode, setBookingCode] = useState("");

  // Real data state
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [apiSeats, setApiSeats] = useState<SeatAvailability[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    movieService.getAll().then(setMovies).catch(() => {});
  }, []);

  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  // Fetch showtimes when a movie tab is selected in ShowtimeSelector
  useEffect(() => {
    if (!selectedMovieId) { setShowtimes([]); return; }
    showtimeService.getAll(selectedMovieId).then(setShowtimes).catch(() => {});
  }, [selectedMovieId]);

  // Gap 2: Fetch real seats when selectedShowtime changes
  useEffect(() => {
    if (!selectedShowtime) { setApiSeats([]); return; }
    let cancelled = false;
    seatService.getAvailable(selectedShowtime.id)
      .then(data => { if (!cancelled) setApiSeats(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [selectedShowtime]);

  // Clock updater
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle showtime selection
  const handleSelectShowtime = (showtime: Showtime) => {
    const movie = movies.find((m) => m.id === showtime.movieId) || null;
    setSelectedMovie(movie);
    setSelectedShowtime(showtime);
    setSelectedSeatIds([]);
  };

  const handleMovieSelect = (movieId: number) => {
    setSelectedMovieId(movieId);
  };

  // Toggle seat selection
  const handleToggleSeat = (seatId: string) => {
    setSelectedSeatIds((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      }
      return [...prev, seatId];
    });
  };

  // Gap 3: Map SeatAvailability to admin Seat type for POSSeatMap
  const roomSeats = useMemo<Seat[]>(() => {
    if (apiSeats.length === 0) return generateMockSeats(10, 12); // fallback if no showtime selected
    return apiSeats.map(s => ({
      id: String(s.id), // string ID for POSSeatMap
      row: s.rowLabel.charCodeAt(0) - 65, // A=0, B=1, ...
      col: s.seatNumber - 1,
      type: s.isBooked
        ? "Blocked" as const
        : s.tierName.toLowerCase().includes("vip")
          ? "VIP" as const
          : s.tierName.toLowerCase().includes("couple")
            ? "Couple" as const
            : "Regular" as const,
      label: `${s.rowLabel}${s.seatNumber}`,
    }));
  }, [apiSeats]);

  // Also compute rowCount/colCount from the fetched seats
  const roomRowCount = useMemo(() => {
    if (apiSeats.length === 0) return 10;
    return Math.max(...apiSeats.map(s => s.rowLabel.charCodeAt(0) - 65)) + 1;
  }, [apiSeats]);

  const roomColCount = useMemo(() => {
    if (apiSeats.length === 0) return 12;
    return Math.max(...apiSeats.map(s => s.seatNumber));
  }, [apiSeats]);

  // Selected seats object list
  const selectedSeats = useMemo(() => {
    return roomSeats.filter((seat) => selectedSeatIds.includes(seat.id));
  }, [selectedSeatIds, roomSeats]);

  // Total price
  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((total, seat) => {
      const config = DEFAULT_TYPE_CONFIGS.find((c) => c.type === seat.type);
      return total + (config?.price || 0);
    }, 0);
  }, [selectedSeats]);

  // Booked seats from real API data
  const bookedSeatIds = useMemo(() => {
    return roomSeats.filter(s => s.type === "Blocked").map(s => s.id);
  }, [roomSeats]);

  // Gap 4: Send real numeric seat IDs to bookingService
  const handleConfirmBooking = async () => {
    if (!selectedShowtime || selectedSeatIds.length === 0) return;
    setSubmitting(true);
    setBookingError(null);
    try {
      // Map string seat IDs ("123") back to numeric IDs for the API
      const numericSeatIds = selectedSeatIds
        .map(strId => apiSeats.find(s => String(s.id) === strId)?.id)
        .filter((id): id is number => id !== undefined);
      await bookingService.create({
        showtimeId: selectedShowtime.id,
        seatIds: numericSeatIds,
      });
    } catch (err) {
      setBookingError(typeof err === "string" ? err : "Booking failed");
      setSubmitting(false);
      return; // don't show success if booking failed
    }
    setSubmitting(false);
    const generatedCode = `TKF-${Math.floor(10000 + Math.random() * 90000)}`;
    setBookingCode(generatedCode);
    setIsPaymentSuccess(true);
  };

  const resetPOS = () => {
    setSelectedSeatIds([]);
    setSelectedShowtime(null);
    setSelectedMovie(null);
    setIsPaymentSuccess(false);
    setBookingCode("");
    setBookingError(null);
  };

  return (
    <StaffLayout>
      <div className="min-h-screen bg-slate-950 text-white px-6 py-6 space-y-6">
        {/* POS Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.06] bg-slate-900/70 backdrop-blur-xl px-8 py-6 shadow-2xl"
        >
          {/* Glow */}
          <div className="absolute -top-24 right-0 w-72 h-72 bg-tickify-cyan/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            {/* Left */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-tickify-cyan/10 border border-tickify-cyan/20 flex items-center justify-center text-tickify-cyan shadow-[0_0_20px_rgba(0,255,242,0.15)]">
                  <Film size={22} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500 font-black">
                    Ticket POS System
                  </p>

                  <h1 className="text-3xl font-display font-bold text-white">
                    Cinema Counter
                  </h1>
                </div>
              </div>

              {selectedMovie && selectedShowtime ? (
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                    <Film size={14} className="text-tickify-cyan" />
                    <span className="font-bold text-white">
                      {selectedMovie.title}
                    </span>
                  </div>

                  <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                    <Timer size={14} className="text-tickify-cyan" />
                    <span className="font-bold text-white">
                      {new Date(selectedShowtime.startTime).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        },
                      )}
                    </span>
                  </div>

                  <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                    <MonitorPlay size={14} className="text-tickify-cyan" />
                    <span className="font-bold text-white">
                      {selectedShowtime.roomName ?? `Room ${selectedShowtime.roomId}`}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Select a movie showtime to begin ticket booking.
                </p>
              )}

              {bookingError && (
                <p className="text-red-400 text-xs mt-2">{bookingError}</p>
              )}
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
              <div className="px-5 py-4 rounded-2xl bg-white/5 border border-white/10 min-w-[160px]">
                <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">
                  <User2 size={12} />
                  Cashier
                </div>

                <p className="text-white font-bold text-sm">
                  Staff Counter #01
                </p>
              </div>

              <div className="px-5 py-4 rounded-2xl bg-white/5 border border-white/10 min-w-[160px]">
                <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">
                  <Clock3 size={12} />
                  Current Time
                </div>

                <p className="text-white font-display font-bold text-lg tracking-wide">
                  {currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Showtime Selection */}
        {!selectedShowtime && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ShowtimeSelector
              movies={movies}
              showtimes={showtimes}
              onSelectShowtime={handleSelectShowtime}
              onMovieSelect={handleMovieSelect}
            />
          </motion.div>
        )}

        {/* Main POS Layout */}
        <AnimatePresence>
          {selectedShowtime && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6"
            >
              {/* Seat Map */}
              <div className="rounded-[2.5rem] border border-white/[0.06] bg-slate-900/60 backdrop-blur-xl p-8 overflow-hidden">
                <POSSeatMap
                  rowCount={roomRowCount}
                  colCount={roomColCount}
                  seats={roomSeats}
                  selectedSeatIds={selectedSeatIds}
                  bookedSeatIds={bookedSeatIds}
                  typeConfigs={DEFAULT_TYPE_CONFIGS}
                  onToggleSeat={handleToggleSeat}
                />
              </div>

              {/* Checkout Panel */}
              <div className="sticky top-6 h-fit">
                <CheckoutPanel
                  selectedMovie={selectedMovie}
                  selectedShowtime={selectedShowtime}
                  selectedSeats={selectedSeats}
                  typeConfigs={DEFAULT_TYPE_CONFIGS}
                  totalPrice={totalPrice}
                  onBack={() => setSelectedSeatIds([])}
                  onComplete={() => {
                    setIsPricingOpen(true);
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pricing Popup */}
        <PricingPopup
          isOpen={isPricingOpen}
          onClose={() => setIsPricingOpen(false)}
          onConfirm={() => {
            setIsPricingOpen(false);
            handleConfirmBooking();
          }}
          selectedSeats={selectedSeats}
          typeConfigs={DEFAULT_TYPE_CONFIGS}
          movieTitle={selectedMovie?.title || ""}
        />

        <PaymentSuccessModal
          isOpen={isPaymentSuccess}
          bookingCode={bookingCode}
          totalPrice={totalPrice}
          seatLabels={selectedSeats.map((seat) => seat.label)}
          onClose={resetPOS}
        />
      </div>
    </StaffLayout>
  );
}
