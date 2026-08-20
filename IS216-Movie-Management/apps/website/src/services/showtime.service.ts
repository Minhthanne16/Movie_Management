import api from "./api";
import type { Showtime } from "../types/showtime";
import { extractErrorMessage } from "../utils/error";

export interface ShowtimeRequest {
  movieId: number;
  roomId: number;
  startTime: string;
  endTime: string;
  basePrice: number;
}

export const showtimeService = {
  getAll: async (movieId?: number, from?: string, to?: string): Promise<Showtime[]> => {
    try {
      const params: Record<string, string | number> = {};
      if (movieId !== undefined) params.movieId = movieId;
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await api.get("/api/showtimes", { params });
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load showtimes"); }
  },

  getById: async (id: number): Promise<Showtime> => {
    try {
      const res = await api.get(`/api/showtimes/${id}`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load showtime"); }
  },

  create: async (req: ShowtimeRequest): Promise<Showtime> => {
    try {
      const res = await api.post("/api/showtimes", req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to create showtime"); }
  },

  update: async (id: number, req: ShowtimeRequest): Promise<Showtime> => {
    try {
      const res = await api.put(`/api/showtimes/${id}`, req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to update showtime"); }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/showtimes/${id}`);
    } catch (e) { throw extractErrorMessage(e, "Failed to delete showtime"); }
  },
};
