import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Ticket, CreditCard, ChevronRight, Info } from "lucide-react";
import type { Seat, SeatTypeConfig } from "../../admin/types/adminRoom";

interface PricingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedSeats: Seat[];
  typeConfigs: SeatTypeConfig[];
  movieTitle: string;
}

const PricingPopup: React.FC<PricingPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedSeats,
  typeConfigs,
  movieTitle,
}) => {
  const totalPrice = selectedSeats.reduce((acc, s) => {
    const config = typeConfigs.find((c) => c.type === s.type);
    return acc + (config?.price || 0);
  }, 0);

  // Group seats by type for summary
  const groupedSeats = selectedSeats.reduce(
    (acc, s) => {
      if (!acc[s.type]) acc[s.type] = [];
      acc[s.type].push(s);
      return acc;
    },
    {} as Record<string, Seat[]>,
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-tickify-dark/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-tickify-card border border-white/10 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 pb-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-tickify-cyan/10 flex items-center justify-center text-tickify-cyan">
                  <Ticket size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white">
                    Order Summary
                  </h3>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Review before payment
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Movie Info */}
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
                  Movie Selection
                </p>
                <p className="text-lg font-bold text-white mb-1">
                  {movieTitle}
                </p>
                <div className="flex items-center gap-2 text-tickify-cyan text-[10px] font-bold uppercase">
                  <Info size={12} /> Standard Listing
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  Pricing Breakdown
                </p>
                <div className="space-y-3">
                  {(Object.entries(groupedSeats) as [string, Seat[]][]).map(
                    ([type, seats]) => {
                      const config = typeConfigs.find((c) => c.type === type);
                      const groupTotal = (config?.price || 0) * seats.length;
                      return (
                        <div
                          key={type}
                          className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: config?.color }}
                            />
                            <div>
                              <p className="text-sm font-bold text-white">
                                {type} Seat{" "}
                                <span className="text-gray-500 ml-1">
                                  × {seats.length}
                                </span>
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {(seats as Seat[])
                                  .map((s) => s.label)
                                  .join(", ")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-white">
                              ₫{Number(groupTotal).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              ₫{(config?.price ?? 0).toLocaleString()} / seat
                            </p>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Total Card */}
              <div className="bg-linear-to-br from-tickify-cyan to-blue-500 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-tickify-dark/60 uppercase tracking-widest">
                      Total Amount Due
                    </p>
                    <p className="text-3xl font-display font-bold text-tickify-dark">
                      ₫{Number(totalPrice).toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-tickify-dark/10 flex items-center justify-center text-tickify-dark">
                    <CreditCard size={24} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={onConfirm}
                  className="w-full py-4 bg-tickify-cyan text-tickify-dark font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-[0_10px_30px_rgba(0,255,242,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Confirm & Go to Payment <ChevronRight size={16} />
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-4 text-gray-500 hover:text-white font-black text-xs uppercase tracking-[0.2em] transition-all"
                >
                  Cancel & Return
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PricingPopup;
