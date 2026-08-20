import { useEffect, useState } from "react";
import StaffLayout from "../../layouts/StaffLayout";
import {
  History,
  Search,
  CupSoda,
  DollarSign,
  Calendar,
  CheckCircle2,
  ShoppingBag,
  XCircle,
  Clock
} from "lucide-react";

import { orderService } from "../../services/order.service";
import type { Order } from "../../types/order";

export default function StaffHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"All" | "CONFIRMED" | "PENDING" | "CANCELLED">("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    orderService
      .getAll()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "All" || order.status === filterStatus;
    const matchesSearch =
      String(order.id).includes(searchQuery) ||
      order.items.some((item) =>
        item.foodItemName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesStatus && matchesSearch;
  });

  const totalRevenue = orders.reduce((acc, o) => {
    if (o.status === "CONFIRMED") return acc + o.totalPrice;
    return acc;
  }, 0);

  const confirmedOrders = orders.filter((o) => o.status === "CONFIRMED");
  const pendingOrders = orders.filter((o) => o.status === "PENDING");

  return (
    <StaffLayout>
      <div className="space-y-10 max-w-7xl mx-auto pb-20">
        {/* Header Section */}
        <div>
          <div className="flex items-center gap-2 text-tickify-cyan mb-3">
            <History size={24} />
            <span className="text-xs font-black uppercase tracking-[0.3em]">
              Sales History
            </span>
          </div>
          <h1 className="text-5xl font-display font-bold text-white tracking-tight">
            Order History
          </h1>
          <p className="text-gray-500 font-medium mt-2">
            Overview of F&amp;B orders in the system
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-tickify-card border border-white/5 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-tickify-cyan/5 rounded-full blur-3xl" />
            <div className="w-10 h-10 rounded-xl bg-tickify-cyan/15 flex items-center justify-center mb-4 text-tickify-cyan">
              <DollarSign size={20} />
            </div>
            <p className="text-3xl font-display font-bold text-white">
              {loading ? "—" : `₫${totalRevenue.toLocaleString()}`}
            </p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-black">Total Revenue</p>
          </div>

          <div className="bg-tickify-card border border-white/5 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-tickify-purple/5 rounded-full blur-3xl" />
            <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center mb-4 text-green-400">
              <CheckCircle2 size={20} />
            </div>
            <p className="text-3xl font-display font-bold text-white">
              {loading ? "—" : confirmedOrders.length}
            </p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-black">Confirmed Orders</p>
          </div>

          <div className="bg-tickify-card border border-white/5 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center mb-4 text-amber-500">
              <CupSoda size={20} />
            </div>
            <p className="text-3xl font-display font-bold text-white">
              {loading ? "—" : pendingOrders.length}
            </p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-black">Pending Orders</p>
          </div>
        </div>

        {/* Filter and Search controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="bg-tickify-card/50 border border-white/5 rounded-2xl p-2 flex items-center gap-1.5 w-fit flex-wrap">
            {(["All", "CONFIRMED", "PENDING", "CANCELLED"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  filterStatus === status
                    ? "bg-tickify-cyan text-tickify-dark shadow-[0_0_12px_rgba(0,255,242,0.3)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {status === "All" ? "All Orders" : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search by order ID or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-tickify-card/50 border border-white/5 focus:border-tickify-cyan/30 rounded-2xl text-sm focus:outline-none transition-all placeholder-gray-500 text-white"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-tickify-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-gray-500 font-black">
                  <th className="px-8 py-5">Order ID</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Date &amp; Time</th>
                  <th className="px-6 py-5">Items</th>
                  <th className="px-8 py-5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-20">
                      <p className="text-gray-500 font-medium">Loading orders...</p>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-20">
                      <p className="text-gray-500 font-medium">No orders found</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.01] transition-colors text-xs font-bold">
                      <td className="px-8 py-5 text-white font-mono">#{order.id}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                          order.status === "CONFIRMED"
                            ? "bg-green-500/10 text-green-400"
                            : order.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-red-500/10 text-red-400"
                        }`}>
                          {order.status === "CONFIRMED" && <CheckCircle2 size={12} />}
                          {order.status === "PENDING" && <Clock size={12} />}
                          {order.status === "CANCELLED" && <XCircle size={12} />}
                          {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-gray-400 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-gray-600" />
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-white font-medium max-w-xs">
                        <div className="flex flex-col gap-1">
                          {order.items.length === 0 ? (
                            <span className="text-gray-500">—</span>
                          ) : (
                            order.items.map((item) => (
                              <span key={item.id} className="flex items-center gap-1">
                                <ShoppingBag size={10} className="text-gray-500 shrink-0" />
                                {item.foodItemName} × {item.quantity}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className={`px-8 py-5 text-right text-base ${
                        order.status === "CANCELLED" ? "text-gray-500 line-through" : "text-white"
                      }`}>
                        ₫{order.totalPrice.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
