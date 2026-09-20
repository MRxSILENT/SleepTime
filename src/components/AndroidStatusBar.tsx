import React from 'react';
import { Wifi, WifiOff, Signal, SignalLow, Moon, BellOff, Lock, BatteryMedium, ShieldCheck, Zap } from 'lucide-react';
import { DeviceState } from '../types';

interface AndroidStatusBarProps {
  currentTime: Date;
  deviceState: DeviceState;
  showNotch?: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  currentTime,
  deviceState,
  showNotch = false,
}) => {
  const hours = currentTime.getHours();
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const timeFormatted = `${hours % 12 || 12}:${minutes}`;

  return (
    <header className="relative w-full h-8 px-4 flex items-center justify-between text-xs font-medium select-none z-30 transition-colors duration-300">
      {/* Left side: Clock & Status icons */}
      <div className="flex items-center gap-2">
        <span className="font-semibold tracking-tight text-white/90">
          {timeFormatted}
        </span>

        {deviceState.isBedtimeActive && (
          <span 
            className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
            title="Bedtime Mode Active"
          >
            <Moon className="w-2.5 h-2.5 text-indigo-400 fill-indigo-400" />
            <span className="hidden xs:inline">Bedtime</span>
          </span>
        )}

        {deviceState.dndActive && (
          <span title="Do Not Disturb active">
            <BellOff className="w-3 h-3 text-amber-400" />
          </span>
        )}

        {deviceState.isLocked && (
          <span title="Device Locked">
            <Lock className="w-3 h-3 text-rose-400/90" />
          </span>
        )}
      </div>

      {/* Center: Punch-hole camera (optional when inside device mockup) */}
      {showNotch && (
        <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-3.5 h-3.5 rounded-full bg-black ring-2 ring-neutral-800 shadow-inner" />
      )}

      {/* Right side: Offline & Network indicators (Wi-Fi, Data, Battery) */}
      <div className="flex items-center gap-2 text-white/80">
        {/* Offline Cache Indicator Badge */}
        <span 
          className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
          title="100% Offline • Local Cache Only"
        >
          <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
          <span className="hidden sm:inline">Offline</span>
        </span>

        {/* Wi-Fi indicator */}
        <div className="flex items-center" title={deviceState.wifiEnabled ? 'Wi-Fi: Connected' : 'Wi-Fi: Disabled by Bedtime'}>
          {deviceState.wifiEnabled ? (
            <Wifi className="w-3.5 h-3.5 text-white/90" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
          )}
        </div>

        {/* Mobile Internet Data indicator */}
        <div 
          className="flex items-center gap-0.5" 
          title={deviceState.mobileDataEnabled ? 'Mobile Data: 5G Active' : 'Mobile Data: Switched OFF by Bedtime'}
        >
          {deviceState.mobileDataEnabled ? (
            <>
              <Signal className="w-3.5 h-3.5 text-white/90" />
              <span className="text-[9px] font-bold text-sky-400">5G</span>
            </>
          ) : (
            <>
              <SignalLow className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[9px] font-bold text-rose-400 line-through">DATA</span>
            </>
          )}
        </div>

        {/* Battery with Saver Status */}
        <div 
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full transition-colors ${
            deviceState.batterySaverEnabled 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
              : 'text-white/80'
          }`}
          title={
            deviceState.batterySaverEnabled
              ? deviceState.isBedtimeActive
                ? 'Battery Saver Active: Background processes stopped, brightness minimized'
                : 'Battery Saver Active: Background throttled'
              : `Battery: ${deviceState.batteryLevel}%`
          }
        >
          {deviceState.batterySaverEnabled && (
            <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
          )}
          <span className="text-[10px]">{deviceState.batteryLevel}%</span>
          <BatteryMedium className={`w-3.5 h-3.5 ${deviceState.batterySaverEnabled ? 'text-amber-400' : 'text-emerald-400'}`} />
        </div>
      </div>
    </header>
  );
};
