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

export const ENGLISH_LEVELS_VI: Record<EnglishLevel, string> = {
  'Beginner (A1-A2)': 'Sơ cấp (A1-A2)',
  'Intermediate (B1-B2)': 'Trung cấp (B1-B2)',
  'Advanced (C1-C2)': 'Cao cấp (C1-C2)',
};

export const LEARNING_GOALS: LearningGoal[] = [
  'Fluency',
  'Exam prep',
  'Work',
  'Travel',
  'Speaking',
  'Vocabulary',
];

export const LEARNING_GOALS_VI: Record<LearningGoal, string> = {
  'Fluency': 'Nói trôi chảy',
  'Exam prep': 'Chuẩn bị thi',
  'Work': 'Công việc',
  'Travel': 'Du lịch',
  'Speaking': 'Giao tiếp',
  'Vocabulary': 'Từ vựng',
};

export const WRITING_TYPES: WritingType[] = [
  'Daily journal',
  'Travel notes',
  'Study reflections',
  'Work logs',
  'Creative stories',
  'Other',
];

export const WRITING_TYPES_VI: Record<WritingType, string> = {
  'Daily journal': 'Nhật ký hàng ngày',
  'Travel notes': 'Ghi chú du lịch',
  'Study reflections': 'Suy ngẫm về học tập',
  'Work logs': 'Nhật ký công việc',
  'Creative stories': 'Truyện sáng tạo',
  'Other': 'Khác',
};