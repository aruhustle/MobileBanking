
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Landmark, User, Hash, FileText } from 'lucide-react';
import { UPIData } from '../types';

export const BankTransfer: React.FC = () => {
  const navigate = useNavigate();
  const [accNo, setAccNo] = useState('');
  const [confirmAccNo, setConfirmAccNo] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!accNo) newErrors.accNo = 'Account number is required';
    else if (!/^\d{9,18}$/.test(accNo)) newErrors.accNo = 'Invalid account number format';

    if (accNo !== confirmAccNo) newErrors.confirmAccNo = 'Account numbers do not match';

    if (!ifsc) newErrors.ifsc = 'IFSC code is required';
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase())) newErrors.ifsc = 'Invalid IFSC format (e.g., HDFC0001234)';

    if (!name) newErrors.name = 'Beneficiary name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // We structure this as UPIData but include the extra bankDetails
    // The ConfirmPayment page will detect 'bankDetails' and render accordingly.
    const paymentData: UPIData = {
      pa: `${accNo}@${ifsc}`, // Virtual VPA for internal tracking
      pn: name,
      am: null, // Amount collected on next screen
      tn: null,
      tr: null,
      mc: null,
      rawUri: '',
      bankDetails: {
        accNo,
        ifsc: ifsc.toUpperCase()
      }
    };

    navigate('/confirm', { state: { data: paymentData } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showBack title="To Bank Account" />
      
      <div className="flex-1 p-4 pt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          
          {/* Account Number */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Number</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Hash size={18} />
              </div>
              <input
                type="password"
                value={accNo}
                onChange={(e) => {
                  setAccNo(e.target.value);
                  if(errors.accNo) setErrors({...errors, accNo: ''});
                }}
                placeholder="Enter Account Number"
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-gray-900 focus:outline-none focus:ring-2 transition-all ${errors.accNo ? 'focus:ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
              />
            </div>
            {errors.accNo && <p className="text-xs text-red-500 ml-1">{errors.accNo}</p>}
          </div>

          {/* Confirm Account Number */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Re-enter Account No.</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Hash size={18} />
              </div>
              <input
                type="text"
                value={confirmAccNo}
                onChange={(e) => {
                  setConfirmAccNo(e.target.value);
                  if(errors.confirmAccNo) setErrors({...errors, confirmAccNo: ''});
                }}
                placeholder="Confirm Account Number"
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-gray-900 focus:outline-none focus:ring-2 transition-all ${errors.confirmAccNo ? 'focus:ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
              />
            </div>
            {errors.confirmAccNo && <p className="text-xs text-red-500 ml-1">{errors.confirmAccNo}</p>}
          </div>

          {/* IFSC */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">IFSC Code</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Landmark size={18} />
              </div>
              <input
                type="text"
                value={ifsc}
                onChange={(e) => {
                  setIfsc(e.target.value);
                  if(errors.ifsc) setErrors({...errors, ifsc: ''});
                }}
                placeholder="e.g. HDFC0001234"
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-gray-900 focus:outline-none focus:ring-2 uppercase transition-all ${errors.ifsc ? 'focus:ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
              />
            </div>
            {errors.ifsc && <p className="text-xs text-red-500 ml-1">{errors.ifsc}</p>}
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Beneficiary Name</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Account Holder Name"
                className={`w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-gray-900 focus:outline-none focus:ring-2 transition-all ${errors.name ? 'focus:ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name}</p>}
          </div>

          <div className="pt-4">
            <Button fullWidth onClick={handleSubmit}>
              Proceed
            </Button>
          </div>

          <p className="text-xs text-center text-gray-400">
            Ensure details are correct. Transfers to wrong accounts cannot be reversed.
          </p>
        </div>
      </div>
    </div>
  );
};
