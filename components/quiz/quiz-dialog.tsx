'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QuizQuestion, QuizState } from '@/types/quiz';
import { Check, X, ExternalLink, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FeedbackLoadingScreen } from '@/components/roleplay/feedback-loading-screen';

interface QuizDialogProps {
    isOpen: boolean;
    onClose: () => void;
    questions: QuizQuestion[];
    topicName: string;
    sources?: string;
    onRetry?: () => void;
    isLoading?: boolean;
    loadingSteps?: string[];
}

interface QuestionHistory {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
}

export function QuizDialog({ isOpen, onClose, questions, topicName, sources, onRetry, isLoading, loadingSteps }: QuizDialogProps) {
    const [quizState, setQuizState] = useState<QuizState>({
        currentQuestionIndex: 0,
        selectedAnswer: null,
        isAnswered: false,
        score: 0,
    });
    const [showCompletion, setShowCompletion] = useState(false);
    const [questionHistory, setQuestionHistory] = useState<QuestionHistory[]>([]);
    const [loadingStep, setLoadingStep] = useState(0);

    // Reset state when dialog opens with new questions
    useEffect(() => {
        if (isOpen) {
            setQuizState({
                currentQuestionIndex: 0,
                selectedAnswer: null,
                isAnswered: false,
                score: 0,
            });
            setShowCompletion(false);
            setQuestionHistory([]);
            setLoadingStep(0);
        }
    }, [isOpen, questions]);

    // Animate loading steps
    useEffect(() => {
        if (!isLoading || !loadingSteps) {
            setLoadingStep(0);
            return;
        }

        const interval = setInterval(() => {
            setLoadingStep(prev => {
                if (prev < loadingSteps.length - 1) return prev + 1;
                return 0; // Loop back to start
            });
        }, 2000); // Change every 2 seconds

        return () => clearInterval(interval);
    }, [isLoading, loadingSteps]);

    const currentQuestion = questions[quizState.currentQuestionIndex];
    const totalQuestions = questions.length;
    const isLastQuestion = quizState.currentQuestionIndex === totalQuestions - 1;

    const handleOptionClick = (option: string) => {
        if (quizState.isAnswered) return; // Prevent changing answer after selection

        const answerLetter = option.charAt(0); // Extract "A", "B", "C", "D"
        const isCorrect = answerLetter === currentQuestion.answer;
        const correctOption = currentQuestion.options.find(opt => opt.charAt(0) === currentQuestion.answer);

        // Add to history
        const historyItem: QuestionHistory = {
            question: currentQuestion.question,
            userAnswer: option,
            correctAnswer: correctOption || '',
            isCorrect,
            explanation: currentQuestion.explanation
        };

        setQuestionHistory(prev => [...prev, historyItem]);

        setQuizState({
            ...quizState,
            selectedAnswer: option,
            isAnswered: true,
            score: isCorrect ? quizState.score + 1 : quizState.score,
        });
    };

    const handleNext = () => {
        if (isLastQuestion) {
            // Quiz completed - show fireworks and completion screen
            setShowCompletion(true);
            
            // Trigger fireworks effect
            const count = 200;
            const defaults = {
                origin: { y: 0.7 }
            };
            
            function fire(particleRatio: number, opts: any) {
                confetti(Object.assign({}, defaults, opts, {
                    particleCount: Math.floor(count * particleRatio)
                }));
            }
            
            fire(0.25, {
                spread: 26,
                startVelocity: 55,
            });
            
            fire(0.2, {
                spread: 60,
            });
            
            fire(0.35, {
                spread: 100,
                decay: 0.91,
                scalar: 0.8
            });
            
            fire(0.1, {
                spread: 120,
                startVelocity: 25,
                decay: 0.92,
                scalar: 1.2
            });
            
            fire(0.1, {
                spread: 120,
                startVelocity: 45,
            });
        } else {
            setQuizState({
                ...quizState,
                currentQuestionIndex: quizState.currentQuestionIndex + 1,
                selectedAnswer: null,
                isAnswered: false,
            });
        }
    };

    const getOptionState = (option: string) => {
        if (!quizState.isAnswered) return 'idle';

        const answerLetter = option.charAt(0);
        const isCorrect = answerLetter === currentQuestion.answer;
        const isSelected = option === quizState.selectedAnswer;

        if (isSelected && isCorrect) return 'correct';
        if (isSelected && !isCorrect) return 'incorrect';
        if (isCorrect) return 'correct'; // Show correct answer even if not selected
        return 'dimmed';
    };

    const getOptionClasses = (state: string) => {
        const baseClasses = 'w-full p-4 rounded-lg border-2 text-left transition-all cursor-pointer';

        switch (state) {
            case 'correct':
                return `${baseClasses} border-green-500 bg-green-50 text-green-900`;
            case 'incorrect':
                return `${baseClasses} border-red-500 bg-red-50 text-red-900`;
            case 'dimmed':
                return `${baseClasses} border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed`;
            default:
                return `${baseClasses} border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50`;
        }
    };

    if (!currentQuestion) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {isLoading ? 'Đang tạo câu hỏi...' : showCompletion ? 'Chúc mừng!' : topicName}
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    /* Loading Screen */
                    <div className="py-12 flex justify-center">
                        <div className="text-center space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                            <div className="h-6 flex items-center justify-center">
                                {loadingSteps && loadingSteps[loadingStep] && (
                                    <div 
                                        key={loadingStep}
                                        className="text-sm text-purple-600 font-medium animate-pulse transition-all duration-1500 ease-in-out"
                                    >
                                        {loadingSteps[loadingStep]}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : showCompletion ? (
                    /* Completion Screen */
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <Trophy className="w-16 h-16 text-yellow-500" />
                        </div>
                        
                        <div>
                            <h3 className="text-2xl font-bold text-green-600 mb-2">Hoàn thành!</h3>
                            <p className="text-lg text-muted-foreground">
                                Bạn đã trả lời đúng {quizState.score}/{totalQuestions} câu hỏi
                            </p>
                        </div>

                        {/* Question History */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left max-h-64 overflow-y-auto">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Lịch sử câu hỏi:</h4>
                            <div className="space-y-3">
                                {questionHistory.map((item, index) => (
                                    <div key={index} className="border-l-4 pl-3 py-2 rounded-r border-l-gray-300 bg-white">
                                        <p className="text-sm font-medium text-gray-900 mb-1">
                                            Câu {index + 1}: {item.question.length > 80 ? item.question.substring(0, 80) + '...' : item.question}
                                        </p>
                                        <div className="flex flex-col gap-1 text-xs">
                                            <div className={`flex items-center gap-2 ${item.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                                {item.isCorrect ? (
                                                    <Check className="w-3 h-3" />
                                                ) : (
                                                    <X className="w-3 h-3" />
                                                )}
                                                <span>Bạn chọn: {item.userAnswer}</span>
                                            </div>
                                            {!item.isCorrect && (
                                                <div className="text-green-700 flex items-center gap-2">
                                                    <Check className="w-3 h-3" />
                                                    <span>Đáp án đúng: {item.correctAnswer}</span>
                                                </div>
                                            )}
                                            <p className="text-gray-600 mt-1">{item.explanation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {sources && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                                <h4 className="text-sm font-semibold text-blue-900 mb-2">Làm thêm tại:</h4>
                                <div className="space-y-2">
                                    {sources.split(', ').map((source, index) => {
                                        const cleanSource = source.trim();
                                        if (cleanSource.startsWith('http')) {
                                            return (
                                                <a
                                                    key={index}
                                                    href={cleanSource}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-blue-700 hover:text-blue-900 text-sm hover:underline"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    {cleanSource}
                                                </a>
                                            );
                                        }
                                        return (
                                            <p key={index} className="text-blue-700 text-sm">
                                                {cleanSource}
                                            </p>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        
                        <div className="flex gap-3">
                            {onRetry && (
                                <Button onClick={onRetry} size="lg" className="flex-1">
                                    Làm thêm
                                </Button>
                            )}
                            <Button onClick={onClose} variant="outline" size="lg" className="flex-1">
                                Đóng
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* Quiz Content */
                    <>
                        {/* Progress Bar */}
                        <div className="flex gap-1 mb-6">
                            {Array.from({ length: totalQuestions }).map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-2 flex-1 rounded-full transition-all ${index < quizState.currentQuestionIndex
                                            ? 'bg-green-500'
                                            : index === quizState.currentQuestionIndex
                                                ? 'bg-blue-500'
                                                : 'bg-gray-200'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Question Counter */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                                    {quizState.currentQuestionIndex + 1}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    / {totalQuestions}
                                </span>
                            </div>
                        </div>

                        {/* Question Text */}
                        <div className="mb-6">
                            <p className="text-lg leading-relaxed">{currentQuestion.question}</p>
                        </div>

                        {/* Label */}
                        <p className="text-sm font-medium text-muted-foreground mb-3">Chọn đáp án đúng</p>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                            {currentQuestion.options.map((option, index) => {
                                const state = getOptionState(option);
                                const answerLetter = option.charAt(0);
                                const isCorrect = answerLetter === currentQuestion.answer;
                                const isSelected = option === quizState.selectedAnswer;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleOptionClick(option)}
                                        disabled={quizState.isAnswered}
                                        className={getOptionClasses(state)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{option}</span>
                                            {quizState.isAnswered && isCorrect && (
                                                <Check className="w-5 h-5 text-green-600" />
                                            )}
                                            {quizState.isAnswered && isSelected && !isCorrect && (
                                                <X className="w-5 h-5 text-red-600" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Explanation (shown after answer) */}
                        {quizState.isAnswered && (
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm font-medium text-blue-900 mb-1">Giải thích:</p>
                                <p className="text-sm text-blue-800">{currentQuestion.explanation}</p>
                            </div>
                        )}

                        {/* Next Button */}
                        {quizState.isAnswered && (
                            <div className="flex justify-end">
                                <Button onClick={handleNext} size="lg">
                                    {isLastQuestion ? 'Hoàn thành' : 'Tiếp'}
                                </Button>
                            </div>
                        )}

                        {/* Report Issue Link */}
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
                            <button className="hover:underline">🚩 Báo lỗi câu hỏi</button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
