import { Exam, Question, User, UserRole, PaymentRequest, PaymentStatus, ExamAttempt } from '../types';
import { mockExams, mockQuestions, mockUser, mockAdmin, ADMIN_CREDENTIALS } from './mockData';

const STORAGE_KEYS = {
  USERS: 'agriiq_users',
  EXAMS: 'agriiq_exams',
  QUESTIONS: 'agriiq_questions',
  PAYMENTS: 'agriiq_payments',
  ATTEMPTS: 'agriiq_attempts',
  CURRENT_USER: 'agriiq_current_user'
};

class ApiService {
  private _get<T>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }

  private _set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  constructor() {
    if (!localStorage.getItem(STORAGE_KEYS.EXAMS)) this._set(STORAGE_KEYS.EXAMS, mockExams);
    if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) this._set(STORAGE_KEYS.QUESTIONS, mockQuestions);
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) this._set(STORAGE_KEYS.USERS, [mockUser, mockAdmin]);
  }

  // AUTH
  async login(phone: string): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = this._get<User[]>(STORAGE_KEYS.USERS, []);
        let user = users.find(u => u.phoneNumber === phone);
        if (!user) {
          user = {
            id: 'u_' + Date.now(),
            phoneNumber: phone,
            fullName: 'Student_' + Math.floor(Math.random() * 1000),
            role: UserRole.STUDENT,
            blocked: false,
            createdAt: Date.now()
          };
          this._set(STORAGE_KEYS.USERS, [...users, user]);
        }
        this._set(STORAGE_KEYS.CURRENT_USER, user);
        resolve(user);
      }, 500);
    });
  }

  async adminLogin(username: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
          this._set(STORAGE_KEYS.CURRENT_USER, mockAdmin);
          resolve(mockAdmin);
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 800);
    });
  }

  getCurrentUser(): User | null {
    return this._get<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  // EXAMS
  async getExams(): Promise<Exam[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this._get<Exam[]>(STORAGE_KEYS.EXAMS, [])), 300);
    });
  }

  async getExamById(id: string): Promise<Exam | undefined> {
    const exams = await this.getExams();
    return exams.find(e => e.id === id);
  }

  async createExamWithQuestions(examData: Omit<Exam, 'id' | 'questionIds'>, questions: Omit<Question, 'id'>[]): Promise<Exam> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const allQuestions = this._get<Question[]>(STORAGE_KEYS.QUESTIONS, []);
        const allExams = this._get<Exam[]>(STORAGE_KEYS.EXAMS, []);

        // Create Questions
        const newQuestions: Question[] = questions.map(q => ({
          ...q,
          id: 'q_' + Math.random().toString(36).substr(2, 9)
        }));

        this._set(STORAGE_KEYS.QUESTIONS, [...allQuestions, ...newQuestions]);

        // Create Exam
        const newExam: Exam = {
          ...examData,
          id: 'exam_' + Date.now(),
          questionIds: newQuestions.map(q => q.id)
        };

        this._set(STORAGE_KEYS.EXAMS, [...allExams, newExam]);
        resolve(newExam);
      }, 800);
    });
  }

  // QUESTIONS
  async getAllQuestions(): Promise<Question[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this._get<Question[]>(STORAGE_KEYS.QUESTIONS, []));
      }, 300);
    });
  }

  async getQuestionsByIds(ids: string[]): Promise<Question[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const all = this._get<Question[]>(STORAGE_KEYS.QUESTIONS, []);
        resolve(all.filter(q => ids.includes(q.id)));
      }, 300);
    });
  }

  // PAYMENTS
  async submitPayment(payment: Omit<PaymentRequest, 'id' | 'status' | 'createdAt'>): Promise<PaymentRequest> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const payments = this._get<PaymentRequest[]>(STORAGE_KEYS.PAYMENTS, []);
        const newPayment: PaymentRequest = {
          ...payment,
          id: 'p_' + Date.now(),
          status: PaymentStatus.PENDING,
          createdAt: Date.now()
        };
        this._set(STORAGE_KEYS.PAYMENTS, [...payments, newPayment]);
        resolve(newPayment);
      }, 600);
    });
  }

  async getMyPayments(userId: string): Promise<PaymentRequest[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const all = this._get<PaymentRequest[]>(STORAGE_KEYS.PAYMENTS, []);
        resolve(all.filter(p => p.userId === userId));
      }, 300);
    });
  }

  async getAllPayments(): Promise<PaymentRequest[]> {
    return this._get<PaymentRequest[]>(STORAGE_KEYS.PAYMENTS, []);
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<void> {
    const payments = this._get<PaymentRequest[]>(STORAGE_KEYS.PAYMENTS, []);
    const updated = payments.map(p => p.id === paymentId ? { ...p, status } : p);
    this._set(STORAGE_KEYS.PAYMENTS, updated);
  }

  // ATTEMPTS
  async saveAttempt(attempt: ExamAttempt): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const attempts = this._get<ExamAttempt[]>(STORAGE_KEYS.ATTEMPTS, []);
        const existingIdx = attempts.findIndex(a => a.userId === attempt.userId && a.examId === attempt.examId);
        if (existingIdx > -1) {
          attempts[existingIdx] = attempt;
          this._set(STORAGE_KEYS.ATTEMPTS, attempts);
        } else {
          this._set(STORAGE_KEYS.ATTEMPTS, [...attempts, attempt]);
        }
        resolve();
      }, 400);
    });
  }

  async getAttempt(userId: string, examId: string): Promise<ExamAttempt | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const all = this._get<ExamAttempt[]>(STORAGE_KEYS.ATTEMPTS, []);
        resolve(all.find(a => a.userId === userId && a.examId === examId));
      }, 300);
    });
  }
}

export const api = new ApiService();