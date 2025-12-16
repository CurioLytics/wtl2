'use client';

import { useState } from 'react';
import { RoleplayScenario } from '@/types/roleplay';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import { MessageSquare, Mic } from 'lucide-react';

interface ScenarioDetailProps {
  scenario: RoleplayScenario;
}

export function ScenarioDetail({ scenario }: ScenarioDetailProps) {
  const router = useRouter();
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [showVoiceWarning, setShowVoiceWarning] = useState(false);
  const [pauseDelay, setPauseDelay] = useState(2); // Default 2 seconds

  const handleStartSession = () => {
    if (!scenario.starter_message) {
      alert('Kịch bản này chưa có tin nhắn bắt đầu. Vui lòng chọn kịch bản khác.');
      return;
    }
    setShowModeDialog(true);
  };

  const handleVoiceModeClick = () => {
    setShowModeDialog(false);
    setShowVoiceWarning(true);
  };

  const startWithMode = (mode: 'text' | 'voice') => {
    setShowModeDialog(false);
    setShowVoiceWarning(false);
    const url = mode === 'voice'
      ? `/roleplay/session/${scenario.id}?mode=${mode}&pauseDelay=${pauseDelay}`
      : `/roleplay/session/${scenario.id}?mode=${mode}`;
    router.push(url);
  };

  const handleBackClick = () => {
    router.push('/roleplay');
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <button
            onClick={handleBackClick}
            className="text-[var(--primary)] hover:opacity-80 flex items-center mb-4"
          >
            ←
          </button>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">{scenario.name}</h1>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-2">Bối cảnh</h2>
          <p className="text-gray-600 bg-gray-50 p-4 rounded-md">{scenario.context}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-2">Nhiệm vụ</h2>
          <div className="text-gray-600 bg-[var(--primary-blue-light)] p-4 rounded-md whitespace-pre-wrap leading-relaxed">
            {scenario.task}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-2">Câu mở đầu gợi ý</h2>
          <div className="text-gray-600 bg-blue-50 p-4 rounded-md italic">
            "{scenario.starter_message}"
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleStartSession}
            className="btn-blue-primary shadow-sm"
          >
            Let's go
          </button>
        </div>
      </div>

      {/* Mode Selection Dialog */}
      <Dialog open={showModeDialog} onOpenChange={setShowModeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chọn chế độ trò chuyện</DialogTitle>
            <DialogDescription>
              Bạn muốn sử dụng chế độ văn bản hay giọng nói?
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Text Mode */}
            <button
              onClick={() => startWithMode('text')}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gray-200 hover:border-[var(--primary)] hover:bg-[var(--primary-blue-light)] transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-[var(--primary-blue-lighter)] flex items-center justify-center transition-colors">
                <MessageSquare className="w-8 h-8 text-gray-600 group-hover:text-[var(--primary)]" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-gray-800">Văn bản</h3>
                <p className="text-xs text-gray-500 mt-1">Gõ tin nhắn thủ công</p>
              </div>
            </button>

            {/* Voice Mode */}
            <button
              onClick={handleVoiceModeClick}
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gray-200 hover:border-[var(--primary-purple)] hover:bg-[var(--primary-purple-light)] transition-all group relative"
            >
              {/* Beta Badge */}
              <span className="absolute top-2 right-2 px-2 py-0.5 bg-[var(--primary-purple)] text-white text-[10px] font-medium rounded-full">
                BETA
              </span>

              <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-[var(--primary-purple-lighter)] flex items-center justify-center transition-colors">
                <Mic className="w-8 h-8 text-gray-600 group-hover:text-[var(--primary-purple)]" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-gray-800">Giọng nói</h3>
                <p className="text-xs text-gray-500 mt-1">Giao tiếp bằng giọng nói</p>
              </div>
            </button>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button
              variant="ghost"
              onClick={() => setShowModeDialog(false)}
              className="text-gray-600"
            >
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Voice Mode Warning Dialog */}
      <Dialog open={showVoiceWarning} onOpenChange={setShowVoiceWarning}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Khuyến cáo: Không dành cho người yếu tim!
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 font-medium mb-3">
                Chế độ giọng nói yêu cầu phản hồi nhanh:
              </p>
              <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                <li>Bạn có <strong>tối đa 12 giây</strong> để suy nghĩ</li>
                <li>Mỗi lần dừng không quá <strong>{pauseDelay} giây</strong></li>
                <li>Khi muốn kết thúc hội thoại, nói "Finish the conversation" hoặc nhấn nút "Finish"</li>
              </ul>
            </div>

            {/* Pause Delay Selector */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <label className="text-sm text-gray-700 font-medium mb-2 block">
                ⚙️ Thời gian dừng tối đa:
              </label>
              <select
                value={pauseDelay}
                onChange={(e) => setPauseDelay(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-purple)] focus:border-transparent"
              >
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(seconds => (
                  <option key={seconds} value={seconds}>
                    {seconds} giây {seconds === 2 ? '(Mặc định - Khuyến nghị)' : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Thời gian hệ thống chờ sau khi bạn dừng nói trước khi tự động gửi tin nhắn.
              </p>
            </div>

            <p className="text-sm text-gray-600">
              Nếu bạn muốn có nhiều thời gian hơn để suy nghĩ, hãy chọn <strong>chế độ văn bản</strong>.
            </p>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <button
              onClick={() => {
                setShowVoiceWarning(false);
                setShowModeDialog(true);
              }}
              className="btn-purple-outline flex-1"
            >
              Quay lại
            </button>
            <button
              onClick={() => startWithMode('voice')}
              className="btn-purple-primary flex-1"
            >
              Chơi luôn!
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}