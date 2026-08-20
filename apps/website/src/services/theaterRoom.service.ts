import api from "./api";
import type { TheaterRoom } from "../types/cinema";
import { extractErrorMessage } from "../utils/error";

export interface TheaterRoomRequest {
  name: string;
  totalRows: number;
  seatsPerRow: number;
}

export const theaterRoomService = {
  getAll: async (): Promise<TheaterRoom[]> => {
    try {
      const res = await api.get("/api/theater-rooms");
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load theater rooms"); }
  },

  getById: async (id: number): Promise<TheaterRoom> => {
    try {
      const res = await api.get(`/api/theater-rooms/${id}`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load theater room"); }
  },

  create: async (req: TheaterRoomRequest): Promise<TheaterRoom> => {
    try {
      const res = await api.post("/api/theater-rooms", req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to create theater room"); }
  },

  update: async (id: number, req: TheaterRoomRequest): Promise<TheaterRoom> => {
    try {
      const res = await api.put(`/api/theater-rooms/${id}`, req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to update theater room"); }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/theater-rooms/${id}`);
    } catch (e) { throw extractErrorMessage(e, "Failed to delete theater room"); }
  },
};
