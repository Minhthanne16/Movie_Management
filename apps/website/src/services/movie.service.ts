import api from "./api";
import type { Movie } from "../types/movie";
import { extractErrorMessage } from "../utils/error";

const MOCK_MOVIES: Movie[] = [
  {
    id: 1,
    title: "Dune: Part Two",
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    durationMinutes: 166,
    releaseDate: "2024-03-01",
    rating: "8.6",
    genre: "Sci-Fi · Adventure",
    ageRating: "T16",
    posterUrl:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop",
    trailerUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
  {
    id: 2,
    title: "Cyberpunk: Neon Genesis",
    description:
      "In the sprawling metropolis of Neo-Tokyo, a cyber-enhanced detective hunts down a rogue AI syndicate.",
    durationMinutes: 142,
    releaseDate: "2024-05-15",
    rating: "8.9",
    genre: "Action · Cyberpunk",
    ageRating: "T18",
    posterUrl:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop",
    trailerUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
  {
    id: 3,
    title: "Interstellar: Beyond Time",
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    durationMinutes: 169,
    releaseDate: "2024-04-10",
    rating: "8.7",
    genre: "Sci-Fi · Drama",
    ageRating: "P",
    posterUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
    trailerUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
  {
    id: 4,
    title: "Avatar: Fire and Ash",
    description:
      "Jake Sully and Neytiri encounter a new, aggressive volcanic clan of Na'vi known as the Ash People.",
    durationMinutes: 180,
    releaseDate: "2025-12-19",
    rating: "8.4",
    genre: "Sci-Fi · Action",
    ageRating: "T13",
    posterUrl:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    trailerUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: null,
  },
];

export const movieService = {
  getAll: async (): Promise<Movie[]> => {
    try {
      const res = await api.get("/api/movies");
      return res.data.data;
    } catch {
      return MOCK_MOVIES;
    }
  },

  getNowShowing: async (): Promise<Movie[]> => {
    try {
      const res = await api.get("/api/movies/now-showing");
      return res.data.data;
    } catch {
      return MOCK_MOVIES;
    }
  },

  getById: async (id: number): Promise<Movie> => {
    try {
      const res = await api.get(`/api/movies/${id}`);
      return res.data.data;
    } catch {
      const found = MOCK_MOVIES.find((m) => m.id === id);
      if (found) return found;
      return MOCK_MOVIES[0];
    }
  },

  create: async (formData: FormData): Promise<Movie> => {
    try {
      const res = await api.post("/api/movies", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (e) {
      throw extractErrorMessage(e, "Failed to create movie");
    }
  },

  update: async (id: number, formData: FormData): Promise<Movie> => {
    try {
      const res = await api.put(`/api/movies/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (e) {
      throw extractErrorMessage(e, "Failed to update movie");
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/api/movies/${id}`);
    } catch (e) {
      throw extractErrorMessage(e, "Failed to delete movie");
    }
  },

  uploadPoster: async (file: File): Promise<{ posterUrl: string }> => {
    try {
      const formData = new FormData();
      formData.append("poster", file);
      const res = await api.post("/api/movies/poster", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.data;
    } catch (e) {
      throw extractErrorMessage(e, "Failed to upload poster");
    }
  },
};
