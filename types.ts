export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizResult {
  questions: QuizQuestion[];
}

export enum AppState {
  AUTH = 'AUTH',
  ADMIN = 'ADMIN',
  IDLE = 'IDLE',
  QUIZ_CONFIG = 'QUIZ_CONFIG',
  EDIT_TEXT_VIEW = 'EDIT_TEXT_VIEW',
  PROCESSING = 'PROCESSING',
  SUMMARY_VIEW = 'SUMMARY_VIEW',
  QUIZ_VIEW = 'QUIZ_VIEW',
  HISTORY_VIEW = 'HISTORY_VIEW', // New State
  ERROR = 'ERROR'
}

export type ProcessingMode = 'summarize' | 'quiz' | 'extract';

export type Language = 'en' | 'ar';

export type FontSize = 'small' | 'medium' | 'large';
export type FontType = 'sans' | 'serif' | 'mono';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  isGuest: boolean;
  isAdmin?: boolean;
  isDisabled?: boolean;
  joinedAt?: string;
}

export interface GuestUsage {
  summariesCount: number;
  questionsCount: number;
}

// New History Interface
export interface HistoryItem {
  id: string;
  userId: string;
  timestamp: string;
  fileName: string;
  fileData: FileData;
  extractedText: string;
  summary: string | null;
  quiz: QuizQuestion[] | null;
  language: Language;
}