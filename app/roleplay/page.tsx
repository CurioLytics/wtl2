'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScenarioCard } from '@/components/roleplay/scenario-card';
import { ScenarioFilter } from '@/components/roleplay/scenario-filter';
import { useRoleplayScenarios } from '@/services/api/roleplay-service';

export default function RoleplayPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { scenarios, loading, error } = useRoleplayScenarios(selectedTopic || undefined);
  
  const handleFilterChange = (topic: string | null) => {
    setSelectedTopic(topic);
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="text-3xl mr-2">🎭</span> Role-play Conversations
        </h1>
        
        <p className="text-gray-600 mb-6">
          Practice your English by having conversations in different scenarios. 
          Choose a scenario below to start practicing your communication skills.
        </p>
      </div>
      
      {/* Filter section */}
      <ScenarioFilter onFilterChange={handleFilterChange} currentTopic={selectedTopic} />
      
      {/* Scenarios grid */}
      <div className="mb-6">
        {loading ? (
          // Skeleton loader when loading
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={`skeleton-${i}`} className="bg-white rounded-lg h-32 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">
            <p className="mb-2">Unable to load scenarios. Please try again.</p>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        ) : scenarios && scenarios.length > 0 ? (
          // Success state with data
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map(scenario => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        ) : (
          // Empty state
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-600 mb-4">
              {selectedTopic 
                ? `No scenarios found for topic "${selectedTopic}".` 
                : "No scenarios available yet."}
            </p>
            {selectedTopic && (
              <Button 
                variant="outline"
                onClick={() => setSelectedTopic(null)}
                className="mt-2"
              >
                Clear filter
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
