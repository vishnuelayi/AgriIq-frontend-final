
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
    setLoading(true);
    setError(null);
    try {
      const user = await api.adminLogin(username, password);
      onLogin(user);
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a3a19] flex flex-col p-6 items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-4">
             <span className="text-[#1a3a19] font-black text-xl">AIQ</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Control</h1>
          <p className="text-green-300/60 mt-1 font-medium text-sm">Administrator Access Only</p>
        </div>

        <Card className="p-8 border-none shadow-2xl bg-white">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Admin ID</label>
              <Input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Security Key</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-3 pt-2">
              <Button type="submit" className="w-full" disabled={!username || !password || loading}>
                {loading ? 'Verifying...' : 'Authorize Access'}
              </Button>
              <button 
                type="button" 
                onClick={onBack}
                className="w-full text-center text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-600 transition-colors"
              >
                Back to Landing
              </button>
            </div>
          </form>
        </Card>
        
        <p className="text-center text-green-300/30 text-[10px] mt-12 font-mono uppercase tracking-[0.2em]">
          Encrypted Session Active
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
