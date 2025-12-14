'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import { useAnalytics } from '@/hooks/dashboard/useAnalytics';
import { WeeklyActivityChart } from '@/components/dashboard/weekly-activity-chart';
import { DailyGoalCard } from '@/components/dashboard/daily-goal-card';
import { GrammarErrorChart } from '@/components/dashboard/grammar-error-chart';
import { ProgressCalendar } from '@/components/dashboard/progress-calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RefreshCw, Flame, TrendingUp, HelpCircle } from 'lucide-react';
import { cn } from '@/utils/ui';
import { DailyGoalStatus, AnalyticsSummary } from '@/types/analytics';
import { SectionNavigation } from '@/components/ui/section-navigation';

type DatePreset = '7days' | '30days' | '90days' | 'all';

const DATE_PRESETS = [
  { value: '7days' as DatePreset, label: '7 ngày', days: 7 },
  { value: '30days' as DatePreset, label: '30 ngày', days: 30 },
  { value: '90days' as DatePreset, label: '90 ngày', days: 90 },
  { value: 'all' as DatePreset, label: 'Tất cả', days: 365 },
];

export default function ReportPage() {
  const { user } = useAuth();
  const [datePreset, setDatePreset] = useState<DatePreset>('7days');
  const [monthlyGoals, setMonthlyGoals] = useState<Map<string, DailyGoalStatus>>(new Map());
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipOpen2, setTooltipOpen2] = useState(false);
  const [tooltipOpen3, setTooltipOpen3] = useState(false);
  const [tooltipOpen4, setTooltipOpen4] = useState(false);

  // Memoize date range calculation to prevent infinite loops
  const { startDate, endDate } = useMemo(() => {
    const endDate = new Date();
    const daysAgo = DATE_PRESETS.find(p => p.value === datePreset)?.days || 7;
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    return { startDate, endDate };
  }, [datePreset]);

  const { data, isLoading, error, refetch } = useAnalytics({ startDate, endDate });

  // Fetch monthly goal statuses for calendar
  useEffect(() => {
    async function fetchMonthlyGoals() {
      if (!user?.id) return;

      setIsLoadingCalendar(true);
      try {
        const timezoneOffset = new Date().getTimezoneOffset();
        const params = new URLSearchParams({
          timezoneOffset: timezoneOffset.toString(),
        });

        const response = await fetch(`/api/analytics/monthly-goals?${params}`);
        const result = await response.json();

        if (result.success && result.data?.goalStatuses) {
          // Convert object back to Map with proper typing
          const statusMap = new Map(Object.entries(result.data.goalStatuses)) as Map<string, DailyGoalStatus>;
          setMonthlyGoals(statusMap);
        }
      } catch (err) {
        console.error('Error fetching monthly goals:', err);
      } finally {
        setIsLoadingCalendar(false);
      }
    }

    fetchMonthlyGoals();
  }, [user?.id]);

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 space-y-8 py-8">
        <div className="bg-white shadow rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Report</h1>

          <div className="space-y-6">
            {/* Loading skeletons */}
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <Card>
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-8 bg-muted rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="animate-pulse">
                <Card>
                  <CardContent className="p-6">
                    <div className="h-80 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              </div>
              <div className="animate-pulse">
                <Card>
                  <CardContent className="p-6">
                    <div className="h-80 bg-muted rounded"></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 space-y-8 py-8">
        <div className="bg-white shadow rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Report</h1>

          <Card className="border-destructive">
            <CardContent className="p-6">
              <p className="text-destructive mb-4">Không thể tải dữ liệu: {error.message}</p>
              <Button onClick={refetch} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const streak = data?.streak;
  const isStreakActive = streak && streak.current_streak > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-8 py-8">
      <SectionNavigation sections={[
        { id: 'overview', label: 'Overview' },
        { id: 'activity', label: 'Activity' },
        { id: 'grammar', label: 'Grammar' },
      ]} />
      {/* HEADER */}
      <div className="bg-white shadow rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Report</h1>
            <p className="mt-2 text-sm text-gray-600">
              Theo dõi tiến trình và phân tích chi tiết quá trình học tập của bạn
            </p>
          </div>
        </div>
      </div>

      <div id="overview" className="space-y-8">
        {/* Reorganized Layout: Daily Goal (1/3) + Weekly Activity (2/3) */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Column 1: Daily Goals */}
          <div className="lg:col-span-1">
            <DailyGoalCard
              data={data?.dailyGoal || null}
              isLoading={isLoading}
            />
          </div>

          <div id="activity" className="lg:col-span-2">
            <WeeklyActivityChart
              data={data?.weeklyActivity || []}
              isLoading={isLoading}
              action={
                <div className="flex gap-2 flex-wrap justify-end">
                  {DATE_PRESETS.map((preset) => (
                    <Button
                      key={preset.value}
                      variant={datePreset === preset.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDatePreset(preset.value)}
                      className={datePreset === preset.value ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-blue-600 text-blue-600 hover:bg-blue-50'}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              }
            />
          </div>

          {/* Column 2: Nested grid with Streak cards and Calendar */}
          <div className="space-y-6">
            {/* Row 1: Streak Cards - Side by side */}
            <div className="grid grid-cols-2 gap-6">
              {/* Current Streak */}
              <Card className={cn(
                "relative overflow-hidden bg-white shadow rounded-2xl",
                isStreakActive && "border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50"
              )}>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "p-3 rounded-full",
                      isStreakActive ? "bg-orange-100" : "bg-gray-100"
                    )}>
                      <Flame className={cn(
                        "w-6 h-6",
                        isStreakActive ? "text-orange-500" : "text-gray-400"
                      )} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">STREAK</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {streak?.current_streak || 0}
                      </p>
                      <p className="text-xs text-gray-500">ngày</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Longest Streak */}
              <Card className="bg-white shadow rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-full bg-blue-100">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">LONGEST</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {streak?.longest_streak || 0}
                      </p>
                      <p className="text-xs text-gray-500">ngày</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Row 2: Calendar (full width) */}
            <Card className="bg-white shadow rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">Những ngày hoàn hảo</h3>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
                      <TooltipTrigger asChild>
                        <button
                          className="touch-manipulation"
                          onClick={(e) => {
                            e.preventDefault();
                            setTooltipOpen(!tooltipOpen);
                          }}
                        >
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-xs">
                        <p>Ngày hoàn thành toàn bộ mục tiêu sẽ được in đậm</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {isLoadingCalendar ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <ProgressCalendar
                    goalStatuses={monthlyGoals}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>



        {/* Grammar Error Analysis - Full width */}
        <div id="grammar">
          <GrammarErrorChart
            data={data?.grammarErrors || []}
            isLoading={isLoading}
          />
        </div>

        {/* Motivational footer */}
        {isStreakActive && streak && streak.current_streak >= 7 && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow rounded-2xl">
            <CardContent className="p-6 text-center">
              <p className="text-lg font-medium text-gray-900">
                🎉 Tuyệt vời! Bạn đã duy trì chuỗi {streak.current_streak} ngày! Tiếp tục nhé!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}