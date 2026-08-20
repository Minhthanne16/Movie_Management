import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Film, LogOut, LayoutDashboard, ShoppingCart, CupSoda } from "lucide-react";
import { authService } from "../services/auth.service";

interface StaffLayoutProps {
  children: React.ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const role = authService.getCurrentRole();
  const currentPath = location.pathname;

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/staff/dashboard" && (currentPath === "/staff" || currentPath === "/staff/dashboard")) {
      return true;
    }
    return currentPath === path;
  };

  const getBtnClass = (path: string) => {
    return `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 border ${
      isActive(path)
        ? "bg-tickify-cyan/15 text-tickify-cyan border-tickify-cyan/20 shadow-[0_0_15px_rgba(0,255,242,0.1)]"
        : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
    }`;
  };

  return (
    <div className="min-h-screen bg-tickify-bg text-white">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-tickify-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/staff/dashboard")}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-tickify-cyan to-tickify-purple flex items-center justify-center shadow-lg">
                <Film size={18} className="text-white" />
              </div>
              <div>
                <span className="text-lg font-display font-bold text-white">Tickify</span>
                <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-tickify-cyan bg-tickify-cyan/10 px-2 py-0.5 rounded-full">
                  {role || "Staff"}
                </span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigate("/staff/dashboard")}
                className={getBtnClass("/staff/dashboard")}
              >
                <LayoutDashboard size={16} />
                Dashboard
              </button>
              <button
                onClick={() => navigate("/staff/pos")}
                className={getBtnClass("/staff/pos")}
              >
                <ShoppingCart size={16} />
                Quầy Vé
              </button>
              <button
                onClick={() => navigate("/staff/food")}
                className={getBtnClass("/staff/food")}
              >
                <CupSoda size={16} />
                Quầy Nước
              </button>
            </nav>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors font-semibold"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  );
}
