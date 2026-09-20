import React from 'react';
import { Moon, WifiOff, SignalLow, Lock, X } from 'lucide-react';
import { BedtimeConfig, DeviceState } from '../types';

interface AndroidNotificationBannerProps {
  config: BedtimeConfig;
  deviceState: DeviceState;
  onLockScreen: () => void;
  onExitBedtime: () => void;
}

export const AndroidNotificationBanner: React.FC<AndroidNotificationBannerProps> = ({
  config,
  deviceState,
  onLockScreen,
  onExitBedtime,
}) => {
  if (!deviceState.isBedtimeActive) return null;

  return (
    <div className="mx-4 my-2 p-3.5 rounded-2xl bg-indigo-950/90 border border-indigo-500/40 shadow-lg text-white animate-in slide-in-from-top-3 duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-full bg-indigo-500/20 text-indigo-300">
            <Moon className="w-4 h-4 fill-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Bedtime mode is active</span>
              <span className="text-[10px] text-indigo-300 bg-indigo-900/60 px-1.5 py-0.2 rounded font-mono">
                Until {config.wakeTime}
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 mt-0.5 leading-tight">
              Custom rules applied: {!deviceState.wifiEnabled ? 'Wi-Fi off, ' : 'Wi-Fi on, '}
              {!deviceState.mobileDataEnabled ? 'Mobile Data off, ' : 'Mobile Data on, '}
              {deviceState.batterySaverEnabled ? 'Battery Saver (Eco & Dimmed), ' : ''}
              {config.enableGrayscale ? 'Grayscale on' : 'DND on'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-indigo-800/60 flex items-center justify-end gap-2">
        <button
          onClick={onExitBedtime}
          className="px-3 py-1 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-[11px] font-medium text-neutral-300 transition"
        >
          Pause Bedtime
        </button>

        {!deviceState.isLocked && (
          <button
            onClick={onLockScreen}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[11px] font-bold text-white shadow transition"
          >
            <Lock className="w-3 h-3" />
            Lock Phone
          </button>
        )}
      </div>
    </div>
  );
};
