import api from "./api";
import type { DashboardStats } from "../types/dashboard";
import { extractErrorMessage } from "../utils/error";

export const dashboardService = {
  get: async (from?: string, to?: string): Promise<DashboardStats> => {
    try {
      const params: Record<string, string> = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const res = await api.get("/api/dashboard", { params });
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load dashboard"); }
  },
};
