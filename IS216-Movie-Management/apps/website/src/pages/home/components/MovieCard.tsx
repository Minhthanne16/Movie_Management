import React from "react";
import { Star } from "lucide-react";

interface MovieCardProps {
  title: string;
  posterUrl: string;
  rating: string | number;
  genre?: string;
  isNew?: boolean;
}
const MovieCard: React.FC<MovieCardProps> = ({
  title,
  posterUrl,
  rating,
  genre,
  isNew,
}) => {
  return (
    <div className="group cursor-pointer">
      {/* Container Ảnh */}
      <div className="relative aspect-2/3 overflow-hidden rounded-2xl border border-white/5 transition-all duration-500 group-hover:border-tickify-pink/50 group-hover:shadow-[0_0_30px_rgba(255,0,128,0.2)">
        {/* Poster Image */}
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay phủ nhẹ để làm nổi bật badge */}
        <div className="absolute inset-0 bg-linear-to-t from-tickify-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {isNew && (
          <div className="absolute top-3 left-3 bg-tickify-pink text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-lg shadow-tickify-pink/20 uppercase tracking-wider">
            New
          </div>
        )}
        {!isNew && genre && (
          <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-md text-white text-[10px] font-medium px-2.5 py-1 rounded-md border border-white/10 uppercase tracking-wider">
            {genre}
          </div>
        )}
        <div className="absolute top-3 right-3 bg-[#FFB800]/20 backdrop-blur-md border border-[#FFB800]/50 text-[#FFB800] text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-lg">
          <Star size={10} fill="currentColor" />
          {rating}
        </div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-tickify-pink text-sm font-semibold tracking-wide transition-colors duration-300 group-hover:text-white truncate px-2">
          {title}
        </h3>
      </div>
    </div>
  );
};

const movies: MovieCardProps[] = [
  {
    title: "The Conjuring: Last Rites",
    posterUrl:
      "https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/1800x/71252117777b696995f01934522c402d/4/7/470wx700h-conjuring.jpg",
    rating: "9.2",
    isNew: true,
  },
  {
    title: "Deadpool & Wolverine",
    posterUrl:
      "https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2024/7/18/deadpool-1721299124513856651289.jpg",
    rating: "8.8",
    isNew: false,
    genre: "Action",
  },
];
const MovieSection: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
      {movies.map((movie, index) => (
        <MovieCard key={index} {...movie} />
      ))}
    </div>
  );
};

export default MovieSection;
