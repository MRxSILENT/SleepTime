import React from 'react';
import { Smartphone, Monitor, Moon, Lock, Power, Sliders, History } from 'lucide-react';
import { DeviceState } from '../types';

interface AndroidDeviceFrameProps {
  children: React.ReactNode;
  isDeviceView: boolean;
  onToggleDeviceView: () => void;
  deviceState: DeviceState;
  onPowerButton: () => void;
  onOpenQuickSettings: () => void;
  onOpenHistory: () => void;
}

export const AndroidDeviceFrame: React.FC<AndroidDeviceFrameProps> = ({
  children,
  isDeviceView,
  onToggleDeviceView,
  deviceState,
  onPowerButton,
  onOpenQuickSettings,
  onOpenHistory,
}) => {
  // Grayscale & Dim filter classes applied to the screen
  const screenFilterStyle: React.CSSProperties = {
    filter: deviceState.grayscaleActive ? 'grayscale(100%)' : 'none',
    backgroundColor: deviceState.nightLightActive ? 'rgba(255, 170, 50, 0.04)' : undefined,
    opacity: deviceState.dimActive ? Math.max(0.4, deviceState.screenBrightness / 100) : 1,
    transition: 'filter 0.4s ease, opacity 0.4s ease, background-color 0.4s ease',
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col items-center justify-start sm:py-6 sm:px-4">
      {/* Top Workspace Bar (controls & switches) */}
      <header className="w-full max-w-md sm:max-w-xl mb-3 px-4 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-neutral-300">Android 15</span>
          <span className="hidden sm:inline opacity-60">• 100% Offline Cache</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Settings Shortcut */}
          <button
            onClick={onOpenQuickSettings}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 transition"
            title="Open Quick Settings Shade"
          >
            <Sliders className="w-3 h-3 text-sky-400" />
            <span className="hidden xs:inline">Quick Settings</span>
          </button>

          {/* Sleep Logs */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 transition"
            title="View Cached Sleep Logs"
          >
            <History className="w-3 h-3 text-indigo-400" />
            <span className="hidden xs:inline">Logs</span>
          </button>

          {/* Toggle View Mode */}
          <button
            onClick={onToggleDeviceView}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 transition"
            title="Toggle Device Frame vs Full Screen"
          >
            {isDeviceView ? (
              <>
                <Monitor className="w-3 h-3 text-indigo-400" />
                <span className="hidden xs:inline">Edge-to-Edge</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3 h-3 text-indigo-400" />
                <span className="hidden xs:inline">Pixel Frame</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="relative flex items-center justify-center w-full">
        {/* Hardware Power Button (simulated on side of frame in desktop mode) */}
        {isDeviceView && (
          <div className="hidden sm:block absolute -right-3.5 top-28 z-40">
            <button
              onClick={onPowerButton}
              className="w-2.5 h-12 bg-neutral-700 hover:bg-neutral-500 rounded-r-md shadow-md active:scale-95 transition"
              title="Android Power Button (Click to Lock / Unlock)"
              aria-label="Power button"
            />
          </div>
        )}

        {/* Device Chassis Frame */}
        <div
          className={`relative w-full ${
            isDeviceView
              ? 'max-w-[420px] aspect-[9/19.5] sm:min-h-[760px] sm:max-h-[880px] rounded-[48px] ring-[12px] ring-neutral-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-4 border-neutral-900'
              : 'max-w-md min-h-[92vh] sm:rounded-3xl sm:border sm:border-neutral-800'
          } bg-neutral-950 overflow-hidden flex flex-col`}
        >
          {/* Inner Screen Surface with Dynamic Filters (Grayscale, Dimming, Night Light) */}
          <div 
            className="relative w-full h-full flex flex-col flex-1 overflow-hidden"
            style={screenFilterStyle}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
