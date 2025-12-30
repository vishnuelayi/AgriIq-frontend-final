
import React, { useEffect, useState } from 'react';
import { User, Exam, PaymentStatus, PaymentRequest } from '../../types';
import { api } from '../../services/api';
import { Card, Badge, Button } from '../../components/UI';
import { Icons } from '../../constants';

interface MyExamsProps {
  user: User;
  onStartExam: (id: string) => void;
  onNavigate: (page: string) => void;
}

const MyExams: React.FC<MyExamsProps> = ({ user, onStartExam, onNavigate }) => {
  const [purchasedExams, setPurchasedExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const allExams = await api.getExams();
      const myPayments = await api.getMyPayments(user.id);
      const approvedExamIds = myPayments
        .filter(p => p.status === PaymentStatus.APPROVED)
        .map(p => p.examId);
      
      const filtered = allExams.filter(e => e.isFree || approvedExamIds.includes(e.id));
      setPurchasedExams(filtered);
      setLoading(false);
    };
    load();
  }, [user.id]);

  return (
    <div className="flex flex-col w-full">
      <div className="p-6 bg-[#2D5A27] text-white pt-10 rounded-b-[40px] shadow-lg mb-8">
        <h1 className="text-2xl font-black">My Exam Library</h1>
        <p className="text-green-200 text-sm mt-1">Ready to test your knowledge?</p>
      </div>

      <div className="px-6 space-y-4">
        {loading ? (
          <p className="text-center text-gray-400 py-20 font-medium">Checking your library...</p>
        ) : purchasedExams.length === 0 ? (
          <div className="text-center py-20">
             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
               <Icons.Exams />
             </div>
             <p className="text-gray-500 font-bold mb-4">No exams unlocked yet.</p>
             <Button onClick={() => onNavigate('home')} variant="secondary">Browse All Exams</Button>
          </div>
        ) : (
          purchasedExams.map(exam => (
            <Card key={exam.id} className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <Badge color="green">Unlocked</Badge>
                  <h3 className="font-bold text-gray-900 mt-2">{exam.name}</h3>
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {exam.duration} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {exam.questionIds.length} Questions
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="secondary" onClick={() => onStartExam(exam.id)} className="w-full">Start Attempt</Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MyExams;
