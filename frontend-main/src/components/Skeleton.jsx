import React from 'react';

/**
 * Skeleton — shimmer placeholder blocks for loading states.
 * Use <Skeleton className="h-4 w-32" /> etc. Matches the cocoa/flame palette.
 */
export default function Skeleton({ className = 'h-4 w-full' }) {
  return <div className={`rounded-lg bg-cocoa-100 animate-pulse ${className}`} />;
}

/** SkeletonCard — a pre-built card skeleton with shimmer. */
export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="rounded-2xl bg-white border border-cocoa-100 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-16" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-3" />
      ))}
    </div>
  );
}