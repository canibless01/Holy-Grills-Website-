import React from 'react';
import { X } from 'lucide-react';

export function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 disabled:opacity-50 ${checked ? 'flame-gradient' : 'bg-cocoa-200'}`}
    >
      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full sm:max-w-lg bg-white rounded-3xl shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white px-5 py-4 border-b border-cocoa-100 flex items-center justify-between z-10">
          <h3 className="font-heading font-extrabold text-base text-cocoa-800">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-cocoa-100">
            <X className="w-4 h-4 text-cocoa-500" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <div>
      <label className="text-[11px] font-bold text-cocoa-500 uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-cocoa-400 mt-1">{hint}</p>}
    </div>
  );
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full mt-1 p-2.5 rounded-xl border border-cocoa-200 text-sm focus:outline-none focus:border-flame-400 ${props.className || ''}`}
    />
  );
}

const TONES = {
  cocoa: 'bg-cocoa-100 text-cocoa-600',
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  flame: 'bg-flame-100 text-flame-700',
};

export function Pill({ children, tone = 'cocoa' }) {
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TONES[tone]}`}>{children}</span>;
}

export function Card({ children, className = '' }) {
  return <div className={`rounded-2xl bg-white border border-cocoa-100 p-4 ${className}`}>{children}</div>;
}

export function SectionHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-bold text-sm text-cocoa-800">{title}</h3>
      {action}
    </div>
  );
}