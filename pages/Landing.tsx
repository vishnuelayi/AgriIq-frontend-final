import React from 'react';
import { Button } from '../components/UI';

interface LandingProps {
  onStart: () => void;
  onAdminClick: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart, onAdminClick }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <div className="w-full max-w-md flex-1 flex flex-col relative overflow-hidden">
        {/* Subtle Admin Access */}
        <button 
          onClick={onAdminClick}
          className="absolute top-6 right-6 z-50 p-3 bg-gray-50/50 rounded-2xl text-gray-300 hover:text-[#2D5A27] hover:bg-green-50 transition-all active:scale-90"
          title="Admin Portal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </button>

        <div className="absolute top-[-5%] right-[-5%] w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-80 h-80 bg-orange-50 rounded-full blur-3xl opacity-40"></div>
        
        <div className="px-8 pt-20 pb-12 flex flex-col items-center text-center relative z-10">
          <div className="w-20 h-20 bg-[#2D5A27] rounded-[28px] flex items-center justify-center shadow-2xl shadow-green-900/20 mb-8 animate-bounce-slow">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          
          <h1 className="text-5xl font-black text-gray-900 leading-[1.1] mb-6">
            Master Your <br/>
            <span className="text-[#2D5A27]">Agri Exams</span>
          </h1>
          
          <p className="text-gray-500 text-base font-medium max-w-[280px]">
            The most advanced mock test platform for agricultural students in India.
          </p>
        </div>

        <div className="px-6 grid grid-cols-2 gap-4 mb-12">
          {[
            { title: 'Mock Tests', icon: '📝', desc: 'Real patterns' },
            { title: 'Analysis', icon: '📊', desc: 'Instant results' },
            { title: 'Expert Content', icon: '🌱', desc: 'Syllabus' },
            { title: 'Secure Pay', icon: '🔒', desc: 'Easy UPI' }
          ].map((feature, i) => (
            <div key={i} className="bg-gray-50/50 backdrop-blur-sm p-5 rounded-3xl border border-gray-100 flex flex-col gap-2 hover:shadow-xl transition-all group">
              <span className="text-2xl group-hover:scale-110 transition-transform">{feature.icon}</span>
              <h3 className="font-bold text-gray-800 text-sm leading-tight">{feature.title}</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="px-8 pb-12 mt-auto w-full">
          <Button onClick={onStart} className="w-full py-5 text-lg shadow-2xl shadow-green-900/20 rounded-2xl">
            Get Started
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Button>
          <p className="text-center text-gray-400 text-xs mt-6 font-medium">
            Join 5,000+ agriculture students today
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;