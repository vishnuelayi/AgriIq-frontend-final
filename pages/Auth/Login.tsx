
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
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setLoading(true);
    setTimeout(() => {
      setStep(2);
      setLoading(false);
    }, 1000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await api.login(phone);
      onLogin(user);
    } catch (err) {
      alert("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-[#2D5A27] rounded-3xl flex items-center justify-center shadow-2xl shadow-green-200 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Agri IQ</h1>
          <p className="text-gray-500 mt-2 font-medium">Excellence in Agricultural Studies</p>
        </div>

        <Card className="p-8 border-none shadow-xl bg-gray-50/50">
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">+91</span>
                  <Input 
                    type="tel" 
                    placeholder="Enter 10 digit number" 
                    className="pl-14" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={phone.length < 10 || loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Verification Code</label>
                <Input 
                  type="text" 
                  placeholder="Enter 6-digit OTP" 
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">Sent to {phone} <button type="button" onClick={() => setStep(1)} className="text-[#2D5A27] font-bold">Edit</button></p>
              </div>
              <Button type="submit" className="w-full" disabled={otp.length < 4 || loading}>
                {loading ? 'Verifying...' : 'Login Now'}
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-gray-400 text-sm mt-12">
          By continuing, you agree to our <br/>
          <span className="font-semibold text-gray-600 underline">Terms of Service</span> and <span className="font-semibold text-gray-600 underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
