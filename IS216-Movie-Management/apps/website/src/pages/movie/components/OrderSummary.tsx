import { ChevronRight } from "lucide-react";

interface OrderSummaryProps {
  onComplete: () => void;
  isFormValid: boolean;
  total: number;
  movieTitle?: string;
  seatCount?: number;
  hasSnacks?: boolean;
}

export default function OrderSummary({
  onComplete,
  isFormValid,
  total,
  movieTitle,
  seatCount,
  hasSnacks,
}: OrderSummaryProps) {
  return (
    <div className="bg-tickify-card border border-white/5 rounded-[2.5rem] p-8 h-fit sticky top-8 shadow-[0_0_40px_rgba(0,0,0,0.3)]">
      <h2 className="text-xl font-display font-bold mb-8">Order Summary</h2>

      <div className="space-y-6 mb-8">
        <div>
          <h3 className="text-tickify-pink font-bold text-sm mb-1">
            {movieTitle ?? "Your Movie"}
          </h3>
          {seatCount != null && (
            <p className="text-xs text-gray-500 font-medium">
              {seatCount} ticket{seatCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {hasSnacks && (
          <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-white/5 pt-4">
            <div className="w-1.5 h-1.5 rounded-full bg-tickify-cyan shrink-0" />
            Snacks & drinks included
          </div>
        )}
      </div>

      <div className="space-y-4 border-t border-white/5 pt-6">
        <div className="flex items-center justify-between pt-4">
          <span className="text-lg font-display font-bold text-white">
            Total
          </span>
          <span className="text-2xl font-display font-bold text-tickify-pink">
            ₫{total.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <button
          onClick={onComplete}
          disabled={!isFormValid}
          className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
            isFormValid
              ? "bg-tickify-pink text-white shadow-[0_0_20px_rgba(255,0,128,0.4)] hover:shadow-[0_0_30px_rgba(255,0,128,0.6)]"
              : "bg-white/5 text-gray-600 cursor-not-allowed"
          }`}
        >
          {isFormValid ? `Pay ₫${total.toLocaleString()}` : "Complete Card Details"}
          <ChevronRight size={18} />
        </button>

        <ul className="space-y-3">
          {[
            "Payment is secure and encrypted with bank-level security",
            "Tickets will be sent to your email instantly",
            "Refunds available up to 2 hours before showtime",
            "24/7 customer support available",
          ].map((text, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-[10px] font-bold text-gray-600"
            >
              <div className="w-1 h-1 rounded-full bg-gray-700 mt-1.5 shrink-0"></div>
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
