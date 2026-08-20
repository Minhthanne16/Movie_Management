import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DeleteConfirmPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  movieTitle: string;
}

const DeleteConfirmPopup: React.FC<DeleteConfirmPopupProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  movieTitle 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md bg-tickify-card border border-white/10 rounded-[2.5rem] p-8 shadow-2xl text-center"
          >
            {/* Warning Icon */}
            <div className="w-20 h-20 bg-tickify-pink/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(255,0,128,0.2)]">
              <AlertTriangle size={40} className="text-tickify-pink" />
            </div>

            <h2 className="text-2xl font-display font-bold text-white mb-4">Are you sure?</h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              You are about to delete <span className="text-white font-bold">&quot;{movieTitle}&quot;</span>. 
              This action cannot be undone.
            </p>

            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl border border-white/10 font-bold text-sm text-gray-500 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => { onConfirm(); onClose(); }}
                className="flex-1 py-4 rounded-2xl bg-tickify-pink text-white font-bold text-sm shadow-[0_0_20px_rgba(255,0,128,0.4)] hover:bg-tickify-pink/80 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={18} /> Delete Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmPopup;