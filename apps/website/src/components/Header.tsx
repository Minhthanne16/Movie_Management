import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Film,
  Bookmark,
  ShoppingCart,
  Crown,
  User,
  Zap,
  LogOut,
  LogIn,
} from "lucide-react";
import { authService } from "../services/auth.service";

const NAV_LINKS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Movies", href: "/movies", icon: Film },
  { label: "Watchlist", href: "/watchlist", icon: Bookmark },
  { label: "Snacks", href: "/snacks", icon: ShoppingCart },
  { label: "Membership", href: "/membership", icon: Crown },
  { label: "Profile", href: "/profile", icon: User },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userName =
    localStorage.getItem("userFullName") ||
    localStorage.getItem("userEmail") ||
    "Khách";

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <header className="w-full py-6 px-8 flex items-center justify-between">
      <div className="flex items-center gap-12">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-tickify-pink rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,0,128,0.5)]">
            <Film className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-display font-bold tracking-tight">
              Lycine
            </span>
            <span className="text-[10px] text-gray-500 font-medium tracking-[0.2em] uppercase">
              .com
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10">
          {NAV_LINKS.map((link) => {
            const isActive =
              location.pathname === link.href ||
              (link.href === "/" && location.pathname === "/home");
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-tickify-pink text-white shadow-[0_0_15px_rgba(255,0,128,0.4)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 bg-tickify-pink/10 border border-tickify-pink/30 rounded-full px-4 py-2 shadow-[0_0_10px_rgba(255,0,128,0.1)]">
          <Zap size={16} className="text-tickify-pink fill-tickify-pink" />
          <span className="text-sm font-bold text-white">2.450</span>
          <div className="w-4 h-4 bg-tickify-pink rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>

        {token ? (
          /* Logged In: Avatar & Logout */
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-tickify-cyan to-tickify-purple flex items-center justify-center text-xs font-bold text-white">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-medium text-gray-300 max-w-[100px] truncate hidden md:inline">
              {userName}
            </span>
            <button
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-1 text-gray-400 hover:text-red-400 transition-colors ml-1 cursor-pointer"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          /* Not Logged In: Login / Register */
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="flex items-center gap-1.5 bg-tickify-pink hover:bg-tickify-pink/90 text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-[0_0_12px_rgba(255,0,128,0.3)]"
            >
              <LogIn size={14} />
              Đăng nhập
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
