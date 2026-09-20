import React, { useState, useMemo } from 'react';
import { 
  X, Moon, Clock, WifiOff, SignalLow, BellOff, ShieldCheck, 
  Trash2, Zap, BarChart2, List, TrendingUp 
} from 'lucide-react';
import { SleepSession, BedtimeConfig } from '../types';
import { CacheService } from '../services/cacheService';
import { processWeeklySleepSummary } from '../utils/sleepAnalytics';
import { SleepSummaryDashboard } from './SleepSummaryDashboard';

interface SleepHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHistoryCleared: () => void;
  config?: BedtimeConfig;
}

export const SleepHistoryModal: React.FC<SleepHistoryModalProps> = ({
  isOpen,
  onClose,
  onHistoryCleared,
  config,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'sessions'>('summary');
  const [refreshKey, setRefreshKey] = useState(0);

  const activeConfig = config || CacheService.loadConfig();
  const history: SleepSession[] = CacheService.getSleepHistory();

  const summary = useMemo(() => {
    return processWeeklySleepSummary(history, activeConfig);
  }, [history, activeConfig, refreshKey]);

  if (!isOpen) return null;

  const handleClear = () => {
    if (confirm('Clear local sleep history from cache?')) {
      localStorage.removeItem('android_sleep_history_v1');
      setRefreshKey((k) => k + 1);
      onHistoryCleared();
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-neutral-950/90 backdrop-blur-md flex flex-col p-4 sm:p-5 text-white animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">
            Sleep & Bedtime History
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between mt-3 mb-2 gap-2">
        <div className="flex items-center p-1 rounded-2xl bg-neutral-900 border border-white/10 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'summary'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Sleep Summary
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'sessions'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Session Logs ({history.length})
          </button>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="hidden sm:flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-2 py-1"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Offline Storage Status Badge */}
      <div className="flex items-center justify-between pb-2 text-[11px] text-neutral-400">
        <span className="flex items-center gap-1 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          Offline local cache only • Zero external data transfer
        </span>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="sm:hidden flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto pr-1">
        {activeTab === 'summary' ? (
          <SleepSummaryDashboard summary={summary} />
        ) : (
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-neutral-400 text-xs text-center">
                <Moon className="w-8 h-8 text-neutral-600 mb-2" />
                No bedtime sessions recorded in cache yet.
                <br />
                Activate bedtime or test now to record your first session!
              </div>
            ) : (
              history.map((session) => {
                const startDate = new Date(session.startedAt);
                const dateStr = startDate.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                });
                const startTimeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const endTimeStr = session.endedAt 
                  ? new Date(session.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                  : 'Ongoing';

                const durationH = session.durationMinutes ? Math.floor(session.durationMinutes / 60) : 0;
                const durationM = session.durationMinutes ? session.durationMinutes % 60 : 0;

                return (
                  <div
                    key={session.id}
                    className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-neutral-200">{dateStr}</span>
                      <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-500/20">
                        {durationH > 0 ? `${durationH}h ${durationM}m` : `${durationM} mins`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-400">
                      <Clock className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{startTimeStr} – {endTimeStr}</span>
                      {session.unlockedEarly && (
                        <span className="text-[10px] text-amber-400 font-medium ml-auto">
                          Unlocked early
                        </span>
                      )}
                    </div>

                    {/* Proof of custom settings applied */}
                    <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/80 text-[10px] text-neutral-300 flex-wrap">
                      {session.wifiWasDisabled && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-800 text-sky-300">
                          <WifiOff className="w-3 h-3" /> Wi-Fi Off
                        </span>
                      )}
                      {session.dataWasDisabled && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-800 text-sky-300">
                          <SignalLow className="w-3 h-3" /> Data Off
                        </span>
                      )}
                      {session.dndWasEnabled && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-800 text-amber-300">
                          <BellOff className="w-3 h-3" /> DND
                        </span>
                      )}
                      {session.batterySaverWasEnabled && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/30 text-amber-300">
                          <Zap className="w-3 h-3" /> Battery Saver
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <button
        onClick={onClose}
        className="mt-3 w-full py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition shrink-0"
      >
        Close
      </button>
    </div>
  );
};
