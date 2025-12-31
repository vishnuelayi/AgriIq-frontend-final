import React, { useEffect, useState } from 'react';
import { User, Exam, PaymentStatus, PaymentRequest } from '../../types';
import { api } from '../../services/api';
import { Button, Card, Badge, Input, ExamCardSkeleton } from '../../components/UI';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [allExams, myPayments] = await Promise.all([
          api.getExams(),
          api.getMyPayments(user.id)
        ]);
        setExams(allExams || []);
        setPayments(myPayments || []);
      } finally {
        setLoading(false);
      }
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
    try {
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
    } catch (err) {
      console.error("Payment submission failed", err);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const filteredExams = exams.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <div className="bg-[#2D5A27] text-white p-6 pt-12 rounded-b-[40px] shadow-2xl mb-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-green-200 text-[10px] font-black uppercase tracking-widest opacity-80">Dashboard</p>
            <h1 className="text-2xl font-black">{user.fullName}</h1>
          </div>
          <button 
            onClick={onLogout} 
            className="p-2.5 bg-green-800/50 rounded-full active:scale-95 transition-all border border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
        <div className="relative">
          <Input 
            placeholder="Search category or test name..." 
            className="bg-white/10 border-white/20 text-white placeholder-green-200 pr-10 py-3.5 rounded-2xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-4 top-1/2 -translate-y-1/2 text-green-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Main List Container */}
      <div className="px-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-gray-800">Available Tests</h2>
          {!loading && (
            <span className="text-[10px] font-black text-[#2D5A27] bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest border border-green-100">
              {filteredExams.length} Total
            </span>
          )}
        </div>

        <div className="flex flex-col gap-6 pb-6">
          {loading ? (
            <>
              <ExamCardSkeleton />
              <ExamCardSkeleton />
              <ExamCardSkeleton />
            </>
          ) : filteredExams.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 font-bold text-sm">No results found.</p>
            </div>
          ) : (
            filteredExams.map(exam => {
              const status = getExamStatus(exam);
              return (
                <Card key={exam.id} className="p-6 border-none shadow-lg hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <Badge color={exam.isFree ? 'green' : 'yellow'}>
                      {exam.isFree ? 'Free Access' : `₹${exam.price}`}
                    </Badge>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{exam.category}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{exam.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-6 leading-relaxed">{exam.description}</p>
                  
                  <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 mb-6 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50">
                    <span className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#2D5A27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {exam.duration} Minutes
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-[#2D5A27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {exam.questionIds.length} Questions
                    </span>
                  </div>
                  
                  {status === 'Unlocked' ? (
                    <Button 
                      variant="secondary" 
                      onClick={() => onStartExam(exam.id)} 
                      className="w-full py-4 text-sm font-black shadow-none active:bg-green-600 active:text-white"
                    >
                      LAUNCH TEST
                    </Button>
                  ) : status === 'Pending' ? (
                    <Button variant="outline" disabled className="w-full py-4 text-xs font-black uppercase tracking-widest bg-gray-50 text-gray-300">
                      Waiting for Approval
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleBuy(exam)} 
                      className="w-full py-4 text-sm font-black active:scale-95"
                    >
                      BUY ACCESS
                    </Button>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Payment Sheet/Modal */}
      {buyingExam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-[100] animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-[340px] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 bg-[#2D5A27] text-white text-center">
              <h2 className="text-xl font-black">Secure Checkout</h2>
              <p className="text-green-200 text-[10px] font-bold uppercase tracking-widest mt-1">Bundle: {buyingExam.name}</p>
              <div className="mt-4 inline-block bg-white/20 px-6 py-1.5 rounded-full text-xl font-black">
                ₹{buyingExam.price}
              </div>
            </div>
            <div className="p-6 flex flex-col items-center gap-6">
              <div className="p-2 border-2 border-dashed border-gray-100 rounded-3xl">
                <img src={ADMIN_QR_MOCK} alt="Payment QR" className="w-40 h-40 rounded-2xl shadow-inner" />
              </div>
              <div className="text-center w-full">
                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2">Admin UPI ID</p>
                <div 
                  className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl font-mono text-xs font-black text-gray-700 flex justify-between items-center cursor-pointer active:bg-gray-100 transition-all" 
                  onClick={() => {
                    navigator.clipboard.writeText(ADMIN_UPI_ID);
                    alert("Copied UPI ID!");
                  }}
                >
                  {ADMIN_UPI_ID}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#2D5A27]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="w-full">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">UTR Number (12 digits)</label>
                <Input 
                  placeholder="Enter Transaction ID" 
                  className="py-3.5 text-center text-sm font-mono tracking-widest bg-gray-50 border-gray-100"
                  value={txnId} 
                  onChange={(e) => setTxnId(e.target.value.replace(/\D/g, '').slice(0, 12))} 
                />
              </div>
              <div className="flex flex-col gap-3 w-full">
                <Button className="w-full py-4 text-sm font-black shadow-xl" onClick={submitPayment} disabled={txnId.length < 6 || isSubmittingPayment}>
                  {isSubmittingPayment ? 'VERIFYING...' : 'CONFIRM PAYMENT'}
                </Button>
                <button 
                  className="text-gray-400 text-[10px] font-black uppercase tracking-widest py-2 hover:text-gray-600 active:scale-95 transition-all" 
                  onClick={() => setBuyingExam(null)}
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHome;