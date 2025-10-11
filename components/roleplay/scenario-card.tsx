'use client';

import { useState } from 'react';
import { RoleplayScenario, LevelColor } from '@/types/roleplay';
import { useRouter } from 'next/navigation';

interface ScenarioCardProps {
  scenario: RoleplayScenario;
}

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState(false);
  
  // Xác định màu sắc dựa trên cấp độ
  const getLevelColor = (level: string): string => {
    switch (level) {
      case 'Beginner':
        return LevelColor.Beginner;
      case 'Intermediate':
        return LevelColor.Intermediate;
      case 'Advanced':
        return LevelColor.Advanced;
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleClick = () => {
    router.push(`/roleplay/${scenario.id}`);
  };
  
  return (
    <div 
      className={`
        bg-white rounded-lg border shadow-sm p-4 cursor-pointer transition-all duration-200
        ${isHovering ? 'transform -translate-y-1 shadow-md' : ''}
      `}
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <h3 className="font-medium text-lg mb-2 text-gray-800">{scenario.name}</h3>
      
      <div className="flex justify-between items-center mt-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(scenario.level)}`}>
          {scenario.level}
        </span>
        <span className="text-gray-500 text-xs">{scenario.topic}</span>
      </div>
    </div>
  );
}