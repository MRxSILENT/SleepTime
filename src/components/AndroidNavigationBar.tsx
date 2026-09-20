import React from 'react';
import { Triangle, Circle, Square, Lock, Moon } from 'lucide-react';

interface AndroidNavigationBarProps {
  onBack?: () => void;
  onHome?: () => void;
  onLockScreen?: () => void;
  isLocked?: boolean;
}

export const AndroidNavigationBar: React.FC<AndroidNavigationBarProps> = ({
  onBack,
  onHome,
  onLockScreen,
  isLocked = false,
}) => {
  return (
    <nav className="w-full h-11 px-8 flex items-center justify-between bg-neutral-950/90 select-none z-30 border-t border-white/5">
      {/* Back button (triangle pointing left) */}
      <button
        onClick={onBack}
        disabled={isLocked}
        className="p-2 text-neutral-400 hover:text-white active:scale-90 transition disabled:opacity-30 disabled:pointer-events-none"
        aria-label="Back"
      >
        <Triangle className="w-3.5 h-3.5 -rotate-90 fill-current" />
      </button>

      {/* Home / Gesture Pill button */}
      <button
        onClick={onHome}
        disabled={isLocked}
        className="px-6 py-2 group flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
        aria-label="Home"
      >
        <div className="w-16 h-1 rounded-full bg-neutral-500 group-hover:bg-white group-active:scale-95 transition" />
      </button>

      {/* Recents / Lock toggle button */}
      <button
        onClick={onLockScreen}
        className="p-2 text-neutral-400 hover:text-white active:scale-90 transition"
        title={isLocked ? 'Phone is Locked' : 'Lock Phone'}
        aria-label="Lock phone"
      >
        {isLocked ? (
          <Lock className="w-3.5 h-3.5 text-rose-400" />
        ) : (
          <Square className="w-3.5 h-3.5 stroke-2 fill-transparent" />
        )}
      </button>
    </nav>
  );
};
