'use client';

import { Button } from '@/components/ui/button';

export default function RoleplayPage() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="text-3xl mr-2">🎭</span> Role-play Conversations
      </h1>
      
      <div className="text-center py-12">
        <p className="text-gray-600 mb-8">Practice your English by having conversations in different scenarios.</p>
        <Button>
          Start New Role-play
        </Button>
      </div>
    </div>
  );
}
