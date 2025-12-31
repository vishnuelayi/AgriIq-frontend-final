
import React from 'react';
import { Button } from '../components/UI';

interface LandingProps {
  onStart: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Hero Section */}
      <div className="w-full max-w-lg flex-1 flex flex-col relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-green-50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-[20%] left-[-20%] w-80 h-80 bg-orange-50 rounded-full blur-3xl opacity-40"></div>
        
        <div className="px-8 pt-20 pb-10 flex flex-col items-center text-center relative z-10">
          <div className="w-24 h-24 bg-[#2D5A27] rounded-[32px] flex items-center justify-center shadow-2xl shadow-green-900/20 mb-8 animate-bounce-slow">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-black text-gray-900 leading-tight mb-4">
            Master Your <br/>
            <span className="text-[#2D5A27]">Agri Exams</span>
          </h1>
          
          <p className="text-gray-500 text-lg font-medium max-w-[280px]">
            The most advanced mock test platform for agricultural students in India.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="px-8 grid grid-cols-2 gap-4 mb-12">
          {[
            { title: 'Mock Tests', icon: '📝', desc: 'Real exam patterns' },
            { title: 'Analysis', icon: '📊', desc: 'Instant results' },
            { title: 'Expert Content', icon: '🌱', desc: 'Updated syllabus' },
            { title: 'Secure Pay', icon: '🔒', desc: 'Easy UPI payment' }
          ].map((feature, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-2">
              <span className="text-2xl">{feature.icon}</span>
              <h3 className="font-bold text-gray-800 text-sm">{feature.title}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom Action Area */}
        <div className="px-8 pb-12 mt-auto">
          <Button onClick={onStart} className="w-full py-5 text-lg shadow-2xl shadow-green-900/20">
            Start Now
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Button>
          <p className="text-center text-gray-400 text-xs mt-6 font-medium">
            Join 5000+ agriculture students today
          </p>
        </div>
      </div>
      
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Landing;
