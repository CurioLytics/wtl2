
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import { roleplaySessionService } from '@/services/roleplay/roleplay-session-service';
import { RoleplaySessionData } from '@/types/roleplay';
import { SessionCard } from './session-card';
import Link from 'next/link';
import { SessionDetailDialog } from './session-detail-dialog';
import { History } from 'lucide-react';
import { DateFilter } from '@/app/report/components/DateFilter';
import { DatePreset } from '@/types/dashboard';
import { getDateRangeFromPreset } from '@/utils/date-utils';

export function SessionHistory({ renderAsLinks = false }: { renderAsLinks?: boolean } = {}) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<RoleplaySessionData[]>([]);
  const [selectedSession, setSelectedSession] = useState<RoleplaySessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [datePreset, setDatePreset] = useState<DatePreset>('all-time');

  useEffect(() => {
    async function fetchSessions() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const data = await roleplaySessionService.getSessions(user.id);
        setSessions(data);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [user?.id]);

  // Filter sessions based on date preset
  const filteredSessions = useMemo(() => {
    const dateRange = getDateRangeFromPreset(datePreset);

    let filtered = sessions;

    if (dateRange) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);

      filtered = sessions.filter(session => {
        const sessionDate = new Date(session.created_at);
        return sessionDate >= fromDate && sessionDate <= toDate;
      });
    }

    // Sort by pinned first, then by created_at
    return filtered
      .sort((a, b) => {
        // Pinned sessions come first
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1;
        }
        // Then sort by date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
      .slice(0, 10); // Limit to top 10 sessions
  }, [sessions, datePreset]);

  const handleTogglePin = async (sessionId: string, pinned: boolean) => {
    try {
      await roleplaySessionService.togglePinSession(sessionId, pinned);

      // Update local state optimistically
      setSessions(prevSessions =>
        prevSessions
          .map(s => s.session_id === sessionId ? { ...s, pinned } : s)
          .sort((a, b) => {
            // Sort by pinned first, then by created_at
            if (a.pinned !== b.pinned) {
              return a.pinned ? -1 : 1;
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          })
      );
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font text-gray-900">Roleplay đã chơi</h2>
          </div>

          <div className="w-64">
            <DateFilter
              currentPreset={datePreset}
              onPresetChange={setDatePreset}
            />
          </div>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>
              {sessions.length === 0
                ? 'Chưa có phiên hội thoại nào được hoàn thành'
                : 'Không có phiên hội thoại nào trong khoảng thời gian này'}
            </p>
          </div>
        ) : renderAsLinks ? (
          <ul className="space-y-2">
            {filteredSessions.map((session) => (
              <li key={session.session_id}>
                <Link href={`/roleplay/session/${session.session_id}`} className="text-[var(--primary)] hover:underline">
                  {session.scenario_name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-2">
              {filteredSessions.map((session) => (
                <SessionCard
                  key={session.session_id}
                  session={session}
                  onClick={() => setSelectedSession(session)}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <SessionDetailDialog
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </>
  );
}