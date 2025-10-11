'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { roleplayService } from '@/services/api/roleplay-service';
import { RoleplayScenario } from '@/types/roleplay';
import { ScenarioDetail } from '@/components/roleplay/scenario-detail';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ScenarioDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [scenario, setScenario] = useState<RoleplayScenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadScenario() {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await roleplayService.getScenarioById(id);
        setScenario(data);
        setError(null);
      } catch (err) {
        console.error('Error loading scenario:', err);
        setError('Failed to load the scenario. Please try again.');
        setScenario(null);
      } finally {
        setLoading(false);
      }
    }
    
    loadScenario();
  }, [id]);
  
  const handleBack = () => {
    router.push('/roleplay');
  };
  
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/4"></div>
          <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded mb-6 w-1/2"></div>
          
          <div className="space-y-4">
            <div className="h-32 bg-gray-100 rounded"></div>
            <div className="h-32 bg-gray-100 rounded"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !scenario) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <h2 className="text-xl font-medium text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Scenario not found'}</p>
          <Button 
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Back to Scenarios
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <ScenarioDetail scenario={scenario} />
    </div>
  );
}