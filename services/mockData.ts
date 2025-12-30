
import { Exam, Question, User, UserRole, PaymentRequest, PaymentStatus } from '../types';

export const mockQuestions: Question[] = [
  {
    id: 'q1',
    text: 'What is the primary nutrient supplied by Urea?',
    options: ['Nitrogen', 'Phosphorus', 'Potassium', 'Calcium'],
    correctAnswer: 0,
    explanation: 'Urea is a nitrogenous fertilizer containing about 46% nitrogen.',
  },
  {
    id: 'q2',
    text: 'Which crop is known as the "Queen of Cereals"?',
    options: ['Rice', 'Wheat', 'Maize', 'Barley'],
    correctAnswer: 2,
    explanation: 'Maize is often referred to as the Queen of Cereals due to its high genetic yield potential.',
  },
  {
    id: 'q3',
    text: 'What is the optimum soil pH for most agricultural crops?',
    options: ['4.5 - 5.5', '6.0 - 7.5', '8.0 - 9.0', '10.0 - 11.0'],
    correctAnswer: 1,
    explanation: 'Most crops grow best in slightly acidic to neutral soil (pH 6.0 - 7.5).',
  },
  {
    id: 'q4',
    text: 'Which method of irrigation is most efficient for water conservation?',
    options: ['Flood Irrigation', 'Drip Irrigation', 'Sprinkler Irrigation', 'Furrow Irrigation'],
    correctAnswer: 1,
    explanation: 'Drip irrigation delivers water directly to the plant roots, minimizing evaporation and runoff.',
  }
];

export const mockExams: Exam[] = [
  {
    id: 'exam1',
    name: 'Introduction to Agronomy',
    description: 'A comprehensive mock test covering basic agronomic principles.',
    price: 0,
    duration: 30,
    totalMarks: 40,
    negativeMarking: 0.25,
    isFree: true,
    questionIds: ['q1', 'q2', 'q3', 'q4'],
    category: 'Agronomy',
  },
  {
    id: 'exam2',
    name: 'Advanced Horticulture Bundle',
    description: 'Test your knowledge on fruit and vegetable production techniques.',
    price: 499,
    duration: 60,
    totalMarks: 100,
    negativeMarking: 0.33,
    isFree: false,
    questionIds: ['q1', 'q2', 'q3', 'q4'],
    category: 'Horticulture',
  }
];

export const mockUser: User = {
  id: 'u1',
  phoneNumber: '+919876543210',
  fullName: 'Rajesh Kumar',
  role: UserRole.STUDENT,
  blocked: false,
  createdAt: Date.now(),
};

export const mockAdmin: User = {
  id: 'admin1',
  phoneNumber: '+910000000000',
  fullName: 'Admin User',
  role: UserRole.ADMIN,
  blocked: false,
  createdAt: Date.now(),
};
