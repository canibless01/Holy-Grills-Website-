import React from 'react';
import { Flame } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading...', fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="relative">
        <div className="w-10 h-10 border-4 border-cocoa-200 border-t-flame-600 rounded-full animate-spin" />
        <Flame className="w-4 h-4 text-flame-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="text-sm text-cocoa-400 font-medium">{label}</p>
    </div>
  );
  if (fullScreen) return <div className="fixed inset-0 bg-cocoa-50 flex items-center justify-center z-50">{content}</div>;
  return content;
}