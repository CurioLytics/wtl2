'use client';

import { useEffect, useState } from 'react';
import { useRoleplayTopics } from '@/hooks/roleplay/use-roleplay-topics';

type FilterType = 'topic' | 'difficulty';

interface ScenarioFilterProps {
  onFilterChange: (filters: { topic: string | null; difficulty: string | null }) => void;
  currentTopic: string | null;
  currentDifficulty: string | null;
}

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Upper Intermediate', 'Advanced'];

export function ScenarioFilter({ onFilterChange, currentTopic, currentDifficulty }: ScenarioFilterProps) {
  const { topics, loading } = useRoleplayTopics();
  const [filterType, setFilterType] = useState<FilterType>('topic');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(currentTopic);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(currentDifficulty);

  // Cập nhật filter khi thay đổi
  const handleTopicChange = (topic: string | null) => {
    setSelectedTopic(topic);
    onFilterChange({ topic, difficulty: selectedDifficulty });
  };

  const handleDifficultyChange = (difficulty: string | null) => {
    setSelectedDifficulty(difficulty);
    onFilterChange({ topic: selectedTopic, difficulty });
  };

  // Reset filter về trạng thái ban đầu nếu currentTopic hoặc currentDifficulty thay đổi từ bên ngoài
  useEffect(() => {
    setSelectedTopic(currentTopic);
    setSelectedDifficulty(currentDifficulty);
  }, [currentTopic, currentDifficulty]);

  // Tự động reset filter còn lại khi chuyển loại filter
  useEffect(() => {
    if (filterType === 'topic' && selectedDifficulty !== null) {
      handleDifficultyChange(null);
    } else if (filterType === 'difficulty' && selectedTopic !== null) {
      handleTopicChange(null);
    }
  }, [filterType]);

  return (
    <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-md font-medium text-gray-700">Filter by</h3>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as FilterType)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
        >
          <option value="topic">Topic</option>
          <option value="difficulty">Difficulty</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {filterType === 'topic' ? (
          <>
            {/* Button "All" để xóa filter */}
            <button
              onClick={() => handleTopicChange(null)}
              className={`
                px-3 py-1.5 text-sm rounded-full transition-colors
                ${selectedTopic === null
                  ? 'bg-[var(--primary-blue-lighter)] text-[var(--primary)] font-medium'
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
                      ? 'bg-[var(--primary-blue-lighter)] text-[var(--primary)] font-medium'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {topic}
                </button>
              ))
            )}
          </>
        ) : (
          <>
            {/* Button "All" để xóa difficulty filter */}
            <button
              onClick={() => handleDifficultyChange(null)}
              className={`
                px-3 py-1.5 text-sm rounded-full transition-colors
                ${selectedDifficulty === null
                  ? 'bg-[var(--primary-blue-lighter)] text-[var(--primary)] font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              All
            </button>

            {/* Difficulty level buttons */}
            {DIFFICULTY_LEVELS.map(level => (
              <button
                key={level}
                onClick={() => handleDifficultyChange(level)}
                className={`
                  px-3 py-1.5 text-sm rounded-full transition-colors
                  ${selectedDifficulty === level
                    ? 'bg-[var(--primary-blue-lighter)] text-[var(--primary)] font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {level}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}