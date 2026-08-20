import React from "react";
import { Edit2, Trash2, Zap } from "lucide-react";
import type { FoodItem } from "../../../types/food";

interface FoodCardProps {
  item: FoodItem;
  onEdit: (item: FoodItem) => void;
  onDelete: (item: FoodItem) => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ item, onEdit, onDelete }) => {
  return (
    <div className="bg-tickify-card border border-white/5 rounded-4xl overflow-hidden group hover:border-tickify-pink/30 transition-all duration-500 shadow-xl">
      {/* Image Section */}
      <div className="relative aspect-4/3 overflow-hidden bg-[#1a1a1c]">
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
        />
        {item.is_popular && (
          <div className="absolute top-4 left-4 bg-tickify-pink/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full flex items-center gap-1 shadow-[0_0_15px_rgba(255,0,128,0.4)]">
            <Zap size={10} fill="currentColor" />
            Popular
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-tickify-pink transition-colors">
            {item.name}
          </h3>
          <p className="text-gray-500 text-xs line-clamp-2 font-medium">
            {item.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-orange-500/20 text-orange-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
            {item.category}
          </span>
          <span className="text-white font-bold">
            ₫{item.price.toLocaleString()}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onEdit(item)}
            className="flex-1 bg-linear-to-r from-tickify-pink to-tickify-purple text-white text-xs font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(255,0,128,0.2)] hover:shadow-[0_0_20px_rgba(255,0,128,0.4)] transition-all flex items-center justify-center gap-2"
          >
            <Edit2 size={14} />
            Edit
          </button>
          <button
            onClick={() => onDelete(item)}
            className="px-4 bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all rounded-xl flex items-center justify-center"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;