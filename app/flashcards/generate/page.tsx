'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Flashcard } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth/use-auth';
import { createClient } from '@/services/supabase/client';
import { FeedbackLoadingScreen } from '@/components/roleplay/feedback-loading-screen';

interface VocabularySetOption {
  id: string;
  title: string;
  is_default: boolean;
}

export default function FlashcardCreationPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [vocabularySets, setVocabularySets] = useState<VocabularySetOption[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load flashcards from localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load flashcards
        const raw = localStorage.getItem('flashcardData');
        if (!raw) {
          setFlashcards([]);
        } else {
          const parsed = JSON.parse(raw);
          let list: any[] = [];

          // Handle array directly (new structure from webhook)
          if (Array.isArray(parsed)) {
            list = parsed;
          } else if (parsed && Array.isArray(parsed.flashcards)) {
            list = parsed.flashcards;
          } else if (parsed && Array.isArray(parsed.output)) {
            list = parsed.output;
          }

          // Validate and normalize flashcards
          const valid = list.filter(
            (c: any) => c && typeof c.word === 'string' && typeof c.back === 'string'
          ).map((c: any) => ({
            word: c.word,
            back: {
              definition: c.back,
              example: ''
            }
          }));

          setFlashcards(valid as Flashcard[]);
        }

        // Load vocabulary sets if user is authenticated
        if (user?.id) {
          await loadVocabularySets();
        }
      } catch (err) {
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const loadVocabularySets = async () => {
    if (!user?.id) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('vocabulary_set')
        .select('id, title, is_default')
        .eq('profile_id', user.id)
        .order('is_default', { ascending: false })
        .order('title', { ascending: true });

      if (error) {
        console.error('Error loading vocabulary sets:', error);
        return;
      }

      setVocabularySets(data || []);
      // Set default selection to "Tổng hợp" if exists
      const defaultSet = data?.find(set => set.is_default);
      if (defaultSet) {
        setSelectedSetId(defaultSet.id);
      }
    } catch (err) {
      console.error('Error loading vocabulary sets:', err);
    }
  };

  // simple editors
  const updateFlashcard = (index: number, patch: Partial<Flashcard>) => {
    setFlashcards((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...patch, back: { ...f.back, ...(patch.back || {}) } } : f))
    );
  };

  const deleteFlashcard = (index: number) => {
    setFlashcards((prev) => prev.filter((_, i) => i !== index));
  };

  const addFlashcard = () => {
    setFlashcards((prev) => [...prev, {
      word: '',
      back: {
        definition: '',
        example: ''
      }
    }]);
  };

  const validate = (cards: Flashcard[]) => {
    if (!cards || cards.length === 0) {
      setError('Không có flashcard để lưu.');
      return false;
    }
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i];
      if (!c.word || !c.back?.definition) {
        setError(`Flashcard #${i + 1} chưa đầy đủ. Vui lòng kiểm tra Term và Meaning.`);
        return false;
      }
    }
    return true;
  };

  // --------------------------
  // ✅ Save flashcards via Supabase RPC or direct insert
  // --------------------------
  const handleSaveFlashcards = async () => {
    setError(null);

    // Filter out empty flashcards
    const validFlashcards = flashcards.filter(card =>
      card.word.trim() && card.back?.definition.trim()
    );

    if (validFlashcards.length === 0) {
      setError('Không có flashcard hợp lệ. Bạn cần điền đầy đủ Từ và Nghĩa.');
      return;
    }

    if (!user?.id) {
      setError('Bạn cần đăng nhập để lưu flashcards.');
      return;
    }

    if (!selectedSetId) {
      setError('Vui lòng chọn bộ để lưu.');
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();

      // Save valid flashcards directly to vocabulary table
      const vocabularyData = validFlashcards.map((card) => ({
        set_id: selectedSetId,
        word: card.word.trim(),
        meaning: card.back.definition.trim(),
        example: card.back.example?.trim() || null,
      }));

      const { error } = await supabase
        .from('vocabulary')
        .insert(vocabularyData);

      if (error) {
        console.error('Supabase Insert Error:', error);
        setError(
          `Lỗi khi lưu: ${error.message || 'Không thể lưu flashcards'}`
        );
        return;
      }

      console.log('Save Success: Flashcards saved to vocabulary set');

      localStorage.removeItem('flashcardData');
      setSaveSuccess(true);

      setTimeout(() => {
        router.push('/vocab');
      }, 800);
    } catch (err: any) {
      console.error('Unexpected Error:', err);
      setError(`Lỗi không mong đợi: ${err.message || 'Vui lòng thử lại'}`);
    } finally {
      setIsSaving(false);
    }
  };



  // --------------------------
  // ✅ Render
  // --------------------------
  if (isLoading) {
    return (
      <FeedbackLoadingScreen
        isVisible={true}
        colorScheme="blue"
        steps={['tạo mặt trước', 'tạo mặt sau', 'thêm ví dụ']}
      />
    );
  }

  if (saveSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Lưu thành công</h2>
          <p className="text-sm text-gray-600 mb-6">Lưu thành công.</p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => router.push('/vocab')}>Đến Vocab Hub</Button>
            <Button variant="outline" onClick={() => router.push('/flashcards/generate')}>
              Tạo thêm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ fontFamily: 'var(--font-sans)' }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tạo Flashcards</h1>
              <p className="text-sm text-gray-600 mt-2">Kiểm tra và chỉnh sửa trước khi lưu.</p>
            </div>
            <div className="text-sm text-gray-600">{flashcards.length} mục</div>
          </div>

          {/* Vocabulary Set Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lưu vào bộ từ vựng
            </label>
            <select
              value={selectedSetId}
              onChange={(e) => setSelectedSetId(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Chọn bộ từ vựng...</option>
              {vocabularySets.map(set => (
                <option key={set.id} value={set.id}>
                  {set.title} {set.is_default ? '(Mặc định)' : ''}
                </option>
              ))}
            </select>

          </div>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded">{error}</div>
          )}

          <div className="space-y-6">
            {/* Vocabulary Words Section */}
            <div>
              <div className="flex items-center mb-4">
              </div>

              <div className="space-y-4">
                {flashcards.length === 0 && (
                  <div className="text-center py-12 text-gray-500">Không có flashcard để hiển thị.</div>
                )}

                {flashcards.map((card, idx) => (
                  <div key={idx} className="relative border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <button
                      onClick={() => deleteFlashcard(idx)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-600 transition-colors text-lg"
                      aria-label={`Xóa flashcard ${idx + 1}`}
                    >
                      ×
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Mạt trước
                        </label>
                        <textarea
                          value={card.word}
                          onChange={(e) => updateFlashcard(idx, { word: e.target.value })}
                          rows={2}
                          className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
                          placeholder="Nhập từ..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Mặt sau
                        </label>
                        <textarea
                          value={card.back.definition}
                          onChange={(e) =>
                            updateFlashcard(idx, { back: { ...card.back, definition: e.target.value } })
                          }
                          rows={2}
                          className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
                          placeholder="Nhập nghĩa..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Word Button at the end */}
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addFlashcard}
                  className="text-sm w-full"
                >
                  + Thêm từ
                </Button>
              </div>
            </div>
          </div>          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => router.back()}>
              Quay về
            </Button>

            <Button
              onClick={handleSaveFlashcards}
              disabled={isSaving || flashcards.length === 0 || !selectedSetId}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isSaving ? 'Đang lưu...' : selectedSetId ? 'Lưu vào bộ từ vựng' : 'Chọn bộ từ vựng'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
