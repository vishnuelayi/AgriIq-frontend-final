
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

  if (loading || !exam) return <div>Loading...</div>;

  const currentQuestion = questions[currentIndex];
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="fixed inset-0 bg-white flex flex-col overflow-hidden select-none">
      {/* Top Bar */}
      <div className="bg-[#2D5A27] text-white p-4 flex justify-between items-center shadow-lg">
        <div className="flex flex-col">
          <h2 className="font-bold text-sm truncate max-w-[150px]">{exam.name}</h2>
          <span className="text-[10px] text-green-200">Q {currentIndex + 1} of {questions.length}</span>
        </div>
        <div className={`px-4 py-1.5 rounded-full font-mono font-bold flex items-center gap-2 ${timeLeft < 300 ? 'bg-red-500 animate-pulse' : 'bg-green-800'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <p className="text-lg font-bold text-gray-800 leading-tight">
            {currentQuestion.text}
          </p>
          {currentQuestion.imageUrl && (
            <img src={currentQuestion.imageUrl} alt="Question" className="mt-4 rounded-xl w-full h-48 object-cover border" />
          )}
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setAnswers({ ...answers, [currentQuestion.id]: idx })}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 ${
                answers[currentQuestion.id] === idx 
                ? 'border-[#2D5A27] bg-green-50 shadow-md translate-x-1' 
                : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <span className={`w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                answers[currentQuestion.id] === idx ? 'border-[#2D5A27] bg-[#2D5A27] text-white' : 'border-gray-300 text-gray-400'
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className={`font-medium ${answers[currentQuestion.id] === idx ? 'text-[#2D5A27]' : 'text-gray-700'}`}>
                {option}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="bg-gray-50 p-4 border-t border-gray-200 grid grid-cols-2 gap-4">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="px-3"
            onClick={() => {
              if (markedForReview.includes(currentQuestion.id)) {
                setMarkedForReview(markedForReview.filter(id => id !== currentQuestion.id));
              } else {
                setMarkedForReview([...markedForReview, currentQuestion.id]);
              }
            }}
          >
            {markedForReview.includes(currentQuestion.id) ? 'Unmark' : 'Mark'}
          </Button>
          <Button variant="outline" className="px-3" onClick={() => setShowPalette(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </Button>
        </div>
        <div className="flex gap-2 justify-end">
          {currentIndex < questions.length - 1 ? (
            <Button onClick={() => setCurrentIndex(currentIndex + 1)}>Next</Button>
          ) : (
            <Button variant="danger" onClick={() => setShowConfirmModal(true)}>Submit</Button>
          )}
        </div>
      </div>

      {/* Question Palette Modal */}
      {showPalette && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-3/4 max-w-xs h-full flex flex-col shadow-2xl animate-in slide-in-from-right">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm">Question Palette</h3>
              <button onClick={() => setShowPalette(false)} className="text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-4 gap-3">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isMarked = markedForReview.includes(q.id);
                const isCurrent = currentIndex === idx;
                
                let bgColor = 'bg-gray-100 text-gray-400';
                if (isCurrent) bgColor = 'ring-2 ring-offset-2 ring-[#2D5A27] bg-[#2D5A27] text-white';
                else if (isMarked) bgColor = 'bg-yellow-400 text-white';
                else if (isAnswered) bgColor = 'bg-green-500 text-white';

                return (
                  <button
                    key={idx}
                    onClick={() => { setCurrentIndex(idx); setShowPalette(false); }}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${bgColor}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="p-6 bg-gray-50 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <span className="w-3 h-3 bg-green-500 rounded-sm"></span> Answered
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                  <span className="w-3 h-3 bg-yellow-400 rounded-sm"></span> Marked
                </div>
              </div>
              <Button 
                variant="danger" 
                className="w-full text-xs" 
                onClick={() => {
                  setShowPalette(false);
                  setShowConfirmModal(true);
                }}
              >
                Finish & Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Final Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in">
          <Card className="w-full max-w-sm p-8 flex flex-col items-center text-center shadow-2xl border-none">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              You have answered <span className="font-bold text-[#2D5A27]">{answeredCount} out of {questions.length}</span> questions. Once submitted, you cannot change your answers.
            </p>
            <div className="w-full space-y-3">
              <Button variant="danger" className="w-full" onClick={handleSubmit}>Yes, Submit Now</Button>
              <Button variant="outline" className="w-full" onClick={() => setShowConfirmModal(false)}>Back to Exam</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExamEngine;
