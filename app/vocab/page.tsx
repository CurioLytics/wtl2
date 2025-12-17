'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import { Button } from '@/components/ui/button';
import { FlashcardSetList, VocabularySetList } from '@/app/vocab/components/vocab_list/flashcard-set-list';
import type { VocabularySetStats } from '@/types/flashcardSetStats';
import { supabase } from '@/services/supabase/client';
import type { Vocabulary } from '@/types/vocabulary';
import { getStarredVocabulary } from '@/utils/star-helpers';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { PageContentWrapper } from '@/components/ui/page-content-wrapper';
import { VocabSetListSkeleton } from '@/components/ui/page-skeleton';

export default function VocabPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [flashcardSets, setFlashcardSets] = useState<VocabularySetStats[]>([]);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(true);
  const [flashcardError, setFlashcardError] = useState<string | null>(null);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'sets' | 'starred-words'>('sets');
  const [starredWords, setStarredWords] = useState<Vocabulary[]>([]);
  const [isLoadingStarredWords, setIsLoadingStarredWords] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  // Filter sets based on starred status
  const filteredSets = showStarredOnly
    ? flashcardSets.filter(set => (set as any).is_starred)
    : flashcardSets;

  useEffect(() => {
    if (!user?.id) return;
    const loadFlashcardSetStats = async () => {
      setIsLoadingFlashcards(true);
      setFlashcardError(null);
      try {
        const { data, error } = await (supabase.rpc as any)(
          'get_flashcard_set_stats',
          { user_uuid: user.id }
        );
        if (error) throw error;
        setFlashcardSets(data || []);
      } catch (err: any) {
        console.error('Error loading flashcard set stats:', err);
        setFlashcardError('Không thể tải danh sách flashcard. Vui lòng thử lại.');
      } finally {
        setIsLoadingFlashcards(false);
      }
    };
    loadFlashcardSetStats();
  }, [user?.id]);

  // Load starred words on page load
  useEffect(() => {
    if (user?.id) {
      loadStarredWords();
    }
  }, [user?.id]);

  const loadStarredWords = async () => {
    if (!user?.id) return;

    // Check sessionStorage cache first
    const cacheKey = `starred-words-${user.id}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        const isExpired = Date.now() - timestamp > 5 * 60 * 1000; // 5 minutes TTL

        if (!isExpired) {
          setStarredWords(data);
          return;
        }
      } catch (e) {
        console.error('Error parsing cached starred words:', e);
      }
    }

    // Fetch fresh data if no cache or expired
    setIsLoadingStarredWords(true);
    try {
      const starred = await getStarredVocabulary();
      console.log('Starred words data:', starred); // Debug log
      setStarredWords(starred);

      // Cache the data
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: starred,
        timestamp: Date.now()
      }));
    } catch (error: any) {
      console.error('Error loading starred words:', error);
      toast.error(error.message || 'Failed to load starred words');
    } finally {
      setIsLoadingStarredWords(false);
    }
  };

  const handleStarToggle = async (wordId: string) => {
    if (!user?.id) return;
    try {
      const response = await fetch(`/api/vocabulary/words/${wordId}/star`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error('Failed to toggle star');
      }

      const result = await response.json();
      const newStarredStatus = result.data?.isStarred;

      // Invalidate cache and refresh starred words
      const cacheKey = `starred-words-${user.id}`;
      sessionStorage.removeItem(cacheKey);

      if (activeTab === 'starred-words') {
        await loadStarredWords();
      }
      toast.success(newStarredStatus ? 'Đã thêm vào mục yêu thích' : 'Đã xóa khỏi mục yêu thích');
    } catch (error) {
      console.error('Error toggling star:', error);
      toast.error('Lỗi khi cập nhật');
    }
  };

  const handleSelectSet = (setId: string) => {
    if (!setId) return;
    router.push(`/vocab/${setId}`);
  };

  return (
    <div className="flex flex-col items-center px-4 py-10 w-full">
      {/* HEADER */}
      <div className="w-full max-w-3xl bg-white shadow rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Từ vựng</h1>
        <div className="mt-2 flex items-center gap-2">
          <p className="text-sm text-gray-600">
            Ôn từ vựng với phương pháp khoa học spaced repetition
          </p>
          <TooltipProvider delayDuration={0}>
            <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
              <TooltipTrigger asChild>
                <button
                  className="touch-manipulation flex-shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    setTooltipOpen(!tooltipOpen);
                  }}
                >
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p>Spaced Repetition là phương pháp ôn tập tăng khoảng cách giữa các lần ôn, giúp ghi nhớ lâu dài và hiệu quả</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Add spacing between header and next block */}
      <div className="w-full max-w-3xl space-y-6 mt-10">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('sets')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'sets'
                ? 'border-[oklch(0.55_0.22_250)] text-[oklch(0.55_0.22_250)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Bộ từ vựng
            </button>
            <button
              onClick={() => setActiveTab('starred-words')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'starred-words'
                ? 'border-[oklch(0.55_0.22_250)] text-[oklch(0.55_0.22_250)]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              ⭐ Từ đã đánh dấu
            </button>
          </nav>
        </div>

        {activeTab === 'sets' ? (
          <>
            {/* Filter Toggle for Sets */}
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">{filteredSets.length} bộ</div>
              <button
                onClick={() => setShowStarredOnly(!showStarredOnly)}
                className={`px-4 py-2 rounded-lg transition-colors ${showStarredOnly
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}
                title={showStarredOnly ? 'Chỉ xem từ đã đánh dấu' : 'Xem tất cả bộ'}
              >
                {showStarredOnly ? '⭐' : '☆'}
              </button>
            </div>

            <PageContentWrapper
              isLoading={isLoadingFlashcards}
              skeleton={<VocabSetListSkeleton />}
            >
              {flashcardError ? (
                <div className="text-center py-8 text-red-600">
                  {flashcardError}
                </div>
              ) : (
                <VocabularySetList
                  vocabularySets={filteredSets as any}
                  isLoading={false}
                  error={null}
                  onSelectSet={handleSelectSet}
                  onStarToggle={(setId: string, newStarredStatus: boolean) => {
                    console.log('[VocabPage] Star toggled:', { setId, newStarredStatus });
                    setFlashcardSets(prev => prev.map(set =>
                      set.set_id === setId
                        ? { ...set, is_starred: newStarredStatus } as any
                        : set
                    ));
                  }}
                  onDelete={(setId: string) => {
                    setFlashcardSets(prev => prev.filter(set => set.set_id !== setId));
                  }}
                />
              )}
            </PageContentWrapper>

            <div className="mt-8 flex justify-center">
              <button
                className="btn-blue-primary"
                onClick={() => router.push('/vocab/create')}
              >
                Thêm bộ
              </button>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow p-6">
            {/* Starred Words View */}
            {isLoadingStarredWords ? (
              <div className="text-center py-8 text-gray-500">Chờ xíu...</div>
            ) : starredWords.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-2">Chưa có từ nào được đánh dấu</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {starredWords.map((word) => (
                  <div
                    key={word.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{word.word}</h3>
                      <button
                        onClick={() => word.id && handleStarToggle(word.id)}
                        className="text-yellow-500 hover:text-yellow-600 transition-colors"
                        title="Bỏ đánh dấu"
                        disabled={!word.id}
                      >
                        ⭐
                      </button>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{word.meaning}</p>
                    {word.example && (
                      <p className="text-gray-500 text-xs italic">{word.example}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
