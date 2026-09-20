import { useState, useEffect, useCallback, useRef } from 'react';
import { BedtimeConfig, DeviceState, DayOfWeek, SleepSession } from '../types';
import { CacheService } from '../services/cacheService';
import { AudioService } from '../services/audioService';

const DAY_KEYS: DayOfWeek[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function useBedtimeScheduler() {
  const [config, setConfig] = useState<BedtimeConfig>(() => CacheService.loadConfig());
  const [deviceState, setDeviceState] = useState<DeviceState>(() => CacheService.loadDeviceState());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [lastTriggerMinute, setLastTriggerMinute] = useState<string | null>(null);

  // Pre-bedtime state cache to restore values when waking up
  const previousStateRef = useRef<{
    wifiEnabled: boolean;
    mobileDataEnabled: boolean;
    bluetoothEnabled: boolean;
    screenBrightness: number;
    batterySaverEnabled: boolean;
  }>({
    wifiEnabled: true,
    mobileDataEnabled: true,
    bluetoothEnabled: true,
    screenBrightness: 90,
    batterySaverEnabled: false,
  });

  // Save changes to offline cache
  const updateConfig = useCallback((newConfig: Partial<BedtimeConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      CacheService.saveConfig(updated);
      return updated;
    });
  }, []);

  const updateDeviceState = useCallback((newState: Partial<DeviceState>) => {
    setDeviceState((prev) => {
      const updated = { ...prev, ...newState };
      CacheService.saveDeviceState(updated);
      return updated;
    });
  }, []);

  // Activate Bedtime routine with user's defined custom settings
  const activateBedtime = useCallback((isManual = false) => {
    // Cache current pre-bedtime settings for restoration
    previousStateRef.current = {
      wifiEnabled: deviceState.wifiEnabled,
      mobileDataEnabled: deviceState.mobileDataEnabled,
      bluetoothEnabled: deviceState.bluetoothEnabled,
      screenBrightness: deviceState.screenBrightness,
      batterySaverEnabled: deviceState.batterySaverEnabled,
    };

    // Calculate applied network rules based on user's customization
    let nextWifi = deviceState.wifiEnabled;
    if (config.wifiAction === 'turn_off') nextWifi = false;
    else if (config.wifiAction === 'keep_on') nextWifi = true;

    let nextData = deviceState.mobileDataEnabled;
    if (config.dataAction === 'turn_off') nextData = false;
    else if (config.dataAction === 'keep_on') nextData = true;

    let nextBluetooth = deviceState.bluetoothEnabled;
    if (config.bluetoothAction === 'turn_off') nextBluetooth = false;
    else if (config.bluetoothAction === 'keep_on') nextBluetooth = true;

    const shouldEnableBatterySaver = config.enableBatterySaver || deviceState.batterySaverEnabled;
    const baseBedtimeBrightness = config.enableScreenDimming ? config.dimBrightnessPercent : deviceState.screenBrightness;
    // When battery saver is active during Bedtime Mode, reduce screen brightness and disable non-essential background processes
    const finalBrightness = shouldEnableBatterySaver
      ? Math.min(baseBedtimeBrightness, 12)
      : baseBedtimeBrightness;

    const sessionId = 'session_' + Date.now();
    const newSession: SleepSession = {
      id: sessionId,
      startedAt: new Date().toISOString(),
      scheduledStart: config.startTime,
      scheduledWake: config.wakeTime,
      wifiWasDisabled: nextWifi === false,
      dataWasDisabled: nextData === false,
      dndWasEnabled: config.dndAction !== 'off',
      batterySaverWasEnabled: shouldEnableBatterySaver,
      unlockedEarly: false,
    };

    // Save session in local cache
    CacheService.addSleepSession(newSession);

    // Play lock sound & haptic
    AudioService.playLockClick();
    AudioService.triggerHaptic();

    // Start ambient sleep sound if enabled
    if (config.ambientSound !== 'none') {
      AudioService.startAmbientSound(config.ambientSound, 35);
    }

    // Apply device state
    const nextState: DeviceState = {
      ...deviceState,
      wifiEnabled: nextWifi,
      mobileDataEnabled: nextData,
      bluetoothEnabled: nextBluetooth,
      dndActive: config.dndAction !== 'off',
      grayscaleActive: config.enableGrayscale,
      dimActive: config.enableScreenDimming || shouldEnableBatterySaver,
      screenBrightness: finalBrightness,
      nightLightActive: config.nightLightAmber,
      isLocked: config.lockPhoneOnBedtime, // Locks phone on bedtime arrival!
      isBedtimeActive: true,
      activeSessionId: sessionId,
      batterySaverEnabled: shouldEnableBatterySaver,
      backgroundProcessesDisabled: shouldEnableBatterySaver,
    };

    setDeviceState(nextState);
    CacheService.saveDeviceState(nextState);
  }, [config, deviceState]);

  // Wake up / Exit Bedtime routine
  const exitBedtime = useCallback((early = false) => {
    AudioService.stopAmbientSound();
    AudioService.stopAlarm();
    setIsAlarmRinging(false);
    AudioService.playUnlockClick();
    AudioService.triggerHaptic();

    if (deviceState.activeSessionId) {
      CacheService.updateSleepSession(deviceState.activeSessionId, {
        endedAt: new Date().toISOString(),
        unlockedEarly: early,
      });
    }

    // Restore device settings
    const restoredState: DeviceState = {
      ...deviceState,
      wifiEnabled: previousStateRef.current.wifiEnabled ?? true,
      mobileDataEnabled: previousStateRef.current.mobileDataEnabled ?? true,
      bluetoothEnabled: previousStateRef.current.bluetoothEnabled ?? true,
      dndActive: false,
      grayscaleActive: false,
      dimActive: false,
      screenBrightness: previousStateRef.current.screenBrightness ?? 90,
      batterySaverEnabled: previousStateRef.current.batterySaverEnabled ?? false,
      backgroundProcessesDisabled: false,
      nightLightActive: false,
      isLocked: false,
      isBedtimeActive: false,
      activeSessionId: null,
    };

    setDeviceState(restoredState);
    CacheService.saveDeviceState(restoredState);
  }, [deviceState]);

  // Toggle Wi-Fi manually or via Quick Settings
  const toggleWifi = useCallback(() => {
    AudioService.triggerHaptic();
    setDeviceState((prev) => {
      const willEnable = !prev.wifiEnabled;
      const updated: DeviceState = {
        ...prev,
        wifiEnabled: willEnable,
      };
      CacheService.saveDeviceState(updated);
      return updated;
    });
  }, []);

  // Toggle Mobile Data manually or via Quick Settings
  const toggleMobileData = useCallback(() => {
    AudioService.triggerHaptic();
    setDeviceState((prev) => {
      const willEnable = !prev.mobileDataEnabled;
      const updated: DeviceState = {
        ...prev,
        mobileDataEnabled: willEnable,
      };
      CacheService.saveDeviceState(updated);
      return updated;
    });
  }, []);

  // Toggle Battery Saver manually or via Quick Settings
  const toggleBatterySaver = useCallback(() => {
    setDeviceState((prev) => {
      const willEnable = !prev.batterySaverEnabled;
      let nextBrightness = prev.screenBrightness;

      if (willEnable) {
        if (!prev.isBedtimeActive) {
          previousStateRef.current.screenBrightness = prev.screenBrightness;
        }
        // When Bedtime Mode is active, reduces screen brightness and disables non-essential background processes
        if (prev.isBedtimeActive) {
          nextBrightness = Math.min(prev.screenBrightness, 12);
        } else {
          nextBrightness = Math.min(prev.screenBrightness, 40);
        }
      } else {
        // Restoring brightness
        if (prev.isBedtimeActive) {
          nextBrightness = config.enableScreenDimming ? config.dimBrightnessPercent : 50;
        } else {
          nextBrightness = previousStateRef.current.screenBrightness ?? 90;
        }
      }

      const updated: DeviceState = {
        ...prev,
        batterySaverEnabled: willEnable,
        // When Bedtime Mode is active, disables non-essential background processes
        backgroundProcessesDisabled: willEnable && prev.isBedtimeActive,
        screenBrightness: nextBrightness,
        dimActive: prev.dimActive || (willEnable && prev.isBedtimeActive),
      };

      AudioService.triggerHaptic();
      CacheService.saveDeviceState(updated);
      return updated;
    });
  }, [config.enableScreenDimming, config.dimBrightnessPercent]);

  // Unlock phone screen without ending bedtime mode (e.g. temporary PIN bypass)
  const unlockScreenOnly = useCallback(() => {
    AudioService.playUnlockClick();
    AudioService.triggerHaptic();
    updateDeviceState({ isLocked: false });
  }, [updateDeviceState]);

  // Relock phone screen while bedtime is running
  const relockScreen = useCallback(() => {
    AudioService.playLockClick();
    AudioService.triggerHaptic();
    updateDeviceState({ isLocked: true });
  }, [updateDeviceState]);

  // Dismiss ringing alarm
  const dismissAlarm = useCallback(() => {
    exitBedtime(false);
  }, [exitBedtime]);

  // Real-time clock and bedtime check loop
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (!config.enabled) return;

      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentFormatted = `${currentHours}:${currentMinutes}`;
      const dayIndex = now.getDay();
      const currentDayKey = DAY_KEYS[dayIndex];

      // Check if day is scheduled
      const isDayActive = config.repeatDays.includes(currentDayKey);

      // Only trigger once per minute
      if (lastTriggerMinute !== currentFormatted) {
        // Bedtime Trigger Check
        if (isDayActive && currentFormatted === config.startTime && !deviceState.isBedtimeActive) {
          setLastTriggerMinute(currentFormatted);
          activateBedtime(false);
        }

        // Wake-up Trigger Check
        if (deviceState.isBedtimeActive && currentFormatted === config.wakeTime) {
          setLastTriggerMinute(currentFormatted);
          setIsAlarmRinging(true);
          AudioService.startAlarm(config.alarmSound, config.alarmVolume);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [config, deviceState.isBedtimeActive, lastTriggerMinute, activateBedtime]);

  // Calculate time remaining until next bedtime or next wake time
  const getTimeRemainingDisplay = useCallback(() => {
    const now = currentTime;
    const [startH, startM] = config.startTime.split(':').map(Number);
    const [wakeH, wakeM] = config.wakeTime.split(':').map(Number);

    if (deviceState.isBedtimeActive) {
      // Time until wake up
      const target = new Date(now);
      target.setHours(wakeH, wakeM, 0, 0);
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }
      const diffMs = target.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return { label: 'Wake up in', text: `${diffHrs}h ${diffMins}m` };
    } else {
      // Time until bedtime arrives
      const target = new Date(now);
      target.setHours(startH, startM, 0, 0);
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }
      const diffMs = target.getTime() - now.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return { label: 'Bedtime starts in', text: `${diffHrs}h ${diffMins}m` };
    }
  }, [currentTime, config.startTime, config.wakeTime, deviceState.isBedtimeActive]);

  return {
    config,
    updateConfig,
    deviceState,
    updateDeviceState,
    currentTime,
    isAlarmRinging,
    activateBedtime,
    exitBedtime,
    unlockScreenOnly,
    relockScreen,
    dismissAlarm,
    getTimeRemainingDisplay,
    toggleBatterySaver,
    toggleWifi,
    toggleMobileData,
  };
}
