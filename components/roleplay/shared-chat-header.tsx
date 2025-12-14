'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { RoleplayScenario } from '@/types/roleplay';
import { Lightbulb } from 'lucide-react';

interface SharedChatHeaderProps {
  scenario: RoleplayScenario;
  hasUserMessages: boolean;
  finishing: boolean;
  messagesLength: number;
  onFinish: () => void;
  onExit: () => void;
  theme?: 'blue' | 'purple';
}

export function SharedChatHeader({
  scenario,
  hasUserMessages,
  finishing,
  messagesLength,
  onFinish,
  onExit,
  theme = 'blue',
}: SharedChatHeaderProps) {
  const finishButtonClass = theme === 'purple' ? 'btn-purple-primary' : 'btn-blue-primary';
  const exitOutlineClass = theme === 'purple' ? 'btn-purple-outline' : 'btn-blue-outline';
  
  return (
    <div className="p-3 border-b flex justify-between items-center bg-white">
      <Dialog>
        <DialogTrigger asChild>
          <button
            aria-label="Show roleplay task"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
          >
            <Lightbulb className="w-4 h-4" />
          </button>
        </DialogTrigger>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Roleplay Task</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Nhiệm vụ:</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {scenario.task || 'No task available'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Câu mở đầu gợi ý:</h3>
              <p className="text-sm text-gray-600 italic bg-blue-50 p-3 rounded-md">
                "{scenario.starter_message}"
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2">
        {hasUserMessages ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className={exitOutlineClass}>
                Thoát
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Thoát khỏi cuộc trò chuyện?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn đã có tin nhắn trong cuộc trò chuyện này. Nếu thoát bây giờ, cuộc trò chuyện sẽ không được lưu lại.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={onExit} className="bg-red-600 hover:bg-red-700">
                  Thoát
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <button className={exitOutlineClass} onClick={onExit}>
            Thoát
          </button>
        )}

        <button
          onClick={onFinish}
          disabled={finishing || messagesLength <= 1}
          className={finishButtonClass}
        >
          {finishing ? 'Saving...' : 'Finish'}
        </button>
      </div>
    </div>
  );
}
