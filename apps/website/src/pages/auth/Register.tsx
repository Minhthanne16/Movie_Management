import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, User, ShieldCheck, ArrowRight, Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import { authService } from "../../services/auth.service";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.register(data.fullName, data.email, data.password);
      // Đăng ký xong có thể tự động login hoặc chuyển sang trang login
      navigate("/");
    } catch (err: any) {
      setError(typeof err === "string" ? err : "Đăng ký không thành công. Gmail có thể đã tồn tại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-slate-950">
      {/* ── Background ── */}
      <div className="absolute inset-0">
        <img src="/movie-bg.png" alt="" className="w-full h-full object-cover scale-105 opacity-40 blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/80 to-slate-950" />
      </div>

      <div className="relative z-10 w-full flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[480px] bg-slate-900/40 backdrop-blur-3xl border border-white/[0.08] rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-tickify-cyan to-tickify-purple flex items-center justify-center shadow-lg shadow-tickify-cyan/20">
                <UserPlus size={28} className="text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Tạo tài khoản</h1>
            <p className="text-gray-400 text-sm">Tham gia cộng đồng điện ảnh Tickify ngay hôm nay</p>
          </div>

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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* ... (các trường input giữ nguyên) ... */}
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Họ và tên</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-tickify-cyan transition-colors" size={18} />
                <input
                  {...register("fullName", { required: "Vui lòng nhập họ tên" })}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-tickify-cyan/50 focus:ring-2 focus:ring-tickify-cyan/10 transition-all placeholder:text-gray-600"
                />
              </div>
              {errors.fullName && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1">{errors.fullName.message as string}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Gmail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-tickify-cyan transition-colors" size={18} />
                <input
                  {...register("email", { 
                    required: "Vui lòng nhập Gmail",
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Gmail không hợp lệ" }
                  })}
                  placeholder="admin@tickify.vn"
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-tickify-cyan/50 focus:ring-2 focus:ring-tickify-cyan/10 transition-all placeholder:text-gray-600"
                />
              </div>
              {errors.email && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1">{errors.email.message as string}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mật khẩu</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-tickify-cyan transition-colors" size={18} />
                <input
                  {...register("password", { required: "Vui lòng nhập mật khẩu", minLength: { value: 6, message: "Tối thiểu 6 ký tự" } })}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-sm text-white focus:outline-none focus:border-tickify-cyan/50 focus:ring-2 focus:ring-tickify-cyan/10 transition-all placeholder:text-gray-600"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1">{errors.password.message as string}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Xác nhận mật khẩu</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-tickify-cyan transition-colors" size={18} />
                <input
                  {...register("confirmPassword", { 
                    required: "Vui lòng xác nhận mật khẩu", 
                    validate: (v: string) => v === password || "Mật khẩu không khớp" 
                  })}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-sm text-white focus:outline-none focus:border-tickify-cyan/50 focus:ring-2 focus:ring-tickify-cyan/10 transition-all placeholder:text-gray-600"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1">{errors.confirmPassword.message as string}</p>}
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-gradient-to-r from-tickify-cyan to-tickify-purple text-white py-4 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(0,210,255,0.2)] hover:shadow-[0_0_30px_rgba(0,210,255,0.4)] flex items-center justify-center gap-2 group mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Đăng ký tài khoản
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-10 text-sm text-gray-500">
            Đã có tài khoản?{" "}
            <Link to="/" className="text-tickify-cyan font-bold hover:underline">Đăng nhập</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
