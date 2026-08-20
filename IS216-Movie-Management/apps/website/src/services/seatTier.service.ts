import api from "./api";
import type { SeatTier } from "../types/cinema";
import { extractErrorMessage } from "../utils/error";

export interface SeatTierRequest {
  name: string;
  priceMultiplier: number;
  description?: string;
}

export const seatTierService = {
  getAll: async (): Promise<SeatTier[]> => {
    try {
      const res = await api.get("/api/seat-tiers");
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load seat tiers"); }
  },

  getById: async (id: number): Promise<SeatTier> => {
    try {
      const res = await api.get(`/api/seat-tiers/${id}`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load seat tier"); }
  },

  create: async (req: SeatTierRequest): Promise<SeatTier> => {
    try {
      const res = await api.post("/api/seat-tiers", req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to create seat tier"); }
  },

  update: async (id: number, req: SeatTierRequest): Promise<SeatTier> => {
    try {
      const res = await api.put(`/api/seat-tiers/${id}`, req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to update seat tier"); }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/seat-tiers/${id}`);
    } catch (e) { throw extractErrorMessage(e, "Failed to delete seat tier"); }
  },
};
