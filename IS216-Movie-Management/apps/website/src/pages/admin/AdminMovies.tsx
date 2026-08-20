import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import AdminMovieCard from "../admin/components/AdminMovieCard";
import MovieFormPopup from "../../components/Popups/MovieFormPopup";
import DeleteConfirmPopup from "../../components/Popups/DeleteConfirmPopup";
import { Plus } from "lucide-react";
import type { Movie } from "../../types/movie";
import { movieService } from "../../services/movie.service";

const AdminMovies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Movie | null>(null);
  const [editTarget, setEditTarget] = useState<Movie | null>(null);

  useEffect(() => {
    movieService.getAll()
      .then(setMovies)
      .catch(err => setError(typeof err === "string" ? err : "Failed to load movies"))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenAdd = () => {
    setEditTarget(null);
    setIsPopupOpen(true);
  };

  const handleOpenEdit = (movie: Movie) => {
    setEditTarget(movie);
    setIsPopupOpen(true);
  };

  // MovieFormPopup passes Partial<Movie> with legacy snake_case fields; map them to real API fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSaveMovie = async (movieData: any) => {
    try {
      const fd = new FormData();
      const title = movieData.title ?? "";
      const description = movieData.description ?? "";
      const durationMinutes = movieData.durationMinutes ?? movieData.duration_minutes ?? 120;
      const releaseDate = movieData.releaseDate ?? movieData.release_date ?? "";
      const rating = movieData.rating !== undefined ? String(movieData.rating) : "";
      const genre = movieData.genre ?? "";
      const ageRating = movieData.ageRating ?? movieData.age_rating ?? "";
      const posterUrl = movieData.posterUrl ?? movieData.poster_url ?? "";

      fd.append("title", title);
      fd.append("description", description);
      fd.append("durationMinutes", String(durationMinutes));
      if (releaseDate) fd.append("releaseDate", releaseDate);
      if (rating) fd.append("rating", rating);
      if (genre) fd.append("genre", genre);
      if (ageRating) fd.append("ageRating", ageRating);
      if (posterUrl) fd.append("posterUrl", posterUrl);

      if (editTarget) {
        const updated = await movieService.update(editTarget.id, fd);
        setMovies(prev => prev.map(m => m.id === editTarget.id ? updated : m));
      } else {
        const created = await movieService.create(fd);
        setMovies(prev => [...prev, created]);
      }
      setIsPopupOpen(false);
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to save movie");
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      try {
        await movieService.delete(deleteTarget.id);
        setMovies(prev => prev.filter(m => m.id !== deleteTarget.id));
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to delete movie");
      }
      setDeleteTarget(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-10 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2 text-white">Movie Management</h1>
            <p className="text-gray-500 font-medium">Add, update or remove movies from the catalog.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Grid Movies */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Ô Add New Movie - Giao diện Dashed */}
          <button
            onClick={() => handleOpenAdd()}
            className="group relative aspect-2/3 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-tickify-pink/50 hover:bg-tickify-pink/5 transition-all duration-500"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-tickify-pink/20 transition-all">
              <Plus size={32} className="text-gray-500 group-hover:text-tickify-pink" />
            </div>
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest group-hover:text-tickify-pink">
              Add New Movie
            </span>
          </button>

          {/* Loading skeletons */}
          {loading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-2/3 bg-white/5 rounded-[2.5rem] animate-pulse" />
          ))}

          {/* Danh sách phim */}
          {!loading && movies.map((movie) => (
            <AdminMovieCard
              key={movie.id}
              movie={movie}
              onEdit={() => handleOpenEdit(movie)}
              onDelete={() => setDeleteTarget(movie)}
            />
          ))}

        </div>
      </div>

      {/* Popup Thêm phim */}
      <MovieFormPopup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
        onSave={handleSaveMovie} 
        movieToEdit={editTarget}
      />

      <DeleteConfirmPopup 
        isOpen={!!deleteTarget}
        movieTitle={deleteTarget?.title || ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </AdminLayout>
  );
};

export default AdminMovies;