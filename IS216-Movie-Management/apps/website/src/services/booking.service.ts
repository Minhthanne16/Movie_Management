import api from "./api";
import type { Booking, BookingRequest } from "../types/booking";
import { extractErrorMessage } from "../utils/error";

export const bookingService = {
  create: async (req: BookingRequest): Promise<Booking> => {
    try {
      const res = await api.post("/api/bookings", req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to create booking"); }
  },

  getById: async (id: number): Promise<Booking> => {
    try {
      const res = await api.get(`/api/bookings/${id}`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load booking"); }
  },

  getMyBookings: async (): Promise<Booking[]> => {
    try {
      const res = await api.get("/api/bookings/my");
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load bookings"); }
  },

  cancel: async (id: number): Promise<Booking> => {
    try {
      const res = await api.post(`/api/bookings/${id}/cancel`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to cancel booking"); }
  },
};
