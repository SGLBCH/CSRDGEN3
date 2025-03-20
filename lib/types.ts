// User type
export interface User {
  id: string;
  email: string;
  stripe_customer_id?: string;
  has_paid: boolean;
  created_at: string;
  updated_at?: string;
}

// Report type
export interface Report {
  id: string;
  user_id: string;
  user_email: string;
  title: string;
  content: any;
  status: 'draft' | 'submitted';
  created_at: string;
  updated_at: string;
}

// Question structure
export interface Question {
  id: string;
  text: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  required: boolean;
  options?: string[];
  unit?: string;
}

// Section structure
export interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

// Questionnaire structure
export interface Questionnaire {
  id: string;
  title: string;
  description?: string;
  sections: Section[];
  created_at: string;
  updated_at?: string;
}

// Response structure
export interface Response {
  id: string;
  report_id: string;
  question_id: string;
  response_value: string;
  created_at: string;
  updated_at?: string;
}

// Response map for easier UI handling
export interface ResponseMap {
  [questionId: string]: string;
} 