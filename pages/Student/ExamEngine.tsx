import React, { useState, useEffect, useCallback } from 'react';
import { Exam, Question, ExamAttempt, User } from '../../types';
import { api } from '../../services/api';
import { Button, Card, Badge } from '../../components/UI';

interface ExamEngineProps {
  examId: string;
  user: User;
  onFinish: () => void;
}

const ExamEngine: React.FC<ExamEngineProps> = ({ examId, user, onFinish }) => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showPalette, setShowPalette] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const e = await api.getExamById(examId);
      if (e) {
        setExam(e);
        const qs = await api.getQuestionsByIds(e.questionIds);
        setQuestions(qs);
        setTimeLeft(e.duration * 60);
      }
      setLoading(false);
    };
    load();
  }, [examId]);

  const handleSubmit = useCallback(async () => {
    if (!exam) return;
    
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    questions.forEach(q => {
      if (answers[q.id] === undefined) {
        skipped++;
      } else if (answers[q.id] === q.correctAnswer) {
        correct++;
      } else {
        incorrect++;
      }
    });

    const score = (correct * (exam.totalMarks / questions.length)) - (incorrect * exam.negativeMarking);

    const attempt: ExamAttempt = {
      id: 'at_' + Date.now(),
      userId: user.id,
      examId: exam.id,
      answers,
      markedForReview,
      score,
      correctCount: correct,
      incorrectCount: incorrect,
      skippedCount: skipped,
      startTime: Date.now(),
      endTime: Date.now(),
      status: 'completed'
    };

    await api.saveAttempt(attempt);
    onFinish();
  }, [exam, questions, answers, markedForReview, user.id, onFinish]);

  useEffect(() => {
    if (timeLeft <= 0 && !loading) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, handleSubmit]);

  if (loading || !exam) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-[#2D5A27] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Preparing Exam Environment...</p>
      </div>
    </div>
  );

  const currentQuestion = questions[currentIndex];
  const isMarked = markedForReview.includes(currentQuestion.id);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col overflow-hidden select-none">
      {/* Top Bar - High Density */}
      <header className="bg-white border-b border-gray-100 px-5 py-3 flex justify-between items-center z-10 shadow-sm">
        <div className="flex flex-col">
          <h2 className="font-black text-gray-800 text-sm truncate max-w-[180px]">{exam.name}</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Question {currentIndex + 1}/{questions.length}</span>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-xl font-mono text-sm font-black flex items-center gap-2 transition-colors ${timeLeft < 300 ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse' : 'bg-green-50 text-[#2D5A27] border border-green-100'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatTime(timeLeft)}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-4 pb-20 px-5">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="p-6 md:p-10 border-none shadow-xl bg-white rounded-[32px] relative overflow-visible">
            {/* Context Badge */}
            <div className="absolute -top-3 left-8">
              <Badge color={isMarked ? 'yellow' : 'blue'}>
                {isMarked ? 'MARKED FOR REVIEW' : `QUESTION ${currentIndex + 1}`}
              </Badge>
            </div>

            <div className="mt-4 mb-10">
              <h3 className="text-xl font-black text-gray-900 leading-[1.3] tracking-tight">
                {currentQuestion.text}
              </h3>
              {currentQuestion.imageUrl && (
                <div className="mt-6 rounded-2xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                  <img src={currentQuestion.imageUrl} alt="Question Diagram" className="w-full h-auto object-contain max-h-64" />
                </div>
              )}
            </div>

            <div className="space-y-3.5">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setAnswers({ ...answers, [currentQuestion.id]: idx })}
                  className={`w-full p-4.5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 active:scale-[0.98] ${
                    answers[currentQuestion.id] === idx 
                    ? 'border-[#2D5A27] bg-green-50 shadow-md ring-4 ring-green-900/5' 
                    : 'border-gray-50 bg-gray-50/30 hover:bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  <span className={`w-8 h-8 flex-shrink-0 rounded-xl border-2 flex items-center justify-center text-xs font-black transition-all ${
                    answers[currentQuestion.id] === idx 
                    ? 'bg-[#2D5A27] border-[#2D5A27] text-white rotate-12' 
                    : 'bg-white border-gray-200 text-gray-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className={`font-bold text-sm leading-snug flex-1 ${answers[currentQuestion.id] === idx ? 'text-[#2D5A27]' : 'text-gray-600'}`}>
                    {option}
                  </span>
                  {answers[currentQuestion.id] === idx && (
                    <div className="w-5 h-5 bg-[#2D5A27] rounded-full flex items-center justify-center">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                       </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </main>

      {/* Footer Controls - Optimized for Mobile Thumbs */}
      <footer className="bg-white border-t border-gray-100 p-4 md:px-10 flex items-center justify-between gap-3 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        {/* Left Side: Secondary Actions */}
        <div className="flex gap-2">
          <button 
            onClick={() => {
              if (isMarked) {
                setMarkedForReview(markedForReview.filter(id => id !== currentQuestion.id));
              } else {
                setMarkedForReview([...markedForReview, currentQuestion.id]);
              }
            }}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all active:scale-90 border-2 ${
              isMarked ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-gray-50 border-gray-100 text-gray-400'
            }`}
            title="Mark for Review"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isMarked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          
          <button 
            onClick={() => setShowPalette(true)}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 border-2 border-gray-100 text-gray-400 transition-all active:scale-90"
            title="Question Palette"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
        
        {/* Right Side: Navigation Actions */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          {currentIndex > 0 && (
            <button 
              onClick={() => setCurrentIndex(currentIndex - 1)} 
              className="px-4 h-12 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 active:scale-95"
            >
              Back
            </button>
          )}
          
          {currentIndex < questions.length - 1 ? (
            <Button 
              onClick={() => setCurrentIndex(currentIndex + 1)} 
              className="flex-1 max-w-[160px] h-12 text-sm font-black tracking-widest uppercase rounded-2xl shadow-green-900/10"
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Button>
          ) : (
            <Button 
              variant="danger" 
              onClick={() => setShowConfirmModal(true)} 
              className="flex-1 max-w-[160px] h-12 text-sm font-black tracking-widest uppercase rounded-2xl shadow-red-900/10 animate-pulse"
            >
              FINISH
            </Button>
          )}
        </div>
      </footer>

      {/* Palette Modal - Modern Side Drawer */}
      {showPalette && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex justify-end animate-in fade-in duration-200">
          <div className="bg-white w-[85%] max-w-sm h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="font-black text-gray-900 uppercase tracking-[0.15em] text-sm">Exam Overview</h3>
                <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{answeredCount}/{questions.length} Attempted</p>
              </div>
              <button 
                onClick={() => setShowPalette(false)} 
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-gray-900 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-4 gap-2.5 content-start">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isMarked = markedForReview.includes(q.id);
                const isCurrent = currentIndex === idx;
                
                let styles = 'w-full aspect-square rounded-xl flex items-center justify-center font-black text-xs transition-all border-2 ';
                if (isCurrent) styles += 'border-[#2D5A27] bg-[#2D5A27] text-white shadow-lg shadow-green-900/10 scale-105';
                else if (isMarked) styles += 'border-orange-200 bg-orange-400 text-white';
                else if (isAnswered) styles += 'border-green-100 bg-green-500 text-white';
                else styles += 'border-gray-50 bg-gray-50 text-gray-300';

                return (
                  <button
                    key={idx}
                    onClick={() => { setCurrentIndex(idx); setShowPalette(false); }}
                    className={styles}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-6">
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase">
                  <span className="w-3 h-3 bg-green-500 rounded-sm"></span> Solved
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase">
                  <span className="w-3 h-3 bg-orange-400 rounded-sm"></span> Marked
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase">
                  <span className="w-3 h-3 bg-gray-100 rounded-sm"></span> Unvisited
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase">
                  <span className="w-3 h-3 border-2 border-[#2D5A27] rounded-sm"></span> Current
                </div>
              </div>
              <Button 
                variant="danger" 
                className="w-full py-4.5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-red-900/10" 
                onClick={() => {
                  setShowPalette(false);
                  setShowConfirmModal(true);
                }}
              >
                End Session
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal - Mobile Optimized */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in zoom-in-95 duration-200">
          <Card className="w-full max-w-sm p-8 flex flex-col items-center text-center shadow-3xl border-none rounded-[40px] bg-white">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Finish Test?</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed font-bold">
              You've answered <span className="text-[#2D5A27]">{answeredCount}/{questions.length}</span> questions. You cannot edit your answers after submission.
            </p>
            <div className="w-full space-y-3">
              <Button variant="danger" className="w-full py-4.5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-red-900/10" onClick={handleSubmit}>Yes, Submit</Button>
              <button 
                className="w-full py-3 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors" 
                onClick={() => setShowConfirmModal(false)}
              >
                Go Back
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExamEngine;