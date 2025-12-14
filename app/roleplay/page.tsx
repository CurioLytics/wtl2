'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RoleplayCard } from '@/components/roleplay/roleplay-card';
import { ScenarioFilter } from '@/components/roleplay/scenario-filter';
import { SessionHistory } from '@/components/roleplay/session-history';
import { useRoleplayScenarios } from '@/hooks/roleplay/use-roleplay-scenarios';
import { SectionNavigation } from '@/components/ui/section-navigation';
import { PageContentWrapper } from '@/components/ui/page-content-wrapper';
import { HorizontalCardsSkeleton } from '@/components/ui/page-skeleton';
import { HorizontalScrollList } from '@/components/ui/horizontal-scroll-list';

export default function RoleplayPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { scenarios, loading, error } = useRoleplayScenarios(selectedTopic || undefined);

  const handleFilterChange = (topic: string | null) => {
    setSelectedTopic(topic);
  };

  return (
    <div className="flex flex-col items-center px-4 py-10 w-full">
      <SectionNavigation sections={[
        { id: 'scenarios', label: 'Roleplay' },
        { id: 'history', label: 'Lịch sử' },
      ]} />

      {/* HEADER */}
      <div className="w-full max-w-3xl bg-white shadow rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Role-play</h1>
        <p className="text-gray-600 text-sm">Đóng vai vào các nhân vật với các bối cảnh khác nhau, rèn luyện phản xạ nhanh trong các tình huống thực tế</p>
      </div>

      {/* Add spacing between header and next block */}
      <div id="scenarios" className="w-full max-w-3xl space-y-6 mt-10">

        {/* Filter */}
        <ScenarioFilter
          onFilterChange={handleFilterChange}
          currentTopic={selectedTopic}
        />
        {/* Scenarios */}
        <PageContentWrapper
          isLoading={loading}
          skeleton={<HorizontalCardsSkeleton count={6} />}
        >
          {error ? (
            <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">
              <p className="mb-2">Không thể tải danh sách hội thoại.</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Tải lại
              </Button>
            </div>
          ) : scenarios && scenarios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map(s => (
                <RoleplayCard
                  key={s.id}
                  id={s.id}
                  title={s.name}
                  description={s.context}
                  imageUrl={s.image || ''}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-8">
              {selectedTopic ? (
                <>
                  <p className="mb-3">Không có hội thoại nào cho "{selectedTopic}".</p>
                  <Button variant="outline" onClick={() => setSelectedTopic(null)}>
                    Xóa bộ lọc
                  </Button>
                </>
              ) : (
                <p>Hiện chưa có hội thoại nào.</p>
              )}
            </div>
          )}
        </PageContentWrapper>

      </div>

      {/* History */}
      <div id="history" className="w-full max-w-3xl mt-10">
        <SessionHistory />
      </div>
    </div>
  );
}
