import api from "./api";
import type { Seat, SeatAvailability } from "../types/cinema";
import { extractErrorMessage } from "../utils/error";

export interface SeatRequest {
  roomId: number;
  rowLabel: string;
  seatNumber: number;
  tierId: number;
}

export const seatService = {
  getByRoom: async (roomId: number): Promise<Seat[]> => {
    try {
      const res = await api.get("/api/seats", { params: { roomId } });
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load seats"); }
  },

  getAvailable: async (showtimeId: number): Promise<SeatAvailability[]> => {
    try {
      const res = await api.get("/api/seats/available", { params: { showtimeId } });
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load available seats"); }
  },

  create: async (req: SeatRequest): Promise<Seat> => {
    try {
      const res = await api.post("/api/seats", req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to create seat"); }
  },

  update: async (id: number, req: SeatRequest): Promise<Seat> => {
    try {
      const res = await api.put(`/api/seats/${id}`, req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to update seat"); }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/seats/${id}`);
    } catch (e) { throw extractErrorMessage(e, "Failed to delete seat"); }
  },
};
