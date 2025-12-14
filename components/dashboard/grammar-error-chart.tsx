'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GrammarErrorSummary } from '@/types/analytics';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PracticeDialog } from '@/app/report/components/PracticeDialog';
import { ErrorData } from '@/types/exercise';
import { useUserProfileStore } from '@/stores/user-profile-store';
import { QuizDialog } from '@/components/quiz/quiz-dialog';
import { QuizQuestion } from '@/types/quiz';
import { FeedbackLoadingScreen } from '@/components/roleplay/feedback-loading-screen';

interface GrammarErrorChartProps {
  data: GrammarErrorSummary[];
  isLoading?: boolean;
}

const ERROR_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
];

export function GrammarErrorChart({ data, isLoading }: GrammarErrorChartProps) {
  const [isPracticeOpen, setIsPracticeOpen] = useState(false);
  const [selectedErrorData, setSelectedErrorData] = useState<ErrorData[]>([]);
  const [grammarTopics, setGrammarTopics] = useState<Record<string, string[]>>({});
  const [practiceLoading, setPracticeLoading] = useState<string | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentTopicName, setCurrentTopicName] = useState<string>('');
  const [quizSources, setQuizSources] = useState<string>('');
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedErrorDetail, setSelectedErrorDetail] = useState<GrammarErrorSummary | null>(null);
  const profile = useUserProfileStore((state) => state.profile);

  const handlePracticeClick = () => {
    // Build topics structure: { topic_name: [tags] }
    // NOTE: Using topic_name instead of topic_id because some records have null topic_id
    // due to webhook returning IDs that don't exist in grammar_topics table
    const topics: Record<string, string[]> = {};

    console.log('🔍 [Chart] Raw data received:', data);
    console.log('🔍 [Chart] Data length:', data.length);

    data.forEach((error, index) => {
      console.log(`🔍 [Chart] Processing item ${index}:`, {
        topic_id: error.topic_id,
        topic_name: error.topic_name,
        all_tags: error.all_tags,
        tags_length: error.all_tags?.length || 0,
        tags_is_array: Array.isArray(error.all_tags)
      });

      if (error.topic_name && error.all_tags && error.all_tags.length > 0) {
        topics[error.topic_name] = error.all_tags;
        console.log(`✅ [Chart] Added topic: ${error.topic_name} with ${error.all_tags.length} tags`);
      } else {
        console.log(`❌ [Chart] Skipped topic: ${error.topic_name || 'undefined'} (no tags or no topic_name)`);
      }
    });

    console.log('📊 [Chart] Final topics object:', JSON.stringify(topics, null, 2));
    console.log('📊 [Chart] Topics keys:', Object.keys(topics));
    console.log('📊 [Chart] Topics count:', Object.keys(topics).length);

    // Map grammar error data to ErrorData format for the practice dialog
    const errorData: ErrorData[] = data.flatMap(error =>
      error.recent_errors.map(description => ({
        topicName: error.topic_name,
        grammarId: error.topic_name, // Use topic_name as fallback since topic_id may be null
        frequency: error.error_count,
        detectedAt: new Date().toISOString(),
        description: description
      }))
    );

    console.log('📊 [Chart] Error data count:', errorData.length);

    // Pass both errorData and topics structure
    setGrammarTopics(topics);
    setSelectedErrorData(errorData);
    setIsPracticeOpen(true);
  };

  const loadQuizQuestions = async (topicName: string) => {
    if (!profile?.english_level) {
      console.error('User english_level not available');
      return;
    }

    setPracticeLoading(topicName);
    setIsQuizOpen(true); // Open dialog immediately to show loading

    try {
      console.log('Sending practice request:', {
        english_level: profile.english_level,
        topic_name: topicName,
      });

      const response = await fetch('/api/exercises/topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          english_level: profile.english_level,
          topic_name: topicName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Webhook response:', data);

      // Extract questions from webhook response
      // Handle both possible structures:
      // Structure 1: { output: { questions: [...], source: "..." } }
      // Structure 2: [{ output: { questions: [...], source: "..." } }]
      let questions: any[] = [];
      let sources: string = '';
      
      if (data?.output?.questions && Array.isArray(data.output.questions)) {
        // Direct object with output property
        questions = data.output.questions;
        sources = data.output.source || '';
      } else if (Array.isArray(data) && data.length > 0 && data[0]?.output?.questions) {
        // Array containing object with output property
        questions = data[0].output.questions;
        sources = data[0].output.source || '';
      }

      if (questions.length > 0) {
        setQuizQuestions(questions);
        setQuizSources(sources);
        setIsQuizOpen(true);
      } else {
        console.error('Invalid response structure:', data);
        // TODO: Show error toast
      }
    } catch (error) {
      console.error('Error sending practice request:', error);
      // TODO: Show error toast
    } finally {
      setPracticeLoading(null);
    }
  };

  const handlePracticeNow = async (topicName: string) => {
    setCurrentTopicName(topicName);
    await loadQuizQuestions(topicName);
  };

  const handleRetryQuiz = async () => {
    if (currentTopicName) {
      setIsQuizOpen(false); // Close current quiz first
      await loadQuizQuestions(currentTopicName);
    }
  };

  const handleBarClick = (data: any, index: number) => {
    // Find the full error data from the original data array
    const fullTopic = data.fullTopic;
    const errorDetail = data && typeof data === 'object' && 'fullTopic' in data 
      ? (data as any).original 
      : null;
    
    if (errorDetail) {
      setSelectedErrorDetail(errorDetail);
      setIsDetailDialogOpen(true);
    }
  };



  if (isLoading) {
    return (
      <Card className="p-6 bg-white shadow-sm rounded-2xl border-0">
        <div className="h-80 flex items-center justify-center">
          <div className="text-muted-foreground">Đang tải phân tích lỗi...</div>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6 bg-white shadow-sm rounded-2xl border-0">
        <div className="h-80 flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">🎉</div>
          <div className="text-lg font-medium">Không có lỗi ngữ pháp!</div>
          <div className="text-sm text-muted-foreground">Bạn làm rất tốt!</div>
        </div>
      </Card>
    );
  }

  // Show more errors for scrolling (limit to 20)
  const chartData = data.slice(0, 20).map(item => ({
    topic: item.topic_name.length > 20
      ? item.topic_name.substring(0, 20) + '...'
      : item.topic_name,
    fullTopic: item.topic_name,
    count: item.error_count,
    level: item.topic_level,
    tags: item.all_tags || [],
    original: item, // Store original error data for dialog
  }));

  // Calculate height based on number of bars (40px per bar for consistency with weekly chart, min 6 bars visible)
  const barHeight = 40;
  const visibleBars = 6;
  const totalHeight = chartData.length * barHeight;
  const containerHeight = visibleBars * barHeight;

  // Get max value for consistent X-axis scale
  const maxValue = Math.max(...chartData.map(d => d.count));

  return (
    <Card className="p-6 bg-white shadow-sm rounded-2xl border-0">
      <div className="mb-6">
        <div>
          <h3 className="text-lg font-semibold">Chủ đề ngữ pháp</h3>
          <p className="text-sm text-muted-foreground">
            Các chủ điểm ngữ pháp hay sai nhất 
          </p>
        </div>
      </div>

      <div className="mb-6">
        {/* Scrollable bars area */}
        <div className="overflow-y-auto" style={{ height: `${containerHeight}px` }}>
          <div style={{ height: `${totalHeight}px` }}>
            <ResponsiveContainer width="100%" height={totalHeight}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  type="number"
                  className="text-xs"
                  tick={false}
                  axisLine={false}
                  domain={[0, maxValue]}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="topic"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div style={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        padding: '8px 12px',
                      }}>
                        <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'hsl(var(--foreground))' }}>
                          {data.count} lỗi
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 4, 4, 0]}
                  onClick={handleBarClick}
                  cursor="pointer"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ERROR_COLORS[index % ERROR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fixed X-axis at bottom */}
        <div className="border-t-2 pt-3 mt-2 bg-gray-50 rounded px-3 py-2" style={{ marginLeft: '100px', marginRight: '30px' }}>
          <ResponsiveContainer width="100%" height={60}>
            <BarChart
              data={[{ value: 0 }]}
              layout="vertical"
              margin={{ top: 0, right: 0, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={true} horizontal={false} />
              <XAxis
                type="number"
                className="text-sm font-medium"
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                domain={[0, maxValue]}
                ticks={Array.from({ length: Math.min(maxValue + 1, 10) }, (_, i) => Math.ceil(maxValue / 9) * i).filter(v => v <= maxValue)}
                allowDecimals={false}
                axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 2 }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                label={{ 
                  value: 'Số lỗi', 
                  position: 'insideBottom', 
                  offset: -5, 
                  style: { fontSize: '13px', fontWeight: 600, fill: 'hsl(var(--foreground))' } 
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <QuizDialog
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        questions={quizQuestions}
        topicName={currentTopicName}
        sources={quizSources}
        onRetry={handleRetryQuiz}
        isLoading={!!practiceLoading}
        loadingSteps={['Đang tìm nguồn', 'Đang lọc câu hỏi theo level', 'Đang tạo giải thích']}
      />

      {/* Error Detail Dialog */}
      {selectedErrorDetail && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity ${
            isDetailDialogOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsDetailDialogOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold">{selectedErrorDetail.topic_name}</h3>
              <button
                onClick={() => setIsDetailDialogOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong className="text-lg text-foreground">{selectedErrorDetail.error_count}</strong> lỗi được phát hiện
                </p>
                {selectedErrorDetail.topic_level && (
                  <p className="text-sm text-muted-foreground">
                    Cấp độ: <span className="font-medium">{selectedErrorDetail.topic_level}</span>
                  </p>
                )}
              </div>

              {selectedErrorDetail.all_tags && selectedErrorDetail.all_tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedErrorDetail.all_tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-3 py-1 bg-muted text-muted-foreground rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedErrorDetail.recent_errors.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Ví dụ lỗi gần đây:</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    {selectedErrorDetail.recent_errors.map((desc, idx) => (
                      <li key={idx}>{desc}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button
                  onClick={() => {
                    handlePracticeNow(selectedErrorDetail.topic_name);
                    setIsDetailDialogOpen(false);
                  }}
                  disabled={practiceLoading === selectedErrorDetail.topic_name || !profile?.english_level}
                  variant="outline"
                  className="w-full"
                >
                  {practiceLoading === selectedErrorDetail.topic_name ? 'Đang xử lý...' : 'Ôn tập ngay'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
