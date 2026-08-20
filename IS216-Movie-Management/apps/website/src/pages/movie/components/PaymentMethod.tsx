import { CreditCard, QrCode } from "lucide-react";

interface PaymentMethodProps {
  selectedMethod: "card" | "qr";
  onSelect: (method: "card" | "qr") => void;
}

export default function PaymentMethod({
  selectedMethod,
  onSelect,
}: PaymentMethodProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
          <CreditCard size={18} className="text-yellow-500" />
        </div>
        <h3 className="text-sm font-bold">Payment Method</h3>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onSelect("card")}
          className={`w-full p-6 rounded-2xl border transition-all duration-300 flex items-center gap-4 text-left ${
            selectedMethod === "card"
              ? "bg-tickify-pink/5 border-tickify-pink/30 shadow-[0_0_20px_rgba(255,0,128,0.1)]"
              : "bg-tickify-card border-white/5 hover:border-white/10"
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              selectedMethod === "card"
                ? "border-tickify-pink"
                : "border-gray-600"
            }`}
          >
            {selectedMethod === "card" && (
              <div className="w-2.5 h-2.5 rounded-full bg-tickify-pink" />
            )}
          </div>
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
            <CreditCard
              size={20}
              className={
                selectedMethod === "card"
                  ? "text-tickify-pink"
                  : "text-gray-400"
              }
            />
          </div>
          <div>
            <h4 className="text-sm font-bold">Credit / Debit Card</h4>
            <p className="text-xs text-gray-500">Pay securely with your card</p>
          </div>
        </button>

        <button
          onClick={() => onSelect("qr")}
          className={`w-full p-6 rounded-2xl border transition-all duration-300 flex items-center gap-4 text-left ${
            selectedMethod === "qr"
              ? "bg-tickify-pink/5 border-tickify-pink/30 shadow-[0_0_20px_rgba(255,0,128,0.1)]"
              : "bg-tickify-card border-white/5 hover:border-white/10"
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              selectedMethod === "qr"
                ? "border-tickify-pink"
                : "border-gray-600"
            }`}
          >
            {selectedMethod === "qr" && (
              <div className="w-2.5 h-2.5 rounded-full bg-tickify-pink" />
            )}
          </div>
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
            <QrCode
              size={20}
              className={
                selectedMethod === "qr" ? "text-tickify-pink" : "text-gray-400"
              }
            />
          </div>
          <div>
            <h4 className="text-sm font-bold">PromptPay QR Code</h4>
            <p className="text-xs text-gray-500">
              Scan QR code with your banking app
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
