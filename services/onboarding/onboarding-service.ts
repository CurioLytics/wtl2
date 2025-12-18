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
      content: 'How are you feeling this morning?\nWhat are you grateful for?\nWhat are the priorities of the week? How are they going? \nWhat\'s today\'s adventure going to be? In Calendar yet?',
      category: 'Custom',
      description: 'This framework to set the tone for the day by setting the mental state and the task need to be done',
      source: null,
      cover_image: 'https://eqhldzwiymtcyxyxezos.supabase.co/storage/v1/object/public/w2l/evening.jpg',
      is_default: true,
      is_pinned: false
    },
    {
      profile_id: userId,
      name: 'Evening Wind-Down',
      content: 'What is your one win from the day?\nWhat is your one point of tension, anxiety, or stress from the day?\nWhat is your one point of gratitude from the day?\nHave a nice sleep',
      category: 'Custom',
      description: '',
      source: '',
      cover_image: 'https://eqhldzwiymtcyxyxezos.supabase.co/storage/v1/object/public/w2l/morning.jpg',
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
