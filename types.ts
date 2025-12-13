
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
  timestamp: Date;
  generatedImages?: string[]; // Array of base64 image strings
  isGeneratingImages?: boolean;
  cachedTranslations?: Record<string, string>; // Cache for TTS translations
  isTranslatingAudio?: boolean;
  summary?: string;
  isSummarizing?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export enum Language {
  ENGLISH = 'English',
  HINDI = 'Hindi',
  HINGLISH = 'Hinglish',
  AUTO = 'Auto'
}

export type SourceText = 
  | 'All Scriptures' 
  | 'Bhagavad Gita' 
  | 'Rigveda' 
  | 'Yajurveda' 
  | 'Samaveda' 
  | 'Atharvaveda' 
  | 'Ramayana' 
  | 'Mahabharata' 
  | 'Puranas' 
  | 'Upanishads';

export type ToolkitMode = 
  | 'General Wisdom' 
  | 'Exact Reference' 
  | 'Sanskrit Shloka' 
  | 'Philosophical Angle' 
  | 'Scientific Parallel';

export interface UserProfile {
  uuid: string;
  email: string;
  username: string;
  displayId: string;
  joinedAt: Date;
  searchCount: number;
  isPremium: boolean;
  recentChats: string[];
}
