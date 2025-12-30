
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PaymentRequest, PaymentStatus, User, Exam, Question } from '../../types';
import { Button, Card, Badge, Input } from '../../components/UI';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'payments' | 'exams' | 'questions'>('payments');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const ps = await api.getAllPayments();
      const es = await api.getExams();
      setPayments(ps);
      setExams(es);
      setLoading(false);
    };
    load();
  }, []);

  const handleUpdatePayment = async (id: string, status: PaymentStatus) => {
    await api.updatePaymentStatus(id, status);
    const ps = await api.getAllPayments();
    setPayments(ps);
  };

  if (loading) return <div>Loading Admin...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-72 bg-[#1a3a19] text-white p-8 flex flex-col">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
             <span className="text-[#1a3a19] font-black">AIQ</span>
          </div>
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('payments')}
            className={`w-full text-left px-6 py-4 rounded-xl font-bold transition-all ${activeTab === 'payments' ? 'bg-white/10 text-white' : 'text-green-300/60 hover:text-white'}`}
          >
            Payments Review
          </button>
          <button 
            onClick={() => setActiveTab('exams')}
            className={`w-full text-left px-6 py-4 rounded-xl font-bold transition-all ${activeTab === 'exams' ? 'bg-white/10 text-white' : 'text-green-300/60 hover:text-white'}`}
          >
            Exam Bundles
          </button>
          <button 
            onClick={() => setActiveTab('questions')}
            className={`w-full text-left px-6 py-4 rounded-xl font-bold transition-all ${activeTab === 'questions' ? 'bg-white/10 text-white' : 'text-green-300/60 hover:text-white'}`}
          >
            Question Bank
          </button>
        </nav>

        <Button variant="outline" onClick={onLogout} className="border-white/20 text-white hover:bg-white/10 mt-auto">Logout</Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 max-w-6xl">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 capitalize">{activeTab.replace('_', ' ')} Management</h2>
            <p className="text-gray-500 font-medium">Monitoring Agri IQ Ecosystem</p>
          </div>
          <div className="flex gap-4">
             <Card className="px-6 py-3 flex flex-col border-none shadow-sm">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Revenue</span>
                <span className="text-xl font-bold text-[#2D5A27]">₹{payments.filter(p => p.status === PaymentStatus.APPROVED).reduce((sum, p) => sum + p.amount, 0)}</span>
             </Card>
             <Card className="px-6 py-3 flex flex-col border-none shadow-sm">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Requests</span>
                <span className="text-xl font-bold text-orange-500">{payments.filter(p => p.status === PaymentStatus.PENDING).length}</span>
             </Card>
          </div>
        </header>

        {activeTab === 'payments' && (
          <div className="space-y-6">
            <Card className="overflow-hidden border-none shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Student</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Exam</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Transaction ID</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold">No payment requests found.</td></tr>
                  )}
                  {payments.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-800">{p.userName}</p>
                        <p className="text-xs text-gray-400">ID: {p.userId}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">{p.examName}</td>
                      <td className="px-6 py-4 font-mono text-xs text-blue-500 font-bold">{p.transactionId}</td>
                      <td className="px-6 py-4 font-bold text-gray-800">₹{p.amount}</td>
                      <td className="px-6 py-4">
                        <Badge color={p.status === PaymentStatus.APPROVED ? 'green' : p.status === PaymentStatus.REJECTED ? 'red' : 'yellow'}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {p.status === PaymentStatus.PENDING && (
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleUpdatePayment(p.id, PaymentStatus.APPROVED)} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-green-200">Approve</button>
                            <button onClick={() => handleUpdatePayment(p.id, PaymentStatus.REJECTED)} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-red-200">Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {activeTab === 'exams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map(exam => (
              <Card key={exam.id} className="p-6 border-none shadow-lg">
                <div className="flex justify-between mb-4">
                  <Badge color={exam.isFree ? 'green' : 'blue'}>{exam.category}</Badge>
                  <span className="font-bold text-[#2D5A27]">₹{exam.price}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-6">{exam.description}</p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                   <div className="flex gap-3 text-xs font-bold text-gray-400">
                      <span>{exam.duration}m</span>
                      <span>{exam.questionIds.length} Qs</span>
                   </div>
                   <button className="text-[#2D5A27] font-bold text-sm">Edit Bundle</button>
                </div>
              </Card>
            ))}
            <button className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-[#2D5A27] hover:text-[#2D5A27] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-bold uppercase tracking-widest text-xs">Create New Exam</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
