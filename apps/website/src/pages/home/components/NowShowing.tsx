import { useEffect, useState } from "react";
import { Star, Search } from "lucide-react";
import { movieService } from "../../../services/movie.service";
import type { Movie } from "../../../types/movie";

export default function NowShowing() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    movieService.getNowShowing()
      .then(setMovies)
      .catch(err => setError(typeof err === "string" ? err : "Failed to load movies"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="px-8 py-12">
      {/* Search Bar */}
      <div className="relative max-w-4xl mx-auto mb-20">
        <div className="relative flex items-center">
          <div className="absolute left-6 text-gray-500">
            <Search size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search the digital cosmos for movies, genres, or actors..." 
            className="w-full bg-tickify-card border border-white/10 rounded-full py-5 pl-16 pr-40 text-sm focus:outline-none focus:border-tickify-pink/50 transition-all"
          />
          <button className="absolute right-2 bg-tickify-pink hover:bg-tickify-pink/90 text-white px-8 py-3 rounded-full font-bold text-sm transition-all shadow-[0_0_15px_rgba(255,0,128,0.3)]">
            Search Movies
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-display font-bold">Now Showing in the Digital Realm</h2>
        <button className="text-sm font-bold text-gray-400 hover:text-white transition-colors border border-white/10 rounded-lg px-4 py-2">
          View All Movies
        </button>
      </div>

      {error ? (
        <div className="text-center p-8 text-red-400 font-medium">{error}</div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-2/3 rounded-4xl bg-white/5 mb-4" />
              <div className="h-4 bg-white/5 rounded w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {movies.map((movie) => (
            <div key={movie.id} className="group cursor-pointer">
              <div className="relative aspect-2/3 rounded-4xl overflow-hidden mb-4 border border-white/5 transition-all duration-500 group-hover:border-tickify-pink/50 group-hover:shadow-[0_0_30px_rgba(255,0,128,0.2)]">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />

                {/* Badges */}
                <div className="absolute top-6 left-6 flex items-center gap-2">
                  <span className="bg-tickify-pink text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md shadow-lg">New</span>
                </div>

                {movie.rating && (
                  <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md border border-white/20 rounded-lg px-2 py-1.5 flex items-center gap-1.5">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold">{movie.rating}</span>
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-tickify-dark via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                  <button className="w-full bg-white text-black font-bold py-4 rounded-xl transition-transform translate-y-4 group-hover:translate-y-0 duration-500">
                    Quick Book
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-display font-bold group-hover:text-tickify-pink transition-colors px-2">{movie.title}</h3>
              <p className="text-xs text-gray-500 px-2 mt-1">{movie.genre} · {movie.durationMinutes} min</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
