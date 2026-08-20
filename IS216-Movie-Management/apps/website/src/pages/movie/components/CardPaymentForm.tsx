import { ShieldCheck, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";

interface CardPaymentFormProps {
  onValidationChange: (isValid: boolean) => void;
}

export default function CardPaymentForm({
  onValidationChange,
}: CardPaymentFormProps) {
  const [formData, setFormData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
    const isValid =
      formData.number.replace(/\s/g, "").length === 16 &&
      formData.name.trim().length > 0 &&
      formData.expiry.length === 5 &&
      formData.cvv.length === 3;

    onValidationChange(isValid);
  }, [formData, onValidationChange]);
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
          <ShieldCheck size={18} className="text-green-500" />
        </div>
        <h3 className="text-sm font-bold">Card Details</h3>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-tickify-pink">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full bg-tickify-card border border-white/5 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-tickify-pink/50 transition-colors"
              value={formData.number}
              onChange={(e) =>
                setFormData({ ...formData, number: e.target.value })
              }
            />
            <CreditCard
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-tickify-pink">
            Cardholder Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full bg-tickify-card border border-white/5 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-tickify-pink/50 transition-colors"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-tickify-pink">
              Expiry Date
            </label>
            <input
              type="text"
              placeholder="MM/YY"
              className="w-full bg-tickify-card border border-white/5 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-tickify-pink/50 transition-colors"
              value={formData.expiry}
              onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-tickify-pink">
              CVV
            </label>
            <input
              type="text"
              placeholder="123"
              className="w-full bg-tickify-card border border-white/5 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-tickify-pink/50 transition-colors"
              value={formData.cvv}
              onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="bg-green-500/5 border border-green-500/10 rounded-xl p-4 flex items-center gap-3">
        <ShieldCheck size={16} className="text-green-500 shrink-0" />
        <p className="text-[10px] font-bold text-green-500/80">
          Your payment information is encrypted and secured with military-grade
          protection
        </p>
      </div>
    </div>
  );
}
