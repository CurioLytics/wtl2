'use client';

import React, { useState, useMemo } from 'react';
import { DailyGoalStatus } from '@/types/analytics';

interface ProgressCalendarProps {
  goalStatuses: Map<string, DailyGoalStatus>; // Map of date string to goal status
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

export function ProgressCalendar({ goalStatuses, onDateSelect, selectedDate }: ProgressCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = useMemo(() => generateCalendar(currentMonth, goalStatuses), [currentMonth, goalStatuses]);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentMonth);
  const year = currentMonth.getFullYear();

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <button
          onClick={goToPreviousMonth}
          className="p-1 rounded-full hover:bg-gray-100"
          aria-label="Previous month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <h3 className="text-sm font-medium">
          {monthName} {year}
        </h3>

        <button
          onClick={goToNextMonth}
          className="p-1 rounded-full hover:bg-gray-100"
          aria-label="Next month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
          <div key={idx} className="text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day, index) => {
          const isSelected = selectedDate && day.date &&
            selectedDate.getDate() === day.date.getDate() &&
            selectedDate.getMonth() === day.date.getMonth() &&
            selectedDate.getFullYear() === day.date.getFullYear();

          // Bold style for days with all goals completed
          const allGoalsCompletedStyle = day.allGoalsCompleted && day.date
            ? 'bg-green-100 text-green-900 font-bold'
            : '';

          return (
            <button
              key={index}
              onClick={() => day.date && onDateSelect?.(day.date)}
              disabled={!day.date}
              className={`
                p-1 h-7 w-7 text-xs rounded-full flex items-center justify-center relative
                ${!day.date ? 'text-gray-300' : 'hover:bg-neutral-400'}
                ${day.isToday ? 'border border-blue-500 text-blue-600' : ''}
                ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                ${allGoalsCompletedStyle}
              `}
              aria-label={day.date ? formatDate(day.date) : 'Empty day'}
              aria-pressed={!!isSelected}
            >
              {day.date?.getDate()}
              {day.allGoalsCompleted && <span className="absolute w-0.5 h-0.5 bg-green-500 rounded-full bottom-0.5"></span>}
            </button>
          )
        })}
      </div>
    </div>
  );
}

type CalendarDay = {
  date: Date | null;
  isToday: boolean;
  allGoalsCompleted: boolean;
};

function generateCalendar(date: Date, goalStatuses: Map<string, DailyGoalStatus>): CalendarDay[] {
  const year = date.getFullYear();
  const month = date.getMonth();

  // First day of the month
  const firstDayOfMonth = new Date(year, month, 1);
  // Day of the week for the first day (0-6, where 0 is Sunday)
  const firstDayOfWeek = firstDayOfMonth.getDay();

  // Last day of the month
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Today for highlighting current day
  const today = new Date();

  const calendar: CalendarDay[] = [];

  // Add empty days for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendar.push({ date: null, isToday: false, allGoalsCompleted: false });
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const isToday =
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year;

    // Check if all goals are completed for this day
    // If a row exists in daily_goal_completions, all goals were met
    const dayGoals = goalStatuses.get(dateKey);
    const allGoalsCompleted = !!dayGoals;

    calendar.push({ date: currentDate, isToday, allGoalsCompleted });
  }

  // Fill the remaining spaces in the grid
  const remainingDays = (7 - (calendar.length % 7)) % 7;
  for (let i = 0; i < remainingDays; i++) {
    calendar.push({ date: null, isToday: false, allGoalsCompleted: false });
  }

  return calendar;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
