import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout.tsx";
import {
  TrendingUp,
  Users,
  Ticket,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  ChevronDown,
  RefreshCcw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { dashboardService } from "../../services/dashboard.service";
import type { DashboardStats } from "../../types/dashboard";

// Mock Data Generators
const generateRevenueData = (range: string) => {
  const days =
    range === "Last 7 Days"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : range === "Last 30 Days"
        ? ["Week 1", "Week 2", "Week 3", "Week 4"]
        : ["Q1", "Q2", "Q3", "Q4"];

  return days.map((name) => ({
    name,
    revenue: Math.floor(Math.random() * 50000) + 40000,
    tickets: Math.floor(Math.random() * 500) + 300,
  }));
};

const INITIAL_TOP_MOVIES = [
  { name: "Deadpool & Wolverine", value: 45, color: "#FF0080" },
  { name: "The Conjuring 4", value: 30, color: "#7000FF" },
  { name: "Inside Out 2", value: 15, color: "#00D2FF" },
  { name: "Dune: Part Two", value: 10, color: "#FF8A00" },
];

const INITIAL_BOOKINGS = [
  {
    id: "1234",
    user: "John Doe",
    movie: "Deadpool & Wolverine",
    seats: 2,
    price: 300,
    time: "2 mins ago",
    status: "Paid",
  },
  {
    id: "1235",
    user: "Sarah Smith",
    movie: "The Conjuring 4",
    seats: 1,
    price: 150,
    time: "5 mins ago",
    status: "Paid",
  },
  {
    id: "1236",
    user: "Mike Ross",
    movie: "Inside Out 2",
    seats: 3,
    price: 450,
    time: "12 mins ago",
    status: "Paid",
  },
  {
    id: "1237",
    user: "Emma Watson",
    movie: "Dune: Part Two",
    seats: 2,
    price: 360,
    time: "18 mins ago",
    status: "Pending",
  },
];

const TIME_OPTIONS = ["Last 7 Days", "Last 30 Days", "This Year"];

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("Last 7 Days");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [revenueData, setRevenueData] = useState(
    generateRevenueData("Last 7 Days"),
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const refreshTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Fetch real dashboard stats
  useEffect(() => {
    setStatsLoading(true);
    dashboardService.get()
      .then((data) => {
        setStats(data);
        // Seed chart with real daily summaries if available
        if (data.dailySummaries && data.dailySummaries.length > 0) {
          const chartData = data.dailySummaries.slice(-7).map((s) => ({
            name: new Date(s.date).toLocaleDateString("en-US", { weekday: "short" }),
            revenue: s.revenue,
            tickets: s.ticketCount,
          }));
          setRevenueData(chartData);
        }
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Handle data refresh when time range changes
  useEffect(() => {
    setIsRefreshing(true);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    refreshTimerRef.current = setTimeout(() => {
      setRevenueData(generateRevenueData(timeRange));
      setIsRefreshing(false);
    }, 800);

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [timeRange]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    refreshTimerRef.current = setTimeout(() => {
      setRevenueData(generateRevenueData(timeRange));
      setIsRefreshing(false);
    }, 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-10 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">
              Dashboard Overview
            </h1>
            <p className="text-gray-500 font-medium">
              Welcome back, Admin. Heres whats happening in your cinema universe
              today.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              className={`p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all ${isRefreshing ? "animate-spin" : ""}`}
            >
              <RefreshCcw size={20} />
            </button>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-3">
              <Calendar size={18} className="text-tickify-pink" />
              <span className="text-sm font-bold">
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* AD-301: Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: "Total Revenue",
              value: statsLoading
                ? "..."
                : stats
                  ? `₫${stats.totalRevenue.toLocaleString()}`
                  : `₫${revenueData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}`,
              trend: "+12.5%",
              isUp: true,
              icon: DollarSign,
              color: "text-tickify-pink",
              bg: "bg-tickify-pink/10",
            },
            {
              label: "Tickets Sold",
              value: statsLoading
                ? "..."
                : stats
                  ? stats.totalTicketsSold.toLocaleString()
                  : revenueData.reduce((acc, curr) => acc + curr.tickets, 0).toLocaleString(),
              trend: "+8.2%",
              isUp: true,
              icon: Ticket,
              color: "text-tickify-cyan",
              bg: "bg-tickify-cyan/10",
            },
            {
              label: "Active Users",
              value: "8,432",
              trend: "+5.4%",
              isUp: true,
              icon: Users,
              color: "text-tickify-purple",
              bg: "bg-tickify-purple/10",
            },
            {
              label: "Avg. Occupancy",
              value: "78%",
              trend: "-2.1%",
              isUp: false,
              icon: TrendingUp,
              color: "text-orange-500",
              bg: "bg-orange-500/10",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-tickify-card border border-white/5 rounded-4xl p-8 hover:border-tickify-pink/30 transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div
                  className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center ${stat.color}`}
                >
                  <stat.icon size={24} />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-bold ${stat.isUp ? "text-green-400" : "text-red-400"}`}
                >
                  {stat.trend}
                  {stat.isUp ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                </div>
              </div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <h3 className="text-3xl font-display font-bold text-white group-hover:text-tickify-pink transition-colors">
                {stat.value}
              </h3>
            </div>
          ))}
        </div>

        {/* AD-302: Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Trend Chart */}
          <div className="lg:col-span-2 bg-tickify-card border border-white/5 rounded-[3rem] p-10 shadow-xl relative overflow-hidden">
            {isRefreshing && (
              <div className="absolute inset-0 bg-tickify-bg/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-tickify-pink border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-display font-bold mb-1">
                  Revenue Analytics
                </h3>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">
                  {timeRange} Performance
                </p>
              </div>

              {/* Custom Beautiful Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-3 bg-tickify-bg border rounded-xl px-5 py-2.5 text-xs font-bold transition-all hover:bg-white/5 ${isDropdownOpen ? "border-tickify-pink shadow-[0_0_15px_rgba(255,0,128,0.2)]" : "border-white/10"}`}
                >
                  <span className="text-white">{timeRange}</span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-500 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-tickify-pink" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-tickify-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                    >
                      <div className="p-2">
                        {TIME_OPTIONS.map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setTimeRange(option);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${timeRange === option ? "bg-tickify-pink/10 text-tickify-pink" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                          >
                            {option}
                            {timeRange === option && (
                              <div className="w-1.5 h-1.5 rounded-full bg-tickify-pink shadow-[0_0_8px_rgba(255,0,128,0.8)]"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="h-87.5 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#FF0080" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF0080" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ffffff05"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 600 }}
                    tickFormatter={(value) => `₫${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111111",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                      fontSize: "12px",
                      fontWeight: "700",
                    }}
                    itemStyle={{ color: "#FF0080" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FF0080"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Movies Chart */}
          <div className="bg-tickify-card border border-white/5 rounded-[3rem] p-10 shadow-xl">
            <h3 className="text-xl font-display font-bold mb-1">
              Market Share
            </h3>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mb-10">
              By Movie Title
            </p>

            <div className="h-75 w-full mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={INITIAL_TOP_MOVIES} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" hide />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      backgroundColor: "#111111",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "16px",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                    {INITIAL_TOP_MOVIES.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {INITIAL_TOP_MOVIES.map((movie, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: movie.color }}
                    ></div>
                    <span className="text-xs font-bold text-gray-400">
                      {movie.name}
                    </span>
                  </div>
                  <span className="text-xs font-black text-white">
                    {movie.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity & Popular Showtimes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-tickify-card border border-white/5 rounded-[3rem] p-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-display font-bold">
                Recent Bookings
              </h3>
              <button className="text-xs font-bold text-tickify-pink hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-6">
              {INITIAL_BOOKINGS.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 group-hover:border-tickify-pink/30 transition-all">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold group-hover:text-white transition-colors">
                        {booking.user}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {booking.movie} • {booking.seats} seats • ₫
                        {booking.price}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400">
                      {booking.time}
                    </p>
                    <p
                      className={`text-[10px] font-black uppercase tracking-widest ${booking.status === "Paid" ? "text-green-500" : "text-orange-500"}`}
                    >
                      {booking.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-tickify-card border border-white/5 rounded-[3rem] p-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-display font-bold">Live Showtimes</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">
                  Live Now
                </span>
              </div>
            </div>
            <div className="space-y-6">
              {[
                {
                  time: "19:30",
                  screen: "Screen 1",
                  movie: "The Conjuring 4",
                  occupancy: 95,
                },
                {
                  time: "20:00",
                  screen: "Screen 3",
                  movie: "Deadpool & Wolverine",
                  occupancy: 88,
                },
                {
                  time: "20:15",
                  screen: "IMAX 1",
                  movie: "Dune: Part Two",
                  occupancy: 72,
                },
                {
                  time: "20:30",
                  screen: "Screen 2",
                  movie: "Inside Out 2",
                  occupancy: 45,
                },
              ].map((show, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">
                        {show.time} - {show.screen}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {show.movie}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-tickify-cyan">
                      {show.occupancy}% Full
                    </p>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-tickify-pink to-tickify-purple rounded-full"
                      style={{ width: `${show.occupancy}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
