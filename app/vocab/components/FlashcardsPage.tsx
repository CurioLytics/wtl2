'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/services/supabase/client';
import type { Database } from '@/types/database.types';
// Note: Database types need to be regenerated after table rename
// For now, using a generic type until types are updated
type VocabularyRow = {
  id: string;
  word: string;
  meaning: string;
  example?: string | null;
  set_id: string;
};

const supabase = createClient();

type CardRow = {
  vocabulary_id: string;
  next_review_at: string | null;
  vocabulary?: {
    id: string;
    word: string;
    meaning: string;
    example?: string | null;
    set_id: string;
  } | null;
};

type FlatCard = {
  id: string;
  word: string;
  meaning: string;
  example?: string | null;
  next_review_at?: string | null;
};

type ReviewResult = {
  vocabulary_id: string;
  next_review_at: string;
  stability: number;
  difficulty: number;
};

export default function FlashcardsPage() {
  const params = useParams(); // { setId: '...' }
  const setId = params?.setId as string;

  const [cards, setCards] = useState<FlatCard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ReviewResult | null>(null);

  useEffect(() => {
    if (!setId) {
      setError('Missing setId in route parameters.');
      setFetching(false);
      return;
    }

    let mounted = true;
    async function loadDueCards() {
      setFetching(true);
      setError(null);

      const now = new Date().toISOString();
      console.log('[DEBUG] Fetching cards for setId:', setId, 'at', now);

      // 1️⃣ Get all vocabulary IDs in that set
      const { data: vocabularyWords, error: fcErr } = await supabase
        .from('vocabulary')
        .select('id')
        .eq('set_id', setId);

      if (fcErr) {
        console.error('🔴 Supabase vocabulary fetch failed:', fcErr);
        setError(`Supabase error: ${fcErr.message}`);
        setFetching(false);
        return;
      }

      if (!vocabularyWords?.length) {
        setError(`No vocabulary words found for set ${setId}`);
        setFetching(false);
        return;
      }

      // ✅ Map vocabulary IDs for querying status
      const vocabularyIds = vocabularyWords.map((v: { id: string }) => v.id);

      // 2️⃣ Get their statuses (joined with vocabulary info)
      const { data, error: supaErr } = await supabase
        .from('vocabulary_status')
        .select(`
        vocabulary_id,
        next_review_at,
        vocabulary (
          id,
          word,
          meaning,
          example,
          set_id
        )
      `)
        .in('vocabulary_id', vocabularyIds)
        .lte('next_review_at', now)
        .order('next_review_at', { ascending: true })
        .limit(50);

      if (!mounted) return;

      if (supaErr) {
        console.error('🔴 Supabase query failed:', supaErr);
        setError(
          `Supabase error:
${supaErr.message}
(code: ${supaErr.code ?? 'N/A'})
(hint: ${supaErr.hint ?? 'none'})`
        );
        setCards([]);
        setFetching(false);
        return;
      }

      console.log('[DEBUG] Supabase data returned:', data);

      // ✅ Convert data to flat structure
      const formatted: FlatCard[] =
        (data ?? []).map((row: any) => {
          const v = row.vocabulary;
          return {
            id: v?.id ?? row.vocabulary_id,
            word: v?.word ?? '',
            meaning: v?.meaning ?? '',
            example: v?.example ?? null,
            next_review_at: row.next_review_at ?? null,
          };
        }) ?? [];

      setCards(formatted);
      setIndex(0);
      setFlipped(false);
      setFetching(false);
    }

    loadDueCards();
    return () => { mounted = false };
  }, [setId]);



  // UI helpers
  const card = cards[index];

  async function handleRate(rating: 1 | 2 | 3 | 4) {
    if (!card) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocabulary_id: card.id, rating }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API error: ${res.status} ${text}`);
      }

      const data: ReviewResult = await res.json();
      setLastResult(data);
    } catch (err: any) {
      console.error('Review API error', err);
      setError(err?.message ?? 'Failed to submit review');
      // Do not stop advancing — but you can if you prefer
    } finally {
      setLoading(false);
      setFlipped(false);
      // advance to next card; if done, keep index at length (to show done UI)
      setIndex((i) => {
        const next = i + 1;
        return next >= cards.length ? next : next;
      });
    }
  }

  if (fetching) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-600">Loading cards due for review…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!card || index >= cards.length) {
    return (
      <div className="p-6 flex flex-col items-center gap-4">
        <h2 className="text-xl font-semibold">No more cards due</h2>
        <p className="text-sm text-gray-500">You’ve finished the available cards for this set.</p>
        <button
          className="mt-2 px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={() => {
            // reload cards
            setFetching(true);
            setCards([]);
            setIndex(0);
            setFlipped(false);
            setLastResult(null);
            // trigger effect by calling fetch again (simple way)
            // we call same effect by briefly toggling setId? easiest: reload window:
            window.location.reload();
          }}
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Flashcards Review</h1>
          <p className="text-sm text-gray-500">Set: {setId} • {index + 1}/{cards.length}</p>
        </div>
      </div>

      <div
        onClick={() => setFlipped((f) => !f)}
        className={`cursor-pointer rounded-lg border p-8 min-h-[180px] flex flex-col justify-center items-center bg-white shadow ${flipped ? 'bg-yellow-50' : 'bg-white'
          }`}
      >
        {!flipped ? (
          <div className="text-2xl font-semibold">{card.word}</div>
        ) : (
          <div className="text-center">
            <div className="text-xl font-medium">{card.meaning}</div>
            {card.example && <p className="mt-3 text-sm text-gray-600 italic">{card.example}</p>}
          </div>
        )}
      </div>

      {flipped && (
        <div className="mt-6 flex gap-3 justify-center">
          <button
            className="px-4 py-2 rounded border text-red-700 hover:bg-red-50 disabled:opacity-50"
            onClick={() => handleRate(1)}
            disabled={loading}
          >
            Again
          </button>
          <button
            className="px-4 py-2 rounded border text-orange-700 hover:bg-orange-50 disabled:opacity-50"
            onClick={() => handleRate(2)}
            disabled={loading}
          >
            Hard
          </button>
          <button
            className="px-4 py-2 rounded border text-green-700 hover:bg-green-50 disabled:opacity-50"
            onClick={() => handleRate(3)}
            disabled={loading}
          >
            Good
          </button>
          <button
            className="px-4 py-2 rounded border text-[var(--primary)] hover:bg-[var(--primary-blue-light)] disabled:opacity-50"
            onClick={() => handleRate(4)}
            disabled={loading}
          >
            Easy
          </button>
        </div>
      )}

      {lastResult && (
        <div className="mt-6 text-sm text-gray-700">
          <div>Last review result:</div>
          <pre className="bg-gray-100 p-2 rounded mt-2 text-xs overflow-auto">
            {JSON.stringify(lastResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
