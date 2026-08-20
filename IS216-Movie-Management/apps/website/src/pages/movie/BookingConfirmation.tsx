import {
  CheckCircle2,
  Calendar,
  MapPin,
  Users,
  Download,
  Mail,
  Phone,
  Info,
  Ticket,
  ShoppingBag,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookingSteps from "./components/BookingSteps.tsx";
import { bookingService } from "../../services/booking.service";
import { orderService } from "../../services/order.service";
import { useBooking } from "../../contexts/BookingContext";
import type { Booking } from "../../types/booking";
import type { Order } from "../../types/order";

const STEPS = [
  { id: 1, label: "Movies" },
  { id: 2, label: "Theater" },
  { id: 3, label: "Seats" },
  { id: 4, label: "Snacks" },
  { id: 5, label: "Payment" },
  { id: 6, label: "Confirmation" },
];

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function BookingConfirmation() {
  const navigate = useNavigate();
  const { bookingId, orderId, reset } = useBooking();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      navigate("/home");
      return;
    }
    let mounted = true;
    const fetches: Promise<unknown>[] = [
      bookingService.getById(bookingId).then(b => { if (mounted) setBooking(b); }),
    ];
    if (orderId) {
      fetches.push(orderService.getById(orderId).then(o => { if (mounted) setOrder(o); }));
    }
    Promise.all(fetches)
      .catch(err => { if (mounted) setError(typeof err === "string" ? err : "Failed to load booking details"); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [bookingId, orderId, navigate]);

  const handleGoHome = () => {
    reset();
    navigate("/home");
  };

  if (loading) {
    return (
      <div className="pb-20">
        <BookingSteps currentStep={6} steps={STEPS} />
        <div className="flex items-center justify-center py-32">
          <div className="w-10 h-10 border-2 border-tickify-pink border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-20">
        <BookingSteps currentStep={6} steps={STEPS} />
        <div className="flex items-center justify-center py-32 text-red-400 font-medium">{error}</div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <BookingSteps currentStep={6} steps={STEPS} />

      <div className="max-w-3xl mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-tickify-card/30 border border-green-500/20 rounded-[3rem] p-12 text-center mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-green-500/50 to-transparent"></div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.2 }}
            className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 size={48} className="text-green-500" />
          </motion.div>

          <h1 className="text-4xl font-display font-bold text-green-500 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-400 font-medium mb-6">
            Your movie tickets have been successfully booked.
          </p>

          <div className="inline-block bg-white/5 border border-white/10 rounded-full px-6 py-2">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mr-2">
              Booking ID:
            </span>
            <span className="text-xs font-bold text-white">
              {booking?.id ?? bookingId}
            </span>
          </div>
        </motion.div>

        {/* Booking Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-tickify-card/30 border border-white/5 rounded-[3rem] p-8 md:p-12 mb-8"
        >
          <div className="flex items-center gap-3 mb-8">
            <Ticket size={20} className="text-tickify-pink" />
            <h2 className="text-sm font-black uppercase tracking-widest">
              Booking Details
            </h2>
          </div>

          <div className="space-y-8">
            {/* Movie Info */}
            <div>
              <h3 className="text-2xl font-display font-bold mb-4">
                {booking?.movieTitle ?? "—"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Calendar size={18} className="text-tickify-pink" />
                  <span>
                    {booking?.startTime
                      ? formatDateTime(booking.startTime)
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <MapPin size={18} className="text-tickify-pink" />
                  <span>{booking?.roomName ?? "—"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Users size={18} className="text-tickify-pink" />
                  <span>
                    {booking?.tickets?.length ?? 0} Ticket
                    {(booking?.tickets?.length ?? 0) !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Seats */}
            {booking?.tickets && booking.tickets.length > 0 && (
              <div className="border-t border-white/5 pt-8">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">
                  Selected Seats
                </h4>
                <div className="flex flex-wrap gap-4">
                  {booking.tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-tickify-purple/10 border border-tickify-purple/20 rounded-xl px-4 py-3 flex items-center justify-between gap-4 min-w-[9rem]"
                    >
                      <span className="text-sm font-bold">
                        {ticket.rowLabel}
                        {ticket.seatNumber}
                      </span>
                      <span className="text-[10px] font-bold text-tickify-purple uppercase tracking-widest">
                        {ticket.tierName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order / Snacks */}
            {order && order.items.length > 0 && (
              <div className="border-t border-white/5 pt-8">
                <div className="flex items-center gap-3 mb-4">
                  <ShoppingBag size={16} className="text-tickify-cyan" />
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Snacks & Drinks
                  </h4>
                </div>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-400">
                        {item.foodItemName}{" "}
                        <span className="text-tickify-pink">
                          x{item.quantity}
                        </span>
                      </span>
                      <span className="font-bold">
                        ₫{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="border-t border-white/5 pt-8">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">
                Payment Summary
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between pt-4 border-t border-white/5">
                  <span className="text-lg font-bold">Total Paid</span>
                  <span className="text-xl font-display font-bold text-tickify-pink">
                    ₫{booking?.totalPrice ?? 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 text-tickify-dark">
              <div className="flex items-center gap-3 mb-4">
                <Info size={20} className="text-tickify-pink" />
                <h4 className="text-sm font-black uppercase tracking-widest">
                  Important Information
                </h4>
              </div>
              <ul className="space-y-2">
                {[
                  "Please arrive at least 15 minutes before showtime",
                  "Bring a valid ID for verification",
                  "No outside food or drinks allowed",
                  "Tickets are non-transferable and non-refundable after 2 hours before showtime",
                ].map((text, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-xs font-bold leading-relaxed"
                  >
                    <div className="w-1 h-1 rounded-full bg-tickify-pink mt-1.5 shrink-0"></div>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button className="bg-tickify-pink text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,0,128,0.3)] hover:shadow-[0_0_30px_rgba(255,0,128,0.5)] transition-all">
            <Download size={18} />
            Download Ticket
          </button>
          <button className="bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
            <Mail size={18} />
            Email Ticket
          </button>
        </div>

        <button
          onClick={handleGoHome}
          className="w-full py-4 rounded-2xl font-bold text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all mb-16"
        >
          Back to Home
        </button>

        <div className="text-center space-y-4">
          <h4 className="text-lg font-display font-bold">Need Help?</h4>
          <p className="text-xs text-gray-500">
            Contact our customer support for any questions about your booking.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-2">
            <a
              href="mailto:support@tickify.com"
              className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-tickify-pink transition-colors"
            >
              <Mail size={16} />
              support@tickify.com
            </a>
            <a
              href="tel:+6621234567"
              className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-tickify-pink transition-colors"
            >
              <Phone size={16} />
              +66 2 123 4567
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
