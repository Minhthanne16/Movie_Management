import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { authService } from "../../services/auth.service";

export default function ForgotPassword() {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleSendOtp = async (data: any) => {
    setError(null);
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setEmail(data.email);
      setSuccessMessage("OTP sent to your email.");
      setStep("otp");
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.verifyOtp(email, otp.join(""));
      setStep("reset");
    } catch (err) {
      setError(typeof err === "string" ? err : "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: any) => {
    setError(null);
    setLoading(true);
    try {
      await authService.resetPassword(email, otp.join(""), data.password);
      navigate("/");
    } catch (err) {
      setError(typeof err === "string" ? err : "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="absolute inset-0">
        <img src="/movie-bg.png" alt="" className="w-full h-full object-cover scale-105 opacity-30 blur-[4px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/60" />
      </div>

      <div className="relative z-10 w-full flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[460px] bg-slate-900/40 backdrop-blur-3xl border border-white/[0.08] rounded-[2.5rem] p-8 md:p-10 shadow-2xl"
        >
          {/* Error / Success messages */}
          <AnimatePresence>
            {error && (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-500 text-sm mb-4 text-center"
              >
                {error}
              </motion.p>
            )}
            {successMessage && (
              <motion.p
                key="success"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-green-500 text-sm mb-4 text-center"
              >
                {successMessage}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* Step 1: Email */}
            {step === "email" && (
              <motion.div key="step-email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-tickify-pink/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-tickify-pink/20 shadow-[0_0_20px_rgba(255,0,128,0.1)]">
                    <KeyRound size={32} className="text-tickify-pink" />
                  </div>
                  <h1 className="text-3xl font-display font-bold text-white mb-2">Quên mật khẩu?</h1>
                  <p className="text-gray-400 text-sm">Nhập Gmail để nhận mã OTP khôi phục quyền truy cập</p>
                </div>

                <form onSubmit={handleSubmit(handleSendOtp)} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Gmail Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-tickify-pink transition-colors" size={18} />
                      <input
                        {...register("email", {
                          required: "Vui lòng nhập Gmail",
                          pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Gmail không hợp lệ" }
                        })}
                        type="email"
                        placeholder="admin@tickify.vn"
                        className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-tickify-pink/50 transition-all placeholder:text-gray-600"
                      />
                    </div>
                    {errors.email && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1">{errors.email.message as string}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-tickify-pink hover:bg-tickify-pink/90 text-white py-4 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,0,128,0.25)] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? "Đang gửi..." : (
                      <>
                        Gửi mã OTP
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors font-bold uppercase tracking-widest">
                    <ArrowLeft size={16} /> Quay lại đăng nhập
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Step 2: OTP Verification */}
            {step === "otp" && (
              <motion.div key="step-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                    <CheckCircle2 size={32} className="text-green-500" />
                  </div>
                  <h1 className="text-3xl font-display font-bold text-white mb-2">Kiểm tra Gmail</h1>
                  <p className="text-gray-400 text-sm italic">Mã xác thực đã được gửi tới hòm thư của bạn</p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* OTP Inputs */}
                  <div className="space-y-3 text-center">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Nhập mã 6 chữ số</label>
                    <div className="flex justify-between gap-2">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => { otpRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(idx, e)}
                          className="w-12 h-14 bg-slate-900/60 border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:border-tickify-pink focus:ring-4 focus:ring-tickify-pink/10 transition-all"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-tickify-pink hover:bg-tickify-pink/90 text-white py-4 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,0,128,0.25)] flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? "Đang xác thực..." : (
                      <>
                        Xác nhận OTP
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 3: Reset Password */}
            {step === "reset" && (
              <motion.div key="step-reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-tickify-purple/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-tickify-purple/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                    <Lock size={32} className="text-tickify-purple" />
                  </div>
                  <h1 className="text-3xl font-display font-bold text-white mb-2">Đặt lại mật khẩu</h1>
                  <p className="text-gray-400 text-sm">Nhập mật khẩu mới cho tài khoản của bạn</p>
                </div>

                <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Mật khẩu mới</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-tickify-pink transition-colors" size={18} />
                      <input
                        {...register("password", { required: "Vui lòng nhập mật khẩu", minLength: { value: 6, message: "Tối thiểu 6 ký tự" } })}
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-tickify-pink/50 transition-all placeholder:text-gray-600"
                      />
                    </div>
                    {errors.password && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1">{errors.password.message as string}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Xác nhận mật khẩu mới</label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-tickify-pink transition-colors" size={18} />
                      <input
                        {...register("confirmPassword", {
                          required: "Vui lòng xác nhận mật khẩu",
                          validate: (val: string) => val === password || "Mật khẩu không khớp"
                        })}
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-tickify-pink/50 transition-all placeholder:text-gray-600"
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-red-400 text-[10px] font-bold mt-1 ml-1">{errors.confirmPassword.message as string}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-tickify-pink to-tickify-purple text-white py-4 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,0,128,0.3)] mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
