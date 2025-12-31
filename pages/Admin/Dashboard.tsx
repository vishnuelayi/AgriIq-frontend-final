import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PaymentRequest, PaymentStatus, Exam, Question } from '../../types';
import { Button, Card, Badge, Input } from '../../components/UI';
import { CATEGORIES } from '../../constants';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState<'payments' | 'exams'>('payments');
  const [loading, setLoading] = useState(true);

  // Wizard State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Exam Info
  const [examMeta, setExamMeta] = useState({
    name: '',
    description: '',
    category: CATEGORIES[0],
    price: 0,
    duration: 30,
    totalMarks: 100,
    negativeMarking: 0.25,
    isFree: false
  });

  // Step 2: Questions Info
  const [questionsList, setQuestionsList] = useState<Omit<Question, 'id'>[]>([]);
  const [currentQ, setCurrentQ] = useState<Omit<Question, 'id'>>({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  useEffect(() => {
    const load = async () => {
      const [ps, es] = await Promise.all([
        api.getAllPayments(),
        api.getExams()
      ]);
      setPayments(ps);
      setExams(es);
      setLoading(false);
    };
    load();
  }, []);

  const resetForm = () => {
    setStep(1);
    setExamMeta({
      name: '',
      description: '',
      category: CATEGORIES[0],
      price: 0,
      duration: 30,
      totalMarks: 100,
      negativeMarking: 0.25,
      isFree: false
    });
    setQuestionsList([]);
    setCurrentQ({ text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' });
  };

  const handleAddQuestion = () => {
    if (!currentQ.text || currentQ.options.some(opt => !opt)) {
      alert("Please fill question and all options.");
      return;
    }
    setQuestionsList([...questionsList, currentQ]);
    setCurrentQ({ text: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' });
  };

  const handleFinalPublish = async () => {
    if (questionsList.length === 0) {
      alert("Add at least one question.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.createExamWithQuestions(examMeta, questionsList);
      const updatedExams = await api.getExams();
      setExams(updatedExams);
      setShowCreateModal(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePayment = async (id: string, status: PaymentStatus) => {
    await api.updatePaymentStatus(id, status);
    const ps = await api.getAllPayments();
    setPayments(ps);
  };

  const stats = {
    revenue: payments.filter(p => p.status === PaymentStatus.APPROVED).reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter(p => p.status === PaymentStatus.PENDING).length,
    approved: payments.filter(p => p.status === PaymentStatus.APPROVED).length,
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-[#2D5A27] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Accessing Admin Vault...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-72 bg-[#1a3a19] text-white p-8 flex flex-col h-screen sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
             <span className="text-[#1a3a19] font-black">AIQ</span>
          </div>
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('payments')}
            className={`w-full text-left px-6 py-4 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === 'payments' ? 'bg-white/10 text-white' : 'text-green-300/60 hover:text-white'}`}
          >
            <div className={`w-2 h-2 rounded-full ${activeTab === 'payments' ? 'bg-green-400' : 'bg-transparent'}`}></div>
            Payments Review
          </button>
          <button 
            onClick={() => setActiveTab('exams')}
            className={`w-full text-left px-6 py-4 rounded-xl font-bold transition-all flex items-center gap-3 ${activeTab === 'exams' ? 'bg-white/10 text-white' : 'text-green-300/60 hover:text-white'}`}
          >
            <div className={`w-2 h-2 rounded-full ${activeTab === 'exams' ? 'bg-green-400' : 'bg-transparent'}`}></div>
            Exam Bundles
          </button>
        </nav>

        <Button variant="outline" onClick={onLogout} className="border-white/20 text-white hover:bg-white/10 mt-auto">Logout</Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 max-w-6xl">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 capitalize tracking-tight">{activeTab} Management</h2>
            <p className="text-gray-500 font-medium">Monitoring Agri IQ Ecosystem</p>
          </div>
          <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
             <Card className="px-5 py-4 flex flex-col border-none shadow-sm bg-white">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Revenue</span>
                <span className="text-lg font-black text-[#2D5A27]">₹{stats.revenue}</span>
             </Card>
             <Card className="px-5 py-4 flex flex-col border-none shadow-sm bg-white">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Pending</span>
                <span className="text-lg font-black text-orange-500">{stats.pending}</span>
             </Card>
             <Card className="px-5 py-4 flex flex-col border-none shadow-sm bg-white">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Approved</span>
                <span className="text-lg font-black text-blue-500">{stats.approved}</span>
             </Card>
          </div>
        </header>

        {activeTab === 'payments' && (
          <div className="space-y-6">
            <Card className="overflow-hidden border-none shadow-xl bg-white rounded-[32px]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead className="bg-gray-50/50">
                    <tr className="border-b border-gray-100">
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Details</th>
                      <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Exam Bundle</th>
                      <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction Ref</th>
                      <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-24 text-center">
                           <p className="font-bold text-gray-500">No payment requests.</p>
                        </td>
                      </tr>
                    )}
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-8 py-5">
                          <p className="font-bold text-gray-900">{p.userName}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: {p.userId.slice(-8)}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="font-semibold text-gray-700 text-sm">{p.examName}</p>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-mono text-xs text-blue-600 font-black">{p.transactionId}</span>
                        </td>
                        <td className="px-6 py-5 font-black text-gray-900">₹{p.amount}</td>
                        <td className="px-6 py-5">
                          <Badge color={p.status === PaymentStatus.APPROVED ? 'green' : p.status === PaymentStatus.REJECTED ? 'red' : 'yellow'}>
                            {p.status}
                          </Badge>
                        </td>
                        <td className="px-8 py-5 text-right">
                          {p.status === PaymentStatus.PENDING && (
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => handleUpdatePayment(p.id, PaymentStatus.APPROVED)} className="px-4 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase">Approve</button>
                              <button onClick={() => handleUpdatePayment(p.id, PaymentStatus.REJECTED)} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase">Deny</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'exams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map(exam => (
              <Card key={exam.id} className="p-6 border-none shadow-lg bg-white rounded-3xl relative flex flex-col">
                <div className="flex justify-between mb-4">
                  <Badge color={exam.isFree ? 'green' : 'blue'}>{exam.category}</Badge>
                  <span className="font-black text-[#2D5A27]">₹{exam.price}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{exam.name}</h3>
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <span>{exam.duration}m • {exam.questionIds.length} Qs</span>
                  <button className="text-[#2D5A27] hover:underline">Edit</button>
                </div>
              </Card>
            ))}
            
            <button 
              onClick={() => { resetForm(); setShowCreateModal(true); }}
              className="border-2 border-dashed border-gray-200 bg-white rounded-3xl p-8 flex flex-col items-center justify-center text-gray-400 hover:border-[#2D5A27] hover:text-[#2D5A27] transition-all min-h-[200px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-black uppercase tracking-widest text-[10px]">Create Exam</span>
            </button>
          </div>
        )}
      </div>

      {/* Simplified Create Exam Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <Card className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                  {step === 1 ? 'Step 1: Exam Details' : 'Step 2: Add Questions'}
                </h3>
                <div className="flex gap-2 mt-2">
                  <div className={`h-1.5 w-12 rounded-full transition-all ${step === 1 ? 'bg-[#2D5A27]' : 'bg-green-100'}`}></div>
                  <div className={`h-1.5 w-12 rounded-full transition-all ${step === 2 ? 'bg-[#2D5A27]' : 'bg-green-100'}`}></div>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Step 1: Meta Info */}
            {step === 1 && (
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Exam Name</label>
                    <Input 
                      placeholder="e.g. ICAR Mock Test 1" 
                      value={examMeta.name}
                      onChange={e => setExamMeta({...examMeta, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2D5A27] font-bold"
                      value={examMeta.category}
                      onChange={e => setExamMeta({...examMeta, category: e.target.value})}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Short Description</label>
                    <textarea 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2D5A27] font-medium text-sm"
                      placeholder="Describe the syllabus covered..."
                      rows={2}
                      value={examMeta.description}
                      onChange={e => setExamMeta({...examMeta, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Duration (Mins)</label>
                    <Input 
                      type="number"
                      value={examMeta.duration}
                      onChange={e => setExamMeta({...examMeta, duration: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label>
                    <Input 
                      type="number"
                      value={examMeta.price}
                      onChange={e => setExamMeta({...examMeta, price: Number(e.target.value), isFree: Number(e.target.value) === 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Marks</label>
                    <Input 
                      type="number"
                      value={examMeta.totalMarks}
                      onChange={e => setExamMeta({...examMeta, totalMarks: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Negative Marking</label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={examMeta.negativeMarking}
                      onChange={e => setExamMeta({...examMeta, negativeMarking: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-50 flex justify-end">
                  <Button 
                    onClick={() => setStep(2)} 
                    disabled={!examMeta.name || !examMeta.description}
                    className="px-10"
                  >
                    Next: Add Questions
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Manually Add Questions */}
            {step === 2 && (
              <div className="flex-1 overflow-y-auto p-8 flex flex-col">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Left: Input Form */}
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-[#2D5A27] uppercase tracking-[0.2em] mb-4 flex justify-between items-center">
                      <span>Add Question #{questionsList.length + 1}</span>
                    </h4>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Question Text</label>
                      <textarea 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2D5A27] font-bold"
                        placeholder="Enter the question here..."
                        rows={2}
                        value={currentQ.text}
                        onChange={e => setCurrentQ({...currentQ, text: e.target.value})}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Options & Answer</label>
                      {currentQ.options.map((opt, i) => (
                        <div key={i} className="flex gap-3 items-center">
                          <button 
                            type="button"
                            onClick={() => setCurrentQ({...currentQ, correctAnswer: i})}
                            className={`w-10 h-10 flex-shrink-0 rounded-xl border-2 font-black transition-all ${currentQ.correctAnswer === i ? 'bg-[#2D5A27] border-[#2D5A27] text-white' : 'bg-gray-50 border-gray-100 text-gray-300'}`}
                          >
                            {String.fromCharCode(65 + i)}
                          </button>
                          <Input 
                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                            className="bg-gray-50/50 border-gray-100"
                            value={opt}
                            onChange={e => {
                              const newOpts = [...currentQ.options];
                              newOpts[i] = e.target.value;
                              setCurrentQ({...currentQ, options: newOpts});
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Explanation (Optional)</label>
                      <textarea 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2D5A27] text-xs font-medium"
                        placeholder="Explain why the answer is correct..."
                        rows={2}
                        value={currentQ.explanation}
                        onChange={e => setCurrentQ({...currentQ, explanation: e.target.value})}
                      />
                    </div>

                    <Button onClick={handleAddQuestion} variant="outline" className="w-full border-dashed border-2 py-4">
                      + Add to Exam
                    </Button>
                  </div>

                  {/* Right: Preview List */}
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center bg-[#2D5A27] text-white p-4 rounded-2xl shadow-lg">
                       <span className="text-[10px] font-black uppercase tracking-widest">Questions in Bundle</span>
                       <Badge color="green">{questionsList.length}</Badge>
                    </div>
                    
                    <div className="flex-1 bg-gray-50 rounded-[32px] p-4 border border-gray-100 overflow-y-auto max-h-[400px] space-y-3">
                      {questionsList.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50 py-20">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em]">List is Empty</p>
                        </div>
                      ) : (
                        questionsList.map((q, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start gap-3">
                             <div>
                               <p className="text-xs font-black text-gray-900 leading-snug">{idx + 1}. {q.text}</p>
                               <div className="flex gap-2 mt-2">
                                 {q.options.map((_, oi) => (
                                   <div key={oi} className={`w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-black ${q.correctAnswer === oi ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                     {String.fromCharCode(65 + oi)}
                                   </div>
                                 ))}
                               </div>
                             </div>
                             <button onClick={() => setQuestionsList(questionsList.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                               </svg>
                             </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Final Footer */}
                <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between items-center">
                  <button onClick={() => setStep(1)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#2D5A27]">Back to Step 1</button>
                  <Button 
                    onClick={handleFinalPublish} 
                    disabled={questionsList.length === 0 || isSubmitting}
                    className="px-12 shadow-xl shadow-green-900/10"
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish Exam Bundle'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;