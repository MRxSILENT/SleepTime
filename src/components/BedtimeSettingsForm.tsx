import React, { useState } from 'react';
import { 
  Wifi, WifiOff, Signal, SignalLow, Moon, Bell, BellOff, 
  Lock, KeyRound, Clock, Calendar, Eye, EyeOff, ShieldCheck, 
  Download, Upload, Trash2, Play, Volume2, Sparkles, ChevronRight,
  Sun, Check, PhoneCall, Database, Zap
} from 'lucide-react';
import { 
  BedtimeConfig, DeviceState, DayOfWeek, WifiBedtimeAction, 
  DataBedtimeAction, DndBedtimeAction, AmbientSoundType 
} from '../types';
import { CacheService } from '../services/cacheService';

interface BedtimeSettingsFormProps {
  config: BedtimeConfig;
  updateConfig: (newConfig: Partial<BedtimeConfig>) => void;
  deviceState: DeviceState;
  onTriggerBedtimeNow: () => void;
  onOpenHistory: () => void;
  onOpenQuickSettings: () => void;
  timeRemainingInfo: { label: string; text: string };
  onToggleWifi?: () => void;
  onToggleData?: () => void;
}

const DAYS_LIST: { key: DayOfWeek; label: string }[] = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
];

export const BedtimeSettingsForm: React.FC<BedtimeSettingsFormProps> = ({
  config,
  updateConfig,
  deviceState,
  onTriggerBedtimeNow,
  onOpenHistory,
  onOpenQuickSettings,
  timeRemainingInfo,
  onToggleWifi,
  onToggleData,
}) => {
  const [cacheMeta, setCacheMeta] = useState(() => CacheService.getCacheMetadata());
  const [showExportToast, setShowExportToast] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const toggleDay = (day: DayOfWeek) => {
    let updated: DayOfWeek[];
    if (config.repeatDays.includes(day)) {
      if (config.repeatDays.length === 1) return; // Keep at least one day
      updated = config.repeatDays.filter((d) => d !== day);
    } else {
      updated = [...config.repeatDays, day];
    }
    updateConfig({ repeatDays: updated });
  };

  const handleExportCache = () => {
    const data = CacheService.exportOfflineCache();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `android-bedtime-offline-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 3000);
  };

  const handleImportCache = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = CacheService.importOfflineCache(content);
      if (success) {
        setImportStatus('Cache restored successfully!');
        setCacheMeta(CacheService.getCacheMetadata());
        setTimeout(() => window.location.reload(), 800);
      } else {
        setImportStatus('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearCache = () => {
    if (confirm('Clear all local bedtime cache? (Will reset to offline defaults)')) {
      CacheService.clearAllCache();
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col gap-5 pb-16 text-neutral-100">
      {/* Bedtime Mode Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-neutral-900 border border-indigo-500/20 p-5 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Moon className="w-6 h-6 fill-indigo-400/20" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                Bedtime Mode
              </h1>
              <p className="text-xs text-neutral-400">
                Android Digital Wellbeing & Rest Automation
              </p>
            </div>
          </div>

          {/* Master Schedule Toggle */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => updateConfig({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Schedule Summary & Instant Trigger */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs text-neutral-400 font-medium">
              {timeRemainingInfo.label}:
            </div>
            <div className="text-sm font-bold text-indigo-300">
              {timeRemainingInfo.text} ({config.startTime} – {config.wakeTime})
            </div>
          </div>

          <button
            onClick={onTriggerBedtimeNow}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Test Bedtime Now
          </button>
        </div>
      </section>

      {/* 1. Bedtime Schedule Section */}
      <section className="rounded-3xl bg-neutral-900/90 border border-white/5 p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Bedtime Routine Schedule</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Start Time */}
          <div className="p-3 rounded-2xl bg-neutral-800/80 border border-neutral-700/60">
            <label className="text-[11px] font-medium text-neutral-400 block mb-1">
              Bedtime (Trigger)
            </label>
            <input
              type="time"
              value={config.startTime}
              onChange={(e) => updateConfig({ startTime: e.target.value })}
              className="w-full bg-transparent text-lg font-bold text-white font-mono focus:outline-none"
            />
            <span className="text-[10px] text-neutral-400">Settings apply & phone locks</span>
          </div>

          {/* Wake Time */}
          <div className="p-3 rounded-2xl bg-neutral-800/80 border border-neutral-700/60">
            <label className="text-[11px] font-medium text-neutral-400 block mb-1">
              Wake Up (Alarm)
            </label>
            <input
              type="time"
              value={config.wakeTime}
              onChange={(e) => updateConfig({ wakeTime: e.target.value })}
              className="w-full bg-transparent text-lg font-bold text-white font-mono focus:outline-none"
            />
            <span className="text-[10px] text-neutral-400">Alarm rings & radios restore</span>
          </div>
        </div>

        {/* Days of week */}
        <div>
          <label className="text-[11px] font-medium text-neutral-400 block mb-2">
            Repeat on Days
          </label>
          <div className="flex items-center justify-between gap-1">
            {DAYS_LIST.map(({ key, label }, idx) => {
              const active = config.repeatDays.includes(key);
              return (
                <button
                  key={`${key}-${idx}`}
                  onClick={() => toggleDay(key)}
                  className={`w-9 h-9 rounded-full text-xs font-semibold transition ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Custom Wi-Fi & Internet Data Rules (User's primary requirement!) */}
      <section className="rounded-3xl bg-neutral-900/90 border border-white/5 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-white">Network & Radios Controls</h2>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
            Live Radios & Automation
          </span>
        </div>
        <p className="text-xs text-neutral-400 mb-4">
          Manage real-time Wi-Fi and Mobile Data connections, and configure automatic shutoff during Bedtime to eliminate radiation, battery drain, and midnight alerts.
        </p>

        {/* Live Radio Hardware Status & Instant Toggles */}
        <div className="p-3.5 mb-4 rounded-2xl bg-neutral-800/80 border border-neutral-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-200">Current Device Radios</span>
            <span className="text-[10px] text-neutral-400 font-mono">Real-Time State</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Wi-Fi Radio Card */}
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-2 rounded-xl shrink-0 ${deviceState.wifiEnabled ? 'bg-sky-500/20 text-sky-400' : 'bg-neutral-800 text-neutral-500'}`}>
                  {deviceState.wifiEnabled ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-white truncate">Wi-Fi Radio</div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    {deviceState.wifiEnabled ? 'Home-5GHz • Connected' : 'Disconnected / Off'}
                  </div>
                </div>
              </div>
              {onToggleWifi && (
                <button
                  type="button"
                  onClick={onToggleWifi}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
                    deviceState.wifiEnabled
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'
                  }`}
                >
                  {deviceState.wifiEnabled ? 'Turn OFF' : 'Turn ON'}
                </button>
              )}
            </div>

            {/* Mobile Data Radio Card */}
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-2 rounded-xl shrink-0 ${deviceState.mobileDataEnabled ? 'bg-sky-500/20 text-sky-400' : 'bg-neutral-800 text-neutral-500'}`}>
                  {deviceState.mobileDataEnabled ? <Signal className="w-4 h-4" /> : <SignalLow className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-white truncate">Mobile Data</div>
                  <div className="text-[10px] text-neutral-400 truncate">
                    {deviceState.mobileDataEnabled ? '5G LTE • VoLTE Active' : 'Switched Off'}
                  </div>
                </div>
              </div>
              {onToggleData && (
                <button
                  type="button"
                  onClick={onToggleData}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
                    deviceState.mobileDataEnabled
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'
                  }`}
                >
                  {deviceState.mobileDataEnabled ? 'Turn OFF' : 'Turn ON'}
                </button>
              )}
            </div>
          </div>

          {/* Real-Time Connectivity Diagnostic Summary */}
          <div className="text-[11px] p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex items-center gap-2 text-neutral-300">
            {deviceState.wifiEnabled && deviceState.mobileDataEnabled && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Dual Connectivity Active: Connected via Wi-Fi with 5G cellular standby.</span>
              </>
            )}
            {deviceState.wifiEnabled && !deviceState.mobileDataEnabled && (
              <>
                <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0"></span>
                <span>Wi-Fi Only: Connected to local network. Cellular data is disabled (0 carrier MBs used).</span>
              </>
            )}
            {!deviceState.wifiEnabled && deviceState.mobileDataEnabled && (
              <>
                <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0"></span>
                <span>Cellular Data Only: Transmitting via 5G network. Wi-Fi radio is dormant.</span>
              </>
            )}
            {!deviceState.wifiEnabled && !deviceState.mobileDataEnabled && (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0"></span>
                <span className="text-rose-300 font-medium">100% Offline: All internet radios switched off. Zero EMF emissions and no pinging.</span>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Wi-Fi Action Rule */}
          <div className="p-3.5 rounded-2xl bg-neutral-800/70 border border-neutral-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-sky-400" />
                Bedtime Wi-Fi Rule
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                {config.wifiAction === 'turn_off' ? 'Turn OFF' : config.wifiAction === 'keep_on' ? 'Keep ON' : 'Unchanged'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['turn_off', 'keep_on', 'unchanged'] as WifiBedtimeAction[]).map((action) => (
                <button
                  key={action}
                  onClick={() => updateConfig({ wifiAction: action })}
                  className={`py-2 px-2 rounded-xl text-xs font-medium transition text-center truncate ${
                    config.wifiAction === action
                      ? 'bg-sky-500 text-neutral-950 font-bold shadow'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {action === 'turn_off' && 'Turn OFF'}
                  {action === 'keep_on' && 'Keep ON'}
                  {action === 'unchanged' && 'Don\'t Change'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-neutral-400 mt-2">
              {config.wifiAction === 'turn_off' && '✓ Automatically turns off Wi-Fi when bedtime begins, and restores it at wake time.'}
              {config.wifiAction === 'keep_on' && '✓ Keeps Wi-Fi active throughout the night.'}
              {config.wifiAction === 'unchanged' && '✓ Leaves Wi-Fi in its current state.'}
            </p>
          </div>

          {/* Mobile Internet Data Action Rule */}
          <div className="p-3.5 rounded-2xl bg-neutral-800/70 border border-neutral-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <Signal className="w-3.5 h-3.5 text-sky-400" />
                Bedtime Mobile Data (5G/LTE) Rule
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                {config.dataAction === 'turn_off' ? 'Turn OFF' : config.dataAction === 'keep_on' ? 'Keep ON' : 'Unchanged'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['turn_off', 'keep_on', 'unchanged'] as DataBedtimeAction[]).map((action) => (
                <button
                  key={action}
                  onClick={() => updateConfig({ dataAction: action })}
                  className={`py-2 px-2 rounded-xl text-xs font-medium transition text-center truncate ${
                    config.dataAction === action
                      ? 'bg-sky-500 text-neutral-950 font-bold shadow'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {action === 'turn_off' && 'Turn OFF'}
                  {action === 'keep_on' && 'Keep ON'}
                  {action === 'unchanged' && 'Don\'t Change'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-neutral-400 mt-2">
              {config.dataAction === 'turn_off' && '✓ Automatically switches off mobile cellular data to block internet notifications, and restores it at wake time.'}
              {config.dataAction === 'keep_on' && '✓ Keeps cellular data connection active.'}
              {config.dataAction === 'unchanged' && '✓ Leaves mobile data untouched.'}
            </p>
          </div>

          {/* Automation Schedule Explanation */}
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[11px] text-indigo-200 flex items-start gap-2">
            <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Bedtime Automation Schedule: </span>
              At <span className="font-mono text-indigo-300 font-bold">{config.startTime}</span>, Wi-Fi will{' '}
              <span className="text-white font-medium">{config.wifiAction === 'turn_off' ? 'switch off' : config.wifiAction === 'keep_on' ? 'remain on' : 'stay as-is'}</span> and Mobile Data will{' '}
              <span className="text-white font-medium">{config.dataAction === 'turn_off' ? 'switch off' : config.dataAction === 'keep_on' ? 'remain on' : 'stay as-is'}</span>.
              At morning alarm (<span className="font-mono text-indigo-300 font-bold">{config.wakeTime}</span>), your pre-bedtime radio states are automatically restored.
            </div>
          </div>
        </div>
      </section>

      {/* 3. Phone Lock & Distraction Prevention */}
      <section className="rounded-3xl bg-neutral-900/90 border border-white/5 p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-rose-400" />
          <h2 className="text-sm font-semibold text-white">Bedtime Phone Lock & Distractions</h2>
        </div>

        <div className="space-y-3">
          {/* Lock Phone Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-800/70">
            <div>
              <div className="text-xs font-semibold text-neutral-200">
                Lock Phone on Bedtime Arrival
              </div>
              <div className="text-[11px] text-neutral-400">
                Locks into sleep display to prevent midnight doom-scrolling
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.lockPhoneOnBedtime}
              onChange={(e) => updateConfig({ lockPhoneOnBedtime: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          {/* PIN Protection */}
          {config.lockPhoneOnBedtime && (
            <div className="p-3 rounded-2xl bg-neutral-800/70 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-neutral-200">
                  Unlock PIN Code
                </div>
                <div className="text-[11px] text-neutral-400">
                  Required to bypass the lock screen early
                </div>
              </div>
              <input
                type="password"
                maxLength={4}
                value={config.unlockPin}
                onChange={(e) => updateConfig({ unlockPin: e.target.value.replace(/\D/g, '') })}
                className="w-20 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-center font-mono font-bold text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Grayscale Mode */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-800/70">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-xs font-semibold text-neutral-200">
                  Grayscale Display
                </div>
                <div className="text-[11px] text-neutral-400">
                  Removes vibrant colors to reduce dopamine & sleep disruption
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.enableGrayscale}
              onChange={(e) => updateConfig({ enableGrayscale: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          {/* Screen Dimming */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-800/70">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-semibold text-neutral-200">
                  Screen Dim & Night Light
                </div>
                <div className="text-[11px] text-neutral-400">
                  Dims brightness to {config.dimBrightnessPercent}% with warm tint
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.enableScreenDimming}
              onChange={(e) => updateConfig({ enableScreenDimming: e.target.checked })}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          {/* Battery Saver Mode */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-neutral-800/70 border border-amber-500/20">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <span>Battery Saver during Bedtime</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                    Eco
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400">
                  Reduces screen brightness and disables non-essential background processes
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={config.enableBatterySaver}
              onChange={(e) => updateConfig({ enableBatterySaver: e.target.checked })}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          {/* Do Not Disturb Action */}
          <div className="p-3 rounded-2xl bg-neutral-800/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <BellOff className="w-3.5 h-3.5 text-amber-400" />
                Do Not Disturb
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['priority_only', 'total_silence', 'off'] as DndBedtimeAction[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => updateConfig({ dndAction: mode })}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-medium transition capitalize truncate ${
                    config.dndAction === mode
                      ? 'bg-amber-400 text-neutral-950 font-bold'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {mode.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Offline Sleep Synthesizer & Alarm */}
      <section className="rounded-3xl bg-neutral-900/90 border border-white/5 p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white">Offline Ambient Synthesizer & Alarm</h2>
        </div>
        <p className="text-xs text-neutral-400 mb-3">
          Synthesized directly in-browser using Web Audio API. 100% offline, zero audio file downloads.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* Ambient Sound choice */}
          <div className="p-3 rounded-2xl bg-neutral-800/70">
            <label className="text-[11px] font-medium text-neutral-400 block mb-1">
              Bedtime Sleep Noise
            </label>
            <select
              value={config.ambientSound}
              onChange={(e) => updateConfig({ ambientSound: e.target.value as AmbientSoundType })}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="none">Silent (No audio)</option>
              <option value="pink_noise">Pink Noise (Deep sleep)</option>
              <option value="soft_rain">Soft Rain Simulation</option>
              <option value="night_hum">Night Drone (108Hz)</option>
            </select>
          </div>

          {/* Alarm chime choice */}
          <div className="p-3 rounded-2xl bg-neutral-800/70">
            <label className="text-[11px] font-medium text-neutral-400 block mb-1">
              Wake-up Alarm
            </label>
            <select
              value={config.alarmSound}
              onChange={(e) => updateConfig({ alarmSound: e.target.value as any })}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="gentle_chime">Gentle Sunrise Chime</option>
              <option value="soft_bells">Soft Morning Bells</option>
              <option value="sunrise_melody">Harmonic Triad</option>
              <option value="silent">Vibrate Only</option>
            </select>
          </div>
        </div>
      </section>

      {/* 5. 100% Offline Local Cache Guarantee & Data Inspector */}
      <section className="rounded-3xl bg-emerald-950/30 border border-emerald-500/30 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-emerald-200">100% Offline & Local Cache</h2>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            No Cloud
          </span>
        </div>
        <p className="text-xs text-emerald-300/80 mb-4 leading-relaxed">
          As requested, this app uses zero external servers, cloud databases, or online methods. All settings, custom network rules, and sleep logs are encrypted in local cache storage on this Android device.
        </p>

        {/* Cache Storage Stats Card */}
        <div className="p-3 rounded-2xl bg-neutral-900/80 border border-emerald-500/20 mb-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[10px] text-neutral-400">Cached Size</div>
            <div className="text-xs font-bold text-emerald-300 font-mono mt-0.5">
              {(cacheMeta.estimatedBytes / 1024).toFixed(1)} KB
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-400">Storage Type</div>
            <div className="text-xs font-bold text-emerald-300 truncate mt-0.5">
              Local Cache
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-400">Last Synced</div>
            <div className="text-xs font-bold text-emerald-300 font-mono mt-0.5">
              {new Date(cacheMeta.lastCachedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Cache Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportCache}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 transition"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Backup Cache
          </button>

          <label className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 cursor-pointer transition">
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            Restore Cache
            <input type="file" accept=".json" onChange={handleImportCache} className="hidden" />
          </label>

          <button
            onClick={handleClearCache}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-rose-950 text-xs font-medium text-rose-300 transition"
            title="Clear Cache"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {showExportToast && (
          <div className="mt-2 text-xs text-emerald-300 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            Offline backup downloaded to your Android downloads folder.
          </div>
        )}

        {importStatus && (
          <div className="mt-2 text-xs text-amber-300">
            {importStatus}
          </div>
        )}
      </section>

      {/* Navigation Quick Links */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenHistory}
          className="flex-1 py-3 px-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 flex items-center justify-between text-xs font-semibold text-neutral-200 transition"
        >
          <span>View Sleep Logs in Cache</span>
          <ChevronRight className="w-4 h-4 text-neutral-400" />
        </button>

        <button
          onClick={onOpenQuickSettings}
          className="py-3 px-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 flex items-center gap-2 text-xs font-semibold text-neutral-200 transition"
        >
          <span>Quick Settings</span>
        </button>
      </div>
    </div>
  );
};
