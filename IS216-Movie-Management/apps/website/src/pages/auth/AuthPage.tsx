import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail, Lock, User, ShieldCheck, ArrowRight, ArrowLeft,
  CheckCircle2, KeyRound, Sparkles, Eye, EyeOff,
} from "lucide-react";

type AuthState = "login" | "register" | "forgot";

/* ───────────────── Floating Particle ───────────────── */
const Particle = ({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-tickify-pink/20"
    style={{ left: x, top: y, width: size, height: size }}
    animate={{ y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
    transition={{ duration: 4, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

/* ───────────────── Reusable Input ───────────────── */
function FormInput({
  icon: Icon, label, error, type = "text", placeholder, registration, accentColor = "pink",
}: {
  icon: any; label: string; error?: string; type?: string;
  placeholder: string; registration: any; accentColor?: "pink" | "cyan" | "purple";
}) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";
  const colorMap = {
    pink: "focus:border-tickify-pink/50 focus:ring-tickify-pink/20 group-focus-within:text-tickify-pink",
    cyan: "focus:border-tickify-cyan/50 focus:ring-tickify-cyan/20 group-focus-within:text-tickify-cyan",
    purple: "focus:border-tickify-purple/50 focus:ring-tickify-purple/20 group-focus-within:text-tickify-purple",
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 ${colorMap[accentColor].split(" ").pop()} transition-colors`} size={18} />
        <input
          {...registration}
          type={isPassword && showPw ? "text" : type}
          placeholder={placeholder}
          className={`w-full bg-white/[0.04] border ${error ? "border-red-500/50 animate-[shake_0.3s]" : "border-white/10"} rounded-xl py-3.5 pl-12 pr-${isPassword ? "12" : "4"} text-sm ${colorMap[accentColor]} focus:outline-none focus:ring-1 transition-all placeholder:text-gray-600`}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-[10px] font-semibold mt-0.5 ml-1 flex items-center gap-1">
            <span className="inline-block w-1 h-1 rounded-full bg-red-400" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═════════════════ MAIN AUTH PAGE ═════════════════ */
export default function AuthPage() {
  const [authState, setAuthState] = useState<AuthState>("login");
  const [forgotStep, setForgotStep] = useState(1);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const navigate = useNavigate();

  // ── Login form ──
  const loginForm = useForm({ defaultValues: { email: "", password: "" } });
  // ── Register form ──
  const registerForm = useForm({ defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" } });
  const regPassword = registerForm.watch("password");
  // ── Forgot form ──
  const forgotForm = useForm({ defaultValues: { email: "", password: "", confirmPassword: "" } });
  const forgotPassword = forgotForm.watch("password");

  const switchState = (s: AuthState) => {
    setAuthState(s);
    if (s === "forgot") setForgotStep(1);
    setOtp(["", "", "", "", "", ""]);
  };

  /* OTP handlers */
  const handleOtpChange = (i: number, v: string) => {
    if (v.length > 1) v = v.slice(-1);
    const n = [...otp]; n[i] = v; setOtp(n);
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  /* Submit handlers */
  const onLogin = (d: any) => { console.log("Login:", d); navigate("/home"); };
  const onRegister = (d: any) => { console.log("Register:", d); switchState("login"); };
  const onSendOtp = (d: any) => { console.log("OTP sent to:", d.email); setForgotStep(2); };
  const onResetPw = (d: any) => { console.log("Reset:", otp.join(""), d); switchState("login"); };

  /* ────────── Title configs ────────── */
  const titles: Record<AuthState, { heading: string; sub: string; icon: any }> = {
    login: { heading: "Chào mừng trở lại", sub: "Đăng nhập để quản lý hệ thống Tickify", icon: Sparkles },
    register: { heading: "Tạo tài khoản", sub: "Đăng ký tài khoản quản trị viên Tickify", icon: User },
    forgot: { heading: forgotStep === 1 ? "Quên mật khẩu?" : "Kiểm tra email", sub: forgotStep === 1 ? "Nhập Gmail để nhận mã xác thực OTP" : "Chúng tôi đã gửi mã bảo mật đến hộp thư của bạn", icon: forgotStep === 1 ? KeyRound : CheckCircle2 },
  };
  const t = titles[authState];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* ── Animated background ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-tickify-pink/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-tickify-purple/8 rounded-full blur-[120px] animate-pulse [animation-delay:1.5s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tickify-cyan/5 rounded-full blur-[150px]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        {/* Particles */}
        <Particle delay={0} x="10%" y="20%" size={4} />
        <Particle delay={1} x="80%" y="15%" size={3} />
        <Particle delay={2} x="60%" y="70%" size={5} />
        <Particle delay={0.5} x="25%" y="80%" size={3} />
        <Particle delay={1.5} x="90%" y="50%" size={4} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative w-full max-w-md z-10">
        {/* Neon border glow */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-tickify-pink via-tickify-purple to-tickify-cyan rounded-3xl blur-sm opacity-25" />

        {/* ── Glass Card ── */}
        <div className="relative bg-slate-950/80 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/40">
          {/* Brand */}
          <div className="text-center mb-2">
            <span className="text-xs font-bold tracking-[0.4em] uppercase bg-gradient-to-r from-tickify-pink to-tickify-purple bg-clip-text text-transparent">Tickify Admin</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={authState + forgotStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-tickify-pink/15 to-tickify-purple/15 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-tickify-pink/20">
                  <t.icon size={28} className="text-tickify-pink" />
                </div>
                <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-1.5">{t.heading}</h1>
                <p className="text-gray-500 text-sm">{t.sub}</p>
              </div>

              {/* ══════ LOGIN ══════ */}
              {authState === "login" && (
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
                  <FormInput icon={Mail} label="Gmail quản trị" placeholder="admin@tickify.vn" accentColor="pink"
                    registration={loginForm.register("email", { required: "Vui lòng nhập Gmail", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Gmail không hợp lệ" } })}
                    error={loginForm.formState.errors.email?.message as string} />
                  <FormInput icon={Lock} label="Mật khẩu" type="password" placeholder="••••••••" accentColor="pink"
                    registration={loginForm.register("password", { required: "Vui lòng nhập mật khẩu", minLength: { value: 6, message: "Tối thiểu 6 ký tự" } })}
                    error={loginForm.formState.errors.password?.message as string} />

                  <div className="flex justify-end">
                    <button type="button" onClick={() => switchState("forgot")} className="text-[11px] font-semibold text-tickify-pink hover:text-tickify-pink/80 hover:underline transition-colors">
                      Quên mật khẩu?
                    </button>
                  </div>

                  <button type="submit" className="w-full bg-gradient-to-r from-tickify-pink to-tickify-purple hover:opacity-90 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_24px_rgba(255,0,128,0.25)] hover:shadow-[0_0_32px_rgba(255,0,128,0.4)] flex items-center justify-center gap-2 group">
                    Đăng nhập
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <p className="text-center text-sm text-gray-500 pt-2">
                    Chưa có tài khoản?{" "}
                    <button type="button" onClick={() => switchState("register")} className="text-tickify-cyan font-bold hover:underline">Đăng ký ngay</button>
                  </p>
                </form>
              )}

              {/* ══════ REGISTER ══════ */}
              {authState === "register" && (
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <FormInput icon={User} label="Họ và tên" placeholder="Nguyễn Văn A" accentColor="cyan"
                    registration={registerForm.register("fullName", { required: "Vui lòng nhập họ tên", minLength: { value: 2, message: "Tối thiểu 2 ký tự" } })}
                    error={registerForm.formState.errors.fullName?.message as string} />
                  <FormInput icon={Mail} label="Gmail quản trị" placeholder="admin@tickify.vn" accentColor="cyan"
                    registration={registerForm.register("email", { required: "Vui lòng nhập Gmail", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Gmail không hợp lệ" } })}
                    error={registerForm.formState.errors.email?.message as string} />
                  <FormInput icon={Lock} label="Mật khẩu" type="password" placeholder="••••••••" accentColor="cyan"
                    registration={registerForm.register("password", { required: "Vui lòng nhập mật khẩu", minLength: { value: 6, message: "Tối thiểu 6 ký tự" } })}
                    error={registerForm.formState.errors.password?.message as string} />
                  <FormInput icon={ShieldCheck} label="Xác nhận mật khẩu" type="password" placeholder="••••••••" accentColor="cyan"
                    registration={registerForm.register("confirmPassword", { required: "Vui lòng xác nhận mật khẩu", validate: (v: string) => v === regPassword || "Mật khẩu không khớp" })}
                    error={registerForm.formState.errors.confirmPassword?.message as string} />

                  <button type="submit" className="w-full bg-gradient-to-r from-tickify-cyan to-tickify-purple hover:opacity-90 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_24px_rgba(0,210,255,0.2)] hover:shadow-[0_0_32px_rgba(0,210,255,0.35)] flex items-center justify-center gap-2 group mt-2">
                    Đăng ký
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <p className="text-center text-sm text-gray-500 pt-1">
                    Đã có tài khoản?{" "}
                    <button type="button" onClick={() => switchState("login")} className="text-tickify-pink font-bold hover:underline">Đăng nhập</button>
                  </p>
                </form>
              )}

              {/* ══════ FORGOT PASSWORD ══════ */}
              {authState === "forgot" && forgotStep === 1 && (
                <form onSubmit={forgotForm.handleSubmit(onSendOtp)} className="space-y-5">
                  <FormInput icon={Mail} label="Gmail" placeholder="admin@tickify.vn" accentColor="pink"
                    registration={forgotForm.register("email", { required: "Vui lòng nhập Gmail", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Gmail không hợp lệ" } })}
                    error={forgotForm.formState.errors.email?.message as string} />

                  <button type="submit" className="w-full bg-gradient-to-r from-tickify-pink to-tickify-purple hover:opacity-90 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_24px_rgba(255,0,128,0.25)] flex items-center justify-center gap-2 group">
                    Gửi mã OTP
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="text-center">
                    <button type="button" onClick={() => switchState("login")} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors font-semibold">
                      <ArrowLeft size={16} /> Quay lại đăng nhập
                    </button>
                  </div>
                </form>
              )}

              {authState === "forgot" && forgotStep === 2 && (
                <div className="space-y-6">
                  {/* OTP */}
                  <div className="space-y-3 text-center">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.25em]">Nhập mã OTP 6 số</label>
                    <div className="flex justify-between gap-2">
                      {otp.map((d, i) => (
                        <input key={i} ref={el => { otpRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={d}
                          onChange={e => handleOtpChange(i, e.target.value)} onKeyDown={e => handleOtpKey(i, e)}
                          className="w-12 h-14 bg-white/[0.04] border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:border-tickify-pink focus:ring-2 focus:ring-tickify-pink/20 focus:shadow-[0_0_16px_rgba(255,0,128,0.3)] transition-all" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      Chưa nhận được mã?{" "}
                      <button type="button" className="text-tickify-pink font-bold hover:underline">Gửi lại</button>
                    </p>
                  </div>

                  <form onSubmit={forgotForm.handleSubmit(onResetPw)} className="space-y-4">
                    <FormInput icon={Lock} label="Mật khẩu mới" type="password" placeholder="••••••••" accentColor="pink"
                      registration={forgotForm.register("password", { required: "Vui lòng nhập mật khẩu mới", minLength: { value: 6, message: "Tối thiểu 6 ký tự" } })}
                      error={forgotForm.formState.errors.password?.message as string} />
                    <FormInput icon={ShieldCheck} label="Xác nhận mật khẩu mới" type="password" placeholder="••••••••" accentColor="pink"
                      registration={forgotForm.register("confirmPassword", { required: "Vui lòng xác nhận mật khẩu", validate: (v: string) => v === forgotPassword || "Mật khẩu không khớp" })}
                      error={forgotForm.formState.errors.confirmPassword?.message as string} />

                    <button type="submit" className="w-full bg-gradient-to-r from-tickify-pink to-tickify-purple hover:opacity-90 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_24px_rgba(255,0,128,0.25)] flex items-center justify-center gap-2 group mt-1">
                      Đặt lại mật khẩu
                      <ShieldCheck size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </form>

                  <div className="text-center">
                    <button type="button" onClick={() => switchState("login")} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors font-semibold">
                      <ArrowLeft size={16} /> Quay lại đăng nhập
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Bottom decorative line */}
          <div className="mt-8 h-px bg-gradient-to-r from-transparent via-tickify-pink/20 to-transparent" />
          <p className="text-center text-[10px] text-gray-600 mt-4 tracking-wider">© 2026 Tickify — Hệ thống đặt vé phim trực tuyến</p>
        </div>
      </motion.div>
    </div>
  );
}
