import React, { useState, useCallback, useRef, useEffect } from "react";
import type { Seat, SeatType, SeatTypeConfig } from "../types/adminRoom";
import { motion } from "motion/react";
import { Info } from "lucide-react";

interface SeatMapBuilderProps {
  rowCount: number;
  colCount: number;
  seats: Seat[];
  onSeatsUpdate: (updatedSeats: Seat[]) => void;
  selectedType: SeatType;
  seatTypeConfigs: SeatTypeConfig[];
}

export default function SeatMapBuilder({
  rowCount,
  colCount,
  seats,
  onSeatsUpdate,
  selectedType,
  seatTypeConfigs,
}: SeatMapBuilderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getSeatAt = useCallback(
    (row: number, col: number) => {
      return seats.find((s) => s.row === row && s.col === col);
    },
    [seats],
  );

  const getSeatColor = (type: SeatType) => {
    const config = seatTypeConfigs.find((c) => c.type === type);
    return config ? config.color : "#1f2937";
  };

  const handleSeatAction = useCallback(
    (row: number, col: number) => {
      const seat = getSeatAt(row, col);
      if (!seat) return;

      // Logic for Couple seats: occupy 2 seats
      // If we select 'Couple', we try to occupy the current and the next one (if available)
      // For simplicity in this brush tool, we'll just set the type.
      // The parent can handle the "pairing" logic if needed, but here we just update the specific seat's type.

      const updatedSeats = seats.map((s) => {
        if (s.row === row && s.col === col) {
          return { ...s, type: selectedType };
        }
        return s;
      });
      onSeatsUpdate(updatedSeats);
    },
    [seats, selectedType, getSeatAt, onSeatsUpdate],
  );

  const onMouseDown = (row: number, col: number) => {
    setIsDragging(true);
    handleSeatAction(row, col);
  };

  const onMouseEnter = (row: number, col: number) => {
    if (isDragging) {
      handleSeatAction(row, col);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 text-xs shadow-[0_0_15px_rgba(59,130,246,0.1)]">
        <Info size={16} />
        <p>
          <strong>Pro Tip:</strong> Click and drag across seats to apply the
          selected seat type in bulk.
        </p>
      </div>

      <div
        className="bg-tickify-bg/80 border border-white/5 rounded-[3rem] p-12 overflow-auto max-h-160 custom-scrollbar shadow-2xl relative"
        ref={containerRef}
      >
        <div className="flex flex-col items-center gap-12 min-w-max">
          {/* Screen Indicator - Enhanced Style */}
          <div className="w-full max-w-4xl text-center space-y-4 mb-8">
            <div className="h-1.5 w-full bg-linear-to-r from-tickify-pink via-tickify-purple to-tickify-cyan rounded-full shadow-[0_0_25px_rgba(255,0,128,0.3)] opacity-80"></div>
            <div className="text-[11px] font-black text-gray-500 uppercase tracking-[0.5em] opacity-50">
              Imax Screen
            </div>
          </div>

          <div
            className="grid gap-x-3 gap-y-3 items-center"
            style={{
              gridTemplateColumns: `40px repeat(${colCount}, 42px)`,
            }}
          >
            {/* Rows */}
            {Array.from({ length: rowCount }).map((_, r) => (
              <React.Fragment key={`row-${r}`}>
                {/* Row Label (Left) in Pink */}
                <div className="text-center text-sm font-black text-tickify-pink uppercase pr-4">
                  {String.fromCharCode(65 + r)}
                </div>

                {/* Seats for this row */}
                {Array.from({ length: colCount }).map((_, c) => {
                  const seat = getSeatAt(r, c);
                  if (!seat)
                    return (
                      <div key={`empty-${r}-${c}`} className="w-10 h-10"></div>
                    );

                  const type = seat.type;
                  const color = getSeatColor(type);
                  const isAisle = type === "Aisle";
                  const isCouple = type === "Couple";

                  // Logic for pairing: indices (0,1), (2,3), etc.
                  const isLeftOfPair = c % 2 === 0;
                  const isRightOfPair = c % 2 === 1;
                  const nextIsCouple =
                    isCouple &&
                    isLeftOfPair &&
                    getSeatAt(r, c + 1)?.type === "Couple";
                  const prevIsCouple =
                    isCouple &&
                    isRightOfPair &&
                    getSeatAt(r, c - 1)?.type === "Couple";

                  return (
                    <motion.button
                      key={`${r}-${c}`}
                      onMouseDown={() => onMouseDown(r, c)}
                      onMouseEnter={() => onMouseEnter(r, c)}
                      whileHover={!isAisle ? { scale: 1.1, zIndex: 10 } : {}}
                      whileTap={!isAisle ? { scale: 0.95 } : {}}
                      style={{
                        backgroundColor: isAisle ? "transparent" : color,
                        opacity: isAisle ? 0.2 : 1,
                      }}
                      className={`w-10 h-10 flex items-center justify-center text-[11px] font-black transition-all relative group select-none shadow-lg ${
                        isAisle
                          ? "border border-dashed border-white/10 hover:bg-white/5 rounded-full"
                          : "text-tickify-dark"
                      } ${
                        nextIsCouple
                          ? "rounded-l-full rounded-r-lg"
                          : prevIsCouple
                            ? "rounded-r-full rounded-l-lg"
                            : "rounded-full"
                      }`}
                    >
                      {!isAisle && c + 1}

                      {/* Couple Connector Bridge */}
                      {nextIsCouple && (
                        <div
                          className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-6 z-[-1]"
                          style={{ backgroundColor: color }}
                        ></div>
                      )}

                      {/* Modern Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-tickify-card border border-white/10 text-white text-[10px] font-bold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-2xl z-50">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[8px] uppercase text-gray-500">
                            {String.fromCharCode(65 + r)}
                            {c + 1}
                          </span>
                          <span style={{ color }}>{type}</span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-12 flex flex-wrap justify-center gap-8 p-8 bg-white/2 border border-white/5 rounded-[2.5rem] backdrop-blur-sm">
        {seatTypeConfigs.map((config) => (
          <div key={config.type} className="flex items-center gap-4">
            <div
              className={`w-8 h-8 rounded-full shadow-xl ${config.type === "Aisle" ? "border-2 border-dashed border-white/10" : ""} transition-transform hover:scale-110`}
              style={{
                backgroundColor:
                  config.type === "Aisle" ? "transparent" : config.color,
              }}
            ></div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-white uppercase tracking-widest">
                {config.type}
              </span>
              {config.price > 0 && (
                <span className="text-[10px] text-gray-500 font-bold tracking-tight">
                  Price: ₫{config.price}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
