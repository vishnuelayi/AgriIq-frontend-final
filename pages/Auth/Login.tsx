import React, { useState } from 'react';
import { User } from '../../types';
import { api } from '../../services/api';
import { Button, Input, Card } from '../../components/UI';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setStep(2);
      setLoading(false);
    }, 1000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await api.login(phone);
      onLogin(user);
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6 items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-50 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange-50 rounded-full blur-[100px]"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-12">
          <div className="w-24 h-24 bg-[#2D5A27] rounded-[32px] flex items-center justify-center shadow-2xl shadow-green-900/20 mb-8 transform transition-transform hover:scale-105 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Agri IQ</h1>
          <p className="text-gray-500 mt-2 font-bold uppercase tracking-widest text-xs">Harvesting Future Experts</p>
        </div>

        <Card className="p-10 md:p-12 border-none shadow-3xl bg-white rounded-[40px]">
          <h2 className="text-2xl font-black text-gray-800 mb-8">{step === 1 ? 'Get Started' : 'Security Check'}</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-black rounded-2xl border border-red-100 text-center animate-shake">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Mobile Number</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black group-focus-within:text-[#2D5A27] transition-colors">+91</span>
                  <Input 
                    type="tel" 
                    placeholder="Enter 10 digit number" 
                    className="pl-16 py-4 text-lg font-bold bg-gray-50/50 border-gray-100 focus:bg-white" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full py-5 text-lg rounded-2xl shadow-xl shadow-green-900/10" disabled={phone.length < 10 || loading}>
                {loading ? 'Processing...' : 'Verify Number'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Verification Code</label>
                <Input 
                  type="text" 
                  placeholder="Enter 6-digit OTP" 
                  maxLength={6}
                  className="py-4 text-center text-3xl font-black tracking-[0.5em] bg-gray-50/50 border-gray-100 focus:bg-white"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
                <div className="flex justify-between items-center mt-4">
                  <p className="text-xs text-gray-400 font-bold tracking-tight">Sent to <span className="text-gray-800">+91 {phone}</span></p>
                  <button type="button" onClick={() => setStep(1)} className="text-[#2D5A27] text-xs font-black uppercase tracking-widest hover:underline">Change</button>
                </div>
              </div>
              <Button type="submit" className="w-full py-5 text-lg rounded-2xl shadow-xl shadow-green-900/10" disabled={otp.length < 4 || loading}>
                {loading ? 'Authorizing...' : 'Log In Now'}
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-gray-400 text-sm mt-12 font-medium">
          Secure, encrypted login powered by Agri IQ
        </p>
      </div>
    </div>
  );
};

export default Login;