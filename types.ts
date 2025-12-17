export interface User {
  id: string;
  email: string;
  name: string;
  registeredAt: string;
}

export enum QuestionType {
  LIKERT = 'LIKERT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TEXT = 'TEXT'
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[]; // For Multiple Choice
  category?: string; // For Radar Chart dimensions (e.g., "Workload", "Autonomy")
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface SurveyResult {
  id: string;
  surveyId: string;
  userId: string;
  timestamp: string;
  answers: Record<string, string | number>;
  scores: Record<string, number>; // Aggregated scores per category
  totalScore: number;
}

export interface KPIMetric {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface RadarDataPoint {
  subject: string;
  A: number;
  fullMark: number;
}