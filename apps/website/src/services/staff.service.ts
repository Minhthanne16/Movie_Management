import api from "./api";
import type { Staff, StaffRequest } from "../types/staff";
import { extractErrorMessage } from "../utils/error";

export const staffService = {
  getAll: async (): Promise<Staff[]> => {
    try {
      const res = await api.get("/api/staff");
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load staff"); }
  },

  getById: async (id: number): Promise<Staff> => {
    try {
      const res = await api.get(`/api/staff/${id}`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load staff member"); }
  },

  create: async (req: StaffRequest): Promise<Staff> => {
    try {
      const res = await api.post("/api/staff", req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to create staff member"); }
  },

  update: async (id: number, req: StaffRequest): Promise<Staff> => {
    try {
      const res = await api.put(`/api/staff/${id}`, req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to update staff member"); }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/staff/${id}`);
    } catch (e) { throw extractErrorMessage(e, "Failed to delete staff member"); }
  },
};
