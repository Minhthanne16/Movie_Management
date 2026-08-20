import api from "./api";
import type { Payment, PaymentRequest } from "../types/payment";
import { extractErrorMessage } from "../utils/error";

export const paymentService = {
  create: async (req: PaymentRequest): Promise<Payment> => {
    try {
      const res = await api.post("/api/payments", req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to create payment"); }
  },

  getById: async (id: number): Promise<Payment> => {
    try {
      const res = await api.get(`/api/payments/${id}`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load payment"); }
  },

  handleVnpayReturn: async (params: Record<string, string>): Promise<unknown> => {
    try {
      const res = await api.get("/api/payments/vnpay/return", { params });
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to handle VNPay return"); }
  },
};
