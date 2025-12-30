
import React, { useEffect, useState } from 'react';
import { User, Exam, PaymentStatus, PaymentRequest } from '../../types';
import { api } from '../../services/api';
import { Button, Card, Badge, Input } from '../../components/UI';
import { ADMIN_QR_MOCK, ADMIN_UPI_ID } from '../../constants';

interface StudentHomeProps {
  user: User;
  onStartExam: (id: string) => void;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const StudentHome: React.FC<StudentHomeProps> = ({ user, onStartExam, onNavigate, onLogout }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [search, setSearch] = useState('');
  const [buyingExam, setBuyingExam] = useState<Exam | null>(null);
  const [txnId, setTxnId] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  useEffect(() => {
    const load = async () => {
      const allExams = await api.getExams();
      const myPayments = await api.getMyPayments(user.id);
      setExams(allExams);
      setPayments(myPayments);
    };
    load();
  }, [user.id]);

  const getExamStatus = (exam: Exam) => {
    if (exam.isFree) return 'Unlocked';
    const p = payments.find(p => p.examId === exam.id);
    if (!p) return 'Locked';
    if (p.status === PaymentStatus.APPROVED) return 'Unlocked';
    return 'Pending';
  };

  const handleBuy = (exam: Exam) => {
    setBuyingExam(exam);
  };

  const submitPayment = async () => {
    if (!txnId || !buyingExam) return;
    setIsSubmittingPayment(true);
    await api.submitPayment({
      userId: user.id,
      userName: user.fullName,
      examId: buyingExam.id,
      examName: buyingExam.name,
      transactionId: txnId,
      amount: buyingExam.price
    });
    const myPayments = await api.getMyPayments(user.id);
    setPayments(myPayments);
    setBuyingExam(null);
    setTxnId('');
    setIsSubmittingPayment(false);
  };

  const filteredExams = exams.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="bg-[#2D5A27] text-white p-6 pt-10 rounded-b-[40px] shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-green-200 text-sm font-medium">Welcome back,</p>
            <h1 className="text-2xl font-bold">{user.fullName}</h1>
          </div>
          <button onClick={onLogout} className="p-2 bg-green-800/50 rounded-full active:scale-95 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
        <div className="relative">
          <Input 
            placeholder="Search Exams..." 
            className="bg-white/10 border-white/20 text-white placeholder-green-200 pr-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-4 top-1/2 -translate-y-1/2 text-green-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="px-6 -mt-8 grid grid-cols-2 gap-4">
        <Card className="p-4 flex flex-col items-center justify-center bg-white shadow-lg border-none">
          <span className="text-2xl font-black text-[#2D5A27]">{exams.filter(e => e.isFree).length}</span>
          <span className="text-xs font-bold text-gray-400 uppercase">Free Exams</span>
        </Card>
        <Card className="p-4 flex flex-col items-center justify-center bg-white shadow-lg border-none">
          <span className="text-2xl font-black text-[#2D5A27]">{exams.filter(e => !e.isFree).length}</span>
          <span className="text-xs font-bold text-gray-400 uppercase">Premium Bundles</span>
        </Card>
      </div>

      {/* Exam List */}
      <div className="px-6 mt-8 space-y-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          Available Tests
          <span className="h-1.5 w-1.5 rounded-full bg-[#2D5A27]"></span>
        </h2>
        {filteredExams.map(exam => {
          const status = getExamStatus(exam);
          return (
            <Card key={exam.id} className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <Badge color={exam.isFree ? 'green' : 'yellow'}>{exam.isFree ? 'Free' : `₹${exam.price}`}</Badge>
                  <h3 className="font-bold text-gray-900 mt-2">{exam.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-1">{exam.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {exam.duration}m
                </span>
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {exam.questionIds.length} Qs
                </span>
              </div>
              
              {status === 'Unlocked' ? (
                <Button variant="secondary" onClick={() => onStartExam(exam.id)} className="w-full">Start Test</Button>
              ) : status === 'Pending' ? (
                <Button variant="outline" disabled className="w-full">Payment Pending Approval</Button>
              ) : (
                <Button onClick={() => handleBuy(exam)} className="w-full">Buy Now</Button>
              )}
            </Card>
          );
        })}
      </div>

      {/* Payment Modal */}
      {buyingExam && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="p-6 bg-[#2D5A27] text-white text-center">
              <h2 className="text-xl font-bold">Secure Checkout</h2>
              <p className="text-green-200 text-sm mt-1">Paying ₹{buyingExam.price} for {buyingExam.name}</p>
            </div>
            <div className="p-6 flex flex-col items-center gap-6">
              <img src={ADMIN_QR_MOCK} alt="Payment QR" className="w-48 h-48 border-4 border-gray-100 rounded-2xl" />
              <div className="text-center">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Admin UPI ID</p>
                <div className="bg-gray-100 px-4 py-2 rounded-lg font-mono text-sm font-bold text-gray-700">
                  {ADMIN_UPI_ID}
                </div>
              </div>
              <div className="w-full space-y-3">
                <p className="text-sm font-bold text-gray-700">Enter Transaction ID (UTR)</p>
                <Input 
                  placeholder="12-digit transaction ID" 
                  value={txnId} 
                  onChange={(e) => setTxnId(e.target.value)} 
                />
                <p className="text-[10px] text-gray-400 text-center italic">After paying, enter the UTR number here and submit. Our admin will verify and unlock your exam within 1-2 hours.</p>
              </div>
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1" onClick={() => setBuyingExam(null)}>Cancel</Button>
                <Button className="flex-1" onClick={submitPayment} disabled={txnId.length < 6 || isSubmittingPayment}>
                  {isSubmittingPayment ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHome;
