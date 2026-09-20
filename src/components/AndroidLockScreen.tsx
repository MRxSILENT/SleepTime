import React, { useState } from 'react';
import { 
  Lock, Unlock, Moon, ShieldAlert, Phone, Volume2, 
  VolumeX, BellRing, Wifi, WifiOff, Signal, SignalLow, EyeOff, Sparkles,
  ArrowUp, KeyRound, AlertTriangle, Zap
} from 'lucide-react';
import { BedtimeConfig, DeviceState, AmbientSoundType } from '../types';
import { AudioService } from '../services/audioService';

interface AndroidLockScreenProps {
  currentTime: Date;
  config: BedtimeConfig;
  deviceState: DeviceState;
  isAlarmRinging: boolean;
  timeRemainingText: string;
  onUnlock: () => void;
  onExitBedtime: (early: boolean) => void;
  onDismissAlarm: () => void;
}

export const AndroidLockScreen: React.FC<AndroidLockScreenProps> = ({
  currentTime,
  config,
  deviceState,
  isAlarmRinging,
  timeRemainingText,
  onUnlock,
  onExitBedtime,
  onDismissAlarm,
}) => {
  const [showPinPad, setShowPinPad] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [ambientAudioActive, setAmbientAudioActive] = useState<AmbientSoundType>(config.ambientSound);

  const hours = currentTime.getHours();
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const timeFormatted = `${hours % 12 || 12}:${minutes}`;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const dateFormatted = currentTime.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Handle PIN input
  const handlePinDigit = (digit: string) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + digit;
      setEnteredPin(nextPin);
      setPinError(false);

      if (nextPin.length === 4) {
        if (nextPin === config.unlockPin) {
          // Success
          AudioService.playUnlockClick();
          onUnlock();
        } else {
          // Failure
          setPinError(true);
          AudioService.triggerHaptic();
          setTimeout(() => {
            setEnteredPin('');
            setPinError(false);
          }, 700);
        }
      }
    }
  };

  const handlePinBackspace = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setPinError(false);
  };

  const toggleAmbientSound = (sound: AmbientSoundType) => {
    if (ambientAudioActive === sound) {
      AudioService.stopAmbientSound();
      setAmbientAudioActive('none');
    } else {
      AudioService.startAmbientSound(sound, 30);
      setAmbientAudioActive(sound);
    }
  };

  // If Alarm is currently ringing in the morning
  if (isAlarmRinging) {
    return (
      <div className="absolute inset-0 z-50 bg-gradient-to-b from-indigo-950 via-slate-900 to-black flex flex-col items-center justify-between p-8 text-white select-none animate-in fade-in duration-300">
        <div className="flex flex-col items-center mt-12 text-center">
          <div className="p-4 rounded-full bg-amber-400 text-slate-950 animate-bounce shadow-xl shadow-amber-400/30">
            <BellRing className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-extrabold mt-6 tracking-tight">
            Good Morning
          </h1>
          <p className="text-neutral-300 text-sm mt-2">
            Bedtime mode scheduled period completed.
          </p>
          <div className="text-6xl font-light tracking-tighter mt-6 font-mono">
            {timeFormatted} <span className="text-2xl font-sans">{ampm}</span>
          </div>
        </div>

        <div className="w-full max-w-xs flex flex-col gap-3 mb-10">
          <button
            onClick={onDismissAlarm}
            className="w-full py-4 rounded-3xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-bold text-base shadow-xl transition"
          >
            Wake Up & Unlock Device
          </button>
          <p className="text-center text-xs text-neutral-400">
            Wi-Fi and mobile data will be automatically restored.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-neutral-950 flex flex-col justify-between p-6 text-white select-none overflow-hidden">
      {/* Background ambient stars & moon illustration */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute top-12 left-10 w-1 h-1 bg-white rounded-full animate-ping" />
        <div className="absolute top-24 right-16 w-1.5 h-1.5 bg-indigo-300 rounded-full" />
        <div className="absolute top-48 left-1/3 w-1 h-1 bg-amber-100 rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white rounded-full" />
      </div>

      {/* Top Lock Indicator */}
      <div className="relative z-10 flex flex-col items-center pt-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-neutral-300 text-xs font-medium shadow-inner">
          <Lock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Phone Locked by Bedtime</span>
        </div>
      </div>

      {/* Center Clock & Date */}
      {!showPinPad ? (
        <div className="relative z-10 flex flex-col items-center my-auto text-center">
          <div className="text-7xl font-extralight tracking-tight font-sans text-white/95 drop-shadow-md">
            {timeFormatted}
          </div>
          <div className="text-sm font-medium text-neutral-400 mt-1">
            {dateFormatted}
          </div>

          {/* Bedtime Status Pill */}
          <div className="mt-5 px-4 py-2.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 backdrop-blur-md flex items-center gap-2.5 max-w-xs shadow-lg">
            <div className="p-1.5 rounded-full bg-indigo-500/20 text-indigo-300">
              <Moon className="w-4 h-4 fill-indigo-400 text-indigo-400" />
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-indigo-200">
                Bedtime Mode Active
              </div>
              <div className="text-[11px] text-indigo-300/80">
                {timeRemainingText} ({config.wakeTime} AM)
              </div>
            </div>
          </div>

          {/* Active Custom Rules Applied Cards */}
          <div className="mt-5 w-full max-w-xs grid grid-cols-2 gap-2 text-left">
            <div className="p-2.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-2">
              {deviceState.wifiEnabled ? (
                <Wifi className="w-4 h-4 text-sky-400 shrink-0" />
              ) : (
                <WifiOff className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <div className="truncate">
                <div className="text-[11px] font-semibold text-neutral-200">Wi-Fi</div>
                <div className={`text-[10px] truncate ${deviceState.wifiEnabled ? 'text-sky-300' : 'text-neutral-400'}`}>
                  {deviceState.wifiEnabled ? 'Connected' : 'Cutoff (Bedtime)'}
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-2">
              {deviceState.mobileDataEnabled ? (
                <Signal className="w-4 h-4 text-sky-400 shrink-0" />
              ) : (
                <SignalLow className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <div className="truncate">
                <div className="text-[11px] font-semibold text-neutral-200">Mobile Data</div>
                <div className={`text-[10px] truncate ${deviceState.mobileDataEnabled ? 'text-sky-300' : 'text-neutral-400'}`}>
                  {deviceState.mobileDataEnabled ? '5G Active' : 'Switched Off'}
                </div>
              </div>
            </div>

            {config.enableGrayscale && (
              <div className="p-2.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-slate-300 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-semibold text-neutral-200">Grayscale</div>
                  <div className="text-[10px] text-neutral-400">Eye safe</div>
                </div>
              </div>
            )}

            <div className="p-2.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <div className="truncate">
                <div className="text-[11px] font-semibold text-neutral-200">Distraction</div>
                <div className="text-[10px] text-neutral-400">Silenced</div>
              </div>
            </div>

            {deviceState.batterySaverEnabled && (
              <div className="p-2.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center gap-2 col-span-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-semibold text-amber-200">Battery Saver Active</div>
                  <div className="text-[10px] text-amber-300/80 truncate">
                    Background halted • Brightness minimized
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Offline Ambient Sleep Sound Synthesizer Controls */}
          <div className="mt-4 p-3 rounded-2xl bg-neutral-900/60 border border-white/5 w-full max-w-xs">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 text-center mb-2">
              Offline Sleep Synthesizer
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => toggleAmbientSound('pink_noise')}
                className={`px-2.5 py-1 rounded-xl text-xs transition ${
                  ambientAudioActive === 'pink_noise'
                    ? 'bg-indigo-500 text-white font-medium shadow-sm'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                Pink Noise
              </button>
              <button
                onClick={() => toggleAmbientSound('soft_rain')}
                className={`px-2.5 py-1 rounded-xl text-xs transition ${
                  ambientAudioActive === 'soft_rain'
                    ? 'bg-indigo-500 text-white font-medium shadow-sm'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                Soft Rain
              </button>
              <button
                onClick={() => toggleAmbientSound('night_hum')}
                className={`px-2.5 py-1 rounded-xl text-xs transition ${
                  ambientAudioActive === 'night_hum'
                    ? 'bg-indigo-500 text-white font-medium shadow-sm'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                Night Hum
              </button>
              {ambientAudioActive !== 'none' && (
                <button
                  onClick={() => toggleAmbientSound('none')}
                  className="p-1 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
                  title="Mute ambient sound"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* PIN Keypad Screen */
        <div className="relative z-10 flex flex-col items-center my-auto w-full max-w-xs animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 text-indigo-300 mb-2">
            <KeyRound className="w-5 h-5" />
            <span className="text-sm font-semibold">Enter Android PIN</span>
          </div>
          <p className="text-xs text-neutral-400 mb-5">
            Default PIN is 1234 (configured in settings)
          </p>

          {/* PIN Dots */}
          <div className="flex items-center gap-4 mb-6">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  pinError
                    ? 'bg-rose-500 animate-shake'
                    : idx < enteredPin.length
                    ? 'bg-sky-400 scale-110 shadow-md shadow-sky-400/50'
                    : 'bg-neutral-800 border border-neutral-700'
                }`}
              />
            ))}
          </div>

          {pinError && (
            <div className="text-xs text-rose-400 font-medium mb-3">
              Incorrect PIN. Try again.
            </div>
          )}

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3 w-full">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                onClick={() => handlePinDigit(num)}
                className="h-14 rounded-full bg-neutral-800/80 hover:bg-neutral-700 active:scale-95 text-xl font-medium text-white flex items-center justify-center shadow transition"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="h-14 rounded-full bg-neutral-900/60 hover:bg-neutral-800 text-xs font-semibold text-rose-400 flex items-center justify-center transition"
            >
              SOS
            </button>
            <button
              onClick={() => handlePinDigit('0')}
              className="h-14 rounded-full bg-neutral-800/80 hover:bg-neutral-700 active:scale-95 text-xl font-medium text-white flex items-center justify-center shadow transition"
            >
              0
            </button>
            <button
              onClick={handlePinBackspace}
              className="h-14 rounded-full bg-neutral-900/60 hover:bg-neutral-800 active:scale-95 text-xs font-medium text-neutral-300 flex items-center justify-center transition"
            >
              Delete
            </button>
          </div>

          <button
            onClick={() => setShowPinPad(false)}
            className="mt-4 text-xs text-neutral-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="relative z-10 flex flex-col items-center gap-3 pt-2">
        {!showPinPad ? (
          <>
            <button
              onClick={() => {
                if (config.requirePinToUnlock) {
                  setShowPinPad(true);
                } else {
                  onUnlock();
                }
              }}
              className="group flex flex-col items-center gap-1.5 text-neutral-400 hover:text-white transition py-2"
            >
              <ArrowUp className="w-5 h-5 text-indigo-400 animate-bounce" />
              <span className="text-xs font-medium tracking-wide">
                {config.requirePinToUnlock ? 'Swipe or Tap for PIN to Unlock' : 'Tap to Unlock Phone'}
              </span>
            </button>

            <div className="w-full flex items-center justify-between text-xs text-neutral-400 px-2 pt-1 border-t border-neutral-900">
              <button
                onClick={() => setShowEmergencyModal(true)}
                className="flex items-center gap-1 hover:text-rose-300 transition"
              >
                <Phone className="w-3.5 h-3.5 text-rose-400" />
                <span>Emergency</span>
              </button>

              <button
                onClick={() => onExitBedtime(true)}
                className="hover:text-amber-300 transition underline underline-offset-4"
              >
                End Bedtime Early
              </button>
            </div>
          </>
        ) : null}
      </div>

      {/* Emergency Call Dialog */}
      {showEmergencyModal && (
        <div className="absolute inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-xs p-6 rounded-3xl bg-neutral-900 border border-neutral-800 text-white shadow-2xl">
            <div className="p-3 rounded-full bg-rose-500/20 text-rose-400 w-fit mx-auto mb-3">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center">
              Emergency Contact
            </h3>
            <p className="text-xs text-neutral-400 text-center mt-1">
              Bedtime restrictions are temporarily lifted for emergency communications.
            </p>

            <div className="mt-4 p-3 rounded-2xl bg-neutral-800/80 text-center">
              <div className="text-sm font-semibold text-neutral-200">{config.emergencyName}</div>
              <div className="text-lg font-mono font-bold text-rose-400 mt-0.5">{config.emergencyNumber}</div>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <a
                href={`tel:${config.emergencyNumber}`}
                className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm text-center shadow-lg transition"
              >
                Place Call ({config.emergencyNumber})
              </a>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="w-full py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition"
              >
                Return to Lock Screen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
