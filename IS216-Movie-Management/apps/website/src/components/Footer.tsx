import { Film } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="px-8 pt-24 pb-12 bg-tickify-card/50 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-tickify-pink rounded-lg flex items-center justify-center">
              <Film className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">
              Tickify
            </span>
          </Link>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            Your premier movie booking experience with rewards, community, and
            convenience in the digital age.
          </p>
        </div>

        <div>
          <h4 className="font-display font-bold mb-6">Movies & Snacks</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="hover:text-tickify-pink transition-colors"
              >
                Now Showing
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="hover:text-tickify-pink transition-colors"
              >
                Coming Soon
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="hover:text-tickify-pink transition-colors"
              >
                Snack Bar
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="hover:text-tickify-pink transition-colors"
              >
                4DX
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold mb-6">Community</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="hover:text-tickify-pink transition-colors"
              >
                Reviews
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="hover:text-tickify-pink transition-colors"
              >
                Discussions
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="hover:text-tickify-pink transition-colors"
              >
                Watchlist
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="hover:text-tickify-pink transition-colors"
              >
                Rewards
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold mb-6">Support</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="hover:text-tickify-pink transition-colors"
              >
                Help Center
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="hover:text-tickify-pink transition-colors"
              >
                Contact Us
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="hover:text-tickify-pink transition-colors"
              >
                Terms of Service
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="hover:text-tickify-pink transition-colors"
              >
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-gray-600 text-xs">
          © 2025 <span className="font-bold">Tickify.com</span> - Your Premier
          Movie Booking Experience in the Digital Cosmos
        </p>
        <div className="flex gap-6">
          <div className="w-5 h-5 bg-gray-800 rounded-full"></div>
          <div className="w-5 h-5 bg-gray-800 rounded-full"></div>
          <div className="w-5 h-5 bg-gray-800 rounded-full"></div>
        </div>
      </div>
    </footer>
  );
}
