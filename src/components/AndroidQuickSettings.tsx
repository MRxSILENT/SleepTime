import React from 'react';
import { 
  Wifi, WifiOff, Signal, SignalLow, Moon, BellOff, Bell,
  Eye, EyeOff, Sun, Bluetooth, BluetoothOff, Flashlight, 
  X, CheckCircle2, Sliders, Shield, Zap
} from 'lucide-react';
import { DeviceState, BedtimeConfig } from '../types';

interface AndroidQuickSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  deviceState: DeviceState;
  config: BedtimeConfig;
  onToggleWifi: () => void;
  onToggleData: () => void;
  onToggleBluetooth: () => void;
  onToggleBatterySaver: () => void;
  onToggleDnd: () => void;
  onToggleGrayscale: () => void;
  onToggleNightLight: () => void;
  onTriggerBedtimeNow: () => void;
  onExitBedtime: () => void;
  onChangeBrightness: (value: number) => void;
}

export const AndroidQuickSettings: React.FC<AndroidQuickSettingsProps> = ({
  isOpen,
  onClose,
  deviceState,
  config,
  onToggleWifi,
  onToggleData,
  onToggleBluetooth,
  onToggleBatterySaver,
  onToggleDnd,
  onToggleGrayscale,
  onToggleNightLight,
  onTriggerBedtimeNow,
  onExitBedtime,
  onChangeBrightness,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-40 bg-neutral-950/95 backdrop-blur-xl flex flex-col p-5 text-white overflow-y-auto select-none animate-in fade-in slide-in-from-top-4 duration-200">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h2 className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
            Android Quick Settings
          </h2>
          <p className="text-sm font-medium text-white/90">
            System Radios & Distraction Controls
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition text-white"
          aria-label="Close Quick Settings"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Offline Guarantee Banner */}
      <div className="mt-3 px-3 py-2 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
        <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
        <p className="leading-tight">
          <span className="font-semibold text-emerald-200">100% Offline Device Mode:</span> All network definitions & schedules run locally in browser cache. No cloud synchronization.
        </p>
      </div>

      {/* Material You 2-column Quick Tiles Grid */}
      <div className="grid grid-cols-2 gap-2.5 mt-4">
        {/* Wi-Fi Tile */}
        <button
          onClick={onToggleWifi}
          className={`flex items-center gap-3 p-3.5 rounded-3xl transition-all duration-200 text-left ${
            deviceState.wifiEnabled
              ? 'bg-sky-400 text-neutral-950 font-medium shadow-md shadow-sky-500/20'
              : 'bg-neutral-800/90 text-white/70 hover:bg-neutral-800'
          }`}
          title={deviceState.wifiEnabled ? 'Wi-Fi is ON (Click to turn OFF)' : 'Wi-Fi is OFF (Click to turn ON)'}
        >
          <div className={`p-2 rounded-full ${deviceState.wifiEnabled ? 'bg-sky-600/30 text-neutral-950' : 'bg-neutral-700 text-white/80'}`}>
            {deviceState.wifiEnabled ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold leading-none">Wi-Fi</div>
            <div className="text-[11px] opacity-80 mt-1 truncate">
              {deviceState.wifiEnabled ? 'Connected' : deviceState.isBedtimeActive ? 'Cutoff by Bedtime' : 'Turned Off'}
            </div>
          </div>
        </button>

        {/* Mobile Data Tile */}
        <button
          onClick={onToggleData}
          className={`flex items-center gap-3 p-3.5 rounded-3xl transition-all duration-200 text-left ${
            deviceState.mobileDataEnabled
              ? 'bg-sky-400 text-neutral-950 font-medium shadow-md shadow-sky-500/20'
              : 'bg-neutral-800/90 text-white/70 hover:bg-neutral-800'
          }`}
          title={deviceState.mobileDataEnabled ? 'Mobile Data is ON (Click to turn OFF)' : 'Mobile Data is OFF (Click to turn ON)'}
        >
          <div className={`p-2 rounded-full ${deviceState.mobileDataEnabled ? 'bg-sky-600/30 text-neutral-950' : 'bg-neutral-700 text-white/80'}`}>
            {deviceState.mobileDataEnabled ? <Signal className="w-5 h-5" /> : <SignalLow className="w-5 h-5" />}
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold leading-none">Mobile Data</div>
            <div className="text-[11px] opacity-80 mt-1 truncate">
              {deviceState.mobileDataEnabled ? '5G LTE' : deviceState.isBedtimeActive ? 'Cutoff by Bedtime' : 'Turned Off'}
            </div>
          </div>
        </button>

        {/* Bedtime Mode Tile */}
        <button
          onClick={deviceState.isBedtimeActive ? onExitBedtime : onTriggerBedtimeNow}
          className={`col-span-2 flex items-center justify-between p-3.5 rounded-3xl transition-all duration-200 ${
            deviceState.isBedtimeActive
              ? 'bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-300'
              : 'bg-neutral-800/90 text-white/80 hover:bg-neutral-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${deviceState.isBedtimeActive ? 'bg-indigo-700 text-white' : 'bg-neutral-700 text-white/80'}`}>
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold leading-none">
                Bedtime Mode
              </div>
              <div className="text-[11px] opacity-90 mt-1">
                {deviceState.isBedtimeActive 
                  ? `Active • Phone locked until ${config.wakeTime}` 
                  : `Scheduled: ${config.startTime} – ${config.wakeTime}`}
              </div>
            </div>
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
            deviceState.isBedtimeActive ? 'bg-white text-indigo-900' : 'bg-white/10 text-white/90'
          }`}>
            {deviceState.isBedtimeActive ? 'Deactivate' : 'Turn On Now'}
          </span>
        </button>

        {/* Do Not Disturb Tile */}
        <button
          onClick={onToggleDnd}
          className={`flex items-center gap-3 p-3.5 rounded-3xl transition-all duration-200 text-left ${
            deviceState.dndActive
              ? 'bg-amber-400 text-neutral-950 font-medium'
              : 'bg-neutral-800/90 text-white/70 hover:bg-neutral-800'
          }`}
        >
          <div className={`p-2 rounded-full ${deviceState.dndActive ? 'bg-amber-600/30 text-neutral-950' : 'bg-neutral-700 text-white/80'}`}>
            {deviceState.dndActive ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold leading-none">Do Not Disturb</div>
            <div className="text-[11px] opacity-80 mt-1 truncate">
              {deviceState.dndActive ? 'Priority only' : 'Off'}
            </div>
          </div>
        </button>

        {/* Grayscale Screen Tile */}
        <button
          onClick={onToggleGrayscale}
          className={`flex items-center gap-3 p-3.5 rounded-3xl transition-all duration-200 text-left ${
            deviceState.grayscaleActive
              ? 'bg-slate-300 text-neutral-950 font-medium'
              : 'bg-neutral-800/90 text-white/70 hover:bg-neutral-800'
          }`}
        >
          <div className={`p-2 rounded-full ${deviceState.grayscaleActive ? 'bg-slate-400/30 text-neutral-950' : 'bg-neutral-700 text-white/80'}`}>
            {deviceState.grayscaleActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold leading-none">Grayscale</div>
            <div className="text-[11px] opacity-80 mt-1 truncate">
              {deviceState.grayscaleActive ? 'Black & White' : 'Color'}
            </div>
          </div>
        </button>

        {/* Night Light Amber Tile */}
        <button
          onClick={onToggleNightLight}
          className={`flex items-center gap-3 p-3.5 rounded-3xl transition-all duration-200 text-left ${
            deviceState.nightLightActive
              ? 'bg-orange-400 text-neutral-950 font-medium'
              : 'bg-neutral-800/90 text-white/70 hover:bg-neutral-800'
          }`}
        >
          <div className={`p-2 rounded-full ${deviceState.nightLightActive ? 'bg-orange-600/30 text-neutral-950' : 'bg-neutral-700 text-white/80'}`}>
            <Sun className="w-5 h-5" />
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold leading-none">Night Light</div>
            <div className="text-[11px] opacity-80 mt-1 truncate">
              {deviceState.nightLightActive ? 'Warm Amber' : 'Standard'}
            </div>
          </div>
        </button>

        {/* Bluetooth Tile */}
        <button
          onClick={onToggleBluetooth}
          className={`flex items-center gap-3 p-3.5 rounded-3xl transition-all duration-200 text-left ${
            deviceState.bluetoothEnabled
              ? 'bg-sky-400 text-neutral-950 font-medium'
              : 'bg-neutral-800/90 text-white/70 hover:bg-neutral-800'
          }`}
        >
          <div className={`p-2 rounded-full ${deviceState.bluetoothEnabled ? 'bg-sky-600/30 text-neutral-950' : 'bg-neutral-700 text-white/80'}`}>
            {deviceState.bluetoothEnabled ? <Bluetooth className="w-5 h-5" /> : <BluetoothOff className="w-5 h-5" />}
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold leading-none">Bluetooth</div>
            <div className="text-[11px] opacity-80 mt-1 truncate">
              {deviceState.bluetoothEnabled ? 'On' : 'Off'}
            </div>
          </div>
        </button>

        {/* Battery Saver Tile */}
        <button
          onClick={onToggleBatterySaver}
          className={`flex items-center gap-3 p-3.5 rounded-3xl transition-all duration-200 text-left ${
            deviceState.batterySaverEnabled
              ? 'bg-amber-400 text-neutral-950 font-medium shadow-md shadow-amber-500/20'
              : 'bg-neutral-800/90 text-white/70 hover:bg-neutral-800'
          }`}
        >
          <div className={`p-2 rounded-full ${deviceState.batterySaverEnabled ? 'bg-amber-600/30 text-neutral-950' : 'bg-neutral-700 text-white/80'}`}>
            <Zap className="w-5 h-5" />
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold leading-none">Battery Saver</div>
            <div className="text-[11px] opacity-80 mt-1 truncate">
              {deviceState.batterySaverEnabled
                ? (deviceState.isBedtimeActive ? 'Throttled & Dimmed' : 'Active')
                : 'Off'}
            </div>
          </div>
        </button>
      </div>

      {/* Screen Brightness Slider */}
      <div className="mt-5 p-4 rounded-3xl bg-neutral-900 border border-white/10">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
          <span className="flex items-center gap-1.5 font-medium">
            <Sun className="w-4 h-4 text-amber-300" />
            Display Brightness
          </span>
          <span className="font-semibold text-white">{deviceState.screenBrightness}%</span>
        </div>
        <input
          type="range"
          min="5"
          max="100"
          value={deviceState.screenBrightness}
          onChange={(e) => onChangeBrightness(Number(e.target.value))}
          className="w-full accent-sky-400 h-2 bg-neutral-800 rounded-lg cursor-pointer"
        />
        {deviceState.dimActive && (
          <p className="text-[11px] text-indigo-300 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Bedtime automatic dimming is actively reducing display glare.
          </p>
        )}
      </div>

      {/* Battery Saver & Background Throttling Notice */}
      {deviceState.batterySaverEnabled && (
        <div className="mt-3 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-100 flex items-center gap-1.5">
              <span>Battery Saver Active</span>
              {deviceState.isBedtimeActive && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                  Bedtime Throttling
                </span>
              )}
            </div>
            <p className="text-[11px] text-amber-300/90 mt-0.5 leading-tight">
              {deviceState.isBedtimeActive
                ? 'Screen brightness reduced to lowest level and non-essential background processes, push sync, and app refreshes are halted.'
                : 'Display brightness restricted and background app sync throttled.'}
            </p>
          </div>
        </div>
      )}

      {/* Bottom dismiss */}
      <div className="mt-auto pt-4 flex justify-center">
        <button
          onClick={onClose}
          className="w-12 h-1.5 rounded-full bg-white/30 hover:bg-white/60 transition"
          aria-label="Swipe up to close"
        />
      </div>
    </div>
  );
};
