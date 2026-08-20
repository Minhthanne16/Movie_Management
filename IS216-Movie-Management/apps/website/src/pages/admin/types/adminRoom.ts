// Admin-specific Room UI types (richer than backend TheaterRoom)
export type SeatType = "Regular" | "VIP" | "Couple" | "Blocked" | "Aisle";

export interface SeatTypeConfig {
  type: SeatType;
  color: string;
  price: number;
}

export interface Seat {
  id: string;
  row: number;
  col: number;
  type: SeatType;
  label: string;
}

export interface Room {
  id: string;
  roomId: string;
  name: string;
  description: string;
  rowCount: number;
  colCount: number;
  seats: Seat[];
  seatTypeConfigs: SeatTypeConfig[];
  createdAt: string;
}

export const DEFAULT_TYPE_CONFIGS: SeatTypeConfig[] = [
  { type: "Regular", color: "#00D2FF", price: 120 },
  { type: "VIP", color: "#FFB700", price: 180 },
  { type: "Couple", color: "#7B2CBF", price: 250 },
  { type: "Blocked", color: "#1f2937", price: 0 },
  { type: "Aisle", color: "#000000", price: 0 },
];
