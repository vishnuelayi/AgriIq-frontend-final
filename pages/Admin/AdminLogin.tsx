import React, { useState } from 'react';
import { User } from '../../types';
import { api } from '../../services/api';
import { Button, Input, Card } from '../../components/UI';

interface AdminLoginProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setLoading(true);
    setError(null);
    try {
      const user = await api.adminLogin(username, password);
      onLogin(user);
    } catch (err) {
      setError("Authorization Failed: Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a3a19] flex flex-col p-8 items-center justify-center relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-green-900/40 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-black/20 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-6 transform hover:rotate-6 transition-transform">
             <span className="text-[#1a3a19] font-black text-2xl">IQ</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Terminal Login</h1>
          <p className="text-green-400/50 mt-2 font-black uppercase tracking-[0.2em] text-[10px]">Secure Gateway Protocol</p>
        </div>

        <Card className="p-8 border-none shadow-3xl bg-white rounded-[32px]">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-100 text-center animate-pulse">
              {error}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Administrator ID</label>
              <Input 
                type="text" 
                placeholder="Username" 
                className="bg-gray-50 border-gray-100 py-3.5 font-bold"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Passkey</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="bg-gray-50 border-gray-100 py-3.5 font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-4 pt-4">
              <Button 
                type="submit" 
                className="w-full py-4 text-sm font-black uppercase tracking-widest shadow-xl shadow-green-900/20" 
                disabled={!username || !password || loading}
              >
                {loading ? 'AUTHENTICATING...' : 'ESTABLISH LINK'}
              </Button>
              
              <button 
                type="button" 
                onClick={onBack}
                className="w-full text-center text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-600 active:scale-95 transition-all py-2"
              >
                Abort & Return
              </button>
            </div>
          </form>
        </Card>
        
        <div className="mt-12 flex flex-col items-center gap-3">
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse delay-75"></div>
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse delay-150"></div>
          </div>
          <p className="text-green-400/30 text-[9px] font-mono uppercase tracking-[0.3em]">
            AES-256 Encrypted Session
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;