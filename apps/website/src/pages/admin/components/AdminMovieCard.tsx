import React from "react";
import { Star, Clock, Edit3, Trash2, Calendar } from "lucide-react";
import { motion } from "motion/react";
import type { Movie } from "../../../types/movie";

interface AdminMovieCardProps {
  movie: Movie;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onClick?: (movie: Movie) => void;
}

const AdminMovieCard: React.FC<AdminMovieCardProps> = ({ 
  movie, 
  onEdit, 
  onDelete, 
  onClick 
}) => {
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="bg-tickify-card border border-white/5 rounded-lg overflow-hidden group hover:border-tickify-pink/30 transition-all duration-500 shadow-xl cursor-pointer flex flex-col h-full"
      onClick={() => onClick?.(movie)}
    >
      {/* Phần Poster Image */}
      <div className="relative aspect-2/3 overflow-hidden">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlay gradient phủ phía trên */}
        <div className="absolute inset-0 bg-linear-to-t from-tickify-dark via-transparent to-transparent opacity-60" />

        {/* Badge Rating - Góc trên phải */}
        <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md border border-[#FFB800]/50 rounded-lg px-2 py-1.5 flex items-center gap-1.5 shadow-lg">
          <Star size={14} className="text-[#FFB800] fill-[#FFB800]" />
          <span className="text-xs font-bold text-[#FFB800]">{movie.rating}</span>
        </div>

        {/* Nút tác nhanh khi hover (Edit/Delete) */}
        <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
            <button 
                onClick={(e) => { e.stopPropagation(); onEdit?.(movie.id); }}
                className="p-4 bg-tickify-cyan text-white rounded-2xl hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,210,255,0.4)]"
                title="Sửa phim"
            >
                <Edit3 size={20} />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete?.(movie.id); }}
                className="p-4 bg-tickify-pink text-white rounded-2xl hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,0,128,0.4)]"
                title="Xóa phim"
            >
                <Trash2 size={20} />
            </button>
        </div>
      </div>

      {/* 2. Phần thông tin phim */}
      <div className="p-8 flex flex-col grow">
        <div className="grow">
            <p className="text-[10px] font-black text-tickify-pink uppercase tracking-[0.2em] mb-3">
              {movie.genre || "General"}
            </p>

            <h3 className="text-2xl font-display font-bold text-white mb-4 group-hover:text-tickify-pink transition-colors line-clamp-1">
              {movie.title}
            </h3>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-bold mb-6">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-tickify-cyan" />
                {movie.durationMinutes} min
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-tickify-purple" />
                {formatDate(movie.releaseDate)}
              </div>
            </div>
        </div>

        {/* 3. Phần Metadata (Hiển thị nhẹ nhàng phía cuối card) */}
        <div className="pt-6 border-t border-white/5 mt-auto">
            <div className="flex items-center justify-between text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                <span>ID: #{movie.id}</span>
                {movie.updatedAt ? (
                    <span>Updated: {formatDate(movie.updatedAt)}</span>
                ) : (
                    <span>Created: {formatDate(movie.createdAt)}</span>
                )}
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminMovieCard;