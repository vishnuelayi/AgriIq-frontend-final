
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

  // Listen for hash changes to support "special route" for admin
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/admin' && !user) {
        setCurrentPage('admin_login');
      } else if (hash === '' && currentPage === 'admin_login') {
        setCurrentPage('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check initial hash

    const currentUser = api.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setCurrentPage(currentUser.role === UserRole.ADMIN ? 'admin_dashboard' : 'home');
    }

    setLoading(false);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentPage(loggedInUser.role === UserRole.ADMIN ? 'admin_dashboard' : 'home');
    // Clear hash if we were on admin login
    if (window.location.hash === '#/admin') {
      window.history.replaceState(null, '', ' ');
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setCurrentPage('landing');
    window.history.replaceState(null, '', ' ');
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
          <p className="mt-4 text-gray-500 font-medium">Harvesting Knowledge...</p>
        </div>
      </div>
    );
  }

  // Handle flow for non-authenticated users
  if (!user) {
    if (currentPage === 'admin_login') {
      return (
        <AdminLogin 
          onLogin={handleLogin} 
          onBack={() => {
            window.location.hash = '';
            setCurrentPage('landing');
          }} 
        />
      );
    }
    if (currentPage === 'landing') {
      return <Landing onStart={() => setCurrentPage('login')} />;
    }
    return <Login onLogin={handleLogin} />;
  }

  // Admin View
  if (user.role === UserRole.ADMIN) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  // Student Views that shouldn't have the bottom nav
  if (currentPage === 'exam_engine' && activeExamId) {
    return <ExamEngine examId={activeExamId} user={user} onFinish={() => setCurrentPage('results')} />;
  }

  if (currentPage === 'results' && activeExamId) {
    return <Results examId={activeExamId} user={user} onBack={() => setCurrentPage('home')} />;
  }

  // Standard Student Layout for Home and My Exams
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-lg bg-white min-h-screen shadow-xl relative flex flex-col overflow-y-auto no-scrollbar">
        <main className="flex-1 pb-24">
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

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-gray-100 px-12 py-3 flex justify-around items-center z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
          <button 
            onClick={() => setCurrentPage('home')} 
            className={`flex flex-col items-center transition-colors ${currentPage === 'home' ? 'text-[#2D5A27]' : 'text-gray-400'}`}
          >
            <Icons.Home />
            <span className="text-[10px] font-bold mt-1 uppercase">Home</span>
          </button>
          <button 
            onClick={() => setCurrentPage('my_exams')} 
            className={`flex flex-col items-center transition-colors ${currentPage === 'my_exams' ? 'text-[#2D5A27]' : 'text-gray-400'}`}
          >
            <Icons.Exams />
            <span className="text-[10px] font-bold mt-1 uppercase">My Tests</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default App;
