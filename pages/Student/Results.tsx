
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

  if (loading || !attempt || !exam) return <div>Loading Results...</div>;

  const percentage = (attempt.score / exam.totalMarks) * 100;

  return (
    <div className="pb-10">
      <div className="bg-[#2D5A27] text-white p-6 pt-10 rounded-b-[40px] text-center">
        <p className="text-green-200 font-medium uppercase tracking-widest text-xs mb-2">Performance Summary</p>
        <h1 className="text-4xl font-black mb-1">Score: {attempt.score.toFixed(1)}</h1>
        <p className="text-sm text-green-100 opacity-80">Out of {exam.totalMarks} Marks</p>
        
        <div className="mt-8 flex justify-center gap-4">
          <div className="bg-white/10 px-4 py-3 rounded-2xl">
            <p className="text-[10px] font-bold opacity-60 uppercase mb-1">Accuracy</p>
            <p className="text-xl font-bold">{attempt.correctCount + attempt.incorrectCount > 0 ? Math.round((attempt.correctCount / (attempt.correctCount + attempt.incorrectCount)) * 100) : 0}%</p>
          </div>
          <div className="bg-white/10 px-4 py-3 rounded-2xl">
            <p className="text-[10px] font-bold opacity-60 uppercase mb-1">Percentile</p>
            <p className="text-xl font-bold">Top 5%</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6">
        <Card className="grid grid-cols-3 divide-x border-none shadow-xl">
          <div className="p-4 flex flex-col items-center">
            <span className="text-green-500 font-black text-xl">{attempt.correctCount}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Correct</span>
          </div>
          <div className="p-4 flex flex-col items-center">
            <span className="text-red-500 font-black text-xl">{attempt.incorrectCount}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Wrong</span>
          </div>
          <div className="p-4 flex flex-col items-center">
            <span className="text-gray-400 font-black text-xl">{attempt.skippedCount}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Skipped</span>
          </div>
        </Card>
      </div>

      <div className="px-6 mt-10 space-y-6">
        <h2 className="text-xl font-bold text-gray-800">Review Questions</h2>
        {questions.map((q, idx) => {
          const userAns = attempt.answers[q.id];
          const isCorrect = userAns === q.correctAnswer;
          const isSkipped = userAns === undefined;

          return (
            <Card key={q.id} className="p-5 border-none shadow-md overflow-visible relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#2D5A27] text-white flex items-center justify-center font-bold text-xs shadow-lg">
                {idx + 1}
              </div>
              <div className="mb-4">
                <p className="font-bold text-gray-800 leading-tight mb-2">{q.text}</p>
                {isSkipped ? (
                  <Badge color="yellow">Skipped</Badge>
                ) : isCorrect ? (
                  <Badge color="green">Correct</Badge>
                ) : (
                  <Badge color="red">Incorrect</Badge>
                )}
              </div>

              <div className="space-y-2 mb-4">
                {q.options.map((opt, i) => {
                  let styles = "p-3 rounded-lg text-sm border ";
                  if (i === q.correctAnswer) styles += "bg-green-50 border-green-200 text-green-800 font-bold";
                  else if (i === userAns && !isCorrect) styles += "bg-red-50 border-red-200 text-red-800 font-bold";
                  else styles += "bg-gray-50 border-gray-100 text-gray-500 opacity-60";

                  return (
                    <div key={i} className={styles}>
                      {opt}
                      {i === q.correctAnswer && <span className="ml-2">✓</span>}
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Explanation</p>
                <p className="text-sm text-blue-900 leading-relaxed">{q.explanation}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="px-6 mt-10 flex flex-col gap-3">
        <Button onClick={onBack} className="w-full">Back to Home</Button>
      </div>
    </div>
  );
};

export default Results;
