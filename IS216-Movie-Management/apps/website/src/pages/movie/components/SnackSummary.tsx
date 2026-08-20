import { ShoppingCart, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Snack {
  id: string;
  name: string;
  price: number;
}

interface SnackSummaryProps {
  selectedSnacks: Record<string, number>;
  snacks: Snack[];
  ticketPrice: number;
  movieTitle?: string;
  onContinue: () => void;
  onSkip: () => void;
}

export default function SnackSummary({
  selectedSnacks,
  snacks,
  ticketPrice,
  movieTitle,
  onContinue,
  onSkip,
}: SnackSummaryProps) {
  const snackItems = snacks.filter((s) => selectedSnacks[s.id] > 0);
  const snacksTotal = snackItems.reduce(
    (sum, s) => sum + s.price * selectedSnacks[s.id],
    0,
  );
  const total = ticketPrice + snacksTotal;

  return (
    <div className="bg-tickify-card border border-white/5 rounded-[2.5rem] p-8 h-fit sticky top-8 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart size={20} className="text-tickify-pink" />
        <h2 className="text-xl font-display font-bold">Your Order</h2>
      </div>

      <div className="space-y-6 mb-8">
        <div>
          <h3 className="text-white font-bold text-sm mb-1">
            {movieTitle ?? "Your Movie"}
          </h3>
          <p className="text-xs text-gray-500 font-medium">
            10:00 AM • 2 tickets
          </p>
        </div>

        <div className="border-t border-white/5 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Snacks & Drinks (
              {Object.values(selectedSnacks).reduce((a, b) => a + b, 0)} items)
            </h4>
          </div>

          <div className="space-y-3 max-h-50 overflow-y-auto no-scrollbar pr-2">
            <AnimatePresence>
              {snackItems.map((snack) => (
                <motion.div
                  key={snack.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-gray-300">
                    {snack.name}{" "}
                    <span className="text-tickify-pink ml-1">
                      x{selectedSnacks[snack.id]}
                    </span>
                  </span>
                  <span className="font-bold text-white">
                    ₫{(snack.price * selectedSnacks[snack.id]).toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            {snackItems.length === 0 && (
              <p className="text-xs text-gray-600 italic">
                No snacks selected yet
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-white/5 pt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-bold">Snacks Total</span>
          <span className="text-white font-bold">₫{Number(snacksTotal).toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 font-bold">Tickets</span>
          <span className="text-white font-bold">₫{Number(ticketPrice).toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between pt-4">
          <span className="text-lg font-display font-bold text-white">
            Total
          </span>
          <span className="text-2xl font-display font-bold text-tickify-pink">
            ₫{Number(total).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <button
          onClick={onContinue}
          className="w-full bg-tickify-pink hover:bg-tickify-pink/90 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,0,128,0.3)]"
        >
          Continue to Payment
          <ChevronRight size={18} />
        </button>
        <button
          onClick={onSkip}
          className="w-full bg-white/5 hover:bg-white/10 text-gray-400 py-4 rounded-xl font-bold text-sm transition-all"
        >
          Skip Snacks
        </button>
      </div>

      <div className="mt-8 space-y-3">
        {[
          "Pick up at Express Counter #3",
          "Show your booking confirmation",
          "Available 30 mins before showtime",
        ].map((text, i) => (
          <div
            key={i}
            className="flex items-center gap-3 text-[10px] font-bold text-gray-600"
          >
            <div className="w-1 h-1 rounded-full bg-gray-700 shrink-0"></div>
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
