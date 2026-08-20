import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  Printer,
  Ticket,
  Sparkles,
} from "lucide-react";

interface PaymentSuccessModalProps {
  isOpen: boolean;

  bookingCode: string;
  totalPrice: number;

  seatLabels: string[];

  onClose: () => void;
}

const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  bookingCode,
  totalPrice,
  seatLabels,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeout = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-md flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 220,
              damping: 20,
            }}
            className="relative overflow-hidden w-full max-w-lg rounded-[2.5rem] border border-white/[0.06] bg-slate-900/90 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
          >
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-tickify-cyan/15 blur-3xl rounded-full pointer-events-none" />

            <div className="relative z-10 p-10">
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.1,
                  type: "spring",
                  stiffness: 250,
                }}
                className="w-24 h-24 rounded-full bg-tickify-cyan/10 border border-tickify-cyan/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(0,255,242,0.15)]"
              >
                <CheckCircle2
                  size={48}
                  className="text-tickify-cyan"
                />
              </motion.div>

              {/* Heading */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tickify-cyan/10 border border-tickify-cyan/20 text-tickify-cyan text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                  <Sparkles size={12} />
                  Transaction Completed
                </div>

                <h2 className="text-4xl font-display font-bold text-white mb-3">
                  Payment Successful
                </h2>

                <p className="text-gray-400 leading-relaxed">
                  Tickets have been confirmed and sent to the printer.
                </p>
              </div>

              {/* Booking Info */}
              <div className="space-y-4 mb-8">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-black mb-2">
                      Booking Code
                    </p>

                    <p className="text-xl font-display font-bold text-white tracking-wider">
                      {bookingCode}
                    </p>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-tickify-cyan/10 border border-tickify-cyan/20 flex items-center justify-center text-tickify-cyan">
                    <Ticket size={26} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-black mb-2">
                      Seats
                    </p>

                    <p className="text-lg font-bold text-white">
                      {seatLabels.join(", ")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-black mb-2">
                      Total Paid
                    </p>

                    <p className="text-lg font-bold text-green-400">
                      ₫{totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Printing Status */}
              <div className="rounded-[2rem] bg-linear-to-r from-tickify-cyan to-blue-500 p-6 text-tickify-dark">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-black/10 flex items-center justify-center">
                    <Printer size={28} />
                  </div>

                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-[0.25em] font-black opacity-70 mb-2">
                      Printing Status
                    </p>

                    <p className="text-xl font-display font-bold">
                      Printing Tickets...
                    </p>
                  </div>

                  <div className="w-8 h-8 border-4 border-tickify-dark/30 border-t-tickify-dark rounded-full animate-spin" />
                </div>
              </div>

              {/* Auto Close */}
              <p className="text-center text-xs text-gray-500 mt-6 uppercase tracking-[0.25em] font-black">
                Preparing next customer...
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentSuccessModal;