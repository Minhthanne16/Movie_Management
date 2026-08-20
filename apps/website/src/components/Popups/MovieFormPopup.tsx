import React, { useState, useEffect } from "react";
import { X, Plus, Film, Clock, Star, Calendar, Type, Image as ImageIcon, Hash, Save } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Movie } from "../../types/movie";

interface MovieFormPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (movie: Movie | Partial<Movie>) => void;
  movieToEdit?: Movie | null; 
}

const MovieFormPopup: React.FC<MovieFormPopupProps> = ({ isOpen, onClose, onSave, movieToEdit }) => {
  const isEditMode = !!movieToEdit;

  const [formData, setFormData] = useState<Partial<Movie>>({} as Partial<Movie>);

  useEffect(() => {
    if (movieToEdit) {
      setFormData({
        id: movieToEdit.id,
        title: movieToEdit.title,
        description: movieToEdit.description ?? "",
        duration_minutes: movieToEdit.durationMinutes,
        rating: movieToEdit.rating ?? "",
        genre: movieToEdit.genre ?? "",
        poster_url: movieToEdit.posterUrl,
        release_date: movieToEdit.releaseDate ?? "",
      } as Partial<Movie>);
    } else {
      setFormData({
        title: "",
        description: "",
        duration_minutes: 120,
        rating: "",
        genre: "",
        poster_url: "",
        release_date: new Date().toISOString().split('T')[0]
      } as Partial<Movie>);
    }
  }, [movieToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-tickify-card border border-white/10 rounded-[3rem] p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-tickify-pink/20 rounded-2xl">
                  {isEditMode ? <Save className="text-tickify-pink" /> : <Plus className="text-tickify-pink" />}
                </div>
                <h2 className="text-2xl font-display font-bold text-white">
                  {isEditMode ? "Edit Movie" : "Add New Movie"}
                </h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Trường ID - Chỉ hiển thị khi Edit và không được sửa */}
              {isEditMode && (
                <div className="space-y-2 opacity-60">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Hash size={12} /> Movie Database ID (Read Only)
                  </label>
                  <input 
                    readOnly 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-400 cursor-not-allowed outline-none"
                    value={`ID #${formData.id}`}
                  />
                </div>
              )}

              {/* Row 1: Title & Genre */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Type size={12} /> Movie Title
                  </label>
                  <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-tickify-pink outline-none transition-all" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Film size={12} /> Genre
                  </label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-tickify-pink outline-none transition-all" value={formData.genre || ""} onChange={e => setFormData({...formData, genre: e.target.value})} />
                </div>
              </div>

              {/* Row 2: Poster URL */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon size={12} /> Poster Image URL
                </label>
                <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-tickify-pink outline-none transition-all" value={formData.poster_url} onChange={e => setFormData({...formData, poster_url: e.target.value})} />
              </div>

              {/* Row 3: Duration, Rating, Release Date */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={12} /> Duration (min)
                  </label>
                  <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-tickify-pink outline-none transition-all" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Star size={12} /> Rating
                  </label>
                  <input type="text" placeholder="PG-13, R, G..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-tickify-pink outline-none transition-all" value={(formData as {rating?: string}).rating ?? ""} onChange={e => setFormData({...formData, rating: e.target.value} as Partial<Movie>)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} /> Release Date
                  </label>
                  <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-tickify-pink outline-none transition-all" value={formData.release_date || ""} onChange={e => setFormData({...formData, release_date: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Description</label>
                <textarea rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-tickify-pink outline-none transition-all resize-none" value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border border-white/10 font-bold text-sm text-gray-500 hover:bg-white/5 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 rounded-2xl bg-tickify-pink text-white font-bold text-sm shadow-[0_0_20px_rgba(255,0,128,0.4)] transition-all">
                  {isEditMode ? "Update Movie" : "Save Movie"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MovieFormPopup;