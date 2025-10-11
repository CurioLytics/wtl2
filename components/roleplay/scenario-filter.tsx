'use client';

import { useEffect, useState } from 'react';
import { useRoleplayTopics } from '@/services/api/roleplay-service';

interface ScenarioFilterProps {
  onFilterChange: (topic: string | null) => void;
  currentTopic: string | null;
}

export function ScenarioFilter({ onFilterChange, currentTopic }: ScenarioFilterProps) {
  const { topics, loading } = useRoleplayTopics();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(currentTopic);
  
  // Cập nhật filter khi thay đổi
  const handleTopicChange = (topic: string | null) => {
    setSelectedTopic(topic);
    onFilterChange(topic);
  };
  
  // Reset filter về trạng thái ban đầu nếu currentTopic thay đổi từ bên ngoài
  useEffect(() => {
    setSelectedTopic(currentTopic);
  }, [currentTopic]);
  
  return (
    <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-md font-medium text-gray-700 mb-3">Filter by Topic</h3>
      
      <div className="flex flex-wrap gap-2">
        {/* Button "All" để xóa filter */}
        <button
          onClick={() => handleTopicChange(null)}
          className={`
            px-3 py-1.5 text-sm rounded-full transition-colors
            ${selectedTopic === null
              ? 'bg-blue-100 text-blue-800 font-medium'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          All
        </button>
        
        {loading ? (
          // Hiển thị placeholder khi đang tải
          Array(3).fill(0).map((_, i) => (
            <div 
              key={`loading-${i}`} 
              className="w-20 h-8 bg-gray-200 animate-pulse rounded-full"
            />
          ))
        ) : (
          // Hiển thị danh sách topics
          topics && topics.map(topic => (
            <button
              key={topic}
              onClick={() => handleTopicChange(topic)}
              className={`
                px-3 py-1.5 text-sm rounded-full transition-colors
                ${selectedTopic === topic
                  ? 'bg-blue-100 text-blue-800 font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {topic}
            </button>
          ))
        )}
      </div>
    </div>
  );
}