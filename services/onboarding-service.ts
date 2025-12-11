import { createClient } from '@/services/supabase/server';
import type { OnboardingData } from '@/types/onboarding';

export async function saveOnboardingData(userId: string, data: OnboardingData) {
  const supabase = await createClient();

  // Update profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      name: data.name,
      english_improvement_reasons: data.english_improvement_reasons,
      english_challenges: data.english_challenges,
      english_level: data.english_level,
      style: data.english_tone,
      daily_review_goal: data.daily_review_goal,
      daily_vocab_goal: data.daily_vocab_goal,
      daily_journal_goal: data.daily_journal_goal,
      daily_roleplay_goal: data.daily_roleplay_goal,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (profileError) throw new Error('Failed to save onboarding data');

  // Create default frameworks
  const frameworks = [
    {
      profile_id: userId,
      name: 'Morning Intentions',
      content: 'What is on your mind right now that you need to clear before you start the day?\nWhat is the one thing you want to get done today, and why?\nWhat is the emotional state or mindset you want to embody today?',
      category: 'Custom',
      description: null,
      source: null,
      cover_image: 'https://eqhldzwiymtcyxyxezos.supabase.co/storage/v1/object/public/w2l/morning.jpg',
      is_default: true,
      is_pinned: false
    },
    {
      profile_id: userId,
      name: 'Evening Wind-Down',
      content: 'What is your one win from the day?\n\n\nWhat is your one point of tension, anxiety, or stress from the day?\n\n\nWhat is your one point of gratitude from the day?',
      category: 'Custom',
      description: null,
      source: null,
      cover_image: 'https://eqhldzwiymtcyxyxezos.supabase.co/storage/v1/object/public/w2l/evening.jpg',
      is_default: true,
      is_pinned: false
    }
  ];

  const { error: frameworksError } = await supabase.from('frameworks').insert(frameworks);
  if (frameworksError) console.error('Failed to create frameworks:', frameworksError);

  // Create default vocabulary set
  const { error: vocabError } = await supabase.from('vocabulary_set').insert({
    title: 'Default Set',
    profile_id: userId,
    is_default: true
  });

  if (vocabError) console.error('Failed to create vocabulary set:', vocabError);

  return { success: true };
}
