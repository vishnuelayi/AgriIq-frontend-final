import React, { useEffect, useState } from 'react';
import { Exam, Question, ExamAttempt, User } from '../../types';
import { api } from '../../services/api';
import { Button, Card, Badge } from '../../components/UI';

interface ResultsProps {
  examId: string;
  user: User;
  onBack: () => void;
}

const Results: React.FC<ResultsProps> = ({ examId, user, onBack }) => {
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const e = await api.getExamById(examId);
      const a = await api.getAttempt(user.id, examId);
      if (e && a) {
        setExam(e);
        setAttempt(a);
        const qs = await api.getQuestionsByIds(e.questionIds);
        setQuestions(qs);
      }
      setLoading(false);
    };
    load();
  }, [examId, user.id]);

  if (loading || !attempt || !exam) return <div>Loading...</div>;

  const percentage = (attempt.score / exam.totalMarks) * 100;

  return (
    <div className="pb-20 w-full">
      <div className="bg-[#2D5A27] text-white p-10 pt-16 rounded-b-[48px] text-center shadow-2xl">
        <p className="text-green-200 font-black uppercase tracking-widest text-[10px] mb-4">Test Finished</p>
        <div className="flex flex-col items-center justify-center gap-2 mb-8">
          <h1 className="text-7xl font-black tabular-nums">{attempt.score.toFixed(1)}</h1>
          <p className="text-lg text-green-100 font-bold">Total Score</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/10">
            <p className="text-[9px] font-black opacity-60 uppercase mb-1">Accuracy</p>
            <p className="text-xl font-black">{attempt.correctCount + attempt.incorrectCount > 0 ? Math.round((attempt.correctCount / (attempt.correctCount + attempt.incorrectCount)) * 100) : 0}%</p>
          </div>
          <div className="bg-white/10 px-4 py-3 rounded-2xl border border-white/10">
            <p className="text-[9px] font-black opacity-60 uppercase mb-1">Status</p>
            <p className="text-xl font-black">{percentage >= 40 ? 'Passed' : 'Average'}</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6">
        <Card className="grid grid-cols-3 divide-x border-none shadow-xl bg-white rounded-3xl overflow-hidden">
          <div className="p-4 flex flex-col items-center">
            <span className="text-green-500 font-black text-xl">{attempt.correctCount}</span>
            <span className="text-[9px] font-black text-gray-400 uppercase mt-1">Right</span>
          </div>
          <div className="p-4 flex flex-col items-center">
            <span className="text-red-500 font-black text-xl">{attempt.incorrectCount}</span>
            <span className="text-[9px] font-black text-gray-400 uppercase mt-1">Wrong</span>
          </div>
          <div className="p-4 flex flex-col items-center">
            <span className="text-gray-400 font-black text-xl">{attempt.skippedCount}</span>
            <span className="text-[9px] font-black text-gray-400 uppercase mt-1">Skip</span>
          </div>
        </Card>
      </div>

      <div className="px-6 mt-12 space-y-8">
        <h2 className="text-xl font-black text-gray-900 px-1">Detailed Analysis</h2>

        <div className="flex flex-col gap-8">
          {questions.map((q, idx) => {
            const userAns = attempt.answers[q.id];
            const isCorrect = userAns === q.correctAnswer;
            const isSkipped = userAns === undefined;

            return (
              <Card key={q.id} className="p-6 border-none shadow-md relative rounded-3xl">
                <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-[#2D5A27] text-white font-black text-[10px]">
                  Q{idx + 1}
                </div>
                
                <div className="mb-6 mt-2">
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <h3 className="font-bold text-base text-gray-900 leading-snug">{q.text}</h3>
                    <div className="flex-shrink-0">
                      {isSkipped ? (
                        <span className="text-yellow-600 text-[10px] font-black uppercase">Skipped</span>
                      ) : isCorrect ? (
                        <span className="text-green-600 text-[10px] font-black uppercase">Correct</span>
                      ) : (
                        <span className="text-red-600 text-[10px] font-black uppercase">Wrong</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-6">
                  {q.options.map((opt, i) => {
                    let styles = "p-4 rounded-xl text-sm border-2 transition-all flex items-center gap-3 ";
                    if (i === q.correctAnswer) styles += "bg-green-50 border-green-200 text-green-800 font-bold";
                    else if (i === userAns && !isCorrect) styles += "bg-red-50 border-red-200 text-red-800 font-bold";
                    else styles += "bg-white border-gray-50 text-gray-400";

                    return (
                      <div key={i} className={styles}>
                        <span className="w-5 h-5 flex-shrink-0 rounded-full border border-current flex items-center justify-center text-[9px] font-black">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-600 leading-relaxed">
                  <span className="block font-black text-[9px] uppercase tracking-widest text-[#2D5A27] mb-1">Explanation</span>
                  {q.explanation}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="px-6 mt-12">
        <Button onClick={onBack} className="w-full py-4 rounded-2xl">Back to Home</Button>
      </div>
    </div>
  );
};

export default Results;