export interface Movie {
  id: number;
  title: string;
  description: string | null;
  durationMinutes: number;
  releaseDate: string | null;
  rating: string | null;
  genre: string | null;
  ageRating: string | null;
  posterUrl: string;
  trailerUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
}
