import api from "./api";
import type { Order, PlaceOrderRequest, PlaceOrderResponse } from "../types/order";
import { extractErrorMessage } from "../utils/error";

export const orderService = {
  place: async (req: PlaceOrderRequest): Promise<PlaceOrderResponse> => {
    try {
      const res = await api.post("/api/orders/place", req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to place order"); }
  },

  getMyOrders: async (): Promise<Order[]> => {
    try {
      const res = await api.get("/api/orders/my");
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load orders"); }
  },

  getAll: async (): Promise<Order[]> => {
    try {
      const res = await api.get("/api/orders");
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load orders"); }
  },

  getById: async (id: number): Promise<Order> => {
    try {
      const res = await api.get(`/api/orders/${id}`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load order"); }
  },

  cancel: async (id: number): Promise<Order> => {
    try {
      const res = await api.post(`/api/orders/${id}/cancel`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to cancel order"); }
  },
};
