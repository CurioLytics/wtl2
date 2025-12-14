import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/use-auth';
import { journalService } from '@/services/journal/journal-service';
import { journalFeedbackService } from '@/services/journal/journal-feedback-service';
import { feedbackLogsService } from '@/services/supabase/feedback-logs-service';
import { formatDateInput } from '@/utils/date-utils';
import { useJournalForm } from './use-journal-form';
import { useUnsavedChanges } from './use-unsaved-changes';

export interface UseJournalEditorOptions {
    mode: 'create' | 'edit';
    journalId?: string;
    templateName?: string | null;
    customContent?: string | null;
    prefilledTag?: string | null;
    entryDate?: string | null;
}

export interface UseJournalEditorReturn {
    // Form state
    title: string;
    content: string;
    journalDate: string;
    tags: string[];
    setTitle: (title: string) => void;
    setContent: (content: string) => void;
    setJournalDate: (date: string) => void;
    setTags: (tags: string[]) => void;

    // UI state
    isSaving: boolean;
    isGettingFeedback: boolean;
    isLoadingData: boolean;
    error: string | null;
    hasContent: boolean;
    journalIdState: string | null;

    // Unsaved changes
    hasUnsavedChanges: boolean;
    showExitDialog: boolean;

    // Actions
    handleSave: () => Promise<void>;
    handleGetFeedback: () => Promise<void>;
    handleDelete: () => Promise<void>;
    handleNavigation: (path: string) => void;
    confirmExit: () => void;
    cancelExit: () => void;
}

/**
 * Main hook for journal editor functionality
 * Handles both create and edit modes
 */
export function useJournalEditor(options: UseJournalEditorOptions): UseJournalEditorReturn {
    const { mode, journalId, templateName, customContent, prefilledTag, entryDate } = options;
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [journalIdState, setJournalIdState] = useState<string | null>(journalId || null);
    const [isSaving, setIsSaving] = useState(false);
    const [isGettingFeedback, setIsGettingFeedback] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(mode === 'edit');
    const [error, setError] = useState<string | null>(null);
    const hasLoadedData = useRef(false);

    // Initialize form with proper date format
    const initialDate = entryDate || formatDateInput(new Date());
    const form = useJournalForm({
        initialDate,
    });

    const unsavedChanges = useUnsavedChanges({
        initialTitle: '',
        initialContent: '',
        currentTitle: form.title,
        currentContent: form.content,
    });

    // Redirect to auth if not logged in
    useEffect(() => {
        if (!authLoading && !user && !sessionStorage.getItem('onboardingData')) {
            router.push('/auth');
        }
    }, [user, authLoading, router]);

    // Handle initialization for create mode
    useEffect(() => {
        if (mode === 'create') {
            if (customContent) {
                const decodedContent = decodeURIComponent(customContent);
                // Replace single newlines with 3 newlines for better spacing between questions
                const formattedContent = decodedContent.replace(/\n/g, '\n\n\n');
                form.setContent(formattedContent);
                if (templateName) {
                    form.setTitle(templateName);
                }
            } else if (templateName) {
                form.setTitle(templateName);
            }

            // Pre-fill tag if coming from tag filter
            if (prefilledTag && !form.tags.includes(prefilledTag)) {
                form.setTags([...form.tags, prefilledTag]);
            }
        }
    }, [mode, templateName, customContent, prefilledTag]);

    // Load journal data for edit mode
    useEffect(() => {
        if (mode === 'edit' && journalId && user && !hasLoadedData.current) {
            const fetchJournal = async () => {
                try {
                    const journalData = await journalService.getJournalById(journalId);
                    const journalTags = await journalService.getJournalEntryTags(journalId);

                    const loadedTitle = journalData.title || '';
                    const loadedContent = journalData.content || '';

                    form.setTitle(loadedTitle);
                    form.setContent(loadedContent);
                    form.setJournalDate(journalData.journal_date || formatDateInput(new Date()));
                    form.setTags(journalTags);

                    // Mark as saved state for unsaved changes detection
                    unsavedChanges.markAsSaved(loadedTitle, loadedContent);

                    hasLoadedData.current = true;
                } catch (err) {
                    console.error('Error fetching journal:', err);
                    setError('Không thể tải nhật ký. Vui lòng thử lại.');
                } finally {
                    setIsLoadingData(false);
                }
            };

            fetchJournal();
        }
    }, [mode, journalId, user]);

    const handleSave = async () => {
        setError(null);
        setIsSaving(true);

        try {
            if (user) {
                if (journalIdState) {
                    // Update existing journal
                    await journalService.updateJournal(journalIdState, {
                        title: form.title,
                        content: form.content,
                        journal_date: form.journalDate,
                    });
                    if (form.tags.length > 0) {
                        await journalService.saveJournalTags(journalIdState, form.tags);
                    }
                } else {
                    // Create new journal
                    const result = await journalService.createJournal(user.id, {
                        title: form.title,
                        content: form.content,
                        journal_date: form.journalDate,
                    });
                    if (form.tags.length > 0) {
                        await journalService.saveJournalTags(result.id, form.tags);
                    }
                    setJournalIdState(result.id);
                }

                // Mark as saved
                unsavedChanges.markAsSaved(form.title, form.content);
                // Use replace to prevent going back to editor after save
                router.replace('/journal');
            } else {
                // Offline mode
                const offlineEntry = {
                    id: `offline-${Date.now()}`,
                    title: form.title,
                    content: form.content,
                    entryDate: form.journalDate,
                    createdAt: new Date().toISOString(),
                };
                const saved = JSON.parse(localStorage.getItem('offlineJournalEntries') || '[]');
                saved.push(offlineEntry);
                localStorage.setItem('offlineJournalEntries', JSON.stringify(saved));
                // Use replace to prevent going back after offline save
                router.replace('/auth?message=journal_saved');
            }
        } catch (err) {
            setError('Không thể lưu nhật ký');
        } finally {
            setIsSaving(false);
        }
    };

    const handleGetFeedback = async () => {
        if (!form.content.trim()) {
            setError('Vui lòng viết nội dung trước');
            return;
        }
        if (!user?.id) {
            setError('Vui lòng đăng nhập');
            return;
        }

        setIsGettingFeedback(true);
        setError(null);

        try {
            console.log('📤 Preparing to get feedback for:', { title: form.title, contentLength: form.content.length });

            // Step 1: Create/update draft journal first (fast operation)
            let draftJournalId = journalIdState;

            if (mode === 'edit' && journalIdState) {
                // Update existing journal
                await journalService.updateJournal(journalIdState, {
                    title: form.title || null,
                    content: form.content,
                    journal_date: form.journalDate,
                    is_draft: true,
                });
            } else if (!draftJournalId) {
                // Create new draft journal
                const draftResult = await journalService.createDraftJournal(user.id, {
                    title: form.title || null,
                    content: form.content,
                    journal_date: form.journalDate,
                    summary: null, // Will be added after feedback
                });
                draftJournalId = draftResult.id;
                setJournalIdState(draftResult.id);
            }

            console.log('✅ Draft saved, navigating to feedback page:', draftJournalId);

            // Step 2: Navigate immediately to feedback page with processing flag
            // The feedback page will make the API call and show loading
            router.replace(`/journal/feedback?journalId=${draftJournalId}&processing=true`);
        } catch (err) {
            console.error('❌ Exception in handleGetFeedback:', err);
            const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
            setError(`Lỗi: ${errorMessage}`);
            setIsGettingFeedback(false);
        }
    };

    const handleDelete = async () => {
        if (!journalIdState) return;

        try {
            await journalService.deleteJournal(journalIdState);
            unsavedChanges.markAsSaved('', '');
            // Use replace to prevent going back to deleted journal
            router.replace('/journal');
        } catch (err) {
            setError('Không thể xóa nhật ký');
        }
    };

    return {
        // Form state
        title: form.title,
        content: form.content,
        journalDate: form.journalDate,
        tags: form.tags,
        setTitle: form.setTitle,
        setContent: form.setContent,
        setJournalDate: form.setJournalDate,
        setTags: form.setTags,

        // UI state
        isSaving,
        isGettingFeedback,
        isLoadingData,
        error,
        hasContent: form.hasContent,
        journalIdState,

        // Unsaved changes
        hasUnsavedChanges: unsavedChanges.hasUnsavedChanges,
        showExitDialog: unsavedChanges.showExitDialog,

        // Actions
        handleSave,
        handleGetFeedback,
        handleDelete,
        handleNavigation: (path: string) => unsavedChanges.handleNavigation(path, router),
        confirmExit: () => unsavedChanges.confirmExit(router),
        cancelExit: unsavedChanges.cancelExit,
    };
}
