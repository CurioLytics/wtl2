export type EnglishLevel = 'Beginner (A1-A2)' | 'Intermediate (B1-B2)' | 'Advanced (C1-C2)';

export type LearningGoal = 'Fluency' | 'Exam prep' | 'Work' | 'Travel' | 'Speaking' | 'Vocabulary';

export type WritingType = 'Daily journal' | 'Travel notes' | 'Study reflections' | 'Work logs' | 'Creative stories' | 'Other';

export interface UserProfile {
  id: string;
  name: string;
  englishLevel: EnglishLevel;
  goals: LearningGoal[];
  writingTypes: WritingType[];
  onboardingCompleted: boolean;
}

export const ENGLISH_LEVELS: EnglishLevel[] = [
  'Beginner (A1-A2)',
  'Intermediate (B1-B2)',
  'Advanced (C1-C2)',
];

export const LEARNING_GOALS: LearningGoal[] = [
  'Fluency',
  'Exam prep',
  'Work',
  'Travel',
  'Speaking',
  'Vocabulary',
];

export const WRITING_TYPES: WritingType[] = [
  'Daily journal',
  'Travel notes',
  'Study reflections',
  'Work logs',
  'Creative stories',
  'Other',
];