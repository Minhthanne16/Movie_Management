import React from "react";
import { motion } from "motion/react";
import type { Seat, SeatTypeConfig } from "../../admin/types/adminRoom";

interface POSSeatMapProps {
  rowCount: number;
  colCount: number;
  seats: Seat[];
  selectedSeatIds: string[];
  bookedSeatIds: string[];
  typeConfigs: SeatTypeConfig[];
  onToggleSeat: (seatId: string) => void;
}

const POSSeatMap: React.FC<POSSeatMapProps> = ({
  rowCount,
  colCount,
  seats,
  selectedSeatIds,
  bookedSeatIds,
  typeConfigs,
  onToggleSeat,
}) => {
  // Create a grid map for efficient lookup
  const seatMap = React.useMemo(() => {
    const map: Record<string, Seat> = {};
    seats.forEach((s) => (map[`${s.row}-${s.col}`] = s));
    return map;
  }, [seats]);

  const getTypeColor = (type: string) => {
    return typeConfigs.find((c) => c.type === type)?.color || "#374151";
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-5xl mx-auto">
      {/* Screen Visualization */}
      <div className="w-full mb-16 relative">
        <div className="w-[80%] h-2 bg-linear-to-r from-transparent via-tickify-cyan to-transparent mx-auto rounded-full shadow-[0_0_20px_rgba(0,255,242,0.6)]" />
        <p className="text-[10px] font-black text-tickify-cyan uppercase tracking-[0.5em] text-center mt-4 opacity-50">
          Cinema Screen
        </p>
      </div>

      {/* Seat Grid */}
      <div
        className="grid gap-2 mb-12"
        style={{
          gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
          width: "fit-content",
        }}
      >
        {Array.from({ length: rowCount }).map((_, rowIndex) =>
          Array.from({ length: colCount }).map((_, colIndex) => {
            const seat = seatMap[`${rowIndex}-${colIndex}`];
            if (!seat || seat.type === "Aisle") {
              return (
                <div
                  key={`aisle-${rowIndex}-${colIndex}`}
                  className="w-8 h-8"
                />
              );
            }

            const isBooked =
              bookedSeatIds.includes(seat.id) || seat.type === "Blocked";
            const isSelected = selectedSeatIds.includes(seat.id);
            const baseColor = getTypeColor(seat.type);

            return (
              <motion.button
                key={seat.id}
                whileHover={!isBooked ? { scale: 1.15, y: -2 } : {}}
                whileTap={!isBooked ? { scale: 0.95 } : {}}
                onClick={() => !isBooked && onToggleSeat(seat.id)}
                disabled={isBooked}
                title={`${seat.label} (${seat.type})`}
                className={`w-8 h-9 rounded-t-xl rounded-b-md relative transition-all duration-300 flex items-center justify-center text-[9px] font-black tracking-tighter ${
                  isBooked
                    ? "bg-white/5 text-gray-800 cursor-not-allowed opacity-15"
                    : isSelected
                      ? "bg-tickify-cyan text-tickify-dark shadow-[0_0_20px_rgba(0,255,242,0.6)] scale-110 z-10 border-b-4 border-white/30"
                      : "text-white/20 hover:text-white border-b-4"
                }`}
                style={{
                  backgroundColor:
                    !isBooked && !isSelected ? `${baseColor}15` : undefined,
                  borderColor:
                    !isBooked && !isSelected ? `${baseColor}40` : undefined,
                }}
              >
                {seat.label}

                {/* Armrests (Visual Decoration) */}
                <div className="absolute -left-0.5 top-2 w-1 h-4 bg-white/5 rounded-full" />
                <div className="absolute -right-0.5 top-2 w-1 h-4 bg-white/5 rounded-full" />

                {/* Status Indicator Dot */}
                {isSelected && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]" />
                )}

                {/* Special indicator for VIP or Couple */}
                {seat.type === "VIP" && !isSelected && !isBooked && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
                )}
                {seat.type === "Couple" && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[110%] h-1 bg-tickify-purple rounded-full opacity-40 shadow-[0_0_10px_rgba(123,44,191,0.5)]" />
                )}
              </motion.button>
            );
          }),
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-8 p-8 bg-white/5 border border-white/10 rounded-[2rem]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-md bg-tickify-cyan shadow-[0_0_10px_rgba(0,255,242,0.3)]" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Selected
          </span>
        </div>
        <div className="flex items-center gap-3 opacity-20">
          <div className="w-5 h-5 rounded-md bg-white/20" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Booked
          </span>
        </div>
        {typeConfigs
          .filter((t) => t.type !== "Blocked" && t.type !== "Aisle")
          .map((config) => (
            <div key={config.type} className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-md border"
                style={{
                  borderColor: config.color,
                  backgroundColor: `${config.color}20`,
                }}
              />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {config.type}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default POSSeatMap;
