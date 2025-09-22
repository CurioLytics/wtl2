'use client';

import React, { useState, useMemo } from 'react';
import { formatDate } from '@/utils/date-utils';
import { Journal } from '@/types/journal';

interface CalendarViewProps {
  journals: Journal[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export function CalendarView({ journals, onDateSelect, selectedDate }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const daysInMonth = useMemo(() => generateCalendar(currentMonth, journals), [currentMonth, journals]);
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentMonth);
  const year = currentMonth.getFullYear();
  
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={goToPreviousMonth}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Previous month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        
        <h3 className="font-medium">
          {monthName} {year}
        </h3>
        
        <button 
          onClick={goToNextMonth}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Next month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs font-medium text-gray-500">
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
            
          return (
            <button
              key={index}
              onClick={() => day.date && onDateSelect(day.date)}
              disabled={!day.date}
              className={`
                p-2 h-8 w-8 text-xs rounded-full flex items-center justify-center
                ${!day.date ? 'text-gray-300' : 'hover:bg-blue-50'}
                ${day.hasJournal && day.date ? 'font-medium' : ''}
                ${day.isToday ? 'border border-blue-500 text-blue-600' : ''}
                ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
              `}
              aria-label={day.date ? formatDate(day.date) : 'Empty day'}
              aria-pressed={isSelected}
            >
              {day.date?.getDate()}
              {day.hasJournal && <span className="absolute w-1 h-1 bg-blue-500 rounded-full -bottom-0.5"></span>}
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
  hasJournal: boolean;
};

function generateCalendar(date: Date, journals: Journal[]): CalendarDay[] {
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
  
  // Convert journal dates to strings for easier comparison
  const journalDates = new Set(
    journals.map(journal => {
      const journalDate = new Date(journal.created_at);
      return `${journalDate.getFullYear()}-${journalDate.getMonth()}-${journalDate.getDate()}`;
    })
  );
  
  const calendar: CalendarDay[] = [];
  
  // Add empty days for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendar.push({ date: null, isToday: false, hasJournal: false });
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const dateKey = `${year}-${month}-${day}`;
    
    const isToday = 
      today.getDate() === day && 
      today.getMonth() === month && 
      today.getFullYear() === year;
    
    const hasJournal = journalDates.has(dateKey);
    
    calendar.push({ date: currentDate, isToday, hasJournal });
  }
  
  // Optionally, fill the remaining spaces in the grid (if the last row is incomplete)
  // If you want to have 6 rows always, calculate 42 (6 rows * 7 days) - calendar.length
  const remainingDays = (7 - (calendar.length % 7)) % 7;
  for (let i = 0; i < remainingDays; i++) {
    calendar.push({ date: null, isToday: false, hasJournal: false });
  }
  
  return calendar;
}