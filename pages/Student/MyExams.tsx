import React, { useEffect, useState } from 'react';
import { User, Exam, PaymentStatus, PaymentRequest } from '../../types';
import { api } from '../../services/api';
import { Card, Badge, Button, ExamCardSkeleton } from '../../components/UI';
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
      setLoading(true);
      try {
        const [allExams, myPayments] = await Promise.all([
          api.getExams(),
          api.getMyPayments(user.id)
        ]);
        
        const approvedExamIds = (myPayments || [])
          .filter(p => p.status === PaymentStatus.APPROVED)
          .map(p => p.examId);
        
        const filtered = (allExams || []).filter(e => e.isFree || approvedExamIds.includes(e.id));
        setPurchasedExams(filtered);
      } catch (err) {
        console.error("Failed to load purchased exams", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.id]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-6 bg-[#2D5A27] text-white pt-12 rounded-b-[40px] shadow-lg mb-10">
        <h1 className="text-2xl font-black">My Library</h1>
        <p className="text-green-200 text-xs mt-1 font-medium opacity-80">Access your purchased mock tests.</p>
      </div>

      <div className="px-6 flex-1">
        {loading ? (
          <div className="flex flex-col gap-6">
            <ExamCardSkeleton />
            <ExamCardSkeleton />
          </div>
        ) : purchasedExams.length === 0 ? (
          <div className="text-center py-20 px-4">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
               <div className="scale-125">
                 <Icons.Exams />
               </div>
             </div>
             <p className="text-lg font-black text-gray-800 mb-2">Library is Empty</p>
             <p className="text-gray-400 text-xs mb-8">Purchase a mock test bundle to see it here.</p>
             <Button onClick={() => onNavigate('home')} variant="secondary" className="w-full py-4 text-sm font-black">EXPLORE STORE</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 pb-20">
            {purchasedExams.map(exam => (
              <Card key={exam.id} className="p-6 border-none shadow-md border border-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <Badge color="green">UNLOCKED</Badge>
                  <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{exam.category}</span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{exam.name}</h3>
                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 mb-6">
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {exam.duration}m
                  </span>
                  <span className="text-gray-200">•</span>
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {exam.questionIds.length} Qs
                  </span>
                </div>
                
                <Button 
                  variant="secondary" 
                  onClick={() => onStartExam(exam.id)} 
                  className="w-full py-4 text-xs font-black uppercase tracking-[0.1em] active:bg-[#2D5A27] active:text-white"
                >
                  START ATTEMPT
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyExams;