/**
 * Android Bedtime Mode Application
 * 100% Offline & Local Cache Architecture
 */

import React, { useState, useEffect } from 'react';
import { useBedtimeScheduler } from './hooks/useBedtimeScheduler';
import { AndroidDeviceFrame } from './components/AndroidDeviceFrame';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidQuickSettings } from './components/AndroidQuickSettings';
import { AndroidLockScreen } from './components/AndroidLockScreen';
import { BedtimeSettingsForm } from './components/BedtimeSettingsForm';
import { AndroidNavigationBar } from './components/AndroidNavigationBar';
import { AndroidNotificationBanner } from './components/AndroidNotificationBanner';
import { SleepHistoryModal } from './components/SleepHistoryModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';

export default function App() {
  const {
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
  } = useBedtimeScheduler();

  const [isDeviceView, setIsDeviceView] = useState(true);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Keyboard shortcut: Press Escape to close quick settings or cancel modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsQuickSettingsOpen(false);
        setIsHistoryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Quick Settings toggle handlers
  const handleToggleWifi = () => {
    toggleWifi();
  };

  const handleToggleData = () => {
    toggleMobileData();
  };

  const handleToggleBluetooth = () => {
    updateDeviceState({ bluetoothEnabled: !deviceState.bluetoothEnabled });
  };

  const handleToggleDnd = () => {
    updateDeviceState({ dndActive: !deviceState.dndActive });
  };

  const handleToggleGrayscale = () => {
    updateDeviceState({ grayscaleActive: !deviceState.grayscaleActive });
  };

  const handleToggleNightLight = () => {
    updateDeviceState({ nightLightActive: !deviceState.nightLightActive });
  };

  const handleChangeBrightness = (value: number) => {
    updateDeviceState({ screenBrightness: value });
  };

  const timeRemainingInfo = getTimeRemainingDisplay();

  return (
    <AndroidDeviceFrame
      isDeviceView={isDeviceView}
      onToggleDeviceView={() => setIsDeviceView((prev) => !prev)}
      deviceState={deviceState}
      onPowerButton={() => {
        if (deviceState.isLocked) {
          unlockScreenOnly();
        } else {
          relockScreen();
        }
      }}
      onOpenQuickSettings={() => setIsQuickSettingsOpen(true)}
      onOpenHistory={() => setIsHistoryOpen(true)}
    >
      {/* 1. Android Status Bar */}
      <AndroidStatusBar
        currentTime={currentTime}
        deviceState={deviceState}
        showNotch={isDeviceView}
      />

      {/* 2. Main Content Screen Area */}
      <div className="relative flex-1 flex flex-col overflow-y-auto">
        {deviceState.isLocked ? (
          /* Phone is Locked by Bedtime */
          <AndroidLockScreen
            currentTime={currentTime}
            config={config}
            deviceState={deviceState}
            isAlarmRinging={isAlarmRinging}
            timeRemainingText={`${timeRemainingInfo.label} ${timeRemainingInfo.text}`}
            onUnlock={unlockScreenOnly}
            onExitBedtime={exitBedtime}
            onDismissAlarm={dismissAlarm}
          />
        ) : (
          /* Phone is Unlocked: Show Settings & Control Panel */
          <main className="flex-1 px-4 pt-2 pb-6 flex flex-col gap-3">
            {/* Bedtime Active Notification Banner */}
            <AndroidNotificationBanner
              config={config}
              deviceState={deviceState}
              onLockScreen={relockScreen}
              onExitBedtime={() => exitBedtime(true)}
            />

            {/* In-App PWA Install Banner & Offline indicator */}
            <PWAInstallBanner />

            {/* Bedtime Custom Settings Suite */}
            <BedtimeSettingsForm
              config={config}
              updateConfig={updateConfig}
              deviceState={deviceState}
              onTriggerBedtimeNow={() => activateBedtime(true)}
              onOpenHistory={() => setIsHistoryOpen(true)}
              onOpenQuickSettings={() => setIsQuickSettingsOpen(true)}
              timeRemainingInfo={timeRemainingInfo}
              onToggleWifi={toggleWifi}
              onToggleData={toggleMobileData}
            />
          </main>
        )}

        {/* 3. Android Quick Settings Shade Overlay */}
        <AndroidQuickSettings
          isOpen={isQuickSettingsOpen}
          onClose={() => setIsQuickSettingsOpen(false)}
          deviceState={deviceState}
          config={config}
          onToggleWifi={handleToggleWifi}
          onToggleData={handleToggleData}
          onToggleBluetooth={handleToggleBluetooth}
          onToggleBatterySaver={toggleBatterySaver}
          onToggleDnd={handleToggleDnd}
          onToggleGrayscale={handleToggleGrayscale}
          onToggleNightLight={handleToggleNightLight}
          onTriggerBedtimeNow={() => {
            setIsQuickSettingsOpen(false);
            activateBedtime(true);
          }}
          onExitBedtime={() => {
            setIsQuickSettingsOpen(false);
            exitBedtime(true);
          }}
          onChangeBrightness={handleChangeBrightness}
        />

        {/* 4. Sleep History Modal (Offline Cache Inspector) */}
        <SleepHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onHistoryCleared={() => setIsHistoryOpen(false)}
          config={config}
        />
      </div>

      {/* 5. Android Bottom Navigation Gesture Bar */}
      <AndroidNavigationBar
        onBack={() => {
          if (isQuickSettingsOpen) setIsQuickSettingsOpen(false);
          else if (isHistoryOpen) setIsHistoryOpen(false);
        }}
        onHome={() => {
          setIsQuickSettingsOpen(false);
          setIsHistoryOpen(false);
        }}
        onLockScreen={() => {
          if (deviceState.isLocked) {
            unlockScreenOnly();
          } else {
            relockScreen();
          }
        }}
        isLocked={deviceState.isLocked}
      />
    </AndroidDeviceFrame>
  );
}
