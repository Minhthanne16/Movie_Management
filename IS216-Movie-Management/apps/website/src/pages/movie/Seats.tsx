import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Monitor, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import BookingSteps from "./components/BookingSteps.tsx";
import BookingSummary from "./components/BookingSummary.tsx";
import { seatService } from "../../services/seat.service";
import { bookingService } from "../../services/booking.service";
import { useBooking } from "../../contexts/BookingContext";
import type { SeatAvailability } from "../../types/cinema";

const STEPS = [
  { id: 1, label: "Movies" },
  { id: 2, label: "Theater" },
  { id: 3, label: "Seats" },
  { id: 4, label: "Snacks" },
  { id: 5, label: "Payment" },
  { id: 6, label: "Confirmation" },
];

function getSeatColor(tierName: string, isBooked: boolean, isSelected: boolean): string {
  if (isBooked) return "bg-white/10 text-gray-600 cursor-not-allowed";
  if (isSelected) return "bg-tickify-pink shadow-[0_0_15px_rgba(255,0,128,0.8)] text-white";
  const name = tierName.toLowerCase();
  if (name.includes("vip")) return "bg-yellow-500 text-black hover:shadow-[0_0_10px_rgba(234,179,8,0.5)]";
  if (name.includes("premium")) return "bg-tickify-purple text-white hover:shadow-[0_0_10px_rgba(168,85,247,0.5)]";
  return "bg-tickify-cyan text-black hover:shadow-[0_0_10px_rgba(34,211,238,0.5)]";
}

export default function Seats() {
  const navigate = useNavigate();
  const { showtimeId, movieTitle, setBookingId, setTotalPrice, setSeats } = useBooking();
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const [seatsData, setSeatsData] = useState<SeatAvailability[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!showtimeId) {
      navigate("/theater");
      return;
    }
    seatService.getAvailable(showtimeId)
      .then(setSeatsData)
      .catch(err => setError(typeof err === "string" ? err : "Failed to load seats"))
      .finally(() => setLoading(false));
  }, [showtimeId, navigate]);

  const toggleSeat = (id: number, isBooked: boolean) => {
    if (isBooked) return;
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleConfirm = async () => {
    if (selected.length === 0 || !showtimeId) return;
    setSubmitting(true);
    try {
      const booking = await bookingService.create({ showtimeId, seatIds: selected });
      if (!mountedRef.current) return;
      setBookingId(booking.id);
      setTotalPrice(booking.totalPrice);
      setSeats(selected);
      navigate("/snacks");
    } catch (err) {
      if (mountedRef.current) setError(typeof err === "string" ? err : "Failed to create booking");
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  };

  // Group seats by row for display
  const rowMap = new Map<string, SeatAvailability[]>();
  for (const seat of seatsData) {
    if (!rowMap.has(seat.rowLabel)) rowMap.set(seat.rowLabel, []);
    rowMap.get(seat.rowLabel)?.push(seat);
  }
  const rows = Array.from(rowMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  // Compute selected seat labels and total price for summary
  const selectedSeatLabels = seatsData
    .filter(s => selected.includes(s.id))
    .map(s => `${s.rowLabel}-${s.seatNumber}`);

  return (
    <div className="pb-20">
      <BookingSteps currentStep={3} steps={STEPS} />

      <div className="px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">
              Select Your Seats
            </h1>
            <p className="text-gray-500 font-medium">
              Choose your preferred seats for this showtime
            </p>
          </div>

          <button
            onClick={() => navigate("/theater")}
            className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Theater
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 font-bold text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-tickify-card/30 border border-white/5 rounded-[3rem] p-8 md:p-12">
              <div className="flex items-center gap-3 mb-12">
                <Monitor size={20} className="text-tickify-cyan" />
                <div>
                  <h4 className="text-sm font-bold">Theater Layout</h4>
                  <p className="text-xs text-gray-500">Select your seats below</p>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="w-8 h-8 border-2 border-tickify-pink border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex flex-col items-center py-12 overflow-x-auto no-scrollbar">
                  {/* Screen indicator */}
                  <div className="w-full max-w-2xl mb-20 relative">
                    <div className="h-2 w-full bg-linear-to-r from-tickify-pink via-tickify-purple to-tickify-cyan rounded-full shadow-[0_0_25px_rgba(255,0,128,0.5)]"></div>
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mt-4">
                      SCREEN
                    </p>
                  </div>

                  <div className="space-y-4 min-w-max px-8">
                    {rows.map(([rowLabel, rowSeats]) => (
                      <div key={rowLabel} className="flex items-center gap-4">
                        <span className="w-6 text-sm font-black text-tickify-pink">{rowLabel}</span>
                        <div className="flex items-center gap-2">
                          {rowSeats
                            .slice()
                            .sort((a, b) => a.seatNumber - b.seatNumber)
                            .map(seat => {
                              const isSelected = selected.includes(seat.id);
                              return (
                                <motion.button
                                  key={seat.id}
                                  whileHover={!seat.isBooked ? { scale: 1.2 } : {}}
                                  whileTap={!seat.isBooked ? { scale: 0.9 } : {}}
                                  onClick={() => toggleSeat(seat.id, seat.isBooked)}
                                  disabled={seat.isBooked}
                                  title={`${seat.tierName}${seat.isBooked ? " (Booked)" : ""}`}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${getSeatColor(seat.tierName, seat.isBooked, isSelected)}`}
                                >
                                  {seat.rowLabel}{seat.seatNumber}
                                </motion.button>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-8 mt-16">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-tickify-cyan"></div>
                      <span className="text-xs font-bold text-gray-400">Regular</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-tickify-purple"></div>
                      <span className="text-xs font-bold text-gray-400">Premium</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                      <span className="text-xs font-bold text-gray-400">VIP</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-white/10"></div>
                      <span className="text-xs font-bold text-gray-400">Occupied</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-tickify-pink shadow-[0_0_10px_rgba(255,0,128,0.5)]"></div>
                      <span className="text-xs font-bold text-gray-400">Selected</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-12 bg-green-400/5 border border-green-400/20 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-10 h-10 bg-green-400/10 rounded-xl flex items-center justify-center">
                  <Zap size={20} className="text-green-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-green-400">
                    Student-Friendly Pricing!
                  </h4>
                  <p className="text-xs text-gray-400">
                    We've made movies affordable for students - enjoy premium cinema experience without breaking the bank!
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <BookingSummary
              selectedSeats={selectedSeatLabels}
              movieTitle={movieTitle ?? "Your Movie"}
              time=""
              theater=""
              onContinue={handleConfirm}
              submitting={submitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
