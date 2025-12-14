'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, AlertCircle } from 'lucide-react';
import { exerciseService } from '@/services/exercises/exercise-service';
import { ErrorData, TopicExercise, GradingV2Response } from '@/types/exercise';
import { ExerciseResults } from './ExerciseResults';

interface PracticeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  errorData: ErrorData[];
  grammarTopics?: Record<string, string[]>; // { grammar_topic_id: [tags] }
}

export function PracticeDialog({ isOpen, onClose, errorData, grammarTopics }: PracticeDialogProps) {
  const [exercises, setExercises] = useState<TopicExercise[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [gradingResults, setGradingResults] = useState<GradingV2Response | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (isOpen && errorData?.length > 0) {
      loadExercises();
    }
  }, [isOpen, errorData]);

  const loadExercises = async () => {
    console.log('🎯 [Dialog] loadExercises called');
    console.log('🎯 [Dialog] grammarTopics prop:', JSON.stringify(grammarTopics, null, 2));
    console.log('🎯 [Dialog] grammarTopics type:', typeof grammarTopics);
    console.log('🎯 [Dialog] grammarTopics keys:', grammarTopics ? Object.keys(grammarTopics) : 'null/undefined');

    try {
      setIsLoading(true);
      setError(null);

      console.log('🚀 [Dialog] Calling exerciseService.generateExercises');
      const result = await exerciseService.generateExercises(errorData, grammarTopics);

      console.log('✅ [Dialog] Result received:', result);

      if (!result.success) {
        setError('Tạm thời đang có lỗi, bạn học phần khác trước nhé');
        return;
      }

      if (!result.data?.exercises || result.data.exercises.length === 0) {
        setError('Tạm thời đang có lỗi, bạn học phần khác trước nhé');
        return;
      }

      setExercises(result.data.exercises);
      setUserAnswers({});
      setGradingResults(null);
      setShowResults(false);
    } catch (error) {
      console.error('❌ [Dialog] Error loading exercises:', error);
      setError('Tạm thời đang có lỗi, bạn học phần khác trước nhé');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (topicIndex: number, quizIndex: number, value: string) => {
    const key = `${topicIndex}-${quizIndex}`;
    setUserAnswers(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClose = () => {
    setExercises([]);
    setUserAnswers({});
    setGradingResults(null);
    setShowResults(false);
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    setIsGrading(true);
    setError(null);

    try {
      const topics = exercises.map((topic, topicIndex) => {
        const topicAnswers = topic.quizzes.map((_, quizIndex) => {
          const key = `${topicIndex}-${quizIndex}`;
          return userAnswers[key] || ' ';
        });

        return {
          topic_name: topic.topic_name,
          quizzes: topic.quizzes,
          user_answers: topicAnswers
        };
      });

      const result = await exerciseService.gradeExercisesV2({ topics });

      if (!result.success) {
        const errorMsg = result.error?.message || 'Lỗi không xác định';
        const errorType = result.error?.type || 'UNKNOWN';
        setError(`Lỗi chấm bài (${errorType}): ${errorMsg}`);
        return;
      }

      if (!result.data) {
        setError('Lỗi chấm bài: Không nhận được kết quả từ server');
        return;
      }

      setGradingResults(result.data);
      setShowResults(true);
    } catch (error) {
      console.error('Error grading exercises:', error);
      setError(`Lỗi chấm bài: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setIsGrading(false);
    }
  };

  const handleRetry = () => {
    setUserAnswers({});
    setGradingResults(null);
    setShowResults(false);
    loadExercises();
  };

  // Calculate total number of quizzes across all topics
  const totalQuizzes = exercises.reduce((sum, topic) => sum + topic.quizzes.length, 0);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] h-[85vh] p-0 flex flex-col gap-0">
        {/* Show Results Screen */}
        {showResults && gradingResults ? (
          <div className="flex flex-col h-full">
            <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
              <DialogTitle>Kết quả bài tập</DialogTitle>
            </DialogHeader>
            <ExerciseResults
              exercises={exercises}
              userAnswers={userAnswers}
              gradingResults={gradingResults}
              onClose={handleClose}
              onRetry={handleRetry}
            />
          </div>
        ) : (
          <>
            <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
              <DialogTitle>Ôn tập từ lỗi sai</DialogTitle>
              {totalQuizzes > 0 && (
                <DialogDescription>
                  {exercises.length} chủ đề • {totalQuizzes} bài tập
                </DialogDescription>
              )}
            </DialogHeader>

            {isLoading && (
              <div className="flex items-center justify-center py-12 px-6">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Đang cook bài tập cho bạn</span>
              </div>
            )}

            {error && (
              <div className="space-y-4 px-6">
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span className="text-red-700 flex-1">{error}</span>
                </div>
                <div className="flex justify-center gap-3">
                  {isGrading ? (
                    <Button onClick={handleSubmit} variant="outline" disabled={isGrading}>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang chấm...
                    </Button>
                  ) : (
                    <>
                      <Button onClick={loadExercises} variant="outline">
                        Tạo bài mới
                      </Button>
                      <Button onClick={handleSubmit} variant="default">
                        Thử chấm lại
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {!isLoading && !error && exercises.length > 0 && (
              <>
                <ScrollArea className="flex-1 px-6">
                  <div className="space-y-6 py-4">
                    {exercises.map((topic, topicIndex) => (
                      <Card key={topicIndex} className="border-2">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between gap-3">
                            <CardTitle className="text-lg">{topic.topic_name}</CardTitle>
                            <Badge variant="secondary" className="shrink-0">
                              {topic.exercise_type}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {topic.quizzes.map((quiz, quizIndex) => {
                            const answerKey = `${topicIndex}-${quizIndex}`;
                            const globalIndex = exercises
                              .slice(0, topicIndex)
                              .reduce((sum, t) => sum + t.quizzes.length, 0) + quizIndex + 1;

                            return (
                              <div key={quizIndex} className="space-y-2">
                                <div className="flex gap-3">
                                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                                    {globalIndex}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-gray-900 mb-2">{quiz}</p>
                                    <Input
                                      type="text"
                                      value={userAnswers[answerKey] || ''}
                                      onChange={(e) => handleAnswerChange(topicIndex, quizIndex, e.target.value)}
                                      placeholder="Nhập câu trả lời..."
                                      className="w-full"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-3 justify-end pt-4 px-6 pb-6 border-t shrink-0">
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    disabled={isGrading}
                  >
                    Làm lại
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isGrading}
                  >
                    {isGrading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang chấm...
                      </>
                    ) : (
                      'Xong'
                    )}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}