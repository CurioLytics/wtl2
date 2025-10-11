'use client';

import { useState } from 'react';
import { RoleplayScenario, LevelColor } from '@/types/roleplay';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface ScenarioDetailProps {
  scenario: RoleplayScenario;
}

export function ScenarioDetail({ scenario }: ScenarioDetailProps) {
  const router = useRouter();
  
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
  
  const handleStartSession = () => {
    // Kiểm tra xem có starter_message hay không
    if (!scenario.starter_message) {
      alert('This scenario does not have a starter message yet. Please try another one.');
      return;
    }
    
    router.push(`/roleplay/session/${scenario.id}`);
  };
  
  const handleBackClick = () => {
    router.back();
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <button 
          onClick={handleBackClick} 
          className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
        >
          ← Back to scenarios
        </button>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{scenario.name}</h1>
        
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(scenario.level)}`}>
            {scenario.level}
          </span>
          <span className="text-gray-500 text-sm">{scenario.topic}</span>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-700 mb-2">Context</h2>
        <p className="text-gray-600 bg-gray-50 p-4 rounded-md">{scenario.context}</p>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-700 mb-2">Guide</h2>
        <div className="text-gray-600 bg-blue-50 p-4 rounded-md">
          {scenario.guide}
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-700 mb-2">You'll be talking with</h2>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-medium">
            {scenario.role1.charAt(0).toUpperCase()}
          </div>
          <span className="text-gray-700">{scenario.role1}</span>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button
          onClick={handleStartSession}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
        >
          Start Conversation
        </Button>
      </div>
    </div>
  );
}