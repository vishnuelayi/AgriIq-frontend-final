import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { api } from './services/api';
import { Icons } from './constants';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import AdminLogin from './pages/Admin/AdminLogin';
import StudentHome from './pages/Student/Home';
import ExamEngine from './pages/Student/ExamEngine';
import Results from './pages/Student/Results';
import AdminDashboard from './pages/Admin/Dashboard';
import MyExams from './pages/Student/MyExams';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [activeExamId, setActiveExamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial Auth Check
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = api.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        if (currentUser.role === UserRole.ADMIN) {
          setCurrentPage('admin_dashboard');
        } else {
          setCurrentPage('home');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Handle Login Event
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    if (loggedInUser.role === UserRole.ADMIN) {
      setCurrentPage('admin_dashboard');
    } else {
      setCurrentPage('home');
    }
  };

  // Handle Logout Event
  const handleLogout = () => {
    api.logout();
    setUser(null);
    setActiveExamId(null);
    setCurrentPage('landing');
  };

  const startExam = (examId: string) => {
    setActiveExamId(examId);
    setCurrentPage('exam_engine');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#2D5A27] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-[10px]">Harvesting Knowledge...</p>
        </div>
      </div>
    );
  }

  // 1. UNAUTHENTICATED FLOW
  if (!user) {
    switch (currentPage) {
      case 'admin_login':
        return <AdminLogin onLogin={handleLogin} onBack={() => setCurrentPage('landing')} />;
      case 'login':
        return <Login onLogin={handleLogin} />;
      default:
        return (
          <Landing 
            onStart={() => setCurrentPage('login')} 
            onAdminClick={() => setCurrentPage('admin_login')}
          />
        );
    }
  }

  // 2. ADMIN FLOW
  if (user.role === UserRole.ADMIN) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // 3. STUDENT FLOW
  // Special Full-Screen Pages
  if (currentPage === 'exam_engine' && activeExamId) {
    return (
      <ExamEngine 
        examId={activeExamId} 
        user={user} 
        onFinish={() => setCurrentPage('results')} 
      />
    );
  }

  if (currentPage === 'results' && activeExamId) {
    return (
      <Results 
        examId={activeExamId} 
        user={user} 
        onBack={() => {
          setActiveExamId(null);
          setCurrentPage('home');
        }} 
      />
    );
  }

  // Dashboard Shell (Home & MyExams)
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col overflow-x-hidden">
        <main className="flex-1 pb-24 overflow-y-auto no-scrollbar">
          {currentPage === 'home' ? (
            <StudentHome 
              user={user} 
              onStartExam={startExam} 
              onNavigate={setCurrentPage} 
              onLogout={handleLogout} 
            />
          ) : (
            <MyExams 
              user={user} 
              onStartExam={startExam} 
              onNavigate={setCurrentPage} 
            />
          )}
        </main>

        <nav className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-10 py-4 flex justify-around items-center z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => setCurrentPage('home')} 
            className={`flex flex-col items-center gap-1 transition-all ${currentPage === 'home' ? 'text-[#2D5A27] scale-110' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Icons.Home />
            <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
            {currentPage === 'home' && <div className="w-1 h-1 bg-[#2D5A27] rounded-full"></div>}
          </button>
          <button 
            onClick={() => setCurrentPage('my_exams')} 
            className={`flex flex-col items-center gap-1 transition-all ${currentPage === 'my_exams' ? 'text-[#2D5A27] scale-110' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Icons.Exams />
            <span className="text-[10px] font-bold uppercase tracking-wider">My Tests</span>
            {currentPage === 'my_exams' && <div className="w-1 h-1 bg-[#2D5A27] rounded-full"></div>}
          </button>
        </nav>
      </div>
    </div>
  );
};

export default App;