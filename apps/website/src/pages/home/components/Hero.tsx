import { Ticket, Users } from "lucide-react";
import { motion } from "motion/react";

export default function Hero() {
  return (
    <section className="px-8 py-6">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-display font-bold">Welcome to Tickify</h2>
        <div className="h-px flex-1 bg-linear-to-t from-white/20 to-transparent"></div>
        <div className="w-2 h-2 rounded-full bg-tickify-cyan shadow-[0_0_8px_rgba(0,210,255,0.8)]"></div>
      </div>

      <div className="relative w-full rounded-[2.5rem] overflow-hidden bg-tickify-card border border-white/5 p-12 md:p-20">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-bl from-tickify-pink/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-linear-to-tr from-tickify-purple/10 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-display font-bold leading-[1.1] mb-8"
          >
            Your Ultimate Movie <br />
            Experience Awaits in <br />
            the <span className="text-transparent bg-clip-text bg-linear-to-r from-tickify-pink to-tickify-purple">Digital Cosmos</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl leading-relaxed"
          >
            Book tickets, discover new films, connect with fellow movie lovers, and earn cosmic rewards with every visit to the digital realm.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <button className="flex items-center gap-2 bg-tickify-pink hover:bg-tickify-pink/90 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,0,128,0.3)] hover:shadow-[0_0_30px_rgba(255,0,128,0.5)]">
              <Ticket size={20} />
              Book Tickets Now
            </button>
            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-bold border border-white/10 transition-all">
              <Users size={20} />
              Join Community
            </button>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-12 right-12 w-24 h-24 rounded-full border border-white/5 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-tickify-pink/20 blur-md"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
