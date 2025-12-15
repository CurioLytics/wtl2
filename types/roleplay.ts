export interface RoleplayScenario {
  id: string;
  name: string;
  context: string;
  starter_message: string;
  task: string;
  level: string;
  topic: string;
  ai_role: string;
  partner_prompt: string | null;
  image: string | null;
}

export interface RoleplayMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: number;
  suggested_answer?: string;
}

export interface GrammarDetail {
  grammar_topic_id: string;
  tags: string[];
  description: string;
}

export interface RoleplayFeedback {
  enhanced_version: string;
  grammar_details: GrammarDetail[];
  output: {
    clarity: string;
    vocabulary: string;
    ideas: string;
  };
}

export interface RoleplaySessionData {
  session_id: string;
  scenario_name: string;
  scenario: {
    name: string;
    context: string;
    ai_role: string;
  };
  feedback: RoleplayFeedback | null;
  messages: RoleplayMessage[];
  highlights: string[];
  created_at: string;
  pinned?: boolean;
}

// Enum cho các level hiển thị màu khác nhau
export enum LevelColor {
  Beginner = 'bg-green-100 text-green-800',
  Intermediate = 'bg-yellow-100 text-yellow-800',
  Advanced = 'bg-red-100 text-red-800'
}

// Định nghĩa cho lỗi roleplay
export type RoleplayError =
  | 'connection_error'
  | 'no_scenarios'
  | 'no_starter_message';