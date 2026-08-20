import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Film, Sparkles, Loader2 } from "lucide-react";
import { authService } from "../../services/auth.service";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = await authService.login(data.email, data.password);
      const role = (payload?.role as string)?.toUpperCase();
      if (role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (role === "STAFF") {
        navigate("/staff/dashboard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError(typeof err === "string" ? err : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-slate-950">
      {/* ... (phần background giữ nguyên) ... */}
      <div className="absolute inset-0">
        <img
          src="/movie-bg.png"
          alt=""
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
        <div className="absolute inset-0 bg-slate-950/20" />
      </div>

      {/* ── Animated Neon Orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-tickify-pink/10 rounded-full blur-[120px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 left-1/3 w-[350px] h-[350px] bg-tickify-purple/10 rounded-full blur-[100px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* ── Main Content ── */}
      <div className="relative z-10 flex w-full min-h-screen">
        <div className="w-full lg:w-[48%] flex items-center justify-center px-6 sm:px-10 lg:px-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-[420px]"
          >
            {/* Brand Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-8">
                <motion.div
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-tickify-pink to-tickify-purple flex items-center justify-center shadow-lg shadow-tickify-pink/30"
                  whileHover={{ rotate: 10, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Film size={24} className="text-white" />
                </motion.div>
                <span className="text-2xl font-display font-bold bg-gradient-to-r from-tickify-pink via-tickify-purple to-tickify-cyan bg-clip-text text-transparent">
                  Tickify
                </span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-3 leading-tight">
                Chào mừng
                <br />
                <span className="bg-gradient-to-r from-tickify-pink to-tickify-purple bg-clip-text text-transparent">
                  trở lại
                </span>
              </h1>
              <p className="text-gray-400 text-base">
                Đăng nhập để khám phá thế giới điện ảnh
              </p>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-medium mb-6 flex items-center gap-2"
                >
                  <div className="w-1 h-1 rounded-full bg-red-400" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-300 ml-1">
                  Gmail
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-tickify-pink transition-colors duration-300"
                    size={18}
                  />
                  <input
                    {...register("email", {
                      required: "Vui lòng nhập Gmail",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Gmail không hợp lệ",
                      },
                    })}
                    type="email"
                    placeholder="you@gmail.com"
                    className={`w-full bg-slate-900/50 backdrop-blur-md border ${
                      errors.email ? "border-red-500/50" : "border-white/[0.08]"
                    } rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-tickify-pink/50 focus:ring-2 focus:ring-tickify-pink/10 focus:bg-slate-900/80 transition-all duration-300 placeholder:text-gray-600`}
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs font-medium ml-1 flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-red-400" />
                    {errors.email.message as string}
                  </motion.p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-gray-300">
                    Mật khẩu
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-tickify-pink hover:text-tickify-pink/80 font-semibold hover:underline transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-tickify-pink transition-colors duration-300"
                    size={18}
                  />
                  <input
                    {...register("password", {
                      required: "Vui lòng nhập mật khẩu",
                      minLength: {
                        value: 6,
                        message: "Tối thiểu 6 ký tự",
                      },
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full bg-slate-900/50 backdrop-blur-md border ${
                      errors.password
                        ? "border-red-500/50"
                        : "border-white/[0.08]"
                    } rounded-2xl py-4 pl-12 pr-12 text-sm text-white focus:outline-none focus:border-tickify-pink/50 focus:ring-2 focus:ring-tickify-pink/10 focus:bg-slate-900/80 transition-all duration-300 placeholder:text-gray-600`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs font-medium ml-1 flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-red-400" />
                    {errors.password.message as string}
                  </motion.p>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                type="submit"
                className="w-full bg-gradient-to-r from-tickify-pink to-tickify-purple text-white py-4 rounded-2xl font-bold text-sm transition-all duration-300 shadow-[0_4px_30px_rgba(255,0,128,0.25)] hover:shadow-[0_4px_40px_rgba(255,0,128,0.45)] flex items-center justify-center gap-2.5 group mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Sparkles size={16} className="opacity-70" />
                    Đăng nhập
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1.5 transition-transform duration-300"
                    />
                  </>
                )}
              </motion.button>
            </motion.form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  className="text-tickify-cyan font-bold hover:underline hover:text-tickify-cyan/80 transition-colors"
                >
                  Đăng ký ngay
                </Link>
              </p>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-[11px] text-gray-600 mt-8 tracking-wider"
            >
              © 2026 Tickify — Hệ thống đặt vé phim trực tuyến
            </motion.p>

          </motion.div>
        </div>

        {/* Right Side — Movie Poster Showcase (visible on lg+) */}
        <div className="hidden lg:flex w-[52%] items-center justify-center relative">
          {/* Floating movie info card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
            className="absolute bottom-20 right-16 bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-6 max-w-xs shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tickify-pink/20 to-tickify-purple/20 border border-tickify-pink/20 flex items-center justify-center">
                <Film size={20} className="text-tickify-pink" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">Khám phá ngay</p>
                <p className="text-gray-500 text-xs">Hàng ngàn bộ phim đang chờ bạn</p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-tickify-pink/10 border border-tickify-pink/20 rounded-full text-[10px] font-bold text-tickify-pink">
                Phim mới
              </span>
              <span className="px-3 py-1 bg-tickify-cyan/10 border border-tickify-cyan/20 rounded-full text-[10px] font-bold text-tickify-cyan">
                Đặt vé online
              </span>
              <span className="px-3 py-1 bg-tickify-purple/10 border border-tickify-purple/20 rounded-full text-[10px] font-bold text-tickify-purple">
                Ưu đãi
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
