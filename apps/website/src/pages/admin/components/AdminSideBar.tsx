import {
  LayoutDashboard,
  Clock,
  Clapperboard,
  Film,
  LogOut,
  User,
  Popcorn,
  Users,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function AdminSideBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any admin session/token if needed
    // For now, just redirect to home
    navigate("/");
  };

  const menuItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      path: "/admin/dashboard",
    },
    { icon: <Clock size={20} />, label: "Showtimes", path: "/admin/showtimes" },
    {
      icon: <Clapperboard size={20} />,
      label: "Movies",
      path: "/admin/movies",
    },
    { icon: <Film size={20} />, label: "Cinemas", path: "/admin/cinemas" },
    {
      icon: <Popcorn size={20} />,
      label: "Foods & Drinks",
      path: "/admin/foods",
    },
    {
      icon: <Users size={20} />,
      label: "Staff",
      path: "/admin/staff",
    },
  ];

  return (
    <aside className="w-80 bg-tickify-card border-r border-white/5 flex flex-col h-screen sticky top-0">
      <div className="p-8">
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-tickify-pink rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,0,128,0.4)]">
            <Film size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white leading-none">
              TICKIFY
            </h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1">
              Management
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-full transition-all font-bold text-xs uppercase tracking-widest ${
                  isActive
                    ? "bg-linear-to-r from-tickify-pink to-tickify-purple text-white shadow-[0_0_25px_rgba(255,0,128,0.4)]"
                    : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-white/5 space-y-2">
        {/* Admin Profile Section */}
        <Link
          to="/admin/profile"
          className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all group ${
            location.pathname === "/admin/profile"
              ? "bg-white/5 border border-white/10"
              : "hover:bg-white/5"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-tickify-pink flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,0,128,0.3)]">
            <User size={20} />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-white leading-tight">
              Admin User
            </p>
            <p className="text-[10px] text-gray-500 font-medium">Super Admin</p>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-5 py-4 w-full text-gray-500 hover:text-tickify-pink transition-all font-bold text-xs uppercase tracking-widest"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
