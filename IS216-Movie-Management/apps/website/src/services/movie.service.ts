import api from "./api";
import type { Movie } from "../types/movie";
import { extractErrorMessage } from "../utils/error";

export const movieService = {
  getAll: async (): Promise<Movie[]> => {
    try {
      const res = await api.get("/api/movies");
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load movies"); }
  },

  getNowShowing: async (): Promise<Movie[]> => {
    try {
      const res = await api.get("/api/movies/now-showing");
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load now-showing movies"); }
  },

  getById: async (id: number): Promise<Movie> => {
    try {
      const res = await api.get(`/api/movies/${id}`);
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to load movie"); }
  },

  create: async (formData: FormData): Promise<Movie> => {
    try {
      const res = await api.post("/api/movies", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to create movie"); }
  },

  update: async (id: number, formData: FormData): Promise<Movie> => {
    try {
      const res = await api.put(`/api/movies/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to update movie"); }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/movies/${id}`);
    } catch (e) { throw extractErrorMessage(e, "Failed to delete movie"); }
  },

  uploadPoster: async (file: File): Promise<{ posterUrl: string }> => {
    try {
      const formData = new FormData();
      formData.append("poster", file);
      const res = await api.post("/api/movies/poster", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (e) { throw extractErrorMessage(e, "Failed to upload poster"); }
  },
};
