import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Mail, Phone, MapPin, Utensils } from 'lucide-react';
import APP_CONFIG from '@/config/app.config';

/**
 * Marketing footer — desktop only (hidden on mobile, where the app works
 * via bottom nav). Rendered on every Layout-wrapped page.
 *
 * Brand system: brown (cocoa-800) background, cream text, gold icons.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="hidden md:block bg-cocoa-800 text-cream-200">
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-xl flame-gradient flex items-center justify-center shadow-lg shadow-flame-600/30">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className="font-heading font-bold text-lg text-white">{APP_CONFIG.name.toUpperCase()}</div>
          </div>
          <p className="text-sm text-cream-200/80 leading-relaxed">
            Real flame. Real flavour. Built for student life. {APP_CONFIG.tagline} 🔥
          </p>
        </div>

        {/* Explore */}
        <div>
          <h4 className="font-heading font-bold text-white text-xs mb-4 uppercase tracking-wider">Explore</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/menu" className="text-cream-200/80 hover:text-gold-300 transition-colors">Menu</Link></li>
            <li><Link to="/events" className="text-cream-200/80 hover:text-gold-300 transition-colors">Events</Link></li>
            <li><Link to="/marketplace" className="text-cream-200/80 hover:text-gold-300 transition-colors">Marketplace</Link></li>
            <li><Link to="/wallet" className="text-cream-200/80 hover:text-gold-300 transition-colors">Wallet</Link></li>
            <li><Link to="/leaderboard" className="text-cream-200/80 hover:text-gold-300 transition-colors">Leaderboard</Link></li>
            <li><Link to="/rewards" className="text-cream-200/80 hover:text-gold-300 transition-colors">Rewards</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="font-heading font-bold text-white text-xs mb-4 uppercase tracking-wider">Support</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-gold-300 shrink-0" />
              <a href="mailto:holygrillfuta@gmail.com" className="text-cream-200/80 hover:text-gold-300 transition-colors">holygrillfuta@gmail.com</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-gold-300 shrink-0" />
              <a href="tel:+2348056789012" className="text-cream-200/80 hover:text-gold-300 transition-colors">+234 805 678 9012</a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-gold-300 shrink-0 mt-0.5" />
              <span className="text-cream-200/80">{APP_CONFIG.university} Campus, Akure — Ondo State</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Utensils className="w-4 h-4 text-gold-300 shrink-0" />
              <Link to="/#catering" className="text-cream-200/80 hover:text-gold-300 transition-colors">Catering</Link>
            </li>
          </ul>
        </div>

        {/* Holy Points */}
        <div>
          <h4 className="font-heading font-bold text-white text-xs mb-4 uppercase tracking-wider">Holy Points</h4>
          <p className="text-sm text-cream-200/80 leading-relaxed">
            Earn Holy Points on every order. Stack them, climb the leaderboard, and unlock free sides, upgrades, and exclusive drops.
          </p>
          <Link to="/hp-education" className="inline-flex items-center gap-1 text-xs font-bold text-gold-300 hover:text-gold-200 transition-colors mt-3">
            Learn how it works →
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-cocoa-700/60">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-center gap-x-5 gap-y-2 text-center">
          <Link to="/our-story" className="text-xs text-cream-300/70 hover:text-gold-300 transition-colors">Our Story</Link>
          <Link to="/faq" className="text-xs text-cream-300/70 hover:text-gold-300 transition-colors">FAQ</Link>
          <Link to="/terms" className="text-xs text-cream-300/70 hover:text-gold-300 transition-colors">Terms & Privacy</Link>
          <span className="text-xs text-cream-300/70">© {year} {APP_CONFIG.name}. Only Flavor. Only Us. 🔥</span>
        </div>
      </div>
    </footer>
  );
}