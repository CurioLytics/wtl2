'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HighlightSelector } from '@/components/features/journal/editor/highlight-selector';
import { HighlightList } from '@/components/features/journal/editor/highlight-list';
import { MessageBubble } from '@/components/roleplay/message-bubble';
import { roleplaySessionService } from '@/services/roleplay/roleplay-session-service';
import { RoleplaySessionData } from '@/types/roleplay';
import { RoleplayFeedback, GrammarDetail } from '@/types/roleplay';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { FeedbackLoadingScreen } from '@/components/roleplay/feedback-loading-screen';
import { SectionNavigation } from '@/components/ui/section-navigation';

export default function RoleplaySummaryPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading, userPreferences: cachedPreferences } = useAuth();
  const [sessionData, setSessionData] = useState<RoleplaySessionData | null>(null);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [selectedGrammar, setSelectedGrammar] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Use cached preferences with defaults
  const userPreferences = {
    name: cachedPreferences?.name || 'User',
    english_level: cachedPreferences?.english_level || 'intermediate',
    style: cachedPreferences?.style || 'conversational',
  };

  const loadingSteps = ['độ rõ ràng', 'từ vựng', 'ngữ pháp', 'ý tưởng', 'phiên bản nâng cấp'];

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (authLoading) return;

    if (!user) {
      router.push('/auth');
      return;
    }

    const loadSession = async () => {
      try {
        const data = await roleplaySessionService.getSessionWithFeedback(params.sessionId as string);
        console.log('[SUMMARY-PAGE] Session loaded, has feedback:', !!data.feedback);
        setSessionData(data);
        setHighlights(data.highlights || []);
      } catch (err: any) {
        setError(err?.message || 'Không tìm thấy hội thoại');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [user, authLoading, params.sessionId, router]);

  const addHighlight = (text: string) => {
    if (!highlights.includes(text)) {
      setHighlights([...highlights, text]);
    }
  };

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const toggleGrammarSelection = (index: number) => {
    setSelectedGrammar(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!user?.id || !sessionData) {
      router.push('/roleplay');
      return;
    }

    // If no highlights, just save and redirect immediately
    if (highlights.length === 0 && selectedGrammar.size === 0) {
      try {
        await roleplaySessionService.saveHighlights(
          params.sessionId as string,
          []
        );
        router.push('/roleplay');
      } catch (err: any) {
        setError(err?.message || 'Không thể lưu session');
      }
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Convert Set to array of selected indices
      const selectedGrammarIndices = Array.from(selectedGrammar);
      
      const result = await roleplaySessionService.saveHighlightsAndGenerateFlashcards(
        params.sessionId as string,
        highlights,
        sessionData,
        user.id,
        selectedGrammarIndices
      );

      // Store flashcards and navigate to flashcard generation page
      localStorage.setItem('flashcardData', JSON.stringify(result.flashcards));
      router.push('/flashcards/generate');
    } catch (err: any) {
      setError(err?.message || 'Không thể lưu session');
      setProcessing(false);
    }
  };

  const handleRetryFeedback = async () => {
    setRetrying(true);
    setLoadingStep(0);
    setError(null);

    // Animate loading steps
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev < loadingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 2000);

    try {
      // Pass preferences - service will use defaults if needed
      const feedback = await roleplaySessionService.retryFeedback(
        params.sessionId as string,
        userPreferences
      );

      // Clear interval IMMEDIATELY when response arrives
      clearInterval(interval);

      // Stop loading state BEFORE updating data
      setRetrying(false);
      setLoadingStep(0);

      // Then update state
      if (sessionData) {
        setSessionData({
          ...sessionData,
          feedback
        });
      }
    } catch (err: any) {
      clearInterval(interval);
      setRetrying(false);
      setLoadingStep(0);
      setError(err?.message || 'Failed to generate feedback');
    }
  };

  const handleBack = () => {
    router.push('/roleplay');
  };

  if (processing) {
    return (
      <FeedbackLoadingScreen
        isVisible={true}
        colorScheme="blue"
        steps={['tạo mặt trước', 'tạo mặt sau', 'thêm ví dụ']}
      />
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center w-full">
          Đang tải phiên hội thoại...
        </div>
      </div>
    );
  }

  if (retrying) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center w-full">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
            <p className="text-lg">
              <span className="text-gray-900">Đang kiểm tra </span>
              <span className="text-[var(--primary)] font-medium">{loadingSteps[loadingStep]}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center w-full">
          <div className="text-red-600 mb-2">{error || 'Không tìm thấy phiên hội thoại'}</div>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleBack} variant="outline" className="mt-2">Quay lại</Button>
            {error && (
              <Button onClick={() => window.location.reload()} className="mt-2">Thử lại</Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'conversation', label: 'Lịch sử' },
    { id: 'comparison', label: 'So sánh' },
    { id: 'vocabulary', label: 'Từ vựng' },
    { id: 'grammar', label: 'Ngữ pháp' },
    { id: 'highlights', label: 'Đánh dấu' },
  ];

  // Parse enhanced_version: stringified JSON array of plain strings
  const parseEnhancedVersion = (enhancedVersion: any): string[] => {
    if (!enhancedVersion) return [];
    
    // If it's already an array, return it
    if (Array.isArray(enhancedVersion)) {
      return enhancedVersion.map(item => String(item));
    }
    
    // If it's a string, parse it
    if (typeof enhancedVersion === 'string') {
      try {
        const parsed = JSON.parse(enhancedVersion);
        if (Array.isArray(parsed)) {
          return parsed.map(item => String(item));
        }
        return [enhancedVersion];
      } catch {
        return [enhancedVersion];
      }
    }
    
    return [];
  };

  // Parse output.vocabulary: stringified JSON array of "old → new" strings
  const parseVocabulary = (vocabulary: any): string[] => {
    if (!vocabulary) return [];
    
    // If it's already an array, return it
    if (Array.isArray(vocabulary)) {
      return vocabulary;
    }
    
    // If it's a string, parse it
    if (typeof vocabulary === 'string') {
      try {
        const parsed = JSON.parse(vocabulary);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        return [vocabulary];
      } catch {
        // Fallback: split by newlines
        return vocabulary.split('\n').filter(line => line.trim());
      }
    }
    
    return [];
  };

  const enhancedMessages = sessionData?.feedback?.enhanced_version 
    ? parseEnhancedVersion(sessionData.feedback.enhanced_version) 
    : [];
  
  const vocabularyList = sessionData?.feedback?.output?.vocabulary
    ? parseVocabulary(sessionData.feedback.output.vocabulary)
    : [];

  const grammarDetails = sessionData?.feedback?.grammar_details || [];

  const userMessages = sessionData?.messages?.filter((msg: any) => msg.sender === 'user') || [];

  // Debug logging
  console.log('[SUMMARY-PAGE] Session Data:', sessionData);
  console.log('[SUMMARY-PAGE] Has Feedback:', !!sessionData?.feedback);
  console.log('[SUMMARY-PAGE] Enhanced Version Raw:', sessionData?.feedback?.enhanced_version);
  console.log('[SUMMARY-PAGE] User Messages:', userMessages.length);
  console.log('[SUMMARY-PAGE] Enhanced Messages:', enhancedMessages.length);
  console.log('[SUMMARY-PAGE] Vocabulary List:', vocabularyList.length);
  console.log('[SUMMARY-PAGE] Grammar Details:', grammarDetails.length);

  return (
    <div className="flex-1 flex flex-col" style={{ transition: '0.3s ease-in-out', width: '100%' }}>
      <SectionNavigation sections={sections} />
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-blue-600 mb-4">{sessionData.scenario_name}</h1>

            {/* Original Conversation History */}
            <div id="conversation" className="scroll-mt-20 mb-8">
              <Accordion type="single" collapsible className="mb-6">
                <AccordionItem value="messages">
                  <AccordionTrigger>Xem toàn bộ hội thoại</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {sessionData.messages?.map((message: any, index: number) => (
                        <MessageBubble
                          key={index}
                          message={message}
                          roleName={message.sender === 'bot' ? sessionData.scenario?.ai_role : 'Bạn'}
                          compact={true}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Feedback Section */}
          <div id="feedback" className="scroll-mt-20">
            {sessionData.feedback ? (
              <div className="mb-8 space-y-8">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={handleRetryFeedback}
                    disabled={retrying || !cachedPreferences}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                    title="Tạo lại phản hồi"
                  >
                    <RefreshCw className={`w-4 h-4 text-gray-600 ${retrying ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Side-by-Side Comparison */}
                <div id="comparison" className="scroll-mt-20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Original Messages */}
                    <div>
                      <div className="bg-red-50 border border-red-200 rounded-t-lg p-3">
                        <h4 className="font-medium text-red-800">Phiên bản của bạn</h4>
                      </div>
                      <div className="bg-white border border-red-200 border-t-0 rounded-b-lg p-4 space-y-3">
                        {userMessages.map((msg: any, idx: number) => (
                          <div 
                            key={idx} 
                            className="p-3 bg-gray-50 rounded-lg text-gray-800 leading-relaxed"
                            style={{
                              userSelect: 'text',
                              WebkitUserSelect: 'text',
                              MozUserSelect: 'text',
                              msUserSelect: 'text'
                            }}
                          >
                            {msg.content}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Messages */}
                    <div>
                      <div className="bg-green-50 border border-green-200 rounded-t-lg p-3">
                        <h4 className="font-medium text-green-800">Phiên bản cải thiện</h4>
                      </div>
                      <div className="bg-white border border-green-200 border-t-0 rounded-b-lg p-4 space-y-3">
                        {enhancedMessages.length > 0 ? (
                          enhancedMessages.map((msg: string, idx: number) => (
                            <div 
                              key={idx} 
                              className="p-3 bg-green-50 rounded-lg text-gray-800 leading-relaxed"
                              style={{
                                userSelect: 'text',
                                WebkitUserSelect: 'text',
                                MozUserSelect: 'text',
                                msUserSelect: 'text'
                              }}
                            >
                              {msg}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">Không có phiên bản cải thiện</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <HighlightSelector
                    containerId="comparison"
                    onHighlightSaved={addHighlight}
                    highlights={highlights}
                  />
                </div>

                {/* Vocabulary Section */}
                <div id="vocabulary" className="scroll-mt-20">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Từ vựng, mẫu câu</h3>
                  {vocabularyList.length > 0 ? (
                    <div 
                      id="vocabulary-content"
                      className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2"
                      style={{
                        userSelect: 'text',
                        WebkitUserSelect: 'text',
                        MozUserSelect: 'text',
                        msUserSelect: 'text'
                      }}
                    >
                      {vocabularyList.map((item: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">
                            {idx + 1}
                          </span>
                          <span className="text-gray-800 leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">Không có gợi ý từ vựng</p>
                  )}
                  <HighlightSelector
                    containerId="vocabulary-content"
                    onHighlightSaved={addHighlight}
                    highlights={highlights}
                  />
                </div>

                {/* Grammar Details */}
                <div id="grammar" className="scroll-mt-20">
                  {sessionData.feedback.grammar_details?.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Ngữ pháp cần chú ý</h3>
                        <span className="text-sm text-gray-500">
                          {selectedGrammar.size} / {sessionData.feedback.grammar_details.length} được chọn
                        </span>
                      </div>
                      <div className="space-y-4">
                        {sessionData.feedback.grammar_details.map((detail: GrammarDetail, index: number) => (
                          <Card key={index} className="hover:shadow-md transition-shadow border-0 bg-white">
                            <CardContent className="p-4">
                              <div className="flex gap-3">
                                <div className="flex-shrink-0 pt-1">
                                  <input
                                    type="checkbox"
                                    checked={selectedGrammar.has(index)}
                                    onChange={() => toggleGrammarSelection(index)}
                                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                  />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className="text-sm font-medium text-blue-600">
                                      {detail.grammar_topic_id.replace(/_/g, ' ')}
                                    </span>
                                    {detail.tags?.map(tag => (
                                      <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="text-gray-800 whitespace-pre-wrap">{detail.description}</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-8 p-8 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-500 mb-3">Chưa có phản hồi</p>
                <Button
                  onClick={handleRetryFeedback}
                  disabled={retrying || !cachedPreferences}
                  size="sm"
                  variant="outline"
                >
                  Thử lại
                </Button>
              </div>
            )}
          </div>

          {/* Highlights */}
          <div id="highlights" className="scroll-mt-20">
            <div className="w-full mb-8">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Đã đánh dấu</h3>
              <HighlightList highlights={highlights} onRemove={removeHighlight} />
            </div>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Actions */}
          <div className="flex justify-end gap-4 w-full">
            <button onClick={handleBack} className="btn-blue-outline">
              Hủy
            </button>
            <button onClick={handleSave} disabled={processing} className="btn-blue-primary">
              {highlights.length > 0 ? 'Lưu session & Tạo Flashcard' : 'Lưu session'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}