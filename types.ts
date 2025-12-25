
export enum SupportMode {
  LISTENING = 'LISTENING',
  CALMING = 'CALMING',
  MOTIVATION = 'MOTIVATION',
  STABILITY = 'STABILITY',
  CRISIS_AWARE = 'CRISIS_AWARE'
}

export interface MoodState {
  dominant_mood: string;
  energy_level: string;
  stability: string;
  risk_score: number;
}

export interface MoodLogEntry {
  date: string; // YYYY-MM-DD
  mood: string;
  energy: string;
  score: number;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  last_message?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mood_state?: MoodState;
  mode?: SupportMode;
  conversation_id?: string;
}

export interface User {
  user_id: string;
  email: string;
  full_name: string;
  is_verified: boolean;
}
