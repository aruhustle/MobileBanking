
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { loginUser } from '../utils/authManager';
import { Lock, Phone } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!phone || !password) {
      setError('Please enter details');
      return;
    }

    const success = loginUser(phone, password);

    if (success) {
      navigate('/');
    } else {
      setError('Invalid Credentials');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center p-6">
      <div className="mb-10 text-center">
        <div className="w-48 mx-auto mb-6">
           <img src="https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg" alt="HDFC Bank" className="w-full h-auto object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-500 mt-2">Login to your HDFC Bank account</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-100">
          <Phone className="text-gray-400" size={20} />
          <input 
            type="number" 
            placeholder="Mobile Number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="bg-transparent w-full outline-none text-gray-900 placeholder-gray-400"
          />
        </div>

        <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-100">
          <Lock className="text-gray-400" size={20} />
          <input 
            type="password" 
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-transparent w-full outline-none text-gray-900 placeholder-gray-400"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-center mt-4 text-sm">{error}</p>}

      <div className="mt-8 space-y-4">
        <Button fullWidth onClick={handleLogin} className="bg-blue-800 hover:bg-blue-900">Login</Button>
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Don't have an account? <button onClick={() => navigate('/signup')} className="text-blue-800 font-semibold">Sign Up</button>
          </p>
        </div>
      </div>
    </div>
  );
};
