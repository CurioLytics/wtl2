export interface RoleplayScenario {
  id: string;
  name: string;
  context: string;
  starter_message: string;
  guide: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  topic: string;
  role1: string;
}

export interface RoleplayMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

// Type định nghĩa cho một phiên hội thoại
export interface RoleplaySession {
  id: string;
  scenarioId: string;
  messages: RoleplayMessage[];
  startedAt: number; // Timestamp
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