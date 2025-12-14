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
  { value: 'all' as DatePreset, label: 'Tất cả', days: 0 }, // Thay 365 bằng 0 để signal "all"
];

// Hàm tiện ích để chuẩn hóa ngày về 00:00:00
const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export default function ReportPage() {
  const { user } = useAuth();
  const [datePreset, setDatePreset] = useState<DatePreset>('7days');
  const [monthlyGoals, setMonthlyGoals] = useState<Map<string, DailyGoalStatus>>(new Map());
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  const [dailyGoalData, setDailyGoalData] = useState<DailyGoalStatus | null>(null);
  const [isDailyGoalLoading, setIsDailyGoalLoading] = useState(true);
  
  // CHỈ GIỮ 1 STATE TOOLTIP
  const [tooltipOpen, setTooltipOpen] = useState(false);

  // Memoize date range calculation
  const { startDate, endDate } = useMemo(() => {
    // 1. Lấy ngày kết thúc (hôm nay) và set về 00:00:00 để truy vấn data trong ngày hôm nay
    const endDate = startOfDay(new Date()); 
    const daysAgo = DATE_PRESETS.find(p => p.value === datePreset)?.days || 7;

    let startDate: Date;

    if (daysAgo === 0) {
      // Logic cho 'Tất cả': Gửi null hoặc ngày rất xa trong quá khứ
      // Tuy nhiên, để tránh lỗi, ta gửi 1 ngày 365 ngày trước (đề xuất xử lý 'all' ở backend)
      // Tùy chọn: Gửi new Date(0) nếu muốn tất cả, hoặc 1 năm trước:
      startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); 
    } else {
      // Cho N ngày bao gồm hôm nay, lùi lại (N-1) ngày.
      const msAgo = (daysAgo - 1) * 24 * 60 * 60 * 1000;
      startDate = new Date(Date.now() - msAgo);
    }
    
    // Đảm bảo startDate được thiết lập về 00:00:00
    startDate = startOfDay(startDate);

    return { startDate, endDate };
  }, [datePreset]);

  const { data, isLoading, error, refetch } = useAnalytics({ startDate, endDate });

  // Fetch daily goal once on mount (not affected by date filter)
  useEffect(() => {
    async function fetchDailyGoal() {
      if (!user?.id) return;

      setIsDailyGoalLoading(true);
      try {
        const timezoneOffset = new Date().getTimezoneOffset();
        const params = new URLSearchParams({
          timezoneOffset: timezoneOffset.toString(),
        });

        const response = await fetch(`/api/analytics/daily-goal?${params}`);
        const result = await response.json();

        if (result.success && result.data) {
          setDailyGoalData(result.data);
        }
      } catch (err) {
        console.error('Error fetching daily goal:', err);
      } finally {
        setIsDailyGoalLoading(false);
      }
    }

    fetchDailyGoal();
  }, [user?.id]);

  // Debug logging
  useEffect(() => {
    if (data) {
      console.log('[ReportPage] Analytics data:', {
        weeklyActivity: data.weeklyActivity,
        weeklyActivityLength: data.weeklyActivity?.length,
        dailyGoal: data.dailyGoal,
        streak: data.streak,
        // Thêm log để kiểm tra startDate/endDate sau khi fix
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(),
      });
    }
  }, [data, startDate, endDate]); // Thêm dependencies

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
      {/* HEADER */}
      <div className="bg-white shadow-md rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Báo Cáo Học Tập</h1>
            <p className="mt-2 text-base text-gray-600">
              📊 Theo dõi tiến trình và phân tích chi tiết quá trình học tập của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Section: Tổng quan */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3">
          <div className="h-8 w-1 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tổng Quan
          </h2>
        </div>
        
        <div id="overview" className="grid gap-6 lg:grid-cols-3">
          {/* Column 1: Daily Goals */}
          <div className="lg:col-span-1">
            <DailyGoalCard
              data={dailyGoalData}
              isLoading={isDailyGoalLoading}
            />
          </div>

          {/* Column 2: Nested grid with Streak cards and Calendar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Row 1: Streak Cards - Side by side */}
            <div className="grid grid-cols-2 gap-6">
              {/* Current Streak */}
              <Card className="relative overflow-hidden bg-white shadow-md rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "p-4 rounded-full shadow-lg",
                      isStreakActive ? "bg-gradient-to-br from-orange-400 via-red-400 to-pink-500" : "bg-gray-100"
                    )}>
                      <Flame className={cn(
                        "w-7 h-7",
                        isStreakActive ? "text-white animate-pulse" : "text-gray-400"
                      )} />
                    </div>
                    <div className="text-center">
                      <p className={cn(
                        "text-xs font-semibold mb-1 tracking-wider",
                        isStreakActive ? "text-orange-600" : "text-gray-600"
                      )}>🔥 STREAK</p>
                      <p className={cn(
                        "text-3xl font-bold",
                        isStreakActive ? "text-orange-600" : "text-gray-900"
                      )}>
                        {streak?.current_streak || 0}
                      </p>
                      <p className={cn(
                        "text-xs font-medium",
                        isStreakActive ? "text-gray-600" : "text-gray-500"
                      )}>ngày</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Longest Streak */}
              <Card className="bg-white shadow-md rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-blue-600 mb-1 tracking-wider">🏆 KỶ LỤC</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {streak?.longest_streak || 0}
                      </p>
                      <p className="text-xs font-medium text-gray-600">ngày</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Row 2: Calendar (full width) */}
            <Card className="bg-white shadow-md rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">✨ Những ngày hoàn hảo</h3>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
                      <TooltipTrigger asChild>
                        <button
                          className="touch-manipulation"
                          // Sử dụng onTouchEnd hoặc onPointerDown cho UX tốt hơn trên mobile
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
      </div>

      {/* Section: Phân tích */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-gradient-to-b from-green-600 to-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Phân Tích Chi Tiết
              </h2>
            </div>
            
            {/* Time Filter - Controls both charts */}
            <div className="flex gap-2 flex-wrap">
              {DATE_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant={datePreset === preset.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDatePreset(preset.value)}
                  className={cn(
                    "transition-all duration-200",
                    datePreset === preset.value 
                      ? 'bg-gray-900 hover:bg-gray-800 text-white' 
                      : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                  )}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* SỬA ID: Đặt ID cho từng chart để SectionNavigation hoạt động tốt hơn */}
          <div id="activity-section" className="lg:col-span-2">
            <WeeklyActivityChart
              data={data?.weeklyActivity || []}
              isLoading={isLoading}
            />
          </div>

          <div id="grammar-section" className="lg:col-span-3">
            <GrammarErrorChart
              data={data?.grammarErrors || []}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Motivational footer */}
      {isStreakActive && streak && streak.current_streak >= 7 && (
          <Card className="bg-white shadow-lg rounded-2xl border-2 border-emerald-400">
            <CardContent className="p-8 text-center">
              <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                🎉 Tuyệt vời! Bạn đã duy trì chuỗi {streak.current_streak} ngày! Tiếp tục nhé! 🚀
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Bạn đang làm rất tốt! Hãy tiếp tục phát huy!
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}