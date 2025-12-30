
export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin'
}

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  role: UserRole;
  blocked: boolean;
  createdAt: number;
}

export interface Question {
  id: string;
  text: string;
  imageUrl?: string;
  options: string[];
  correctAnswer: number; // 0-3
  explanation: string;
  explanationImage?: string;
}

export interface Exam {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  totalMarks: number;
  negativeMarking: number; // e.g., 0.25
  isFree: boolean;
  questionIds: string[];
  category: string;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  examId: string;
  examName: string;
  transactionId: string;
  screenshotUrl?: string;
  status: PaymentStatus;
  amount: number;
  createdAt: number;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  examId: string;
  answers: Record<string, number>; // questionId -> selectedIndex
  markedForReview: string[];
  score: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  startTime: number;
  endTime?: number;
  status: 'ongoing' | 'completed';
}
