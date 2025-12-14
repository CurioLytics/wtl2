import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Framework, frameworkService } from '@/services/journal/framework-service';
import { Pin, Plus, X, Trash2 } from 'lucide-react';

interface FrameworkDialogProps {
  framework: Framework | null;
  isOpen: boolean;
  onClose: () => void;
  mode?: 'view' | 'create' | 'edit';
  onSave?: () => void;
}

export function FrameworkDialog({ framework, isOpen, onClose, mode: initialMode = 'view', onSave }: FrameworkDialogProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'view' | 'create' | 'edit'>(initialMode);
  const [formData, setFormData] = useState<Partial<Framework>>({
    name: '',
    description: '',
    content: '',
    is_pinned: false
  });
  const [questions, setQuestions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, isOpen]);

  useEffect(() => {
    if ((mode === 'view' || mode === 'edit') && framework) {
      setFormData(framework);
      // Split content into questions based on newlines
      setQuestions(framework.content ? framework.content.split('\n').filter(q => q.trim()) : []);
    } else if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        content: '',
        is_pinned: false
      });
      setQuestions(['']);
    }
  }, [framework, mode, isOpen]);

  const handleUseTemplate = () => {
    if (!framework) return;

    const params = new URLSearchParams({
      templateName: framework.name,
      customContent: framework.content
    });

    router.push(`/journal/new?${params.toString()}`);
  };

  const handleSave = async () => {
    // Join questions with newlines
    const content = questions.filter(q => q.trim()).join('\n');

    if (!formData.name || !content) return;

    try {
      setIsSubmitting(true);
      if (mode === 'create') {
        await frameworkService.createFramework({
          name: formData.name,
          content: content,
          description: formData.description,
          category: 'Custom',
          is_pinned: formData.is_pinned
        });
      } else if (mode === 'edit' && framework?.name) {
        try {
          await frameworkService.updateFramework(framework.name, {
            name: formData.name,
            content: content,
            description: formData.description,
            is_pinned: formData.is_pinned
          });
        } catch (error: any) {
          // If update fails because record doesn't exist or isn't owned by user (PGRST116),
          // fallback to creating a new framework (Save As)
          if (error?.code === 'PGRST116' || error?.message?.includes('0 rows')) {
            await frameworkService.createFramework({
              name: formData.name,
              content: content,
              description: formData.description,
              category: 'Custom',
              is_pinned: formData.is_pinned
            });
          } else {
            throw error;
          }
        }
      }
      onSave?.();
      onClose();
    } catch (error) {
      console.error('Failed to save framework:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePin = async () => {
    // Only allow pinning for Custom frameworks (user-owned)
    if (mode !== 'create' && framework?.category !== 'Custom') {
      console.warn('Cannot pin non-Custom frameworks');
      return;
    }

    const newPinnedState = !formData.is_pinned;

    // Update local state immediately for UI feedback
    setFormData(prev => ({ ...prev, is_pinned: newPinnedState }));

    // If we have an existing framework (not in create mode), save to database immediately
    if (framework?.name && mode !== 'create') {
      try {
        await frameworkService.updateFramework(framework.name, {
          is_pinned: newPinnedState
        });
        // Trigger parent refresh to update the list
        onSave?.();
      } catch (error: any) {
        console.error('Failed to update pin status:', error);
        // Revert the local state if save failed
        setFormData(prev => ({ ...prev, is_pinned: !newPinnedState }));

        // Show error to user
        alert('Không thể cập nhật trạng thái pin. Vui lòng thử lại.');
      }
    }
    // If in create mode, the pin state will be saved when the framework is created
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  if (!framework && mode !== 'create') return null;

  const isCustom = framework?.category === 'Custom';
  const isEditing = mode === 'create' || mode === 'edit';
  // Only show pin for Custom frameworks (user-owned) or when creating new
  const canPin = mode === 'create' || (framework?.category === 'Custom' && framework?.profile_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white rounded-xl [&>button]:hidden">
        <div className="flex flex-col md:flex-row h-[80vh] md:h-[600px] relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 z-10 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Pin Button (Top Right, next to close) - Only for Custom frameworks */}
          {canPin && (
            <button
              onClick={handleTogglePin}
              className="absolute top-4 right-14 w-8 h-8 flex items-center justify-center z-10 rounded-full hover:bg-gray-100 transition-colors"
              title={formData.is_pinned ? "Unpin" : "Pin"}
            >
              {formData.is_pinned ? (
                <Pin className="w-5 h-5 text-blue-500 fill-blue-500" />
              ) : (
                <Pin className="w-5 h-5 text-gray-400" />
              )}
            </button>
          )}

          {/* Left Side - Info & Actions */}
          <div className="w-full md:w-1/2 p-8 border-r bg-gray-50/50 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <div className="mb-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full mb-4 font-medium">
                        PREMIUM FEATURE
                      </span>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Tên framework"
                        className="text-xl font-bold bg-transparent border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-gray-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Mô tả</label>
                      <Textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Mô tả ngắn về mục đích của framework này..."
                        className="min-h-[100px] bg-white resize-none border-gray-200 focus:border-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-xs rounded-full mb-4 font-medium">
                      {framework?.category || 'Framework'}
                    </span>
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">{framework?.name}</h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {framework?.description || 'Chưa có mô tả'}
                    </p>
                    {framework?.source && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">Source: {framework.source}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3 pt-6 border-t border-gray-200">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isSubmitting || !formData.name || questions.every(q => !q.trim())}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? 'Đang lưu...' : 'Lưu Framework'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleUseTemplate}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                  >
                    Dùng mẫu này
                  </Button>
                  {isCustom && (
                    <Button
                      variant="outline"
                      onClick={() => setMode('edit')}
                      className="px-4"
                    >
                      Chỉnh sửa
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Side - Questions List */}
          <div className="w-full md:w-1/2 p-8 bg-white flex flex-col h-full">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Danh sách câu hỏi
            </h3>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {isEditing ? (
                <>
                  {questions.map((question, index) => (
                    <div key={index} className="relative group">
                      <Textarea
                        value={question}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                        placeholder={`Câu hỏi ${index + 1}...`}
                        className="w-full min-h-[80px] p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                      />
                      {questions.length > 1 && (
                        <button
                          onClick={() => removeQuestion(index)}
                          className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                          title="Xóa câu hỏi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addQuestion}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm câu hỏi
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-gray-700 text-sm leading-relaxed">{question}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}