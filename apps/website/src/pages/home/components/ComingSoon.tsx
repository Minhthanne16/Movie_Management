import { Bookmark, Bell } from "lucide-react";

interface UpcomingMovie {
  title: string;
  date: string;
  genre: string;
  color: string;
}

const UPCOMING: UpcomingMovie[] = [
  {
    title: "Captain America: Brave New World",
    date: "Feb 14, 2025",
    genre: "Action",
    color: "bg-tickify-pink"
  },
  {
    title: "Thunderbolts",
    date: "May 2, 2025",
    genre: "Superhero",
    color: "bg-tickify-purple"
  },
  {
    title: "Fantastic Four: First Steps",
    date: "Jul 25, 2025",
    genre: "Sci-Fi",
    color: "bg-tickify-cyan"
  }
];

export default function ComingSoon() {
  return (
    <section className="px-8 py-12">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-3xl font-display font-bold">Coming Soon</h2>
        <button className="text-sm font-bold text-gray-400 hover:text-white transition-colors border border-white/10 rounded-lg px-4 py-2">
          View All Upcoming
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {UPCOMING.map((movie, index) => (
          <div key={index} className="bg-tickify-card border border-white/5 rounded-3xl p-8 hover:border-white/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <span className={`${movie.color} text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md`}>
                {movie.genre}
              </span>
              <span className="text-xs font-bold text-gray-500">{movie.date}</span>
            </div>
            
            <h3 className="text-xl font-display font-bold mb-8 leading-tight">{movie.title}</h3>
            
            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-sm font-bold border border-white/10 transition-all">
                <Bookmark size={16} />
                Add to Watchlist
              </button>
              <button className="flex items-center justify-center w-12 h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all">
                <Bell size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
