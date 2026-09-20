/**
 * Android Bedtime Mode Types
 * Strictly Offline / Local Cache Data Architecture
 */

export type WifiBedtimeAction = 'turn_off' | 'keep_on' | 'unchanged';
export type DataBedtimeAction = 'turn_off' | 'keep_on' | 'unchanged';
export type BluetoothBedtimeAction = 'turn_off' | 'keep_on' | 'unchanged';
export type DndBedtimeAction = 'total_silence' | 'priority_only' | 'alarms_only' | 'off';
export type AmbientSoundType = 'none' | 'pink_noise' | 'night_hum' | 'soft_rain';
export type AlarmSoundType = 'gentle_chime' | 'soft_bells' | 'sunrise_melody' | 'silent';
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface BedtimeConfig {
  enabled: boolean;
  startTime: string; // HH:MM (24h) e.g., "22:30"
  wakeTime: string;  // HH:MM (24h) e.g., "07:00"
  repeatDays: DayOfWeek[];
  
  // Network & Connectivity Custom Controls
  wifiAction: WifiBedtimeAction;
  dataAction: DataBedtimeAction;
  bluetoothAction: BluetoothBedtimeAction;
  
  // Distraction & Display Custom Controls
  dndAction: DndBedtimeAction;
  enableGrayscale: boolean;
  enableScreenDimming: boolean;
  dimBrightnessPercent: number; // e.g., 15
  nightLightAmber: boolean;
  
  // Power & Battery Optimization
  enableBatterySaver: boolean;
  
  // Phone Lock & Security
  lockPhoneOnBedtime: boolean;
  requirePinToUnlock: boolean;
  unlockPin: string; // 4-digit PIN (default "1234")
  allowEmergencyCall: boolean;
  emergencyNumber: string;
  emergencyName: string;
  
  // Audio & Sleep Aids (100% Offline Synthesizer)
  ambientSound: AmbientSoundType;
  alarmSound: AlarmSoundType;
  alarmVolume: number;
}

export interface DeviceState {
  wifiEnabled: boolean;
  mobileDataEnabled: boolean;
  bluetoothEnabled: boolean;
  dndActive: boolean;
  grayscaleActive: boolean;
  dimActive: boolean;
  screenBrightness: number;
  nightLightActive: boolean;
  isLocked: boolean;
  isBedtimeActive: boolean;
  activeSessionId: string | null;
  batteryLevel: number;
  carrierName: string;
  batterySaverEnabled: boolean;
  backgroundProcessesDisabled: boolean;
}

export interface SleepSession {
  id: string;
  startedAt: string; // ISO string
  endedAt?: string;   // ISO string
  scheduledStart: string;
  scheduledWake: string;
  wifiWasDisabled: boolean;
  dataWasDisabled: boolean;
  dndWasEnabled: boolean;
  batterySaverWasEnabled?: boolean;
  unlockedEarly: boolean;
  durationMinutes?: number;
}

export interface CacheMetadata {
  lastCachedAt: string;
  totalEntries: number;
  estimatedBytes: number;
  storageType: 'localStorage + CacheStorage (100% Offline)';
}
