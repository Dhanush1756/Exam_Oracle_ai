
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface StudySource {
  id: string; // Unique ID for each file
  category: 'syllabus' | 'notes' | 'textbook';
  title: string;
  type: 'text' | 'file';
  mimeType: string;
  content: string; // Base64 for files, raw text for 'text' type
  fileName: string;
}

export interface Concept {
  name: string;
  description: string;
  sourcesFoundIn: string[];
  priorityReasoning: string;
  tips: string;
  overlapIndex: number; // 1-10 scale of importance
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: 'easy' | 'moderate' | 'difficult';
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  quizTitle: string;
  score: number;
  total: number;
  percentage: number;
  timestamp: number;
}

export interface StudyGuideResponse {
  guideTitle: string;
  oracleMessage: string;
  highPriorityConcepts: Concept[];
  suggestedStudyPlan: string[];
  estimatedStudyTime: string;
}
