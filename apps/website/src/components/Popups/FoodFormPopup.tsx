import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Plus, Minus, Popcorn, CupSoda, Candy, Combine, Zap } from "lucide-react";
import type { FoodItem, FoodCategory } from "../../types/food";

interface FoodFormPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<FoodItem>) => void;
  itemToEdit?: FoodItem | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CATEGORIES: { value: FoodCategory; icon: any }[] = [
  { value: "Popcorn", icon: Popcorn },
  { value: "Drinks", icon: CupSoda },
  { value: "Candy", icon: Candy },
  { value: "Combos", icon: Combine },
];

const FoodFormPopup: React.FC<FoodFormPopupProps> = ({ isOpen, onClose, onSave, itemToEdit }) => {
  const [formData, setFormData] = useState<Partial<FoodItem>>({
    name: "",
    description: "",
    price: 0,
    category: "Popcorn",
    image_url: "",
    is_popular: false,
  });

  useEffect(() => {
    if (itemToEdit) {
      setFormData(itemToEdit);
    } else {
      setFormData({ name: "", description: "", price: 0, category: "Popcorn", image_url: "", is_popular: false });
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          // FIX: Thêm h-full max-h-[90vh] và flex flex-col để chia Header/Body/Footer
          className="relative w-full max-w-lg max-h-[90vh] bg-tickify-dark border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Decorative Background Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-tickify-pink/10 blur-[100px] pointer-events-none" />

          {/* 1. HEADER (Fixed) */}
          <div className="relative z-10 flex justify-between items-center p-8 pb-4 border-b border-white/5">
            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight">
              {itemToEdit ? "Edit Item" : "Add New Item"}
            </h2>
            <button 
              type="button" 
              onClick={onClose} 
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white cursor-pointer"
            >
              <X size={24} />
            </button>
          </div>

          {/* 2. BODY (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-6 custom-scrollbar">
            {/* Image URL Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Image URL</label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-tickify-pink focus:outline-none transition-all text-sm"
                placeholder="https://..."
              />
            </div>

            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Item Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-tickify-pink focus:outline-none transition-all font-medium"
                placeholder="e.g. Large Popcorn"
              />
            </div>

            {/* Category Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Category</label>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-xs font-bold ${
                      formData.category === cat.value 
                      ? "bg-tickify-cyan/10 border-tickify-cyan text-tickify-cyan shadow-[0_0_15px_rgba(0,255,242,0.1)]" 
                      : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    <cat.icon size={16} />
                    {cat.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Stepper */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Price (₫)</label>
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-2">
                <button 
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, price: Math.max(0, (p.price || 0) - 5) }))}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-tickify-pink transition-all"
                >
                  <Minus size={18} />
                </button>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="flex-1 bg-transparent text-center text-xl font-bold text-white focus:outline-none"
                />
                <button 
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, price: (p.price || 0) + 5 }))}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-tickify-cyan transition-all"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-tickify-pink focus:outline-none transition-all font-medium resize-none text-sm"
              />
            </div>

            {/* Popular Toggle */}
            <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4 transition-all hover:border-tickify-pink/30">
              <div className="flex items-center gap-3 text-white">
                <Zap size={18} className={formData.is_popular ? "text-tickify-pink fill-tickify-pink" : "text-gray-500"} />
                <span className="text-sm font-bold">Popular Choice</span>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_popular: !formData.is_popular })}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${formData.is_popular ? 'bg-tickify-pink shadow-[0_0_10px_rgba(255,0,128,0.5)]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${formData.is_popular ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* 3. FOOTER (Fixed) */}
          <div className="p-8 pt-4 border-t border-white/5 bg-tickify-dark relative z-10">
            <button
              onClick={() => onSave(formData)}
              className="w-full bg-linear-to-r from-tickify-pink to-tickify-purple text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,0,128,0.3)] hover:shadow-[0_0_30px_rgba(255,0,128,0.5)] transition-all"
            >
              <Save size={20} />
              Save Item Details
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FoodFormPopup;