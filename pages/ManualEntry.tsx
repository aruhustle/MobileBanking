
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { AtSign, User, IndianRupee, MessageSquare } from 'lucide-react';
import { UPIData } from '../types';

export const ManualEntry: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [vpa, setVpa] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (location.state) {
        const { initialVpa, initialName, initialAmount } = location.state as any;
        if (initialVpa) setVpa(initialVpa);
        if (initialName) setName(initialName);
        if (initialAmount) setAmount(initialAmount);
    }
  }, [location.state]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Stricter VPA validation: alphanumeric, dots, hyphens, underscores, @ symbol, no spaces
    const vpaRegex = /^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+$/;
    
    if (!vpa) {
      newErrors.vpa = 'UPI ID is required';
    } else if (!vpaRegex.test(vpa)) {
      newErrors.vpa = 'Invalid UPI ID format (e.g. name@bank)';
    }

    if (!amount) {
       newErrors.amount = 'Amount is required';
    } else {
       const numAmount = parseFloat(amount);
       if (isNaN(numAmount) || numAmount <= 0) {
         newErrors.amount = 'Amount must be a valid positive number';
       }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const paymentData: UPIData = {
      pa: vpa,
      pn: name || vpa, // Use VPA as name if name not provided
      am: amount || null,
      tn: note || null,
      tr: null,
      mc: null,
      rawUri: `upi://pay?pa=${vpa}&pn=${name}&am=${amount}&tn=${note}`
    };

    navigate('/confirm', { state: { data: paymentData } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showBack title="New Payment" />
      
      <div className="flex-1 p-4 pt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          
          {/* VPA Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">UPI ID</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <AtSign size={18} />
              </div>
              <input
                type="text"
                value={vpa}
                onChange={(e) => {
                  setVpa(e.target.value);
                  if(errors.vpa) setErrors({...errors, vpa: ''});
                }}
                placeholder="mobile@upi"
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-gray-900 focus:outline-none focus:ring-2 transition-all ${errors.vpa ? 'focus:ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
              />
            </div>
            {errors.vpa && <p className="text-xs text-red-500 ml-1">{errors.vpa}</p>}
          </div>

          {/* Name Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Name (Optional)</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Recipient Name"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <IndianRupee size={18} />
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                    setAmount(e.target.value);
                    if (errors.amount) setErrors({...errors, amount: ''});
                }}
                placeholder="0.00"
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-gray-900 focus:outline-none focus:ring-2 transition-all ${errors.amount ? 'focus:ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
              />
            </div>
            {errors.amount && <p className="text-xs text-red-500 ml-1">{errors.amount}</p>}
          </div>

          {/* Note Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Note</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <MessageSquare size={18} />
              </div>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's this for?"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button fullWidth onClick={handleSubmit}>
              Verify & Pay
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};
