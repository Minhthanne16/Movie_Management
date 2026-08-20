import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BookingSteps from "./components/BookingSteps.tsx";
import PaymentMethodSelector from "./components/PaymentMethod.tsx";
import CardPaymentForm from "./components/CardPaymentForm.tsx";
import QRPayment from "./components/QRPayment.tsx";
import OrderSummary from "./components/OrderSummary.tsx";
import { paymentService } from "../../services/payment.service";
import { useBooking } from "../../contexts/BookingContext";
import type { PaymentMethod } from "../../types/payment";

const STEPS = [
  { id: 1, label: "Movies" },
  { id: 2, label: "Theater" },
  { id: 3, label: "Seats" },
  { id: 4, label: "Snacks" },
  { id: 5, label: "Payment" },
  { id: 6, label: "Confirmation" },
];

const UI_METHOD_MAP: Record<"card" | "qr", PaymentMethod> = {
  card: "CASH",
  qr: "VNPAY",
};

export default function Payment() {
  const navigate = useNavigate();
  const { bookingId, totalPrice, orderId, setPaymentId, movieTitle, selectedSeatIds } = useBooking();

  useEffect(() => {
    if (!bookingId) navigate("/seats");
  }, [bookingId, navigate]);

  const [paymentMethod, setPaymentMethod] = useState<"card" | "qr">("card");
  const [isCardValid, setIsCardValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid =
    paymentMethod === "qr" || (paymentMethod === "card" && isCardValid);

  const handlePay = async () => {
    if (!bookingId || totalPrice === null) {
      navigate("/seats");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payment = await paymentService.create({
        bookingId,
        orderId: orderId ?? null,
        amount: totalPrice,
        method: UI_METHOD_MAP[paymentMethod],
      });
      setPaymentId(payment.id);

      if (payment.method === "VNPAY" && payment.vnpayInit?.paymentUrl) {
        // Persist booking state so VnpayReturn page can restore it
        sessionStorage.setItem("vnpay_bookingId", String(bookingId));
        sessionStorage.setItem("vnpay_orderId", orderId != null ? String(orderId) : "");
        sessionStorage.setItem("vnpay_paymentId", String(payment.id));
        window.location.href = payment.vnpayInit.paymentUrl;
        return;
      }

      navigate("/confirmation");
    } catch (err) {
      setError(typeof err === "string" ? err : "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20">
      <BookingSteps currentStep={5} steps={STEPS} />

      <div className="px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">
              Complete Payment
            </h1>
            <p className="text-gray-500 font-medium">
              Secure payment with multiple options including VNPAY
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/snacks")}
              className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Snacks
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl px-6 py-4 text-sm text-red-400 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-tickify-card/30 border border-white/5 rounded-[3rem] p-8 md:p-12">
              <PaymentMethodSelector
                selectedMethod={paymentMethod}
                onSelect={setPaymentMethod}
              />
            </div>

            <div className="bg-tickify-card/30 border border-white/5 rounded-[3rem] p-8 md:p-12">
              {paymentMethod === "card" ? (
                <CardPaymentForm
                  onValidationChange={(isValid) => setIsCardValid(isValid)}
                />
              ) : (
                <QRPayment total={totalPrice ?? 0} />
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              total={totalPrice ?? 0}
              isFormValid={isFormValid && !loading}
              onComplete={handlePay}
              movieTitle={movieTitle ?? undefined}
              seatCount={selectedSeatIds.length || undefined}
              hasSnacks={orderId != null}
            />
            {loading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
                <div className="w-4 h-4 border-2 border-tickify-pink border-t-transparent rounded-full animate-spin" />
                {paymentMethod === "qr" ? "Redirecting to VNPAY…" : "Processing payment…"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
