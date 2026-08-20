import React from "react";
import { Star, MapPin, Navigation, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface TheaterCardProps {
  key?: React.Key;
  name: string;
  rating: string;
  screens: string;
  location: string;
  distance: string;
  transport: string;
  amenities: string[];
  isHighlyRated?: boolean;
  isStudentFriendly?: boolean;
  onSelect?: () => void;
}
export default function TheaterCard({
  name,
  rating,
  screens,
  location,
  distance,
  transport,
  amenities,
  isHighlyRated,
  isStudentFriendly,
  onSelect,
}: TheaterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-tickify-card border border-white/5 rounded-4xl p-8 flex flex-col hover:border-tickify-pink/30 transition-all duration-500 group"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-bold px-2 py-1 rounded-md">
          <Star size={10} fill="currentColor" />
          {rating}
        </div>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          {screens} screens
        </span>
      </div>

      <h3 className="text-xl font-display font-bold mb-4 group-hover:text-tickify-pink transition-colors">
        {name}
      </h3>

      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-2 text-xs text-gray-400">
          <MapPin size={14} className="text-tickify-pink shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-bold">{location}</p>
            <p>{distance} away</p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-xs text-gray-400">
          <Navigation size={14} className="text-tickify-cyan shrink-0 mt-0.5" />
          <p>{transport}</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
          Amenities
        </p>
        <div className="flex flex-wrap gap-2">
          {amenities.map((amenity, i) => (
            <span
              key={i}
              className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-[10px] font-medium text-gray-300"
            >
              {amenity}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2 mb-8 mt-auto">
        {isHighlyRated && (
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-3 flex items-center gap-2">
            <Star size={14} className="text-orange-500 fill-orange-500" />
            <span className="text-[10px] font-bold text-orange-500">
              Highly rated by customers
            </span>
          </div>
        )}
        {isStudentFriendly && (
          <div className="bg-tickify-cyan/5 border border-tickify-cyan/20 rounded-xl p-3 flex items-center gap-2">
            <Sparkles size={14} className="text-tickify-cyan" />
            <span className="text-[10px] font-bold text-tickify-cyan">
              Student-friendly pricing available
            </span>
          </div>
        )}
      </div>

      <button
        onClick={onSelect}
        className="w-full bg-tickify-pink hover:bg-tickify-pink/90 text-white py-4 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,0,128,0.3)] hover:shadow-[0_0_30px_rgba(255,0,128,0.5)]"
      >
        Select This Theater
      </button>
    </motion.div>
  );
}
