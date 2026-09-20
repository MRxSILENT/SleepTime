/**
 * 100% Offline Local Cache Storage Service
 * Strictly operates on browser cache & local storage.
 * No external API requests, no cloud synchronization.
 */

import { BedtimeConfig, DeviceState, SleepSession, CacheMetadata } from '../types';

const STORAGE_KEYS = {
  CONFIG: 'android_bedtime_config_v1',
  DEVICE_STATE: 'android_device_state_v1',
  SLEEP_HISTORY: 'android_sleep_history_v1',
  CACHE_META: 'android_cache_meta_v1',
};

export const DEFAULT_CONFIG: BedtimeConfig = {
  enabled: true,
  startTime: '22:30',
  wakeTime: '07:00',
  repeatDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
  
  // Network controls requested by user
  wifiAction: 'turn_off',
  dataAction: 'turn_off',
  bluetoothAction: 'turn_off',
  
  // Distraction & Display
  dndAction: 'priority_only',
  enableGrayscale: true,
  enableScreenDimming: true,
  dimBrightnessPercent: 15,
  nightLightAmber: true,
  
  // Power & Battery Optimization
  enableBatterySaver: true,
  
  // Phone lock
  lockPhoneOnBedtime: true,
  requirePinToUnlock: true,
  unlockPin: '1234',
  allowEmergencyCall: true,
  emergencyNumber: '911',
  emergencyName: 'Emergency Services',
  
  // Offline audio aids
  ambientSound: 'pink_noise',
  alarmSound: 'gentle_chime',
  alarmVolume: 80,
};

export const DEFAULT_DEVICE_STATE: DeviceState = {
  wifiEnabled: true,
  mobileDataEnabled: true,
  bluetoothEnabled: true,
  dndActive: false,
  grayscaleActive: false,
  dimActive: false,
  screenBrightness: 90,
  nightLightActive: false,
  isLocked: false,
  isBedtimeActive: false,
  activeSessionId: null,
  batteryLevel: 88,
  carrierName: 'Android 5G',
  batterySaverEnabled: false,
  backgroundProcessesDisabled: false,
};

// Mirror cache snapshot to CacheStorage API for durability and offline integrity
async function mirrorToCacheStorage(key: string, data: unknown) {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const cache = await caches.open('android-bedtime-offline-v1');
    const response = new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'X-Bedtime-Offline-Cache': 'true',
        'X-Cached-At': new Date().toISOString(),
      },
    });
    await cache.put(new Request(`/offline-cache/${key}`), response);
  } catch {
    // CacheStorage mirror failed silently, fallback is localStorage
  }
}

export const CacheService = {
  loadConfig(): BedtimeConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to read config from cache, using default:', e);
    }
    return DEFAULT_CONFIG;
  },

  saveConfig(config: BedtimeConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
      mirrorToCacheStorage('config', config);
      this.updateCacheMetadata();
    } catch (e) {
      console.error('Failed to save config to cache:', e);
    }
  },

  loadDeviceState(): DeviceState {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DEVICE_STATE);
      if (stored) {
        return { ...DEFAULT_DEVICE_STATE, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to read device state from cache:', e);
    }
    return DEFAULT_DEVICE_STATE;
  },

  saveDeviceState(state: DeviceState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DEVICE_STATE, JSON.stringify(state));
      mirrorToCacheStorage('device-state', state);
      this.updateCacheMetadata();
    } catch (e) {
      console.error('Failed to save device state to cache:', e);
    }
  },

  getSleepHistory(): SleepSession[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SLEEP_HISTORY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to read sleep history from cache:', e);
    }
    
    // Seed realistic 7-day weekly history if cache is fresh
    const now = Date.now();
    const durations = [470, 490, 435, 510, 460, 480, 455]; // in minutes (approx 7.2h - 8.5h)
    return durations.map((duration, index) => {
      const daysAgo = index + 1;
      const startTime = new Date(now - (daysAgo * 24 + 8.5) * 3600 * 1000);
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
      return {
        id: `sample-session-${daysAgo}`,
        startedAt: startTime.toISOString(),
        endedAt: endTime.toISOString(),
        scheduledStart: '22:30',
        scheduledWake: '07:00',
        wifiWasDisabled: true,
        dataWasDisabled: true,
        dndWasEnabled: true,
        batterySaverWasEnabled: daysAgo <= 5,
        unlockedEarly: daysAgo === 3,
        durationMinutes: duration,
      };
    });
  },

  addSleepSession(session: SleepSession): void {
    try {
      const history = this.getSleepHistory();
      const updated = [session, ...history].slice(0, 50); // Keep last 50
      localStorage.setItem(STORAGE_KEYS.SLEEP_HISTORY, JSON.stringify(updated));
      mirrorToCacheStorage('sleep-history', updated);
      this.updateCacheMetadata();
    } catch (e) {
      console.error('Failed to add sleep session to cache:', e);
    }
  },

  updateSleepSession(sessionId: string, updates: Partial<SleepSession>): void {
    try {
      const history = this.getSleepHistory();
      const updated = history.map((s) => {
        if (s.id === sessionId) {
          const finished = { ...s, ...updates };
          if (finished.startedAt && finished.endedAt && !finished.durationMinutes) {
            const diffMs = new Date(finished.endedAt).getTime() - new Date(finished.startedAt).getTime();
            finished.durationMinutes = Math.max(1, Math.round(diffMs / 60000));
          }
          return finished;
        }
        return s;
      });
      localStorage.setItem(STORAGE_KEYS.SLEEP_HISTORY, JSON.stringify(updated));
      mirrorToCacheStorage('sleep-history', updated);
      this.updateCacheMetadata();
    } catch (e) {
      console.error('Failed to update sleep session:', e);
    }
  },

  updateCacheMetadata(): void {
    try {
      let totalBytes = 0;
      let totalEntries = 0;
      for (const key of Object.values(STORAGE_KEYS)) {
        const item = localStorage.getItem(key);
        if (item) {
          totalBytes += item.length * 2; // approximation for UTF-16
          totalEntries++;
        }
      }
      const meta: CacheMetadata = {
        lastCachedAt: new Date().toISOString(),
        totalEntries,
        estimatedBytes: totalBytes,
        storageType: 'localStorage + CacheStorage (100% Offline)',
      };
      localStorage.setItem(STORAGE_KEYS.CACHE_META, JSON.stringify(meta));
    } catch {
      // ignore
    }
  },

  getCacheMetadata(): CacheMetadata {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CACHE_META);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return {
      lastCachedAt: new Date().toISOString(),
      totalEntries: 3,
      estimatedBytes: 4200,
      storageType: 'localStorage + CacheStorage (100% Offline)',
    };
  },

  exportOfflineCache(): string {
    const backup = {
      config: this.loadConfig(),
      deviceState: this.loadDeviceState(),
      sleepHistory: this.getSleepHistory(),
      exportedAt: new Date().toISOString(),
      platform: 'Android Offline Cache v1',
    };
    return JSON.stringify(backup, null, 2);
  },

  importOfflineCache(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.config) {
        this.saveConfig(parsed.config);
      }
      if (parsed.sleepHistory && Array.isArray(parsed.sleepHistory)) {
        localStorage.setItem(STORAGE_KEYS.SLEEP_HISTORY, JSON.stringify(parsed.sleepHistory));
      }
      return true;
    } catch (e) {
      console.error('Failed to import offline cache:', e);
      return false;
    }
  },

  clearAllCache(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
      if (typeof window !== 'undefined' && 'caches' in window) {
        caches.delete('android-bedtime-offline-v1').catch(() => {});
      }
    } catch {
      // ignore
    }
  },
};
