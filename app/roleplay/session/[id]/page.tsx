'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { roleplayService } from '@/services/api/roleplay-service';
import { RoleplayScenario } from '@/types/roleplay';
import { ChatInterface } from '@/components/roleplay/chat-interface';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import styles from '@/components/roleplay/roleplay.module.css';

export default function ChatSessionPage() {
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
        
        // Kiểm tra xem có starter_message hay không
        if (!data.starter_message) {
          setError('This scenario does not have a starter message yet.');
          return;
        }
        
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
    router.push(`/roleplay/${id}`);
  };
  
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className={styles.typingIndicator}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="text-gray-600 mt-4">Loading conversation...</p>
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
            Back to Scenario Details
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto">
      <ChatInterface scenario={scenario} />
    </div>
  );
}