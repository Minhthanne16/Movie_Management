import api from "./api";
import type { FoodItem } from "../types/food";
import { extractErrorMessage } from "../utils/error";

export interface FoodItemRequest {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable?: boolean;
  category?: string;
}

export const foodService = {
  getAll: async (): Promise<FoodItem[]> => {
    try {
      const res = await api.get("/api/food-items");
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load food items"); }
  },

  getById: async (id: number): Promise<FoodItem> => {
    try {
      const res = await api.get(`/api/food-items/${id}`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load food item"); }
  },

  create: async (formData: FormData): Promise<FoodItem> => {
    try {
      const res = await api.post("/api/food-items", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to create food item"); }
  },

  update: async (id: number, req: FoodItemRequest): Promise<FoodItem> => {
    try {
      const res = await api.put(`/api/food-items/${id}`, req);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to update food item"); }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/food-items/${id}`);
    } catch (e) { throw extractErrorMessage(e, "Failed to delete food item"); }
  },
};
