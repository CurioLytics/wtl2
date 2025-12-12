'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/auth/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function TestStreakPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const simulateActivity = async (eventType: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          metadata: { test: true, timestamp: new Date().toISOString() }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to track event');
      }

      // Fetch updated streak
      const streakResponse = await fetch('/api/analytics/events');
      const streakData = await streakResponse.json();

      setResult({
        event: eventType,
        streak: streakData.data?.streak || null,
        success: true
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testFullDay = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Simulate completing all daily goals
      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'vocab_created', metadata: { test: true } }),
      });

      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'journal_created', metadata: { test: true } }),
      });

      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'roleplay_completed', metadata: { test: true } }),
      });

      // Fetch updated streak
      const streakResponse = await fetch('/api/analytics/events');
      const streakData = await streakResponse.json();

      setResult({
        event: 'Complete Daily Goals',
        streak: streakData.data?.streak || null,
        dailyGoal: streakData.data?.dailyGoal || null,
        success: true
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center">Please log in to test streak functionality</p>
            <Button className="w-full mt-4" onClick={() => window.location.href = '/auth'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Streak Function Test Page</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Streak Calculation (SQL Function)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            This page tests the new <code className="bg-gray-100 px-2 py-1 rounded">update_user_streak</code> PostgreSQL function.
            Click buttons below to simulate activities and see streak updates.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => simulateActivity('vocab_created')}
              disabled={loading}
              variant="outline"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Add Vocabulary
            </Button>

            <Button
              onClick={() => simulateActivity('journal_created')}
              disabled={loading}
              variant="outline"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Create Journal
            </Button>

            <Button
              onClick={() => simulateActivity('roleplay_completed')}
              disabled={loading}
              variant="outline"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Complete Roleplay
            </Button>

            <Button
              onClick={testFullDay}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Complete All Goals (Test Full Day)
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900">Success!</h3>
                <p className="text-sm text-green-800">Event tracked: {result.event}</p>
              </div>
            </div>

            {result.streak && (
              <div className="bg-white rounded-lg p-4 space-y-2">
                <h4 className="font-semibold mb-3">Current Streak Status:</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Current Streak</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {result.streak.current_streak} days
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Longest Streak</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {result.streak.longest_streak} days
                    </p>
                  </div>
                </div>
                {result.streak.last_active_date && (
                  <p className="text-xs text-gray-500 mt-2">
                    Last active: {result.streak.last_active_date}
                  </p>
                )}
              </div>
            )}

            {result.dailyGoal && (
              <div className="bg-white rounded-lg p-4 mt-4">
                <h4 className="font-semibold mb-3">Today's Progress:</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Vocabulary:</span>
                    <span className="font-semibold">
                      {result.dailyGoal.vocab_created.completed} / {result.dailyGoal.vocab_created.target}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Journal:</span>
                    <span className="font-semibold">
                      {result.dailyGoal.journal_created.completed} / {result.dailyGoal.journal_created.target}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Roleplay:</span>
                    <span className="font-semibold">
                      {result.dailyGoal.roleplay_completed.completed} / {result.dailyGoal.roleplay_completed.target}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ How it works</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Each activity triggers the <code className="bg-blue-100 px-1 rounded">update_user_streak</code> SQL function</li>
            <li>Function runs atomically in a single database transaction</li>
            <li>Streak updates only when ALL daily goals are met</li>
            <li>Much faster than the old 5-7 query approach</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
