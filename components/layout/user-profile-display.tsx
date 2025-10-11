'use client';

import { useUser } from '@/components/providers/user-provider';
import { useAuth } from '@/hooks/auth/use-auth';
import { User } from 'lucide-react';

export function UserProfileDisplay() {
  const { profile, isLoadingProfile, profileError } = useUser();
  const { user } = useAuth();
  
  // Display name prioritization: profile name > user email > 'User'
  const displayName = profile?.name || user?.email || 'User';
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
        <User size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {isLoadingProfile ? 'Loading...' : displayName}
        </p>
        {profile?.english_level && (
          <p className="text-xs text-gray-500">
            Level: {profile.english_level}
          </p>
        )}
      </div>
    </div>
  );
}