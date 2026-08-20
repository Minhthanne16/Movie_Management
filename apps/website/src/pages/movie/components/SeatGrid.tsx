import { motion } from "motion/react";

// interface Seat {
//   id: string;
//   row: string;
//   number: number;
//   type: "regular" | "premium" | "vip";
//   status: "available" | "occupied" | "selected";
// }

interface SeatGridProps {
  selectedSeats: string[];
  onSeatClick: (seatId: string) => void;
}

const ROWS = [
  { label: "A", type: "vip", count: 12 },
  { label: "B", type: "vip", count: 12 },
  { label: "C", type: "vip", count: 12 },
  { label: "D", type: "premium", count: 14 },
  { label: "E", type: "premium", count: 14 },
  { label: "F", type: "premium", count: 14 },
  { label: "G", type: "premium", count: 14 },
  { label: "H", type: "regular", count: 16 },
  { label: "I", type: "regular", count: 16 },
  { label: "J", type: "regular", count: 16 },
];

// Mock occupied seats
const OCCUPIED_SEATS = [
  "A-6",
  "B-1",
  "B-2",
  "B-4",
  "C-5",
  "D-2",
  "D-4",
  "D-5",
  "E-3",
  "E-4",
  "E-10",
  "E-11",
  "F-2",
  "F-4",
  "F-5",
  "G-2",
  "G-4",
  "G-12",
  "H-5",
  "H-12",
  "I-1",
  "I-2",
  "I-7",
  "I-8",
  "J-5",
  "J-12",
];

export default function SeatGrid({
  selectedSeats,
  onSeatClick,
}: SeatGridProps) {
  const getSeatColor = (type: string, status: string) => {
    if (status === "selected")
      return "bg-tickify-pink shadow-[0_0_15px_rgba(255,0,128,0.8)]";
    if (status === "occupied")
      return "bg-white/10 text-gray-600 cursor-not-allowed";

    switch (type) {
      case "vip":
        return "bg-yellow-500 text-black hover:shadow-[0_0_10px_rgba(234,179,8,0.5)]";
      case "premium":
        return "bg-tickify-purple text-white hover:shadow-[0_0_10px_rgba(168,85,247,0.5)]";
      case "regular":
        return "bg-tickify-cyan text-black hover:shadow-[0_0_10px_rgba(34,211,238,0.5)]";
      default:
        return "bg-white/20";
    }
  };

  return (
    <div className="flex flex-col items-center py-12 overflow-x-auto no-scrollbar">
      <div className="w-full max-w-2xl mb-20 relative">
        <div className="h-2 w-full bg-linear-to-r from-tickify-pink via-tickify-purple to-tickify-cyan rounded-full shadow-[0_0_25px_rgba(255,0,128,0.5)]"></div>
        <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mt-4">
          IMAX SCREEN
        </p>
      </div>

      <div className="space-y-4 min-w-max px-8">
        {ROWS.map((row) => (
          <div key={row.label} className="flex items-center gap-4">
            <span className="w-6 text-sm font-black text-tickify-pink">
              {row.label}
            </span>
            <div className="flex items-center gap-2">
              {Array.from({ length: row.count }).map((_, i) => {
                const seatId = `${row.label}-${i + 1}`;
                const isOccupied = OCCUPIED_SEATS.includes(seatId);
                const isSelected = selectedSeats.includes(seatId);
                const status = isSelected
                  ? "selected"
                  : isOccupied
                    ? "occupied"
                    : "available";

                return (
                  <motion.button
                    key={seatId}
                    whileHover={status === "available" ? { scale: 1.2 } : {}}
                    whileTap={status === "available" ? { scale: 0.9 } : {}}
                    onClick={() => status !== "occupied" && onSeatClick(seatId)}
                    disabled={status === "occupied"}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${getSeatColor(row.type, status)}`}
                  >
                    {i + 1}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-8 mt-16">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-tickify-cyan"></div>
          <span className="text-xs font-bold text-gray-400">
            Regular (₫120,000)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-tickify-purple"></div>
          <span className="text-xs font-bold text-gray-400">
            Premium (₫150,000)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
          <span className="text-xs font-bold text-gray-400">VIP (₫180,000)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-white/10"></div>
          <span className="text-xs font-bold text-gray-400">Occupied</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-tickify-pink shadow-[0_0_10px_rgba(255,0,128,0.5)]"></div>
          <span className="text-xs font-bold text-gray-400">Selected</span>
        </div>
      </div>
    </div>
  );
}
