import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { paymentService } from "../../services/payment.service";
import { useBooking } from "../../contexts/BookingContext";

export default function VnpayReturn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setBookingId, setOrderId, setPaymentId } = useBooking();
  const [status, setStatus] = useState<"processing" | "success" | "failed">("processing");
  const [message, setMessage] = useState("");
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const params: Record<string, string> = {};
    searchParams.forEach((v, k) => { params[k] = v; });

    const bookingIdStr = sessionStorage.getItem("vnpay_bookingId");
    const orderIdStr = sessionStorage.getItem("vnpay_orderId");
    const paymentIdStr = sessionStorage.getItem("vnpay_paymentId");
    sessionStorage.removeItem("vnpay_bookingId");
    sessionStorage.removeItem("vnpay_orderId");
    sessionStorage.removeItem("vnpay_paymentId");

    if (bookingIdStr) setBookingId(Number(bookingIdStr));
    if (orderIdStr) setOrderId(Number(orderIdStr));
    if (paymentIdStr) setPaymentId(Number(paymentIdStr));

    paymentService.handleVnpayReturn(params)
      .then((res: any) => {
        const code = res?.vnpResponseCode ?? params["vnp_ResponseCode"];
        if (code === "00") {
          setStatus("success");
          setMessage("Payment successful! Redirecting…");
          setTimeout(() => navigate("/confirmation"), 1500);
        } else {
          setStatus("failed");
          setMessage(res?.vnpMessageVi ?? "Payment was not completed.");
        }
      })
      .catch(() => {
        setStatus("failed");
        setMessage("Could not verify payment. Please contact support.");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-tickify-dark px-4">
      <div className="bg-tickify-card border border-white/5 rounded-[3rem] p-12 max-w-md w-full text-center space-y-6">
        {status === "processing" && (
          <>
            <div className="w-16 h-16 border-4 border-tickify-pink border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-2xl font-display font-bold text-white">Verifying payment…</h2>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 size={64} className="text-green-500 mx-auto" />
            <h2 className="text-2xl font-display font-bold text-green-400">Payment Confirmed!</h2>
            <p className="text-gray-400 text-sm">{message}</p>
          </>
        )}
        {status === "failed" && (
          <>
            <XCircle size={64} className="text-red-500 mx-auto" />
            <h2 className="text-2xl font-display font-bold text-red-400">Payment Failed</h2>
            <p className="text-gray-400 text-sm">{message}</p>
            <button
              onClick={() => navigate("/payment")}
              className="mt-4 px-6 py-3 bg-tickify-pink text-white rounded-xl font-bold text-sm"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
