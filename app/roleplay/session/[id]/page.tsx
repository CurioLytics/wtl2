'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { roleplayScenarioService } from '@/services/roleplay/roleplay-scenario-service';
import { RoleplayScenario } from '@/types/roleplay';
import { ChatInterface } from '@/components/roleplay/chat-interface';
import { VoiceModeChatInterface } from '@/components/roleplay/voice-mode-chat-interface';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import styles from '@/components/roleplay/roleplay.module.css';

export default function ChatSessionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id as string;
  const mode = searchParams?.get('mode') || 'text'; // Default to text mode

  const [scenario, setScenario] = useState<RoleplayScenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  useEffect(() => {
    async function loadScenario() {
      if (!id) return;

      try {
        setLoading(true);
        const data = await roleplayScenarioService.getScenarioById(id);

        // Kiểm tra xem có starter_message hay không
        if (!data.starter_message) {
          setError('Tình huống này chưa có tin nhắn mở đầu.');
          return;
        }

        setScenario(data);
        setError(null);
      } catch (err) {
        console.error('Error loading scenario:', err);
        setError('Không thể tải tình huống. Bạn thử lại nhé.');
        setScenario(null);
      } finally {
        setLoading(false);
      }
    }

    loadScenario();
  }, [id]);

  // Prevent navigation with confirmation
  // This handles: refresh, close tab, browser back/forward
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleBack = useCallback(() => {
    setPendingNavigation(`/roleplay/${id}`);
    setShowLeaveDialog(true);
  }, [id]);

  const confirmLeave = () => {
    if (pendingNavigation) {
      router.push(pendingNavigation);
    }
  };

  const cancelLeave = () => {
    setShowLeaveDialog(false);
    setPendingNavigation(null);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className={styles.typingIndicator}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p className="text-gray-600 mt-4">Đang tải hội thoại...</p>
      </div>
    );
  }

  if (error || !scenario) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 min-h-[60vh] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h2 className="text-xl font-medium text-gray-800 mb-4">Lỗi</h2>
          <p className="text-gray-600 mb-6">{error || 'Không tìm thấy tình huống'}</p>
          <Button onClick={handleBack}>
            Quay lại chi tiết tình huống
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {mode === 'voice' ? (
        <VoiceModeChatInterface scenario={scenario} />
      ) : (
        <ChatInterface scenario={scenario} />
      )}

      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rời hội thoại?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn rời phiên này? Tiến độ của bạn sẽ được lưu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelLeave}>Ở lại</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLeave}>Rời đi</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}