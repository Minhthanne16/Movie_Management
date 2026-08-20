import { useEffect, useState } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BookingSteps from "./components/BookingSteps.tsx";
import SnackCard from "./components/SnackCard.tsx";
import SnackSummary from "./components/SnackSummary.tsx";
import { foodService } from "../../services/food.service";
import { orderService } from "../../services/order.service";
import { useBooking } from "../../contexts/BookingContext";
import type { FoodItem } from "../../types/food";
import { CATEGORY_LABELS } from "../../types/food";

const STEPS = [
  { id: 1, label: "Movies" },
  { id: 2, label: "Theater" },
  { id: 3, label: "Seats" },
  { id: 4, label: "Snacks" },
  { id: 5, label: "Payment" },
  { id: 6, label: "Confirmation" },
];

// Adapter: convert FoodItem (numeric id, imageUrl) to the shape SnackCard/SnackSummary expect (string id, image)
function toSnackShape(food: FoodItem) {
  return {
    id: String(food.id),
    name: food.name,
    description: food.description,
    price: food.price,
    image: food.imageUrl,
  };
}

export default function Snacks() {
  const navigate = useNavigate();
  const { bookingId, setOrderId, movieTitle } = useBooking();

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selectedSnacks, setSelectedSnacks] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      navigate("/seats");
      return;
    }
    let mounted = true;
    foodService
      .getAll()
      .then(data => { if (mounted) setFoods(data); })
      .catch(err => { if (mounted) setError(typeof err === "string" ? err : "Failed to load food"); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [bookingId, navigate]);

  const handleAdd = (id: string) => {
    setSelectedSnacks((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleRemove = (id: string) => {
    setSelectedSnacks((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - 1),
    }));
  };

  const handleContinue = async () => {
    if (!bookingId) return;
    const cartItems = Object.entries(selectedSnacks)
      .filter(([, qty]) => qty > 0)
      .map(([idStr, quantity]) => ({ foodItemId: Number(idStr), quantity }));

    if (cartItems.length === 0) {
      navigate("/payment");
      return;
    }
    setSubmitting(true);
    try {
      const order = await orderService.place({ bookingId, items: cartItems });
      setOrderId(order.id);
      navigate("/payment");
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  // Group foods by category
  const grouped = foods.reduce<Record<string, FoodItem[]>>((acc, food) => {
    const key = food.category ?? "OTHER";
    if (!acc[key]) acc[key] = [];
    acc[key].push(food);
    return acc;
  }, {});

  const snackShapes = foods.map(toSnackShape);

  return (
    <div className="pb-20">
      <BookingSteps currentStep={4} steps={STEPS} />

      <div className="px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">
              Add Snacks & Drinks
            </h1>
            <p className="text-gray-500 font-medium">
              Skip the queue! Pre-order your favorite cinema treats
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/seats")}
              className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Seats
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl px-6 py-4 text-sm text-red-400 font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-tickify-pink border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Snacks Menu */}
            <div className="lg:col-span-2 space-y-8">
              {/* Skip Queue Banner */}
              <div className="bg-tickify-cyan/5 border border-tickify-cyan/20 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-tickify-cyan/10 rounded-xl flex items-center justify-center">
                  <Clock size={24} className="text-tickify-cyan" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-tickify-cyan">
                    Skip the Queue!
                  </h4>
                  <p className="text-xs text-gray-400">
                    Pre-order your snacks and pick them up at our express
                    counter. Save time and never miss a moment of your movie!
                  </p>
                </div>
              </div>

              {/* Foods grouped by category */}
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">
                    {CATEGORY_LABELS[category] ?? category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {items.map((food) => (
                      <SnackCard
                        key={food.id}
                        snack={toSnackShape(food)}
                        quantity={selectedSnacks[String(food.id)] || 0}
                        onAdd={handleAdd}
                        onRemove={handleRemove}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {foods.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-12">
                  No food items available at this time.
                </p>
              )}
            </div>

            <div className="lg:col-span-1">
              <SnackSummary
                selectedSnacks={selectedSnacks}
                snacks={snackShapes}
                ticketPrice={0}
                movieTitle={movieTitle ?? undefined}
                onContinue={submitting ? () => {} : handleContinue}
                onSkip={() => navigate("/payment")}
              />
              {submitting && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
                  <div className="w-4 h-4 border-2 border-tickify-pink border-t-transparent rounded-full animate-spin" />
                  Placing order…
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
