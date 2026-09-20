import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Dot,
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Minus, Moon, Target, 
  Zap, WifiOff, Award, Sparkles, Clock, CheckCircle2,
  Calendar, Info
} from 'lucide-react';
import { WeeklySleepSummary, DailySleepPoint } from '../utils/sleepAnalytics';

interface SleepSummaryDashboardProps {
  summary: WeeklySleepSummary;
}

// Custom Tooltip component for recharts
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: DailySleepPoint = payload[0].payload;
    return (
      <div className="p-3 rounded-2xl bg-neutral-900/95 border border-white/15 shadow-2xl backdrop-blur-md text-white text-xs min-w-[170px] pointer-events-none">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-1.5">
          <span className="font-bold text-neutral-200">
            {data.dayLabel}, {data.fullDate}
          </span>
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              data.status === 'Optimal'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : data.status === 'Good'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : data.status === 'Fair'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            {data.status}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Duration:</span>
            <span className="font-mono font-bold text-indigo-300 text-sm">
              {data.durationFormatted}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-400">Goal ({data.targetHours}h):</span>
            <span
              className={`font-mono font-semibold ${
                data.durationHours >= data.targetHours
                  ? 'text-emerald-400'
                  : 'text-amber-300'
              }`}
            >
              {data.durationHours >= data.targetHours
                ? `+${(data.durationHours - data.targetHours).toFixed(1)}h`
                : `${(data.durationHours - data.targetHours).toFixed(1)}h`}
            </span>
          </div>

          {/* Offline Rules Applied */}
          <div className="pt-1.5 mt-1 border-t border-white/5 flex flex-wrap gap-1 text-[10px]">
            {data.wifiCutoff && (
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-sky-300 flex items-center gap-0.5">
                <WifiOff className="w-2.5 h-2.5" /> No Wi-Fi
              </span>
            )}
            {data.batterySaver && (
              <span className="px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5" /> Eco Saver
              </span>
            )}
            {data.unlockedEarly && (
              <span className="px-1.5 py-0.5 rounded bg-rose-950/50 text-rose-300">
                Woke early
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const SleepSummaryDashboard: React.FC<SleepSummaryDashboardProps> = ({ summary }) => {
  const [selectedDay, setSelectedDay] = useState<DailySleepPoint | null>(
    summary.dailyPoints[summary.dailyPoints.length - 1] || null
  );

  return (
    <div className="space-y-4 text-white">
      {/* 1. Header Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Avg Duration */}
        <div className="p-3 rounded-2xl bg-neutral-900/90 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Avg Sleep</span>
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-1.5">
            <div className="text-lg font-bold font-mono text-indigo-300">
              {summary.avgDurationFormatted}
            </div>
            <div className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
              <span>Goal: {summary.targetDurationHours}h</span>
              {summary.avgDurationHours >= summary.targetDurationHours ? (
                <span className="text-emerald-400 font-semibold">✓ Met</span>
              ) : (
                <span className="text-amber-300 font-medium">
                  -{(summary.targetDurationHours - summary.avgDurationHours).toFixed(1)}h
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Target Adherence */}
        <div className="p-3 rounded-2xl bg-neutral-900/90 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Target Match</span>
            <Target className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1.5">
            <div className="text-lg font-bold font-mono text-emerald-300">
              {summary.adherencePercentage}%
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              {summary.dailyPoints.filter((p) => p.durationHours >= summary.targetDurationHours - 1).length} of {summary.totalRecordedNights} nights
            </div>
          </div>
        </div>

        {/* Consistency Score */}
        <div className="p-3 rounded-2xl bg-neutral-900/90 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Consistency</span>
            <Award className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="mt-1.5">
            <div className="text-lg font-bold font-mono text-sky-300">
              {summary.consistencyScore}%
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              {summary.consistencyScore >= 80 ? 'High Regularity' : 'Variable Schedule'}
            </div>
          </div>
        </div>

        {/* Battery Saver Eco Nights */}
        <div className="p-3 rounded-2xl bg-neutral-900/90 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Battery Saver</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1.5">
            <div className="text-lg font-bold font-mono text-amber-300">
              {summary.batterySaverNightCount}/{summary.totalRecordedNights}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              Background Throttled
            </div>
          </div>
        </div>
      </div>

      {/* 2. Line Chart: Weekly Sleep Duration Trends */}
      <div className="p-4 rounded-3xl bg-neutral-900/90 border border-white/10 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Weekly Sleep Duration Trend</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                Past 7 Days
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Calculated from offline device cache
            </p>
          </div>

          {/* Trend Indicator */}
          <div className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl bg-neutral-800 border border-white/5">
            {summary.trendDirection === 'improving' ? (
              <>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold text-[11px]">
                  +{summary.trendDiffHours}h trend
                </span>
              </>
            ) : summary.trendDirection === 'declining' ? (
              <>
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-400 font-semibold text-[11px]">
                  {summary.trendDiffHours}h trend
                </span>
              </>
            ) : (
              <>
                <Minus className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-neutral-300 font-medium text-[11px]">Steady</span>
              </>
            )}
          </div>
        </div>

        {/* Interactive Line Chart */}
        <div className="w-full h-48 sm:h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={summary.dailyPoints}
              margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload.length) {
                  setSelectedDay(e.activePayload[0].payload);
                }
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.08)"
                vertical={false}
              />
              <XAxis
                dataKey="dayLabel"
                stroke="#a3a3a3"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#a3a3a3"
                fontSize={10}
                domain={[0, 10]}
                ticks={[0, 3, 6, 8, 10]}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}h`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Target Sleep Duration Reference Line */}
              <ReferenceLine
                y={summary.targetDurationHours}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
                label={{
                  value: `Goal ${summary.targetDurationHours}h`,
                  position: 'right',
                  fill: '#10b981',
                  fontSize: 9,
                }}
              />

              {/* Main Sleep Duration Line */}
              <Line
                type="monotone"
                dataKey="durationHours"
                name="Sleep Duration"
                stroke="#818cf8"
                strokeWidth={3}
                activeDot={{
                  r: 6,
                  fill: '#a5b4fc',
                  stroke: '#312e81',
                  strokeWidth: 2,
                }}
                dot={(props: any) => {
                  const { cx, cy, payload, index } = props;
                  const isSelected = selectedDay?.dateKey === payload.dateKey;
                  return (
                    <circle
                      key={`dot-${index}`}
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 5 : 3.5}
                      fill={payload.batterySaver ? '#f59e0b' : '#818cf8'}
                      stroke="#171717"
                      strokeWidth={2}
                      className="cursor-pointer transition-all duration-150"
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 pt-2 border-t border-white/5 px-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              Sleep Duration
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-emerald-500 border-dashed" />
              Target ({summary.targetDurationHours}h)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Battery Saver Active
            </span>
          </div>
          <span className="text-[10px] text-neutral-500 hidden sm:inline">
            Tap node for details
          </span>
        </div>
      </div>

      {/* 3. Selected Day Detail Strip */}
      {selectedDay && (
        <div className="p-3.5 rounded-2xl bg-neutral-900/90 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>{selectedDay.dayLabel} ({selectedDay.fullDate})</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    selectedDay.status === 'Optimal'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : selectedDay.status === 'Good'
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : selectedDay.status === 'Fair'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {selectedDay.status}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Duration: <strong className="text-indigo-200">{selectedDay.durationFormatted}</strong> ({selectedDay.durationHours}h)
              </p>
            </div>
          </div>

          {/* Settings proof for this specific day */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {selectedDay.wifiCutoff && (
              <span className="px-2 py-0.5 rounded-lg bg-neutral-800 text-sky-300 text-[10px] flex items-center gap-1">
                <WifiOff className="w-3 h-3" /> Wi-Fi Off
              </span>
            )}
            {selectedDay.batterySaver && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-300 text-[10px] flex items-center gap-1">
                <Zap className="w-3 h-3" /> Battery Saver (Eco)
              </span>
            )}
            {selectedDay.unlockedEarly ? (
              <span className="px-2 py-0.5 rounded-lg bg-rose-950/50 text-rose-300 text-[10px]">
                Woke early
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-lg bg-emerald-950/50 text-emerald-300 text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Full Bedtime
              </span>
            )}
          </div>
        </div>
      )}

      {/* 4. Weekly Highlights & Key Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {summary.bestNight && (
          <div className="p-3 rounded-2xl bg-neutral-900/90 border border-white/5 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-neutral-400">Longest Rest</div>
              <div className="font-bold text-white">
                {summary.bestNight.day} ({summary.bestNight.date}):{' '}
                <span className="text-emerald-300 font-mono">{summary.bestNight.durationFormatted}</span>
              </div>
            </div>
          </div>
        )}

        {summary.shortestNight && (
          <div className="p-3 rounded-2xl bg-neutral-900/90 border border-white/5 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-neutral-400">Shortest Rest</div>
              <div className="font-bold text-white">
                {summary.shortestNight.day} ({summary.shortestNight.date}):{' '}
                <span className="text-amber-300 font-mono">{summary.shortestNight.durationFormatted}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
