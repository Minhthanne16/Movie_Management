import { useEffect, useState } from "react";
import StaffLayout from "../../layouts/StaffLayout";
import { motion, AnimatePresence } from "motion/react";
import {
  CupSoda,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  ArrowRight,
  CheckCircle2,
  Printer,
  ChevronRight,
  Utensils,
  CreditCard,
  Coins,
  QrCode
} from "lucide-react";

import { foodService } from "../../services/food.service";
import { orderService } from "../../services/order.service";
import type { FoodItem } from "../../types/food";

const CATEGORIES = ["All", "COMBO", "COUPLE_SET", "POPCORN", "DRINK", "CANDY"] as const;
const CATEGORY_DISPLAY: Record<string, string> = {
  All: "All",
  COMBO: "Combos",
  COUPLE_SET: "Sets",
  POPCORN: "Popcorn",
  DRINK: "Drinks",
  CANDY: "Candy",
};

type Category = (typeof CATEGORIES)[number];
type PaymentMethod = "cash" | "card" | "e-wallet";

export default function FoodPOS() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [invoiceId, setInvoiceId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    foodService.getAll().then(setFoods).catch(() => {});
  }, []);

  const handleAdd = (id: number) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleRemove = (id: number) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[id] <= 1) {
        delete updated[id];
      } else {
        updated[id]--;
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCart({});
    setCashReceived("");
    setError(null);
  };

  // Filter food items
  const filteredItems = foods.filter((item) => {
    if (!item.isAvailable) return false;
    // null category items appear under "All" but not under specific category filters
    const matchesCategory = selectedCategory === "All" || (item.category !== null && item.category === selectedCategory);
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartItems = Object.entries(cart)
    .map(([idStr, quantity]) => {
      const id = Number(idStr);
      const item = foods.find((f) => f.id === id);
      if (!item) return null;
      return { item, quantity };
    })
    .filter((x): x is { item: FoodItem; quantity: number } => x !== null);

  const subtotal = cartItems.reduce((acc, { item, quantity }) => acc + item.price * quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await orderService.place({
        bookingId: null,
        items: cartItems.map(({ item, quantity }) => ({
          foodItemId: item.id,
          quantity,
        })),
      });
      const randomId = "FB-" + Math.floor(100000 + Math.random() * 900000);
      setInvoiceId(randomId);
      setIsSuccess(true);
    } catch (err) {
      setError(typeof err === "string" ? err : "Order failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleServeNext = () => {
    setIsSuccess(false);
    clearCart();
    setInvoiceId("");
  };

  const changeDue = cashReceived ? parseFloat(cashReceived) - total : 0;

  return (
    <StaffLayout>
      <div className="space-y-10 max-w-7xl mx-auto pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-tickify-cyan mb-3">
              <CupSoda size={24} />
              <span className="text-xs font-black uppercase tracking-[0.3em]">
                F&B POS Terminal
              </span>
            </div>
            <h1 className="text-5xl font-display font-bold text-white tracking-tight">
              {isSuccess ? "Print Invoice" : "F&B Services"}
            </h1>
            <p className="text-gray-500 font-medium mt-2">
              Serving Customer at Snack Counter 02
            </p>
          </div>

          {/* Checkout Steps (Visual indication) */}
          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
            <div className={`flex items-center gap-4 group`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                !isSuccess ? "bg-tickify-cyan text-tickify-dark shadow-[0_0_15px_rgba(0,255,242,0.4)]" : "bg-tickify-cyan/20 text-tickify-cyan"
              }`}>
                1
              </div>
              <ChevronRight size={16} className="text-gray-700" />
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                isSuccess ? "bg-tickify-cyan text-tickify-dark shadow-[0_0_15px_rgba(0,255,242,0.4)]" : "bg-white/5 text-gray-600"
              }`}>
                2
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="min-h-[60vh]">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="pos-select"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 xl:grid-cols-3 gap-10"
              >
                {/* Food Grid & Selector */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Category Filter and Search */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Category Filter */}
                    <div className="bg-tickify-card/50 border border-white/5 rounded-2xl p-2 flex flex-wrap items-center gap-1.5 order-2 md:order-1">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                            selectedCategory === cat
                              ? "bg-tickify-cyan text-tickify-dark shadow-[0_0_12px_rgba(0,255,242,0.3)]"
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {CATEGORY_DISPLAY[cat] ?? cat}
                        </button>
                      ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-64 order-1 md:order-2">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="text"
                        placeholder="Search menu..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-tickify-card/50 border border-white/5 focus:border-tickify-cyan/30 rounded-2xl text-sm focus:outline-none transition-all placeholder-gray-500 text-white"
                      />
                    </div>
                  </div>

                  {/* Food List Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredItems.map((item) => {
                      const count = cart[item.id] || 0;
                      return (
                        <div
                          key={item.id}
                          className="bg-tickify-card border border-white/5 hover:border-white/10 rounded-3xl p-4 flex gap-4 transition-all duration-300 relative group overflow-hidden"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-24 h-24 rounded-2xl object-cover bg-white/5"
                          />

                          <div className="flex flex-col justify-between flex-1 min-w-0">
                            <div>
                              <h3 className="font-bold text-white text-base truncate group-hover:text-tickify-cyan transition-colors">
                                {item.name}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <span className="text-lg font-bold text-white">
                                ₫{item.price.toLocaleString()}
                              </span>

                              {count > 0 ? (
                                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-1">
                                  <button
                                    onClick={() => handleRemove(item.id)}
                                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="text-xs font-bold w-4 text-center">
                                    {count}
                                  </span>
                                  <button
                                    onClick={() => handleAdd(item.id)}
                                    className="w-7 h-7 rounded-lg bg-tickify-cyan text-tickify-dark flex items-center justify-center transition-transform hover:scale-105"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleAdd(item.id)}
                                  className="px-4 py-2 bg-white/5 hover:bg-tickify-cyan hover:text-tickify-dark border border-white/10 hover:border-transparent rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1.5"
                                >
                                  <Plus size={14} /> Add
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {filteredItems.length === 0 && (
                      <div className="col-span-full py-20 text-center">
                        <Utensils className="mx-auto text-gray-700 mb-4" size={48} />
                        <p className="text-gray-500 font-medium">No snacks found matching your search</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* F&B Invoice Panel */}
                <div className="space-y-6">
                  <div className="bg-tickify-card border border-white/10 rounded-[2.5rem] p-8 sticky top-12 shadow-2xl overflow-hidden relative flex flex-col justify-between min-h-[70vh]">
                    {/* Background Glow */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-tickify-cyan/10 rounded-full blur-3xl pointer-events-none" />

                    <div>
                      <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
                        <ShoppingCart size={20} className="text-tickify-cyan" />
                        Selected Items
                      </h3>

                      {/* Cart List */}
                      <div className="space-y-4 max-h-[30vh] overflow-y-auto mb-6 pr-2">
                        {cartItems.length > 0 ? (
                          cartItems.map(({ item, quantity }) => (
                            <div key={item.id} className="flex items-center justify-between text-xs font-bold border-b border-white/5 pb-3">
                              <div className="min-w-0 flex-1">
                                <p className="text-white truncate">{item.name}</p>
                                <p className="text-gray-500 font-medium mt-0.5">₫{item.price.toLocaleString()} x {quantity}</p>
                              </div>
                              <div className="flex items-center gap-3 ml-4">
                                <span className="text-white">₫{(item.price * quantity).toLocaleString()}</span>
                                <button
                                  onClick={() => handleRemove(item.id)}
                                  className="text-gray-500 hover:text-red-400 p-1"
                                >
                                  <Minus size={12} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-10 text-center">
                            <p className="text-xs italic text-gray-600">Cart is empty</p>
                          </div>
                        )}
                      </div>

                      {/* Error */}
                      {error && (
                        <p className="text-red-400 text-xs mb-4">{error}</p>
                      )}

                      {/* Payment Methods */}
                      {cartItems.length > 0 && (
                        <div className="border-t border-white/5 pt-6 mb-6">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                            Payment Method
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => setPaymentMethod("cash")}
                              className={`py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                                paymentMethod === "cash"
                                  ? "bg-tickify-cyan/10 border-tickify-cyan text-tickify-cyan font-bold"
                                  : "bg-white/5 border-transparent text-gray-400 hover:text-white"
                              }`}
                            >
                              <Coins size={16} />
                              <span className="text-[9px] uppercase tracking-wider">Cash</span>
                            </button>
                            <button
                              onClick={() => setPaymentMethod("card")}
                              className={`py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                                paymentMethod === "card"
                                  ? "bg-tickify-cyan/10 border-tickify-cyan text-tickify-cyan font-bold"
                                  : "bg-white/5 border-transparent text-gray-400 hover:text-white"
                              }`}
                            >
                              <CreditCard size={16} />
                              <span className="text-[9px] uppercase tracking-wider">Card</span>
                            </button>
                            <button
                              onClick={() => setPaymentMethod("e-wallet")}
                              className={`py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                                paymentMethod === "e-wallet"
                                  ? "bg-tickify-cyan/10 border-tickify-cyan text-tickify-cyan font-bold"
                                  : "bg-white/5 border-transparent text-gray-400 hover:text-white"
                              }`}
                            >
                              <QrCode size={16} />
                              <span className="text-[9px] uppercase tracking-wider">E-Wallet</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Cash input helper */}
                      {paymentMethod === "cash" && cartItems.length > 0 && (
                        <div className="bg-white/5 rounded-2xl p-4 mb-6">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-2">
                            Cash Received (₫)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="0.00"
                              value={cashReceived}
                              onChange={(e) => setCashReceived(e.target.value)}
                              className="flex-1 px-3 py-2 bg-tickify-dark border border-white/5 rounded-xl text-sm focus:outline-none focus:border-tickify-cyan/30 text-white font-bold"
                            />
                            <button
                              onClick={() => setCashReceived(Math.ceil(total).toString())}
                              className="px-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-colors"
                            >
                              Exact
                            </button>
                          </div>
                          {cashReceived && changeDue >= 0 && (
                            <div className="flex justify-between items-center mt-3 text-xs font-bold text-green-400">
                              <span>Change Due:</span>
                              <span>₫{changeDue.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      {/* Price Breakdown */}
                      <div className="space-y-2 border-t border-white/5 pt-4 mb-6">
                        <div className="flex justify-between text-xs font-medium text-gray-500">
                          <span>Subtotal</span>
                          <span>₫{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs font-medium text-gray-500">
                          <span>VAT (10%)</span>
                          <span>₫{tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/5">
                          <span>Grand Total</span>
                          <span className="text-tickify-cyan">₫{total.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Checkout Buttons */}
                      <div className="grid grid-cols-1 gap-3">
                        <button
                          disabled={submitting || cartItems.length === 0 || (paymentMethod === "cash" && (!cashReceived || changeDue < 0))}
                          onClick={handleCheckout}
                          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                            !submitting && cartItems.length > 0 && (paymentMethod !== "cash" || (cashReceived && changeDue >= 0))
                              ? "bg-tickify-cyan text-tickify-dark shadow-[0_0_20px_rgba(0,255,242,0.4)] hover:scale-[1.02] active:scale-95 cursor-pointer"
                              : "bg-white/5 text-gray-600 cursor-not-allowed"
                          }`}
                        >
                          {submitting ? "Processing..." : <>Checkout & Print <ArrowRight size={18} /></>}
                        </button>
                        {cartItems.length > 0 && (
                          <button
                            onClick={clearCart}
                            className="w-full py-3 rounded-xl font-bold text-gray-500 hover:text-white transition-all text-xs uppercase tracking-widest"
                          >
                            Clear Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Success Panel & Invoice Printing */
              <motion.div
                key="pos-invoice"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-4xl mx-auto"
              >
                {/* Left Side: Success Status */}
                <div className="bg-tickify-card border border-white/10 rounded-[3rem] p-12 text-center flex flex-col items-center justify-center gap-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 inset-x-0 h-1 bg-tickify-cyan shadow-[0_0_20px_rgba(0,255,242,0.6)]" />

                  <div className="w-24 h-24 bg-tickify-cyan/10 rounded-full flex items-center justify-center text-tickify-cyan border-2 border-tickify-cyan/30 shadow-[0_0_40px_rgba(0,255,242,0.2)]">
                    <CheckCircle2 size={48} className="animate-in zoom-in duration-500" />
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-3xl font-display font-bold text-white">
                      Order Successful
                    </h2>
                    <p className="text-gray-500 font-medium text-sm">
                      The F&B order has been submitted. The invoice is printing on the thermal printer.
                    </p>
                  </div>

                  <div className="w-full border-t border-white/5 pt-6 flex flex-col gap-3">
                    <button
                      onClick={() => {
                        alert("Simulating physical printer output. Invoice printed successfully!");
                      }}
                      className="w-full py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                    >
                      <Printer size={18} /> Print Physical Copy
                    </button>
                    <button
                      onClick={handleServeNext}
                      className="w-full py-4 bg-tickify-cyan text-tickify-dark font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-[0_15px_30px_rgba(0,255,242,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Serve Next Customer
                    </button>
                  </div>
                </div>

                {/* Right Side: Virtual Thermal Receipt preview */}
                <div className="bg-white text-black rounded-[2.5rem] p-8 shadow-2xl font-mono text-xs flex flex-col justify-between border border-gray-200 min-h-[50vh]">
                  <div>
                    {/* Receipt Header */}
                    <div className="text-center space-y-1 pb-4 border-b border-dashed border-gray-400">
                      <h3 className="text-lg font-bold uppercase tracking-wider">TICKIFY CINEMA</h3>
                      <p className="text-[10px] text-gray-500 font-sans">Snack Counter 02 • staff_pos</p>
                      <p className="text-[10px] text-gray-500 font-sans">{new Date().toLocaleString()}</p>
                    </div>

                    {/* Receipt Metadata */}
                    <div className="py-3 border-b border-dashed border-gray-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Invoice No:</span>
                        <span className="font-bold">{invoiceId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Method:</span>
                        <span className="uppercase">{paymentMethod}</span>
                      </div>
                    </div>

                    {/* Receipt Items */}
                    <div className="py-4 border-b border-dashed border-gray-400 space-y-3">
                      <div className="flex justify-between font-bold border-b border-gray-100 pb-1">
                        <span>Item</span>
                        <span>Total</span>
                      </div>
                      {cartItems.map(({ item, quantity }) => (
                        <div key={item.id} className="flex justify-between">
                          <div>
                            <p>{item.name}</p>
                            <p className="text-[10px] text-gray-500 font-sans">
                              ₫{item.price.toLocaleString()} x {quantity}
                            </p>
                          </div>
                          <span>₫{(item.price * quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Receipt Totals */}
                    <div className="py-4 space-y-1 text-right">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₫{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT (10%):</span>
                        <span>₫{tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200">
                        <span>TOTAL:</span>
                        <span>₫{total.toLocaleString()}</span>
                      </div>
                    </div>

                    {paymentMethod === "cash" && (
                      <div className="pt-2 border-t border-gray-100 space-y-1">
                        <div className="flex justify-between">
                          <span>Cash Paid:</span>
                          <span>₫{parseFloat(cashReceived || "0").toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Change:</span>
                          <span>₫{changeDue.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-center pt-8 border-t border-dashed border-gray-400">
                    <p className="font-bold">THANK YOU FOR YOUR VISIT</p>
                    <p className="text-[9px] text-gray-500 mt-1">Please keep this receipt to pick up your snacks</p>
                    <div className="w-full h-12 mt-4 bg-[repeating-linear-gradient(90deg,black,black_2px,transparent_2px,transparent_4px)] opacity-80" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </StaffLayout>
  );
}
