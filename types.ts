
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface StudySource {
  id: string;
  category: 'syllabus' | 'notes' | 'textbook';
  title: string;
  type: 'text' | 'file';
  mimeType: string;
  content: string; 
  fileName: string;
}

export interface Reference {
  title: string;
  url: string;
  description: string;
}

export interface Concept {
  name: string;
  description: string;
  sourcesFoundIn: string[];
  priorityReasoning: string;
  tips: string;
  overlapIndex: number;
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

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface StudyGuideResponse {
  guideTitle: string;
  oracleMessage: string;
  highPriorityConcepts: Concept[];
  suggestedStudyPlan: string[];
  estimatedStudyTime: string;
  externalReferences: Reference[];
}
