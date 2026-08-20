import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Film,
  Bookmark,
  ShoppingCart,
  Crown,
  User,
  Zap,
} from "lucide-react";

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
              Tickify
            </span>
            <span className="text-[10px] text-gray-500 font-medium tracking-[0.2em] uppercase">
              .com
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.href;
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

      {/* Cosmic Points */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-tickify-pink/10 border border-tickify-pink/30 rounded-full px-4 py-2 shadow-[0_0_10px_rgba(255,0,128,0.1)]">
          <Zap size={16} className="text-tickify-pink fill-tickify-pink" />
          <span className="text-sm font-bold text-white">2.450</span>
          <div className="w-4 h-4 bg-tickify-pink rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
