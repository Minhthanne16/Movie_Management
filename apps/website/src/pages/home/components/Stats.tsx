import { Zap, Award, Play, Heart } from "lucide-react";

const STATS = [
  { 
    label: "Cosmic Points", 
    value: "2.450", 
    sub: "Earn more by booking!", 
    icon: Zap, 
    color: "text-tickify-cyan", 
    bg: "bg-tickify-cyan/10",
    border: "border-tickify-cyan/20",
    glow: "shadow-[0_0_20px_rgba(0,210,255,0.15)]"
  },
  { 
    label: "Badges Earned", 
    value: "3", 
    sub: "Cyberpunk level", 
    icon: Award, 
    color: "text-tickify-pink", 
    bg: "bg-tickify-pink/10",
    border: "border-tickify-pink/20",
    glow: "shadow-[0_0_20px_rgba(255,0,128,0.15)]"
  },
  { 
    label: "Movies Watched", 
    value: "47", 
    sub: "This cyber-year", 
    icon: Play, 
    color: "text-green-400", 
    bg: "bg-green-400/10",
    border: "border-green-400/20",
    glow: "shadow-[0_0_20px_rgba(74,222,128,0.15)]"
  },
  { 
    label: "Wishlist Items", 
    value: "3", 
    sub: "Digital queue", 
    icon: Heart, 
    color: "text-tickify-pink", 
    bg: "bg-tickify-pink/10",
    border: "border-tickify-pink/20",
    glow: "shadow-[0_0_20px_rgba(255,0,128,0.15)]"
  },
];

export default function Stats() {
  return (
    <section className="px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {STATS.map((stat, index) => (
        <div 
          key={index} 
          className={`bg-tickify-card border ${stat.border} rounded-3xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.02] ${stat.glow}`}
        >
          <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-6`}>
            <stat.icon className={`${stat.color} w-6 h-6`} />
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{stat.label}</span>
          <span className="text-4xl font-display font-bold mb-2">{stat.value}</span>
          <span className="text-xs text-gray-400 font-medium">{stat.sub}</span>
        </div>
      ))}
    </section>
  );
}
