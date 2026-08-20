import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ShoppingCart, History, Film, Ticket, Users, Clock, CupSoda } from "lucide-react";
import StaffLayout from "../../layouts/StaffLayout";
import { dashboardService } from "../../services/dashboard.service";
import type { DashboardStats } from "../../types/dashboard";

const NAV_ITEMS = [
  { 
    icon: ShoppingCart, 
    label: "Quầy Vé (Ticket POS)", 
    path: "/staff/pos", 
    desc: "Bán và in vé xem phim trực tiếp cho khách hàng",
    color: "from-tickify-purple to-pink-600"
  },
  { 
    icon: CupSoda, 
    label: "Quầy Nước (F&B Services)", 
    path: "/staff/food", 
    desc: "Bán bỏng ngô, nước ngọt và các combo ăn uống",
    color: "from-tickify-cyan to-blue-600"
  },
  { 
    icon: History, 
    label: "Lịch sử giao dịch", 
    path: "/staff/history", 
    desc: "Tra cứu danh sách hóa đơn đã bán trong ca làm việc",
    color: "from-amber-500 to-orange-600"
  },
];

const STATIC_STATS = [
  { icon: Film, label: "Phim đang chiếu", value: "—", color: "from-amber-500 to-orange-600" },
  { icon: Clock, label: "Ca làm việc", value: "08:00–17:00", color: "from-green-500 to-teal-600" },
];

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    dashboardService.get().then(setStats).catch(() => {});
  }, []);

  return (
    <StaffLayout>
      <div className="space-y-10 max-w-6xl mx-auto">
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden p-8 md:p-12 border border-white/5 bg-tickify-card"
        >
          {/* Decorative blur bg */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-tickify-cyan/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-tickify-purple/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-3">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
              Chào buổi sáng, Nhân viên! 👋
            </h1>
            <p className="text-gray-400 font-medium text-base">
              Hôm nay hệ thống ghi nhận có <span className="text-tickify-cyan font-bold">{stats?.totalTicketsSold ?? "—"} vé</span> cần xử lý. Hãy bắt đầu phục vụ khách hàng tại quầy.
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Live: tickets sold */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="bg-tickify-card border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tickify-pink to-tickify-purple flex items-center justify-center mb-4 shadow-lg">
              <Ticket size={18} className="text-white" />
            </div>
            <p className="text-2xl font-display font-bold text-white">{stats?.totalTicketsSold ?? "—"}</p>
            <p className="text-xs text-gray-500 mt-1 font-semibold">Vé bán hôm nay</p>
          </motion.div>

          {/* Live: total revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-tickify-card border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tickify-cyan to-blue-600 flex items-center justify-center mb-4 shadow-lg">
              <Users size={18} className="text-white" />
            </div>
            <p className="text-2xl font-display font-bold text-white">
              {stats ? `₫${stats.totalRevenue.toLocaleString()}` : "—"}
            </p>
            <p className="text-xs text-gray-500 mt-1 font-semibold">Doanh thu hôm nay</p>
          </motion.div>

          {/* Static stats */}
          {STATIC_STATS.map(({ icon: Icon, label, value, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i + 2) * 0.1 }}
              className="bg-tickify-card border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon size={18} className="text-white" />
              </div>
              <p className="text-2xl font-display font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500 mt-1 font-semibold">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Nav Options */}
        <div className="space-y-6">
          <h2 className="text-xl font-display font-bold text-white">Chức năng chính của Module</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {NAV_ITEMS.map(({ icon: Icon, label, path, desc, color }, i) => (
              <motion.button
                key={path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                onClick={() => navigate(path)}
                className="bg-tickify-card border border-white/5 rounded-3xl p-6 flex flex-col gap-4 hover:border-tickify-cyan/30 hover:bg-white/[0.02] transition-all text-left group cursor-pointer relative overflow-hidden"
              >
                {/* Subtle Hover Glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-tickify-cyan/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                  <Icon size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg group-hover:text-tickify-cyan transition-colors">{label}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{desc}</p>
                </div>
                <div className="mt-auto pt-4 flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-tickify-cyan opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  Mở trang <span className="text-xs">→</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
