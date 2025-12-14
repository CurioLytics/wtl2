'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { JournalTemplate } from '@/types/journal';
import { useAuth } from '@/hooks/auth/use-auth';
import { supabase } from '@/services/supabase/client';
import Image from 'next/image';
import { FrameworkDialog } from './framework-dialog';
import { Framework } from '@/services/journal/framework-service';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useAsyncState } from '@/hooks/common/use-async-state';

interface TemplateCardsProps {
  onTemplateSelect?: (template: JournalTemplate) => void;
}

export function TemplateCards({ onTemplateSelect }: TemplateCardsProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { data: templates, isLoading, execute: loadTemplates } = useAsyncState<JournalTemplate[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    loadTemplates(async () => {
      const { data } = await supabase
        .from('frameworks')
        .select('profile_id, name, content, cover_image, description, is_pinned')
        .eq('is_default', true)
        .in('name', ['Morning Intentions', 'Evening Wind-Down'])
        .order('name', { ascending: false })
        .limit(2);

      return (data || []).map((template: any) => ({
        id: encodeURIComponent(template.name),
        profile_id: template.profile_id,
        name: template.name,
        content: template.content,
        cover_image: template.cover_image,
        description: template.description,
        is_pinned: template.is_pinned
      }));
    });
  }, [user?.id]);

  const handleCardClick = (template: JournalTemplate) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    } else {
      const params = new URLSearchParams({
        templateName: template.name,
        customContent: template.content || ''
      });
      router.push(`/journal/new?${params.toString()}`);
    }
  };

  const handleSettingsClick = async (e: React.MouseEvent, template: JournalTemplate) => {
    e.stopPropagation();

    // Fetch the latest framework data from database to get is_pinned status and profile_id
    const { data } = await supabase
      .from('frameworks')
      .select('name, content, description, category, source, is_pinned, profile_id')
      .eq('name', template.name)
      .single();

    if (data) {
      const framework: Framework = {
        name: (data as any).name,
        content: (data as any).content || '',
        description: (data as any).description,
        category: (data as any).category || 'Template',
        source: (data as any).source,
        is_pinned: (data as any).is_pinned || false,
        profile_id: (data as any).profile_id
      };

      setSelectedFramework(framework);
      setIsDialogOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="premium-theme">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mx-auto">
          {[1, 2].map((index) => (
            <SkeletonCard key={index} showImage lines={2} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="premium-theme">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mx-auto">
        {(templates || []).map((template) => (
          <div
            key={template.id}
            onClick={() => handleCardClick(template)}
            className="group relative overflow-hidden rounded-xl cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-md bg-white"
          >
            {/* Cover Image */}
            <div className="relative h-16 sm:h-20 w-full">
              {template.cover_image ? (
                <Image
                  src={template.cover_image}
                  alt={template.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--primary-purple)] to-[var(--accent-purple)]" />
              )}

              {/* Small Settings icon */}
              <div className="absolute top-3 right-3">
                {template.name !== 'Viết tự do' && (
                  <button
                    onClick={(e) => handleSettingsClick(e, template)}
                    className="w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/90"
                  >
                    <svg className="w-3 h-3 text-gray-600" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Text Content Below */}
            <div className="p-3">
              <h3 className="text-sm text-gray-800 mb-1">
                {template.name}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {template.name === 'Morning Intentions'
                  ? 'Stay focused, get into the right mindset, and make progress with clarity.'
                  : 'Track your progress, focus on being benevolent, and make tomorrow better.'
                }
              </p>
            </div>
          </div>
        ))}
      </div>

      <FrameworkDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        mode="edit"
        framework={selectedFramework}
        onSave={loadTemplates}
      />
    </div>
  );
}