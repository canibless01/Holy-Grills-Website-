import React from 'react';
import { Bike, Power, ExternalLink, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RiderHeader({ online, onToggleOnline, onSignOut }) {
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-cocoa-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flame-gradient flex items-center justify-center shadow-selected-soft">
            <Bike className="w-5 h-5 text-white" />
          </div>
          <div className="leading-none">
            <h1 className="font-heading font-extrabold text-lg text-cocoa-800">Rider</h1>
            <div className="text-[10px] text-cocoa-400 font-semibold uppercase tracking-wider">Delivery Dashboard</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-cocoa-200 text-xs font-bold text-cocoa-600 hover:text-flame-600 hover:border-flame-200 transition-colors">
            View Site <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button onClick={onSignOut} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
          <button
            onClick={onToggleOnline}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              online
                ? 'bg-green-500 text-white shadow-selected-soft'
                : 'bg-cocoa-100 text-cocoa-500'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {online ? 'Online' : 'Offline'}
          </button>
        </div>
      </div>
    </header>
  );
}