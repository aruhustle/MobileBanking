
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { registerUser } from '../utils/authManager';
import { User, Lock, Phone, AtSign } from 'lucide-react';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = () => {
    if (!name || !phone || !password) {
      setError('All fields are required');
      return;
    }

    if (phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    const success = registerUser({
      id: phone, // Use phone as ID
      password,
      name,
      phone,
      vpa: `${phone}@hdfc`
    });

    if (success) {
      navigate('/');
    } else {
      setError('User already exists with this phone number');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center p-6">
      <div className="mb-10 text-center">
        <div className="w-48 mx-auto mb-6">
           <img src="https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg" alt="HDFC Bank" className="w-full h-auto object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-500 mt-2">Join HDFC Bank for seamless UPI payments</p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-100">
          <User className="text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="bg-transparent w-full outline-none text-gray-900 placeholder-gray-400"
          />
        </div>

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
            placeholder="Set Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-transparent w-full outline-none text-gray-900 placeholder-gray-400"
          />
        </div>
        
        <div className="bg-blue-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-blue-100">
          <AtSign className="text-blue-400" size={20} />
          <div className="flex flex-col">
            <span className="text-xs text-blue-600 font-semibold uppercase">Your HDFC ID</span>
            <span className="text-sm font-medium text-blue-800">{phone ? `${phone}@hdfc` : 'mobile@hdfc'}</span>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-center mt-4 text-sm">{error}</p>}

      <div className="mt-8 space-y-4">
        <Button fullWidth onClick={handleSignup} className="bg-blue-800 hover:bg-blue-900">Sign Up</Button>
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Already have an account? <button onClick={() => navigate('/login')} className="text-blue-800 font-semibold">Login</button>
          </p>
        </div>
      </div>
    </div>
  );
};
