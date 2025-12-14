'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TemplateCards } from '@/components/journal/template-cards';
import { RoleplayCard } from '@/components/roleplay/roleplay-card';
import { FlashcardCard } from '@/app/vocab/components/Flashcard';
import { ReviewControls } from '@/app/vocab/components/ReviewControls';
import { ProgressBar } from '@/app/vocab/components/ProgressBar';
import { supabase } from '@/services/supabase/client';
import { useUserProfileStore } from '@/stores/user-profile-store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { SectionNavigation } from '@/components/ui/section-navigation';
import { PageContentWrapper } from '@/components/ui/page-content-wrapper';
import { TemplateCardsSkeleton, HorizontalCardsSkeleton } from '@/components/ui/page-skeleton';
import { PinnedTemplatesList } from '@/components/journal/pinned-templates-list';
import { HorizontalScrollList } from '@/components/ui/horizontal-scroll-list';

interface RoleplayScenario {
    id: string;
    name: string;
    context: string;
    image: string | null;
}

interface DueFlashcard {
    vocabulary_id: string;
    word: string;
    meaning: string;
    example?: string;
    next_review_at: string;
    vocabulary_set: {
        title: string;
    };
}

function DueFlashcards() {
    const { user } = useAuth();
    const [flashcards, setFlashcards] = useState<DueFlashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isShuffled, setIsShuffled] = useState(false);

    useEffect(() => {
        async function fetchDueFlashcards() {
            if (!user?.id) {
                setIsLoading(false);
                return;
            }

            try {
                const now = new Date().toISOString();
                const { data, error } = await supabase
                    .from('vocabulary_status')
                    .select(`
                        vocabulary_id,
                        next_review_at,
                        vocabulary!inner(
                            word,
                            meaning,
                            example,
                            vocabulary_set!inner(
                                title,
                                profile_id
                            )
                        )
                    `)
                    .eq('vocabulary.vocabulary_set.profile_id', user.id)
                    .lte('next_review_at', now)
                    .order('next_review_at', { ascending: true })
                    .limit(20);

                if (error) {
                    console.error('Error fetching flashcards:', error);
                } else {
                    const formatted = (data || []).map((item: any) => ({
                        vocabulary_id: item.vocabulary_id,
                        word: item.vocabulary.word,
                        meaning: item.vocabulary.meaning,
                        example: item.vocabulary.example,
                        next_review_at: item.next_review_at,
                        vocabulary_set: {
                            title: item.vocabulary.vocabulary_set.title
                        }
                    }));
                    setFlashcards(formatted);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchDueFlashcards();
    }, [user?.id]);

    const handleRating = async (rating: string) => {
        const currentCard = flashcards[currentIndex];
        if (!currentCard || isSubmitting) return;

        // Immediately move to next card for smooth UX
        if (currentIndex + 1 < flashcards.length) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
        } else {
            // All cards completed, show completion state immediately
            setCurrentIndex(0);
            setIsFlipped(false);
            // Optionally refresh to get new due cards after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }

        // Process rating in background (fire-and-forget)
        const ratingMap: Record<string, number> = {
            'again': 1,
            'hard': 2,
            'good': 3,
            'easy': 4
        };

        // Background API call - don't await
        fetch('/api/vocabulary/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                vocabulary_id: currentCard.vocabulary_id,
                rating: ratingMap[rating]
            }),
        }).catch(error => {
            console.error('Background review update failed:', error);
            // Could show a toast notification if needed, but don't block UX
        });
    };

    const handleShuffle = () => {
        setIsShuffled(!isShuffled);
        setIsFlipped(false); // Reset flip state when shuffling
    };

    // Get the front and back content based on shuffle state
    const getFrontContent = (card: DueFlashcard) => isShuffled ? card.meaning : card.word;
    const getBackContent = (card: DueFlashcard) => isShuffled ? card.word : `${card.meaning}${card.example ? `\n\n"${card.example}"` : ''
        }`;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="text-gray-600">Đang tải thẻ từ vựng...</div>
            </div>
        );
    }

    if (flashcards.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">Hết rùi!</h3>
                <p className="text-gray-600">Học thêm để có thêm từ ôn tập nhé</p>
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];
    const progress = ((currentIndex + 1) / flashcards.length) * 100;

    return (
        <div className="flex flex-col items-center space-y-6 w-full max-w-md mx-auto">
            {/* Flashcard */}
            <FlashcardCard
                front={getFrontContent(currentCard)}
                back={getBackContent(currentCard)}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped(!isFlipped)}
            />

            {/* Review Controls */}
            <div className={`flex flex-col items-center transition-opacity duration-200 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <ReviewControls onRate={handleRating} />
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { profile } = useUserProfileStore();

    // Sử dụng kiểu dữ liệu đã định nghĩa
    const [scenarios, setScenarios] = useState<RoleplayScenario[]>([]);
    const [loading, setLoading] = useState(true);
    const [tooltipOpen1, setTooltipOpen1] = useState(false);
    const [tooltipOpen2, setTooltipOpen2] = useState(false);
    const [tooltipOpen3, setTooltipOpen3] = useState(false);

    // Get greeting based on Vietnam time
    const getGreeting = () => {
        const now = new Date();
        const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        const hour = vietnamTime.getHours();

        const name = profile?.name || 'bạn';

        if (hour >= 5 && hour < 11) {
            return {
                greeting: `Chào buổi sáng, ${name}`,
                prompt: 'Kế hoạch hôm nay của bạn là gì?'
            };
        } else if (hour >= 11 && hour < 13) {
            return {
                greeting: `Chào buổi trưa, ${name}`,
                prompt: 'Hôm nay bạn muốn viết gì nào?'
            };
        } else if (hour >= 13 && hour < 18) {
            return {
                greeting: `Chào buổi chiều, ${name}`,
                prompt: 'Hôm nay bạn muốn viết gì nào?'
            };
        } else {
            return {
                greeting: `Chào buổi tối, ${name}`,
                prompt: 'Ngày của bạn hôm nay thế nào?'
            };
        }
    };

    const { greeting, prompt } = getGreeting();

    // Updated auto-scroll refs and state for 2 sections
    const journalSectionRef = useRef<HTMLElement>(null);
    const roleplaySectionRef = useRef<HTMLElement>(null);
    const [currentSection, setCurrentSection] = useState<'journal' | 'practice'>('journal');
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);

    // 🧠 Fetch roleplay từ Supabase
    useEffect(() => {
        async function fetchScenarios() {
            const { data, error } = await supabase
                .from('roleplays') // Tên bảng
                // ❗ Đã điều chỉnh tên cột theo schema bạn cung cấp
                .select('id, name, context, image')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) {
                console.error('❌ Lỗi khi tải roleplay:', error.message);
                setScenarios([]); // Đặt về mảng rỗng khi có lỗi
            } else {
                // Ép kiểu dữ liệu nếu cần
                setScenarios(data as RoleplayScenario[]);
            }
            setLoading(false);
        }

        fetchScenarios();
    }, []);

    // Updated auto-scroll behavior for 2 sections
    // Updated auto-scroll behavior for 2 sections
    useEffect(() => {
        const handleScroll = () => {
            if (isAutoScrolling || window.innerWidth < 768) return;

            const scrollY = window.scrollY;
            // Threshold for "a bit scroll" - e.g., 50px
            const threshold = 1;

            // Get the top position of the practice section
            const practiceTop = roleplaySectionRef.current?.offsetTop || window.innerHeight;

            if (currentSection === 'journal') {
                // If we are in journal section and scroll down a bit
                if (scrollY > threshold) {
                    setIsAutoScrolling(true);
                    setCurrentSection('practice');
                    scrollTo('practice');
                    setTimeout(() => setIsAutoScrolling(false), 1000);
                }
            } else if (currentSection === 'practice') {
                // If we are in practice section and scroll up a bit
                if (scrollY < practiceTop - threshold) {
                    setIsAutoScrolling(true);
                    setCurrentSection('journal');
                    scrollTo('journal');
                    setTimeout(() => setIsAutoScrolling(false), 1000);
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [currentSection, isAutoScrolling]);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="scroll-smooth">
            <SectionNavigation sections={[
                { id: 'journal', label: 'Nhật ký' },
                { id: 'practice', label: 'Học tiếng Anh' },
            ]} />
            {/* SECTION 1 – VIẾT */}
            <section ref={journalSectionRef} id="journal" className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-50 to-blue-50/40 px-4 py-8">
                <div className="w-full max-w-3xl mx-auto">
                    <div className="text-center mb-4 sm:mb-6">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{greeting}</h1>
                        <div className="flex items-center justify-center gap-2">
                            <p className="text-base sm:text-lg text-gray-600">{prompt}</p>
                            <TooltipProvider delayDuration={0}>
                                <Tooltip open={tooltipOpen1} onOpenChange={setTooltipOpen1}>
                                    <TooltipTrigger asChild>
                                        <button
                                            className="touch-manipulation"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setTooltipOpen1(!tooltipOpen1);
                                            }}
                                        >
                                            <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="max-w-xs">
                                        <p>Viết nhật ký bằng cách trả lời các câu hỏi</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                    <PageContentWrapper
                        isLoading={false}
                        skeleton={<TemplateCardsSkeleton />}
                    >
                        <TemplateCards />
                    </PageContentWrapper>
                    <div className="text-center mt-4 sm:mt-6">
                        <PinnedTemplatesList />
                        <Button
                            onClick={() => router.push('/journal/new')}
                            variant='outline'
                            className="relative overflow-hidden bg-white border-2 border-gray-900 text-gray-900 hover:text-white transition-colors duration-500 group text-sm sm:text-base"
                        >
                            <span className="absolute inset-0 bg-gray-900 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
                            <span className="relative z-10">Viết tự do</span>
                        </Button>
                    </div>
                </div>
            </section>

            {/* SECTION 2 – LUYỆN TẬP (Roleplay + Vocab) */}
            <section ref={roleplaySectionRef} id="practice" className="flex flex-col items-center px-4 w-full bg-gradient-to-b from-blue-50/40 to-white py-8 overflow-x-hidden">
                <div className="w-full max-w-3xl space-y-8">

                    {/* Roleplay Section */}
                    <div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">Hôm nay, bạn muốn đóng vai ai?</h2>
                                <TooltipProvider delayDuration={0}>
                                    <Tooltip open={tooltipOpen2} onOpenChange={setTooltipOpen2}>
                                        <TooltipTrigger asChild>
                                            <button
                                                className="touch-manipulation flex-shrink-0"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setTooltipOpen2(!tooltipOpen2);
                                                }}
                                            >
                                                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="max-w-xs">
                                            <p>Rèn luyện phản xạ nhanh trong các tình huống thực tế</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Link href="/roleplay" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                Xem thêm
                            </Link>
                        </div>

                        <PageContentWrapper
                            isLoading={loading}
                            skeleton={<HorizontalCardsSkeleton count={5} />}
                        >
                            <HorizontalScrollList>
                                {scenarios.length > 0 ? (
                                    scenarios.map((s) => (
                                        <div key={s.id} className="flex-shrink-0">
                                            <RoleplayCard
                                                id={s.id}
                                                title={s.name}
                                                description={s.context}
                                                imageUrl={s.image || ''}
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <div className="w-full text-center py-8 text-gray-500">
                                        <p>Chưa có hội thoại nào được thêm.</p>
                                    </div>
                                )}
                            </HorizontalScrollList>
                        </PageContentWrapper>
                    </div>

                    {/* Flashcard Section */}
                    <div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">Các từ sắp quên!!</h2>
                                <TooltipProvider delayDuration={0}>
                                    <Tooltip open={tooltipOpen3} onOpenChange={setTooltipOpen3}>
                                        <TooltipTrigger asChild>
                                            <button
                                                className="touch-manipulation flex-shrink-0"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setTooltipOpen3(!tooltipOpen3);
                                                }}
                                            >
                                                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="max-w-xs">
                                            <p>Các từ đến hạn ôn tập, theo thứ tự gấp nhất</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Link href="/vocab" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                Xem tất cả
                            </Link>
                        </div>
                        <DueFlashcards />
                    </div>

                </div>
            </section>
        </div>
    );
}