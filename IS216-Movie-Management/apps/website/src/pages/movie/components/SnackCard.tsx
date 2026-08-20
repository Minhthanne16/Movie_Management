import React from "react";
import { Plus, Minus} from "lucide-react";
import { motion } from "motion/react";

interface SnackItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isPopular?: boolean;
}

interface SnackCardProps {
  key?: React.Key;
  snack: SnackItem;
  quantity: number;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}


export default function SnackCard({ snack, quantity, onAdd, onRemove }: SnackCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-tickify-card border border-white/5 rounded-2xl p-4 flex gap-4 hover:border-tickify-pink/30 transition-all duration-300 group"
    >
      <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-white/5">
        <img 
          src={snack.image} 
          alt={snack.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        {snack.isPopular && (
          <div className="absolute top-0 left-0 bg-orange-500 text-[8px] font-black text-white px-2 py-1 rounded-br-lg uppercase tracking-widest">
            Popular
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-sm font-bold group-hover:text-tickify-pink transition-colors">{snack.name}</h4>
            <span className="text-sm font-bold text-white">₫{Number(snack.price).toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-gray-500 font-medium line-clamp-2">{snack.description}</p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3 bg-white/5 rounded-lg p-1 border border-white/5">
            <button 
              onClick={() => onRemove(snack.id)}
              disabled={quantity === 0}
              className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                quantity > 0 ? "text-white hover:bg-white/10" : "text-gray-600"
              }`}
            >
              <Minus size={14} />
            </button>
            <span className="text-xs font-bold w-4 text-center">{quantity}</span>
            <button 
              onClick={() => onAdd(snack.id)}
              className="w-6 h-6 rounded-md flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          
          <button 
            onClick={() => onAdd(snack.id)}
            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              quantity > 0 
                ? "bg-tickify-pink text-white shadow-[0_0_10px_rgba(255,0,128,0.3)]" 
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {quantity > 0 ? "Added" : "Add"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
