import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import AdminFoodCard from "../home/components/FoodCard";
import {
  Plus,
  LayoutGrid,
  Popcorn,
  CupSoda,
  Candy,
  Combine,
  Users,
  type LucideIcon, // Thêm type này để fix lỗi 'any'
} from "lucide-react";
import type { FoodItem, FoodCategory } from "../../types/food";
import FoodFormPopup from "../../components/Popups/FoodFormPopup";
import { foodService } from "../../services/food.service";

// Fix lỗi 'any' bằng cách định nghĩa type LucideIcon
const CATEGORIES: { label: FoodCategory; icon: LucideIcon }[] = [
  { label: "All Items", icon: LayoutGrid },
  { label: "Combos", icon: Combine },
  { label: "Couple Sets", icon: Users },
  { label: "Popcorn", icon: Popcorn },
  { label: "Drinks", icon: CupSoda },
  { label: "Candy", icon: Candy },
];

const AdminFoods: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FoodCategory>("All Items");
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FoodItem | null>(null);

  useEffect(() => {
    foodService.getAll()
      .then(setFoods)
      .catch(err => setError(typeof err === "string" ? err : "Failed to load food items"))
      .finally(() => setLoading(false));
  }, []);

  const filteredFoods =
    activeTab === "All Items"
      ? foods
      : foods.filter((f) => f.category === activeTab);

  const handleOpenAdd = () => {
    setEditTarget(null);
    setIsPopupOpen(true);
  };

  const handleOpenEdit = (item: FoodItem) => {
    setEditTarget(item);
    setIsPopupOpen(true);
  };

  // --- LOGIC XÓA ---
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await foodService.delete(id);
        setFoods((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        setError(typeof err === "string" ? err : "Failed to delete food item");
      }
    }
  };

  // --- LOGIC LƯU (THÊM & SỬA) ---
  // FoodFormPopup passes data with legacy field names (image_url, is_popular); map them
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSave = async (data: any) => {
    // Validation cơ bản
    if (!data.name || !data.price || !data.category) {
      alert("Please fill in all required fields (Name, Price, Category)");
      return;
    }

    try {
      if (editTarget) {
        // Update via JSON body
        const updated = await foodService.update(editTarget.id, {
          name: data.name,
          description: data.description ?? "",
          price: Number(data.price),
          category: data.category ?? null,
          imageUrl: data.imageUrl ?? data.image_url ?? editTarget.imageUrl,
          isAvailable: data.isAvailable ?? (data.is_popular !== undefined ? data.is_popular : editTarget.isAvailable),
        });
        setFoods((prev) =>
          prev.map((item) => item.id === editTarget.id ? updated : item),
        );
      } else {
        // Create via FormData
        const fd = new FormData();
        fd.append("name", data.name);
        fd.append("description", data.description ?? "");
        fd.append("price", String(data.price));
        if (data.category) fd.append("category", data.category);
        const imageUrl = data.imageUrl ?? data.image_url;
        if (imageUrl) fd.append("imageUrl", imageUrl);
        const created = await foodService.create(fd);
        setFoods((prev) => [...prev, created]);
      }
      setIsPopupOpen(false);
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to save food item");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-10 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2 text-white">
              F&B Management
            </h1>
            <p className="text-gray-500 font-medium">
              Manage cinema snacks, drinks and combo deals.
            </p>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.label;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs transition-all border ${
                  isActive
                    ? "bg-tickify-cyan/10 border-tickify-cyan text-tickify-cyan shadow-[0_0_15px_rgba(0,255,242,0.2)]"
                    : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Foods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {/* Fix cảnh báo Tailwind: aspect-[4/5] -> aspect-4/5, rounded-[2rem] -> rounded-4xl */}
          <button
            onClick={handleOpenAdd}
            className="group relative aspect-4/5 border-2 border-dashed border-white/10 rounded-4xl flex flex-col items-center justify-center gap-4 hover:border-tickify-pink/50 hover:bg-tickify-pink/5 transition-all duration-500"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:bg-tickify-pink/20 transition-all">
              <Plus
                size={32}
                className="text-gray-500 group-hover:text-tickify-pink"
              />
            </div>
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest group-hover:text-tickify-pink">
              Add New Item
            </span>
          </button>

          {/* Loading skeletons */}
          {loading && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-4/5 bg-white/5 rounded-4xl animate-pulse" />
          ))}

          {/* List Items — coerce to legacy field names that FoodCard reads */}
          {!loading && filteredFoods.map((item) => {
            // FoodCard (outside admin/) reads image_url and is_popular; bridge the real type
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const coerced = { ...item, image_url: item.imageUrl, is_popular: item.isAvailable } as any;
            return (
              <AdminFoodCard
                key={item.id}
                item={coerced}
                onEdit={() => handleOpenEdit(item)}
                onDelete={() => handleDelete(item.id)}
              />
            );
          })}

          <FoodFormPopup
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            onSave={handleSave}
            itemToEdit={editTarget}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFoods;
