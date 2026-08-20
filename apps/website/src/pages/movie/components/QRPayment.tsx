import { QrCode, Smartphone, Scan, CheckCircle2, Clock } from "lucide-react";
import { useMemo } from "react";

export default function QRPayment({ total }: { total: number }) {
  const dots = useMemo(() => {
    return Array.from({ length: 400 }).map(() => Math.random() > 0.5);
  }, []);
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-tickify-purple/10 rounded-lg flex items-center justify-center">
          <QrCode size={18} className="text-tickify-purple" />
        </div>
        <h3 className="text-sm font-bold">PromptPay QR Code</h3>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative p-6 bg-white rounded-4xl shadow-[0_0_50px_rgba(255,0,128,0.2)]">
          <div className="w-64 h-64 bg-white flex items-center justify-center">
            <div className="grid grid-cols-20 gap-0.5 w-full h-full">
              {dots.map((isBlack, i) => (
                <div
                  key={i}
                  className={`w-full h-full ${isBlack ? "bg-black" : "bg-transparent"}`}
                />
              ))}
            </div>
            {/* QR Corners */}
            <div className="absolute top-6 left-6 w-12 h-12 border-4 border-black"></div>
            <div className="absolute top-6 right-6 w-12 h-12 border-4 border-black"></div>
            <div className="absolute bottom-6 left-6 w-12 h-12 border-4 border-black"></div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-[10px] font-black text-black uppercase tracking-widest">
              PromptPay QR Code
            </p>
            <p className="text-xs font-bold text-gray-500">Amount: ₫{total.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-8 w-full bg-tickify-card/50 border border-white/5 rounded-2xl p-6 text-center">
          <h4 className="text-lg font-display font-bold mb-2">Amount: ₫{total.toLocaleString()}</h4>
          <p className="text-xs text-gray-500 mb-6">
            Scan this QR code with any Thai mobile banking app:
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {["SCB Easy", "Krungthai Next", "K PLUS", "ttb touch"].map(
              (bank) => (
                <span
                  key={bank}
                  className="px-3 py-1 bg-tickify-purple/20 text-tickify-purple text-[10px] font-bold rounded-full border border-tickify-purple/30"
                >
                  {bank}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-yellow-500">
          <Clock size={16} />
          <span className="text-xs font-bold">QR expires in 8:40</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-8 w-full">
          {[
            {
              icon: <Smartphone size={16} />,
              label: "Step 1",
              desc: "Open your banking app",
            },
            {
              icon: <Scan size={16} />,
              label: "Step 2",
              desc: "Scan the QR code",
            },
            {
              icon: <CheckCircle2 size={16} />,
              label: "Step 3",
              desc: "Confirm payment",
            },
          ].map((step, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/5 rounded-xl p-4 text-center space-y-2"
            >
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center mx-auto text-tickify-pink">
                {step.icon}
              </div>
              <p className="text-[10px] font-black text-tickify-pink uppercase tracking-widest">
                {step.label}
              </p>
              <p className="text-[10px] text-gray-500 font-medium leading-tight">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
