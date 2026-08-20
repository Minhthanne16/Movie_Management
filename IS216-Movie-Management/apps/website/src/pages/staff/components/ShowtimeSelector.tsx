import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Film,
  Clock3,
  MonitorPlay,
  CalendarDays,
} from "lucide-react";

import type { Movie } from "../../../types/movie";
import type { Showtime } from "../../../types/showtime";

interface ShowtimeSelectorProps {
  movies: Movie[];
  showtimes: Showtime[];
  onSelectShowtime: (showtime: Showtime) => void;
  onMovieSelect?: (movieId: number) => void;
}

const ShowtimeSelector: React.FC<ShowtimeSelectorProps> = ({
  movies,
  showtimes,
  onSelectShowtime,
  onMovieSelect,
}) => {
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  const selectMovie = (id: number) => {
    setSelectedMovieId(id);
    onMovieSelect?.(id);
  };

  // Auto select first movie
  useEffect(() => {
    if (movies.length > 0 && selectedMovieId === null) {
      selectMovie(movies[0].id);
    }
  }, [movies, selectedMovieId]);

  // Filter showtimes by selected movie
  const filteredShowtimes = useMemo(() => {
    if (!selectedMovieId) {
      return [];
    }

    return showtimes
      .filter((showtime) => showtime.movieId === selectedMovieId)
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() -
          new Date(b.startTime).getTime(),
      );
  }, [showtimes, selectedMovieId]);

  const selectedMovie = useMemo(() => {
    return movies.find((movie) => movie.id === selectedMovieId) || null;
  }, [movies, selectedMovieId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.06] bg-slate-900/60 backdrop-blur-xl px-6 py-6 shadow-2xl"
    >
      {/* Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-tickify-cyan/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-tickify-cyan/10 border border-tickify-cyan/20 flex items-center justify-center text-tickify-cyan shadow-[0_0_20px_rgba(0,255,242,0.15)]">
            <CalendarDays size={20} />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-500 font-black">
              Quick Showtime Selector
            </p>

            <h2 className="text-2xl font-display font-bold text-white">
              Today Showtimes
            </h2>
          </div>
        </div>

        {/* Movies */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Film size={14} className="text-tickify-cyan" />

            <p className="text-xs uppercase tracking-[0.25em] text-gray-500 font-black">
              Movies
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {movies.map((movie) => {
              const isActive = selectedMovieId === movie.id;

              return (
                <button
                  key={movie.id}
                  onClick={() => selectMovie(movie.id)}
                  className={`group relative overflow-hidden rounded-2xl border px-5 py-3 transition-all duration-300 ${
                    isActive
                      ? "bg-tickify-cyan text-tickify-dark border-tickify-cyan shadow-[0_0_25px_rgba(0,255,242,0.25)]"
                      : "bg-white/[0.03] border-white/[0.06] text-gray-400 hover:bg-white/[0.05] hover:border-white/10"
                  }`}
                >
                  {/* Active Glow */}
                  {isActive && (
                    <div className="absolute inset-0 bg-linear-to-r from-white/10 to-transparent pointer-events-none" />
                  )}

                  <div className="relative z-10 flex items-center gap-3">
                    {movie.posterUrl && (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-10 h-14 rounded-lg object-cover shadow-lg"
                      />
                    )}

                    <div className="text-left">
                      <p className="font-bold text-sm leading-tight">
                        {movie.title}
                      </p>

                      <p
                        className={`text-[10px] uppercase tracking-widest mt-1 ${
                          isActive
                            ? "text-tickify-dark/70"
                            : "text-gray-500"
                        }`}
                      >
                        {movie.genre || "Now Showing"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Showtime Pills */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock3 size={14} className="text-tickify-cyan" />

            <p className="text-xs uppercase tracking-[0.25em] text-gray-500 font-black">
              Available Showtimes
            </p>
          </div>

          {filteredShowtimes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-10 text-center">
              <p className="text-sm text-gray-500 font-medium">
                No showtimes available.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {filteredShowtimes.map((showtime) => (
                <button
                  key={showtime.id}
                  onClick={() => onSelectShowtime(showtime)}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] hover:bg-tickify-cyan hover:text-tickify-dark hover:border-tickify-cyan transition-all duration-300 px-5 py-4 min-w-[140px]"
                >
                  {/* Hover Glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-r from-white/10 to-transparent pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock3 size={14} />

                      <span className="text-lg font-display font-bold">
                        {new Date(showtime.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-black opacity-70">
                      <MonitorPlay size={12} />

                      <span>
                        {showtime.roomName ?? `Room ${showtime.roomId}`}
                      </span>
                    </div>

                    <div className="mt-2 text-center">
                      <span className="inline-flex px-2 py-1 rounded-full bg-black/10 text-[9px] uppercase tracking-widest font-black">
                        ₫{Number(showtime.basePrice).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current Selected Movie Info */}
        {selectedMovie && (
          <div className="rounded-[2rem] border border-white/[0.06] bg-white/[0.03] p-5 flex flex-col lg:flex-row gap-5">
            {selectedMovie.posterUrl && (
              <img
                src={selectedMovie.posterUrl}
                alt={selectedMovie.title}
                className="w-full lg:w-28 h-40 lg:h-36 rounded-2xl object-cover shadow-xl"
              />
            )}

            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">
                    {selectedMovie.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span>{selectedMovie.genre}</span>

                    <span>•</span>

                    <span>{selectedMovie.durationMinutes} mins</span>

                    <span>•</span>

                    <span>{selectedMovie.rating}</span>
                  </div>
                </div>

                <div className="px-4 py-2 rounded-2xl bg-tickify-cyan/10 border border-tickify-cyan/20 text-tickify-cyan text-xs font-black uppercase tracking-widest">
                  Active Selection
                </div>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                {selectedMovie.description ||
                  "Now showing in cinemas today."}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ShowtimeSelector;