import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, ExternalLink, LogOut } from 'lucide-react';
import { clearTokens } from '@/lib/apiClient';

// Full-width sticky header for the Kitchen panel. Sits above the max-width
// content area so the brand + key actions stay reachable on every screen size.
export default function KitchenHeader({ open, accepting }) {
  const navigate = useNavigate();
  const statusColor = open && accepting ? 'bg-emerald-500' : 'bg-flame-600';
  const statusLabel = open && accepting ? 'Open' : accepting ? 'Closed for the day' : 'Closed';

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur border-b border-cocoa-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl flame-gradient flex items-center justify-center shrink-0">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-heading font-extrabold text-base sm:text-lg text-cocoa-800 leading-none truncate">Kitchen</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${statusColor} relative flex`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${statusColor} opacity-60`} />
              </span>
              <span className="text-[11px] font-bold text-cocoa-500">{statusLabel}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to="/" className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-cream-100 border border-cocoa-200 text-xs font-bold text-cocoa-600 hover:text-flame-600 transition-colors">
            View Site <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button onClick={() => { clearTokens(); navigate('/'); }} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}