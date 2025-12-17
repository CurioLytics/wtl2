'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, X, Info } from 'lucide-react';
import { JournalList, CalendarView } from '@/components/features/journal/entries';
import { JournalStatsDisplay } from '@/components/features/journal/stats';
import { ExploreFrameworks } from '@/components/journal/explore-frameworks';
import { TagFilterDropdown } from '@/components/journal/tag-filter-dropdown';
import { DateRangeFilter } from '@/components/journal/date-range-filter';
import { WeekCalendarView } from '@/components/journal/week-calendar-view';
import { Journal, JournalStats } from '@/types/journal';
import { journalService } from '@/services/journal/journal-service';
import { useAuth } from '@/hooks/auth/use-auth';
import { SectionNavigation } from '@/components/ui/section-navigation';
import { PageContentWrapper } from '@/components/ui/page-content-wrapper';
import { JournalListSkeleton, PageHeaderSkeleton } from '@/components/ui/page-skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function JournalPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [stats, setStats] = useState<JournalStats>({ total_journals: 0, current_streak: 0 });
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Filter journals based on search query, tag, and date range
  const filteredJournals = useMemo(() => {
    return journals.filter(journal => {
      const matchesSearch = !searchQuery ||
        journal.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        journal.content.toLowerCase().includes(searchQuery.toLowerCase());

      // Date range filter
      const matchesDateRange = (() => {
        if (!startDate && !endDate) return true;
        const journalDate = new Date(journal.journal_date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && end) {
          return journalDate >= start && journalDate <= end;
        } else if (start) {
          return journalDate >= start;
        } else if (end) {
          return journalDate <= end;
        }
        return true;
      })();

      return matchesSearch && matchesDateRange;
    });
  }, [journals, searchQuery, startDate, endDate]);

  const handleTagFilterChange = async (tag: string | null) => {
    setSelectedTag(tag);

    if (!user?.id) return;

    setIsLoading(true);
    try {
      const journalsData = tag
        ? await journalService.getJournalsByTag(user.id, tag)
        : await journalService.getJournals(user.id);

      setJournals(journalsData);
    } catch (err) {
      console.error('Error fetching filtered journals:', err);
      setError('Failed to filter journals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (start: string | null, end: string | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleSearchToggle = () => {
    if (isSearchExpanded && searchQuery) {
      setSearchQuery('');
    }
    setIsSearchExpanded(!isSearchExpanded);
  };

  useEffect(() => {
    async function fetchJournalData() {
      if (!user?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch journals and stats in parallel
        const [journalsData, statsData] = await Promise.all([
          journalService.getJournals(user.id),
          journalService.getJournalStats(user.id)
        ]);

        setJournals(journalsData);
        setStats(statsData);
      } catch (err) {
        console.error('Error fetching journal data:', err);
        setError('Failed to load journal data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchJournalData();
  }, [user?.id]);

  const handleJournalSelect = (journal: Journal) => {
    setSelectedJournal(journal);
    router.push(`/journal/${journal.id}`);
  };

  const handleJournalDelete = (journalId: string) => {
    setJournals(prev => prev.filter(j => j.id !== journalId));
    if (selectedJournal?.id === journalId) {
      setSelectedJournal(null);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Filter journals by the selected date
    const journalsForDate = journals.filter(journal => {
      const journalDate = new Date(journal.journal_date);
      return (
        journalDate.getDate() === date.getDate() &&
        journalDate.getMonth() === date.getMonth() &&
        journalDate.getFullYear() === date.getFullYear()
      );
    }).sort((a, b) => {
      // #17: Sort by journal_date DESC, then created_at DESC
      const dateCompare = new Date(b.journal_date).getTime() - new Date(a.journal_date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });

    // If journals exist for this date, select the first one
    if (journalsForDate.length > 0) {
      handleJournalSelect(journalsForDate[0]);
    } else {
      // If no journals for this date, create a new entry for this date
      router.push(`/journal/new?date=${date.toISOString().split('T')[0]}`);
    }
  };

  return (
    <div className="flex flex-col items-center px-4 py-10 w-full">
      <SectionNavigation sections={[
        { id: 'journals', label: 'Journals' },
        { id: 'frameworks', label: 'Frameworks' },
      ]} />

      {/* HEADER */}
      <div className="w-full max-w-3xl bg-white shadow rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tổng hợp nhật ký</h1>
        <p className="mt-2 text-sm text-gray-600">
          Viết bằng tiếng Anh và nhận phản hồi chi tiết
        </p>
      </div>

      {/* Add spacing between header and next block */}
      <div id="journals" className="w-full max-w-3xl space-y-6 mt-10">

        {/* Journal & Calendar Section */}
        <div className="space-y-6">
          {/* Action Button Row */}
          <div className="flex justify-end">
            <button onClick={() => router.push('/journal/new')} className="btn-black-primary">
              Viết mới
            </button>
          </div>

          {/* Search and Filter Row */}
          <div className="flex items-center justify-end gap-3">
            {isSearchExpanded ? (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                  autoFocus
                />
                <button
                  onClick={handleSearchToggle}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleSearchToggle}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors min-w-[150px] justify-between"
                >
                  <span className="text-sm font-medium text-gray-700">Tìm kiếm</span>
                  <Search className="h-4 w-4 text-gray-500" />
                </button>
                <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
                <TagFilterDropdown
                  onFilterChange={handleTagFilterChange}
                  currentTag={selectedTag}
                />
              </>
            )}
          </div>

          {/* Calendar */}
          <div className="bg-gray-50 rounded-xl p-4">
            <WeekCalendarView
              journals={journals}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
          </div>

          {/* Journal List */}
          <div className="bg-gray-50 rounded-xl p-4">
            <PageContentWrapper
              isLoading={isLoading}
              skeleton={<JournalListSkeleton />}
            >
              {error ? (
                <div className="bg-red-50 p-4 rounded-lg text-red-700 text-center">
                  {error}
                  <Button variant="link" onClick={() => window.location.reload()} className="ml-2">
                    Thử lại
                  </Button>
                </div>
              ) : filteredJournals.length === 0 ? (
                <div className="text-center text-gray-600 py-8 bg-gray-100 rounded-lg border border-dashed border-gray-300">
                  <Button onClick={() => router.push('/journal/new')} variant="outline">

                    <PlusCircle className="mr-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  <JournalList
                    journals={filteredJournals}
                    onSelect={handleJournalSelect}
                    selectedJournalId={selectedJournal?.id}
                    onDelete={handleJournalDelete}
                  />
                </div>
              )}
            </PageContentWrapper>
          </div>
        </div>

      </div>

      {/* Framework Section */}
      <div id="frameworks" className="w-full max-w-3xl mt-10 bg-white shadow rounded-2xl p-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Khám phá Framework</h2>
          <Popover>
            <PopoverTrigger asChild>
              <button className="focus:outline-none">
                <Info className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="max-w-xs text-sm text-gray-700 bg-white p-3 shadow-md border border-gray-200 rounded-lg">
              <p>Framework là các mẫu nhật ký có hướng dẫn giúp cấu trúc suy nghĩ xoay quanh một mục tiêu cụ thể</p>
            </PopoverContent>
          </Popover>
        </div>
        <p className="text-center text-gray-600 mb-6">Khám phá các framework để trải nghiệm nhiều khía cạnh trong nhật k</p>
        <ExploreFrameworks />
      </div>

    </div>
  );
}
