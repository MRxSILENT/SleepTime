import { SleepSession, BedtimeConfig } from '../types';

export interface DailySleepPoint {
  dayLabel: string;       // e.g. "Mon"
  fullDate: string;       // e.g. "Sep 15"
  dateKey: string;        // "YYYY-MM-DD"
  durationHours: number;  // e.g. 7.8
  durationMinutes: number;// e.g. 468
  durationFormatted: string; // e.g. "7h 48m"
  targetHours: number;    // e.g. 8.5
  status: 'Optimal' | 'Good' | 'Fair' | 'Short' | 'No Data';
  wifiCutoff: boolean;
  dataCutoff: boolean;
  batterySaver: boolean;
  unlockedEarly: boolean;
  sessionCount: number;
}

export interface WeeklySleepSummary {
  dailyPoints: DailySleepPoint[];
  avgDurationHours: number;
  avgDurationFormatted: string;
  totalDurationHours: number;
  targetDurationHours: number;
  adherencePercentage: number;
  consistencyScore: number;
  trendDirection: 'improving' | 'declining' | 'stable';
  trendDiffHours: number;
  batterySaverNightCount: number;
  totalRecordedNights: number;
  bestNight: { day: string; date: string; durationFormatted: string } | null;
  shortestNight: { day: string; date: string; durationFormatted: string } | null;
}

/**
 * Calculates target sleep duration in hours from start and wake time strings (HH:mm)
 */
export function calculateTargetHours(startTime: string = '22:30', wakeTime: string = '07:00'): number {
  try {
    const [startH, startM] = startTime.split(':').map(Number);
    const [wakeH, wakeM] = wakeTime.split(':').map(Number);
    let diffMinutes = (wakeH * 60 + wakeM) - (startH * 60 + startM);
    if (diffMinutes <= 0) {
      diffMinutes += 24 * 60;
    }
    return Math.round((diffMinutes / 60) * 10) / 10;
  } catch {
    return 8.0;
  }
}

/**
 * Format minutes into readable "Xh Ym"
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Aggregates local cache sleep sessions into 7-day weekly sleep patterns
 */
export function processWeeklySleepSummary(
  sessions: SleepSession[],
  config: BedtimeConfig
): WeeklySleepSummary {
  const targetHours = calculateTargetHours(config.startTime, config.wakeTime);
  const now = new Date();

  // Generate the last 7 calendar days in chronological order
  const dayKeys: { date: Date; key: string; dayLabel: string; fullDate: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });
    const fullDate = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    dayKeys.push({ date: d, key, dayLabel, fullDate });
  }

  // Bucket sessions by date
  const dailyMap: Record<string, SleepSession[]> = {};
  dayKeys.forEach(({ key }) => {
    dailyMap[key] = [];
  });

  sessions.forEach((s) => {
    if (!s.startedAt) return;
    const sessionDate = new Date(s.startedAt).toISOString().split('T')[0];
    if (dailyMap[sessionDate]) {
      dailyMap[sessionDate].push(s);
    } else {
      // If session ended on a tracked day
      if (s.endedAt) {
        const endDate = new Date(s.endedAt).toISOString().split('T')[0];
        if (dailyMap[endDate]) {
          dailyMap[endDate].push(s);
        }
      }
    }
  });

  const dailyPoints: DailySleepPoint[] = dayKeys.map(({ key, dayLabel, fullDate }) => {
    const daySessions = dailyMap[key] || [];
    let totalMinutes = 0;
    let wifiCutoff = false;
    let dataCutoff = false;
    let batterySaver = false;
    let unlockedEarly = false;

    daySessions.forEach((s) => {
      let dur = s.durationMinutes;
      if (!dur && s.startedAt && s.endedAt) {
        dur = Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000);
      }
      totalMinutes += dur || 0;
      if (s.wifiWasDisabled) wifiCutoff = true;
      if (s.dataWasDisabled) dataCutoff = true;
      if (s.batterySaverWasEnabled) batterySaver = true;
      if (s.unlockedEarly) unlockedEarly = true;
    });

    const durationHours = Math.round((totalMinutes / 60) * 10) / 10;
    let status: DailySleepPoint['status'] = 'No Data';

    if (totalMinutes > 0) {
      if (durationHours >= targetHours - 0.5) status = 'Optimal';
      else if (durationHours >= targetHours - 1.5) status = 'Good';
      else if (durationHours >= 5) status = 'Fair';
      else status = 'Short';
    }

    return {
      dayLabel,
      fullDate,
      dateKey: key,
      durationHours,
      durationMinutes: totalMinutes,
      durationFormatted: formatDuration(totalMinutes),
      targetHours,
      status,
      wifiCutoff,
      dataCutoff,
      batterySaver,
      unlockedEarly,
      sessionCount: daySessions.length,
    };
  });

  const recordedDays = dailyPoints.filter((d) => d.durationMinutes > 0);
  const totalRecordedMinutes = recordedDays.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalRecordedHours = Math.round((totalRecordedMinutes / 60) * 10) / 10;
  const avgMinutes = recordedDays.length > 0 ? Math.round(totalRecordedMinutes / recordedDays.length) : 0;
  const avgDurationHours = Math.round((avgMinutes / 60) * 10) / 10;

  // Best & Shortest nights
  let bestNight: WeeklySleepSummary['bestNight'] = null;
  let shortestNight: WeeklySleepSummary['shortestNight'] = null;
  if (recordedDays.length > 0) {
    const sorted = [...recordedDays].sort((a, b) => b.durationMinutes - a.durationMinutes);
    bestNight = {
      day: sorted[0].dayLabel,
      date: sorted[0].fullDate,
      durationFormatted: sorted[0].durationFormatted,
    };
    shortestNight = {
      day: sorted[sorted.length - 1].dayLabel,
      date: sorted[sorted.length - 1].fullDate,
      durationFormatted: sorted[sorted.length - 1].durationFormatted,
    };
  }

  // Trend detection: Compare early week (first 3 days with data) vs late week (last 3 days with data)
  const firstHalf = recordedDays.slice(0, Math.ceil(recordedDays.length / 2));
  const secondHalf = recordedDays.slice(Math.ceil(recordedDays.length / 2));
  let trendDirection: WeeklySleepSummary['trendDirection'] = 'stable';
  let trendDiffHours = 0;

  if (firstHalf.length > 0 && secondHalf.length > 0) {
    const avg1 = firstHalf.reduce((a, c) => a + c.durationHours, 0) / firstHalf.length;
    const avg2 = secondHalf.reduce((a, c) => a + c.durationHours, 0) / secondHalf.length;
    trendDiffHours = Math.round((avg2 - avg1) * 10) / 10;
    if (trendDiffHours >= 0.3) trendDirection = 'improving';
    else if (trendDiffHours <= -0.3) trendDirection = 'declining';
    else trendDirection = 'stable';
  }

  // Target adherence percentage
  const onTargetDays = recordedDays.filter((d) => d.durationHours >= targetHours - 1.0);
  const adherencePercentage = recordedDays.length > 0
    ? Math.round((onTargetDays.length / recordedDays.length) * 100)
    : 0;

  // Consistency score: standard deviation of sleep hours
  let consistencyScore = 85;
  if (recordedDays.length >= 3) {
    const variance = recordedDays.reduce((acc, d) => acc + Math.pow(d.durationHours - avgDurationHours, 2), 0) / recordedDays.length;
    const stdDev = Math.sqrt(variance);
    // Lower std dev = higher consistency (e.g. stdDev 0.5h -> 90%, stdDev 2.0h -> 50%)
    consistencyScore = Math.max(40, Math.min(100, Math.round(100 - stdDev * 25)));
  }

  const batterySaverNightCount = recordedDays.filter((d) => d.batterySaver).length;

  return {
    dailyPoints,
    avgDurationHours,
    avgDurationFormatted: formatDuration(avgMinutes),
    totalDurationHours: totalRecordedHours,
    targetDurationHours: targetHours,
    adherencePercentage,
    consistencyScore,
    trendDirection,
    trendDiffHours,
    batterySaverNightCount,
    totalRecordedNights: recordedDays.length,
    bestNight,
    shortestNight,
  };
}
