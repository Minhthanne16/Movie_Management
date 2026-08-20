import Hero from "./components/Hero.tsx";
import Stats from "./components/Stats.tsx";
import NowShowing from "./components/NowShowing.tsx";
import ComingSoon from "./components/ComingSoon.tsx";


export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <NowShowing />
      <ComingSoon />
      
      {/* CTA Banner */}
      <section className="px-8 py-20">
        <div className="relative w-full rounded-[3rem] overflow-hidden bg-linear-to-r from-tickify-pink/20 to-tickify-purple/20 border border-white/10 p-12 md:p-20 text-center">
          <div className="absolute inset-0 bg-tickify-card/40 backdrop-blur-sm -z-10"></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Ready for Your Next Cyberpunk Cinema Adventure?
            </h2>
            <p className="text-gray-400 text-lg mb-10">
              Join thousands of digital movie explorers who trust Tickify for the ultimate cosmic cinema experience in the virtual realm.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-tickify-pink hover:bg-tickify-pink/90 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,0,128,0.3)]">
                Start Booking
              </button>
              <button className="bg-white/5 hover:bg-white/10 text-white px-10 py-4 rounded-xl font-bold border border-white/10 transition-all">
                Explore Universe
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
