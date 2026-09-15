import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Flame, ExternalLink, LogOut, UtensilsCrossed, Bike } from 'lucide-react';
import AdminGlobalSearch from '@/components/admin/AdminGlobalSearch';

/**
 * Admin top bar — clean, compact, responsive.
 *
 * Layout (desktop):
 *   [hamburger (mobile only)] [section title + breadcrumb]   [Kitchen] [Rider] [View Site] [Sign out]
 *
 * Layout (mobile):
 *   [hamburger] [section title]   [sign out icon]
 *
 * The section title + description come from the TITLES map in Admin.jsx.
 */
export default function AdminHeader({ title, subtitle, onOpenMobile, onSignOut, onNavigate }) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-cocoa-100">
      <div className="px-4 lg:px-8 min-h-14 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Left — mobile menu + title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobile}
            className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-cocoa-100 transition-colors shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-cocoa-700" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="hidden sm:flex w-7 h-7 rounded-lg flame-gradient items-center justify-center shrink-0">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 leading-tight">
              <h1 className="font-heading font-bold text-sm sm:text-base text-cocoa-800 truncate">{title}</h1>
              {subtitle && (
                <p className="text-[10px] sm:text-[11px] text-cocoa-400 font-medium truncate">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Center — global search (visible on every breakpoint) */}
        <div className="order-3 lg:order-2 w-full sm:w-auto lg:flex-1 sm:max-w-xs sm:mx-4">
          <AdminGlobalSearch onNavigate={onNavigate} />
        </div>

        {/* Right — quick actions (full desktop cluster, visible on mobile too) */}
        <div className="order-2 lg:order-3 flex items-center gap-1 shrink-0">
          <Link
            to="/kitchen"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-cocoa-500 hover:text-flame-600 hover:bg-flame-50 transition-colors"
            title="Kitchen"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Kitchen</span>
          </Link>
          <Link
            to="/rider"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-cocoa-500 hover:text-flame-600 hover:bg-flame-50 transition-colors"
            title="Rider"
          >
            <Bike className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Rider</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-cocoa-500 hover:text-flame-600 hover:bg-flame-50 transition-colors"
            title="View site"
          >
            <ExternalLink className="w-3 h-3" /> <span className="hidden md:inline">View Site</span>
          </Link>
          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-cocoa-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}