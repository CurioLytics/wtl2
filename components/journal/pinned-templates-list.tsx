'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Framework, frameworkService } from '@/services/journal/framework-service';
import { Badge } from '@/components/ui/badge';
import { Pin } from 'lucide-react';
import { cn } from '@/utils/ui';

export function PinnedTemplatesList() {
    const router = useRouter();
    const [templates, setTemplates] = useState<Framework[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPinned() {
            try {
                const data = await frameworkService.getPinnedFrameworks();
                setTemplates(data);
            } catch (error) {
                console.error('Failed to fetch pinned templates:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchPinned();
    }, []);

    if (loading || templates.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {templates.map((template) => (
                <button
                    key={template.name}
                    onClick={() => {
                        const params = new URLSearchParams({
                            templateName: template.name,
                            customContent: template.content || ''
                        });
                        router.push(`/journal/new?${params.toString()}`);
                    }}
                    className={cn(
                        "group flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                        "bg-white/50 hover:bg-white border border-blue-100 hover:border-blue-200",
                        "text-sm text-gray-600 hover:text-blue-600",
                        "transition-all duration-300 shadow-sm hover:shadow",
                        "cursor-pointer"
                    )}
                >
                    <Pin className="w-3 h-3 text-blue-400 group-hover:text-blue-500" />
                    <span className="font-medium">{template.name}</span>
                </button>
            ))}
        </div>
    );
}
