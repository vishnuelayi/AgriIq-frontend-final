
import { Exam, Question, User, UserRole, PaymentRequest, PaymentStatus, ExamAttempt } from '../types';
import { mockExams, mockQuestions, mockUser, mockAdmin } from './mockData';

// Simulated persistence using LocalStorage
const STORAGE_KEYS = {
  USERS: 'agriiq_users',
  EXAMS: 'agriiq_exams',
  QUESTIONS: 'agriiq_questions',
  PAYMENTS: 'agriiq_payments',
  ATTEMPTS: 'agriiq_attempts',
  CURRENT_USER: 'agriiq_current_user'
};

class ApiService {
  private get<T>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }

  private set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  constructor() {
    if (!localStorage.getItem(STORAGE_KEYS.EXAMS)) this.set(STORAGE_KEYS.EXAMS, mockExams);
    if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) this.set(STORAGE_KEYS.QUESTIONS, mockQuestions);
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) this.set(STORAGE_KEYS.USERS, [mockUser, mockAdmin]);
  }

  // AUTH
  async login(phone: string): Promise<User> {
    const users = this.get<User[]>(STORAGE_KEYS.USERS, []);
    let user = users.find(u => u.phoneNumber === phone);
    if (!user) {
      user = {
        id: 'u_' + Date.now(),
        phoneNumber: phone,
        fullName: 'New Student',
        role: UserRole.STUDENT,
        blocked: false,
        createdAt: Date.now()
      };
      this.set(STORAGE_KEYS.USERS, [...users, user]);
    }
    this.set(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  }

  getCurrentUser(): User | null {
    return this.get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  // EXAMS
  async getExams(): Promise<Exam[]> {
    return this.get<Exam[]>(STORAGE_KEYS.EXAMS, []);
  }

  async getExamById(id: string): Promise<Exam | undefined> {
    return (await this.getExams()).find(e => e.id === id);
  }

  // QUESTIONS
  async getQuestionsByIds(ids: string[]): Promise<Question[]> {
    const all = this.get<Question[]>(STORAGE_KEYS.QUESTIONS, []);
    return all.filter(q => ids.includes(q.id));
  }

  // PAYMENTS
  async submitPayment(payment: Omit<PaymentRequest, 'id' | 'status' | 'createdAt'>): Promise<PaymentRequest> {
    const payments = this.get<PaymentRequest[]>(STORAGE_KEYS.PAYMENTS, []);
    const newPayment: PaymentRequest = {
      ...payment,
      id: 'p_' + Date.now(),
      status: PaymentStatus.PENDING,
      createdAt: Date.now()
    };
    this.set(STORAGE_KEYS.PAYMENTS, [...payments, newPayment]);
    return newPayment;
  }

  async getMyPayments(userId: string): Promise<PaymentRequest[]> {
    return this.get<PaymentRequest[]>(STORAGE_KEYS.PAYMENTS, []).filter(p => p.userId === userId);
  }

  async getAllPayments(): Promise<PaymentRequest[]> {
    return this.get<PaymentRequest[]>(STORAGE_KEYS.PAYMENTS, []);
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<void> {
    const payments = this.get<PaymentRequest[]>(STORAGE_KEYS.PAYMENTS, []);
    const updated = payments.map(p => p.id === paymentId ? { ...p, status } : p);
    this.set(STORAGE_KEYS.PAYMENTS, updated);
  }

  // ATTEMPTS
  async saveAttempt(attempt: ExamAttempt): Promise<void> {
    const attempts = this.get<ExamAttempt[]>(STORAGE_KEYS.ATTEMPTS, []);
    const existing = attempts.findIndex(a => a.userId === attempt.userId && a.examId === attempt.examId);
    if (existing > -1) {
      attempts[existing] = attempt;
      this.set(STORAGE_KEYS.ATTEMPTS, attempts);
    } else {
      this.set(STORAGE_KEYS.ATTEMPTS, [...attempts, attempt]);
    }
  }

  async getAttempt(userId: string, examId: string): Promise<ExamAttempt | undefined> {
    return this.get<ExamAttempt[]>(STORAGE_KEYS.ATTEMPTS, []).find(a => a.userId === userId && a.examId === examId);
  }

  async getAllAttempts(): Promise<ExamAttempt[]> {
    return this.get<ExamAttempt[]>(STORAGE_KEYS.ATTEMPTS, []);
  }
}

export const api = new ApiService();
