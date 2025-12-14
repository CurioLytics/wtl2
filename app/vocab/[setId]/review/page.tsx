"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Vocabulary } from "@/types/vocabulary";
import { FlashcardCard } from "../../components/Flashcard";
import { ReviewControls } from "../../components/ReviewControls";
import { ProgressBar } from "../../components/ProgressBar";
import { toggleVocabularyStar } from '@/utils/star-helpers';
import { useAuth } from '@/hooks/auth/use-auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function ReviewPage() {
  const params = useParams<{ setId: string }>();
  const router = useRouter();
  const setId = params.setId;
  const { user } = useAuth();

  const [cards, setCards] = useState<Vocabulary[]>([]);
  // 💡 NEW STATE: Track the loading status
  const [isLoading, setIsLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);

  useEffect(() => {
    if (!setId) return;
    setIsLoading(true);

    fetch(`/api/vocabulary/sets/${setId}/review`)
      .then(res => res.json())
      .then((data) => {
        // Map vocabulary_id to id for compatibility with Vocabulary type
        const mappedVocabulary = (data.vocabulary || []).map((item: any) => ({
          ...item,
          id: item.vocabulary_id || item.id,
          set_id: setId
        }));
        setCards(mappedVocabulary);
      })
      .catch((error) => {
        console.error("[❌ API Error] vocabulary review failed:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [setId]);

  const currentCard = cards[current];
  const progress = cards.length ? ((current + 1) / cards.length) * 100 : 0;

  const handleShuffle = () => {
    setIsShuffled(!isShuffled);
    setFlipped(false); // Reset flip state when shuffling
  };

  // Get the front and back content based on shuffle state
  const getFrontContent = (card: Vocabulary) => isShuffled ? card.meaning : card.word;
  const getBackContent = (card: Vocabulary) => isShuffled ? card.word : card.meaning;

  // Star toggle function
  const handleStarToggle = async () => {
    if (!user || !currentCard) {
      toast.error('Bạn cần đăng nhập để đánh dấu từ');
      return;
    }

    try {
      const vocabularyId = currentCard.id;
      if (!vocabularyId) {
        toast.error('No card selected');
        return;
      }

      const newStarredStatus = await toggleVocabularyStar(vocabularyId);

      // Update local state
      setCards(prev => prev.map(card => {
        const cardId = card.id;
        return cardId === vocabularyId
          ? { ...card, is_starred: newStarredStatus }
          : card;
      }));

      toast.success(newStarredStatus ? 'Đã đánh dấu' : 'Đã bỏ đánh dấu');
    } catch (error: any) {
      console.error('Error toggling star:', error);
      toast.error(error.message);
    }
  };

  async function handleRating(rating: string) {
    if (!currentCard) return;

    // Immediately move to next card for smooth UX
    setFlipped(false);
    if (current + 1 < cards.length) {
      setCurrent((prev) => prev + 1);
    } else {
      setCompleted(true);
    }

    // Process rating in background (fire-and-forget)
    const ratingMap: Record<string, number> = {
      'again': 1,
      'hard': 2,
      'good': 3,
      'easy': 4
    };

    const numericRating = ratingMap[rating];
    if (!numericRating) {
      console.error('Invalid rating:', rating);
      return;
    }

    // Background API call - don't await
    const payload = {
      vocabulary_id: currentCard.id,
      rating: numericRating
    };

    fetch('/api/vocabulary/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(error => {
      console.error('Background review update failed:', error);
      // Could show a toast notification if needed, but don't block UX
    });
  }

  // 1. Check Loading State first
  if (isLoading) {
    // 💡 SHOW A LOADING MESSAGE/SPINNER
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tìm thẻ...
      </div>
    );
  }

  // 2. Check for "No cards to review" ONLY after loading is complete
  if (!cards.length)
    return (
      <div className="max-w-3xl mx-auto px-4 space-y-8 py-8">
        <div className="bg-white shadow rounded-2xl p-6">
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Chưa có từ đến hạn, bạn đọc qua danh sách nhé</p>
            <Button
              onClick={() => router.push("/vocab")}
              variant="default"
            >
              Quay lại vocab
            </Button>
          </div>
        </div>
      </div>
    );

  if (completed)
    return (
      <div className="max-w-3xl mx-auto px-4 space-y-8 py-8">
        <div className="bg-white shadow rounded-2xl p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold">Hết rùi.. Tuyệt cú mèo</h2>
            <button
              className="text-gray-500 hover:text-black text-xl"
              onClick={() => router.push("/vocab")}
            >
              ✕
            </button>
          </div>
          <Button
            onClick={() => router.push("/vocab")}
          >
            Quay lại vocab
          </Button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl">
        <div className="bg-white shadow rounded-2xl p-6">
          <div className="flex justify-between items-start mb-6">
            {/* MOVED: Star and Shuffle to the left (first div inside justify-between) */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleShuffle}
                className="p-3 text-gray-600 hover:text-[var(--primary)] transition-colors"
                aria-label="Xáo mặt trước & sau"
                title="Đổi nội dung mặt trước/sau"
              >
                🔀
              </button>
              {currentCard && (
                <button
                  onClick={handleStarToggle}
                  className={`p-3 transition-colors ${currentCard.is_starred
                    ? 'text-yellow-500 hover:text-yellow-600'
                    : 'text-gray-400 hover:text-yellow-500'
                    }`}
                  aria-label={currentCard.is_starred ? 'Bỏ đánh dấu' : 'Đánh dấu'}
                  title={currentCard.is_starred ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                >
                  {currentCard.is_starred ? '⭐' : '☆'}
                </button>
              )}
            </div>
            {/* MOVED: Button to the right (second div inside justify-between) */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push("/vocab")}
                variant="default"
                className=""
              >
                Kết thúc
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center space-y-6 mt-8 min-h-[500px]">
            <ProgressBar value={progress} />
            <FlashcardCard
              front={getFrontContent(currentCard)}
              back={getBackContent(currentCard)}
              isFlipped={flipped}
              onFlip={() => setFlipped(!flipped)}
            />
            {flipped && <ReviewControls onRate={handleRating} />}
          </div>
        </div>
      </div>
    </div>
  );
}