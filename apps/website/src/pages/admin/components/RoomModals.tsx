import React, { useState, useEffect, useCallback } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SeatMapBuilder from "./SeatMapBuilder.tsx";
import type {
  Room,
  Seat,
  SeatType,
  SeatTypeConfig,
} from "../types/adminRoom";

interface RoomModalProps {
  room: Room | null;
  onClose: () => void;
  onSave: (room: Room) => void;
  existingRooms: Room[];
}

const DEFAULT_TYPE_CONFIGS: SeatTypeConfig[] = [
  { type: "Regular", color: "#00D2FF", price: 120 },
  { type: "VIP", color: "#FFB700", price: 180 },
  { type: "Couple", color: "#7B2CBF", price: 250 },
  { type: "Blocked", color: "#1f2937", price: 0 },
  { type: "Aisle", color: "#000000", price: 0 },
];

export default function RoomModals({
  room,
  onClose,
  onSave,
  existingRooms,
}: RoomModalProps) {
  const [formData, setFormData] = useState<Partial<Room>>({
    roomId: "",
    name: "",
    description: "",
    rowCount: 8,
    colCount: 10,
    seats: [],
    seatTypeConfigs: DEFAULT_TYPE_CONFIGS,
  });

  const [selectedSeatType, setSelectedSeatType] = useState<SeatType>("Regular");
  const [activeTab, setActiveTab] = useState<"basic" | "seats" | "types">(
    "basic",
  );
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (room) {
      const initialSeatTypeConfigs = room.seatTypeConfigs?.length
        ? room.seatTypeConfigs
        : DEFAULT_TYPE_CONFIGS;

      // If room exists but has no seats array, generate default ones
      if (!room.seats || room.seats.length === 0) {
        const initialSeats: Seat[] = [];
        for (let r = 0; r < (room.rowCount || 8); r++) {
          for (let c = 0; c < (room.colCount || 10); c++) {
            initialSeats.push({
              id: `${r}-${c}`,
              row: r,
              col: c,
              type: "Regular",
              label: `${String.fromCharCode(65 + r)}${c + 1}`,
            });
          }
        }
        setFormData({
          ...room,
          seats: initialSeats,
          seatTypeConfigs: initialSeatTypeConfigs,
        });
      } else {
        setFormData({ ...room, seatTypeConfigs: initialSeatTypeConfigs });
      }
    } else {
      generateInitialSeats(8, 10);
      setFormData((prev) => ({
        ...prev,
        seatTypeConfigs: DEFAULT_TYPE_CONFIGS,
      }));
    }
  }, [room]);

  const generateInitialSeats = (rows: number, cols: number) => {
    const newSeats: Seat[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        newSeats.push({
          id: `${r}-${c}`,
          row: r,
          col: c,
          type: "Regular",
          label: `${String.fromCharCode(65 + r)}${c + 1}`,
        });
      }
    }
    setFormData((prev) => ({
      ...prev,
      rowCount: rows,
      colCount: cols,
      seats: newSeats,
    }));
  };

  const handleSeatsUpdate = useCallback((updatedSeats: Seat[]) => {
    setFormData((prev) => ({ ...prev, seats: updatedSeats }));
  }, []);

  const handleDimensionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "rowCount" | "colCount",
  ) => {
    const newVal = parseInt(e.target.value) || 0;
    if (newVal > 25) return; // UI Safety limit

    setFormData((prev) => {
      const oldRows = prev.rowCount || 0;
      const oldCols = prev.colCount || 0;
      const oldSeats = prev.seats || [];

      const newRows = field === "rowCount" ? newVal : oldRows;
      const newCols = field === "colCount" ? newVal : oldCols;

      const newSeats: Seat[] = [];
      for (let r = 0; r < newRows; r++) {
        for (let c = 0; c < newCols; c++) {
          const existingSeat = oldSeats.find((s) => s.row === r && s.col === c);
          if (existingSeat) {
            newSeats.push(existingSeat);
          } else {
            newSeats.push({
              id: `${r}-${c}`,
              row: r,
              col: c,
              type: "Regular",
              label: `${String.fromCharCode(65 + r)}${c + 1}`,
            });
          }
        }
      }

      return {
        ...prev,
        rowCount: newRows,
        colCount: newCols,
        seats: newSeats,
      };
    });
  };

  const validate = () => {
    const newErrors: string[] = [];
    if (!formData.roomId) newErrors.push("Room ID is required.");
    if (!formData.name) newErrors.push("Room Name is required.");

    // Check if Room ID is unique
    const isDuplicate = existingRooms.some(
      (r) => r.roomId === formData.roomId && r.id !== formData.id,
    );
    if (isDuplicate) {
      newErrors.push(
        `Room ID "${formData.roomId}" is already in use by another theater.`,
      );
    }

    const activeSeats = formData.seats?.filter(
      (s) => s.type !== "Aisle" && s.type !== "Blocked",
    );
    if (!activeSeats || activeSeats.length === 0) {
      newErrors.push(
        "The room must have at least one active seat (Regular, VIP, or Couple).",
      );
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    onSave({
      ...formData,
      id: formData.id || Math.random().toString(36).substr(2, 9),
      createdAt: formData.createdAt || new Date().toISOString(),
    } as Room);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-6xl bg-tickify-card border border-white/10 rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/3">
          <div>
            <h2 className="text-3xl font-display font-bold text-white tracking-tight">
              {room ? "Edit Cinema Room" : "Create New Room"}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] text-tickify-pink font-black uppercase tracking-[0.2em] px-3 py-1 bg-tickify-pink/10 rounded-full">
                Admin Control
              </span>
              <span className="w-1 h-1 bg-white/20 rounded-full"></span>
              <p className="text-xs text-gray-400 font-medium tracking-wide">
                Configuring room layout and seat pricing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all transform hover:rotate-90"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-10 py-5 gap-3 border-b border-white/5 bg-white/1">
          {[
            { id: "basic", label: "1. Basic Configuration" },
            { id: "seats", label: "2. Dynamic Seat Map" },
            { id: "types", label: "3. Pricing & Logistics" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as "basic" | "seats" | "types")
              }
              className={`px-8 py-3 rounded-2xl text-[11px] font-black transition-all uppercase tracking-[0.15em] border ${
                activeTab === tab.id
                  ? "bg-linear-to-r from-tickify-pink to-tickify-purple text-white border-transparent shadow-[0_10px_25px_-5px_rgba(255,0,128,0.4)]"
                  : "text-gray-500 border-white/5 hover:text-white hover:bg-white/5 hover:border-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          {errors.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col gap-2"
            >
              {errors.map((err, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-red-500 text-xs font-bold"
                >
                  <AlertCircle size={14} />
                  {err}
                </div>
              ))}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === "basic" && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12"
              >
                <div className="space-y-8">
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 group-focus-within:text-tickify-pink transition-colors">
                      Internal Room ID
                    </label>
                    <input
                      type="text"
                      value={formData.roomId}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          roomId: e.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="e.g. TH-GRAND-01"
                      className="w-full bg-white/3 border border-white/10 rounded-2xl px-7 py-5 text-sm focus:outline-none focus:border-tickify-pink focus:bg-white/[0. transition-all placeholder:text-gray-600"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 group-focus-within:text-tickify-pink transition-colors">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g. Cinema 1: The IMAX Experience"
                      className="w-full bg-white/3 border border-white/10 rounded-2xl px-7 py-5 text-sm focus:outline-none focus:border-tickify-pink focus:bg-white/5 transition-all placeholder:text-gray-600"
                    />
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="group">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 group-focus-within:text-tickify-pink transition-colors">
                      Description & Technical Details
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={6}
                      placeholder="Describe the audio/visual systems, ADA accessibility..."
                      className="w-full bg-white/3 border border-white/10 rounded-2xl px-7 py-5 text-sm focus:outline-none focus:border-tickify-pink focus:bg-white/5 transition-all resize-none placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "seats" && (
              <motion.div
                key="seats"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="space-y-10"
              >
                <div className="flex flex-wrap items-center gap-8 justify-between p-8 bg-white/2 border border-white/10 rounded-[2.5rem]">
                  <div className="flex gap-10">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Rows (A-Z)
                      </label>
                      <input
                        type="number"
                        value={formData.rowCount}
                        onChange={(e) => handleDimensionChange(e, "rowCount")}
                        className="w-24 bg-tickify-bg border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-tickify-pink transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        Cols (1-25)
                      </label>
                      <input
                        type="number"
                        value={formData.colCount}
                        onChange={(e) => handleDimensionChange(e, "colCount")}
                        className="w-24 bg-tickify-bg border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-tickify-pink transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                      Select Paint Brush Type
                    </label>
                    <div className="flex gap-3 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                      {formData.seatTypeConfigs?.map((config) => (
                        <button
                          key={config.type}
                          onClick={() => setSelectedSeatType(config.type)}
                          className={`px-5 py-2.5 rounded-xl text-[9px] font-black transition-all flex items-center gap-2 border uppercase tracking-wider ${
                            selectedSeatType === config.type
                              ? "bg-white/10 border-white/20 text-white shadow-lg"
                              : "border-transparent text-gray-500 hover:text-gray-300"
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full ${config.type === "Aisle" ? "border border-dashed border-white/40" : ""}`}
                            style={{
                              backgroundColor:
                                config.type === "Aisle"
                                  ? "transparent"
                                  : config.color,
                            }}
                          ></div>
                          {config.type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <SeatMapBuilder
                  rowCount={formData.rowCount || 0}
                  colCount={formData.colCount || 0}
                  seats={formData.seats || []}
                  onSeatsUpdate={handleSeatsUpdate}
                  selectedType={selectedSeatType}
                  seatTypeConfigs={formData.seatTypeConfigs || []}
                />
              </motion.div>
            )}

            {activeTab === "types" && (
              <motion.div
                key="types"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {formData.seatTypeConfigs?.map((config, index) => (
                    <div
                      key={config.type}
                      className="p-8 bg-white/3 border border-white/10 rounded-4xl space-y-6 hover:bg-white/5 transition-all"
                    >
                      <div className="flex items-center gap-5">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xs ${config.type === "Aisle" ? "border-2 border-dashed border-white/10" : "shadow-xl"}`}
                          style={{
                            backgroundColor:
                              config.type === "Aisle"
                                ? "transparent"
                                : config.color,
                          }}
                        >
                          {config.type[0]}
                        </div>
                        <div>
                          <p className="font-display font-bold text-lg text-white">
                            {config.type}
                          </p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            Configuration
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {config.type !== "Aisle" &&
                          config.type !== "Blocked" && (
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">
                                Premium Price (₫)
                              </label>
                              <input
                                type="number"
                                value={config.price}
                                onChange={(e) => {
                                  const newConfigs = [
                                    ...(formData.seatTypeConfigs || []),
                                  ];
                                  newConfigs[index] = {
                                    ...config,
                                    price: parseInt(e.target.value) || 0,
                                  };
                                  setFormData((prev) => ({
                                    ...prev,
                                    seatTypeConfigs: newConfigs,
                                  }));
                                }}
                                className="w-full bg-tickify-bg border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-tickify-pink transition-all font-mono"
                              />
                            </div>
                          )}

                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">
                            Layout Color
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={config.color}
                              onChange={(e) => {
                                const newConfigs = [
                                  ...(formData.seatTypeConfigs || []),
                                ];
                                newConfigs[index] = {
                                  ...config,
                                  color: e.target.value,
                                };
                                setFormData((prev) => ({
                                  ...prev,
                                  seatTypeConfigs: newConfigs,
                                }));
                              }}
                              className="w-full h-12 bg-transparent border-0 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={config.color}
                              onChange={(e) => {
                                const newConfigs = [
                                  ...(formData.seatTypeConfigs || []),
                                ];
                                newConfigs[index] = {
                                  ...config,
                                  color: e.target.value,
                                };
                                setFormData((prev) => ({
                                  ...prev,
                                  seatTypeConfigs: newConfigs,
                                }));
                              }}
                              className="w-full bg-tickify-bg border border-white/10 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-tickify-pink transition-all font-mono uppercase"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Footer */}
        <div className="p-10 border-t border-white/5 bg-white/3 flex items-center justify-between">
          <div className="flex gap-10">
            <div className="flex flex-col">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                Total Capacity
              </p>
              <p className="text-xl font-display font-bold text-white">
                {
                  formData.seats?.filter(
                    (s) => s.type !== "Aisle" && s.type !== "Blocked",
                  ).length
                }{" "}
                <span className="text-xs text-gray-500 font-medium">Seats</span>
              </p>
            </div>
            <div className="flex flex-col border-l border-white/10 pl-10">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                Layout Type
              </p>
              <p className="text-xl font-display font-bold text-white">
                {formData.rowCount}x{formData.colCount}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-gray-500 hover:text-white transition-all border border-transparent hover:border-white/10"
            >
              Discard Changes
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-3 bg-linear-to-r from-tickify-cyan to-blue-600 px-12 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-[0_15px_35px_-10px_rgba(0,210,255,0.4)] hover:shadow-[0_20px_45px_-10px_rgba(0,210,255,0.6)] text-white transition-all transform active:scale-95"
            >
              <Save size={18} />
              Commit Theater Config
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
