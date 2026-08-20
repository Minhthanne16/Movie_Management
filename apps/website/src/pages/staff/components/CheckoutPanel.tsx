import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  CreditCard,
  Banknote,
  Printer,
  Ticket,
  QrCode,
  Wallet,
} from "lucide-react";

import type { Seat, SeatTypeConfig } from "../../admin/types/adminRoom";
import type { Showtime } from "../../../types/showtime";
import type { Movie } from "../../../types/movie";

interface CheckoutPanelProps {
  selectedMovie: Movie | null;
  selectedShowtime: Showtime | null;
  selectedSeats: Seat[];
  typeConfigs: SeatTypeConfig[];
  totalPrice: number;
  onBack: () => void;
  onComplete: (paymentMethod: string, amountReceived?: number) => void; 
}

const PAYMENT_METHODS = [
  {
    key: "CASH",
    label: "Cash",
    icon: Banknote,
  },
  {
    key: "CARD",
    label: "Card",
    icon: CreditCard,
  },
  {
    key: "TRANSFER",
    label: "Transfer",
    icon: QrCode,
  },
] as const;

const CheckoutPanel: React.FC<CheckoutPanelProps> = ({
  selectedMovie,
  selectedShowtime,
  selectedSeats,
  typeConfigs,
  totalPrice,
  onComplete,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "CARD" | "TRANSFER"
  >("CASH");

  const [amountReceived, setAmountReceived] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const groupedSeats = useMemo(() => {
    return selectedSeats.reduce(
      (acc, seat) => {
        if (!acc[seat.type]) {
          acc[seat.type] = [];
        }

        acc[seat.type].push(seat);

        return acc;
      },
      {} as Record<string, Seat[]>,
    );
  }, [selectedSeats]);

  const change = useMemo(() => {
    const received = parseFloat(amountReceived) || 0;

    return Math.max(0, received - totalPrice);
  }, [amountReceived, totalPrice]);

  const canCheckout = useMemo(() => {
    if (selectedSeats.length === 0) {
      return false;
    }

    if (paymentMethod === "CASH") {
      return (parseFloat(amountReceived) || 0) >= totalPrice;
    }

    return true;
  }, [paymentMethod, amountReceived, totalPrice, selectedSeats]);

  const handleComplete = () => {
    setIsProcessing(true);

    setTimeout(() => {
      onComplete(paymentMethod, parseFloat(amountReceived));

      setIsProcessing(false);
      setAmountReceived("");
    }, 1200);
  };

  return (
    <div className="bg-slate-900/70 border border-white/[0.06] backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-tickify-cyan/10 border border-tickify-cyan/20 flex items-center justify-center text-tickify-cyan shadow-[0_0_20px_rgba(0,255,242,0.15)]">
            <Wallet size={22} />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 font-black">
              POS Checkout
            </p>

            <h2 className="text-2xl font-display font-bold text-white">
              Payment Panel
            </h2>
          </div>
        </div>

        {selectedMovie && selectedShowtime && (
          <div className="space-y-2">
            <p className="text-white font-bold leading-tight">
              {selectedMovie.title}
            </p>

            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium flex-wrap">
              <span>
                {new Date(selectedShowtime.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </span>

              <span>•</span>

              <span>₫{selectedShowtime.basePrice.toLocaleString()}/seat</span>

              <span>•</span>

              <span>{selectedShowtime.roomName ?? `Room ${selectedShowtime.roomId}`}</span>
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
        {/* Selected Seats */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500 font-black">
              Selected Seats
            </p>

            <span className="text-xs font-bold text-tickify-cyan">
              {selectedSeats.length} seat(s)
            </span>
          </div>

          {selectedSeats.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-10 text-center">
              <Ticket
                size={28}
                className="mx-auto text-gray-700 mb-3"
              />

              <p className="text-sm text-gray-500 font-medium">
                No seats selected yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedSeats).map(([type, seats]) => {
                const config = typeConfigs.find((c) => c.type === type);

                return (
                  <div
                    key={type}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: config?.color,
                            }}
                          />

                          <p className="text-sm font-bold text-white">
                            {type}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {seats.map((seat) => (
                            <span
                              key={seat.id}
                              className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[11px] font-bold text-gray-300"
                            >
                              {seat.label}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-white font-bold">
                          ₫{((config?.price || 0) * seats.length).toLocaleString()}
                        </p>

                        <p className="text-[10px] text-gray-500 mt-1">
                          ₫{(config?.price ?? 0).toLocaleString()} / seat
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="rounded-[2rem] bg-linear-to-br from-tickify-cyan to-blue-500 p-6 shadow-[0_20px_40px_rgba(0,255,242,0.15)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-tickify-dark/60 mb-2">
                Grand Total
              </p>

              <p className="text-4xl font-display font-bold text-tickify-dark">
                ₫{totalPrice.toLocaleString()}
              </p>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-black/10 flex items-center justify-center text-tickify-dark">
              <CreditCard size={28} />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500 font-black mb-4">
            Payment Method
          </p>

          <div className="grid grid-cols-3 gap-3">
            {PAYMENT_METHODS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setPaymentMethod(key)}
                className={`rounded-2xl p-4 border transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                  paymentMethod === key
                    ? "bg-tickify-cyan text-tickify-dark border-tickify-cyan shadow-[0_0_20px_rgba(0,255,242,0.2)]"
                    : "bg-white/[0.03] border-white/[0.06] text-gray-500 hover:bg-white/[0.05]"
                }`}
              >
                <Icon size={20} />

                <span className="text-[10px] uppercase tracking-widest font-black">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Cash Section */}
        {paymentMethod === "CASH" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs uppercase tracking-[0.25em] text-gray-500 font-black mb-3">
                Amount Received
              </label>

              <input
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                placeholder="Enter cash amount..."
                className="w-full h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] px-5 text-white font-bold focus:outline-none focus:border-tickify-cyan/50 transition-all"
              />
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-black mb-2">
                  Customer Change
                </p>

                <p className="text-3xl font-display font-bold text-green-400">
                  ₫{change.toLocaleString()}
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-green-400/10 flex items-center justify-center text-green-400">
                <Banknote size={24} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Checkout Button */}
        <button
          disabled={!canCheckout || isProcessing}
          onClick={handleComplete}
          className={`w-full h-16 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${
            canCheckout && !isProcessing
              ? "bg-tickify-cyan text-tickify-dark shadow-[0_20px_40px_rgba(0,255,242,0.2)] hover:scale-[1.01] active:scale-95"
              : "bg-white/[0.03] text-gray-600 cursor-not-allowed"
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-4 border-tickify-dark/30 border-t-tickify-dark rounded-full animate-spin" />
              Processing
            </>
          ) : (
            <>
              <Printer size={18} />
              Complete Payment
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPanel;