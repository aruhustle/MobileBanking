
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UPIData, Transaction } from '../types';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { CheckCircle2, Building2, MessageSquare, Lock, X, AlertCircle, ChevronRight, Fingerprint, ScanFace, Landmark, MapPin } from 'lucide-react';
import { saveTransaction } from '../utils/historyManager';
import { deductBalance, getCurrentUser } from '../utils/authManager';

export const ConfirmPayment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.data as UPIData | undefined;

  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorPopup, setErrorPopup] = useState<string | null>(null);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  
  // PIN & Biometric Logic
  const [showPinPad, setShowPinPad] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const [pinError, setPinError] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!data) {
      navigate('/');
      return;
    }
    if (data.am) {
      setAmount(data.am);
    }
    if (data.tn) {
      setNote(data.tn);
    }

    // Check for biometric availability
    const isBiometricEnabled = localStorage.getItem('hdfc_biometric') === 'true';
    
    if (isBiometricEnabled) {
        if (window.PublicKeyCredential) {
        window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
            .then(available => setBiometricAvailable(available || true)) // Defaulting to true for demo if API exists
            .catch(() => setBiometricAvailable(true)); // Fallback for demo
        }
    } else {
        setBiometricAvailable(false);
    }
  }, [data, navigate]);

  const triggerHaptic = (type: 'success' | 'error' | 'light') => {
      if (!navigator.vibrate) return;
      switch (type) {
          case 'success': navigator.vibrate([50, 50, 50]); break;
          case 'error': navigator.vibrate([100, 50, 100]); break;
          case 'light': navigator.vibrate(20); break;
      }
  };

  const handlePayClick = () => {
    triggerHaptic('light');
    
    // 1. Amount Validation
    if (!amount || parseFloat(amount) <= 0) {
      setErrorPopup("Please enter a valid amount greater than ₹0");
      triggerHaptic('error');
      return;
    }
    
    // 2. VPA Validation (Skip if Bank Transfer)
    const vpaRegex = /^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+$/;
    if (!data?.bankDetails && (!data?.pa || !vpaRegex.test(data.pa))) {
        setErrorPopup("Invalid UPI ID (VPA) detected. Please check the recipient details.");
        triggerHaptic('error');
        return;
    }

    // 3. Balance Validation
    const user = getCurrentUser();
    if (user) {
        const currentBalance = user.balance;
        const payAmount = parseFloat(amount);
        if (currentBalance < payAmount) {
            setErrorPopup(`Insufficient balance! Available: ₹${currentBalance.toLocaleString('en-IN')}`);
            triggerHaptic('error');
            return;
        }
    } else {
        navigate('/login');
        return;
    }

    // All checks passed - Show Confirmation Modal first
    setShowConfirmationModal(true);
  };

  const handleConfirmModal = () => {
    setShowConfirmationModal(false);
    setShowPinPad(true);
    // Focus first input after a short delay for animation
    setTimeout(() => pinInputRefs.current[0]?.focus(), 100);
  };

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow 1 char
    
    triggerHaptic('light');
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setPinError(false);

    // Auto-advance
    if (value && index < 3) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    }
  };

  const verifyPinAndPay = () => {
    const enteredPin = pin.join('');
    if (enteredPin.length !== 4) return;

    setIsProcessing(true);

    if (enteredPin === '1809') {
      // Success simulation
      setTimeout(() => {
        triggerHaptic('success');
        completePayment('SUCCESS');
      }, 1500);
    } else {
      // Failure simulation
      setTimeout(() => {
        setIsProcessing(false);
        setPinError(true);
        setPin(['', '', '', '']);
        pinInputRefs.current[0]?.focus();
        triggerHaptic('error');
      }, 1000);
    }
  };

  const handleBiometricAuth = () => {
      setIsBiometricScanning(true);
      // Simulate Biometric Delay
      setTimeout(() => {
          triggerHaptic('success');
          completePayment('SUCCESS');
      }, 2000);
  };

  const completePayment = (status: 'SUCCESS' | 'FAILURE') => {
    if (!data) return;

    const txnId = "TXN" + Math.floor(Math.random() * 10000000000).toString();
    const utr = "UTR" + Math.floor(Math.random() * 1000000000000).toString();

    const transactionData: Transaction = {
      id: crypto.randomUUID(),
      pa: data.pa || '',
      pn: data.pn || 'Unknown',
      am: amount,
      tn: note || null,
      date: new Date().toISOString(),
      status: status,
      txnRef: txnId,
      utr: utr,
      mc: data.mc || null,
      bankDetails: data.bankDetails
    };

    saveTransaction(transactionData);

    // Deduct balance if success
    if (status === 'SUCCESS') {
      deductBalance(parseFloat(amount));
    }

    navigate('/result', { 
      state: { 
        transaction: transactionData
      } 
    });
  };

  if (!data) return null;

  const isAmountFixed = !!data.am;
  const isBankTransfer = !!data.bankDetails;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header showBack title="Pay" />
      
      <div className="flex-1 p-6 flex flex-col items-center pt-10 relative">
        
        {/* Payee Info */}
        <div className="text-center mb-8 animate-fade-in w-full">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-700 font-bold text-3xl shadow-sm">
             {isBankTransfer ? <Landmark size={40} /> : (data.pn || data.pa || '?').charAt(0).toUpperCase()}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 truncate max-w-xs mx-auto">{data.pn || 'Unknown Merchant'}</h2>
          
          {isBankTransfer ? (
            <div className="mt-1 flex flex-col items-center">
               <p className="text-gray-500 text-sm font-mono">A/c: {data.bankDetails?.accNo}</p>
               <p className="text-gray-400 text-xs font-mono">{data.bankDetails?.ifsc}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
                <p className="text-gray-500 text-sm mt-1 font-mono">{data.pa}</p>
                {data.merchantDetails?.city && (
                    <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
                        <MapPin size={12} />
                        <span>{data.merchantDetails.city}, {data.merchantDetails.country || 'IN'}</span>
                    </div>
                )}
            </div>
          )}
          
          <div className="mt-3 flex items-center justify-center gap-1 text-green-600 text-xs font-medium bg-green-50 py-1 px-3 rounded-full inline-flex border border-green-100">
            <CheckCircle2 size={14} />
            <span>Verified {isBankTransfer ? 'Account' : 'Merchant'}</span>
          </div>
        </div>

        {/* Amount Input */}
        <div className="w-full max-w-xs mb-8 relative">
           <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-800 font-bold text-4xl">₹</div>
           <input
             type="number"
             value={amount}
             readOnly={isAmountFixed}
             onChange={(e) => setAmount(e.target.value)}
             placeholder="0"
             className={`w-full bg-transparent text-center text-5xl font-bold text-gray-900 focus:outline-none placeholder-gray-300 ${isAmountFixed ? 'cursor-default' : ''}`}
             autoFocus={!isAmountFixed}
           />
           {isAmountFixed && <p className="text-center text-xs text-gray-400 mt-2">Amount set by merchant</p>}
           {!isAmountFixed && (!amount || parseFloat(amount) <= 0) && (
             <p className="text-center text-xs text-red-500 mt-2 absolute w-full">Please enter a valid amount</p>
           )}
        </div>

        {/* Note Input */}
        <div className="w-full max-w-xs mb-8">
           <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 border border-transparent focus-within:border-blue-500 focus-within:bg-blue-50 transition-colors">
              <MessageSquare size={20} className="text-gray-500" />
              <input 
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note for this payment"
                className="bg-transparent border-none focus:outline-none text-sm w-full text-gray-700 placeholder-gray-400"
              />
           </div>
        </div>

        {/* Bank Selector */}
        <div className="w-full max-w-xs mb-auto">
           <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border border-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg" 
                          alt="HDFC" 
                          className="w-full h-full object-cover object-left" 
                        />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-gray-800">HDFC Bank **** 8899</p>
                        <p className="text-xs text-gray-500">Savings Account</p>
                    </div>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-blue-700 p-0.5">
                    <div className="w-full h-full bg-blue-700 rounded-full"></div>
                </div>
           </div>
           
           {/* View Details Button */}
           <div className="text-right mt-2">
              <button 
                 onClick={() => setShowBankDetails(true)}
                 className="text-xs font-medium text-blue-700 hover:text-blue-800 inline-flex items-center gap-1"
              >
                 View Details <ChevronRight size={12} />
              </button>
           </div>
        </div>

        {/* Pay Button */}
        <div className="w-full max-w-xs mt-6 mb-4">
           <Button 
             fullWidth 
             onClick={handlePayClick} 
             disabled={!amount || parseFloat(amount) <= 0}
             className="bg-blue-800 hover:bg-blue-900 shadow-lg shadow-blue-800/20"
           >
             Proceed to Pay ₹{amount || '0'}
           </Button>
        </div>
        
        <div className="text-center pb-4">
           <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
             <Lock size={10} /> Processed securely via HDFC Bank.
           </p>
        </div>
      </div>

      {/* Error Popup Modal */}
      {errorPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center shadow-xl">
             <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
               <AlertCircle size={28} />
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-2">Whoops!</h3>
             <p className="text-sm text-gray-600 mb-6 leading-relaxed">
               {errorPopup}
             </p>
             <Button fullWidth onClick={() => setErrorPopup(null)} className="bg-red-600 hover:bg-red-700">
               Dismiss
             </Button>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl">
             <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Confirm Payment</h3>
             
             <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                   <p className="text-xs text-gray-500 uppercase font-semibold">Payee</p>
                   <p className="text-sm font-bold text-gray-900 truncate">{data.pn || 'Unknown'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                   <p className="text-xs text-gray-500 uppercase font-semibold">{isBankTransfer ? 'Account Details' : 'UPI ID'}</p>
                   {isBankTransfer ? (
                       <p className="text-xs font-mono text-gray-600 break-all">
                           {data.bankDetails?.accNo}<br/>
                           <span className="text-gray-400">{data.bankDetails?.ifsc}</span>
                       </p>
                   ) : (
                       <div>
                           <p className="text-xs font-mono text-gray-600 break-all">{data.pa}</p>
                           {data.merchantDetails?.city && (
                               <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                   <MapPin size={10} /> {data.merchantDetails.city}
                               </p>
                           )}
                       </div>
                   )}
                </div>
                <div className="bg-blue-50 p-3 rounded-xl space-y-1 text-center border border-blue-100">
                   <p className="text-xs text-blue-600 uppercase font-semibold">Amount</p>
                   <p className="text-2xl font-bold text-blue-800">₹{amount}</p>
                </div>
             </div>

             <div className="flex gap-3">
                <Button 
                  fullWidth 
                  variant="secondary" 
                  onClick={() => setShowConfirmationModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-none"
                >
                  Cancel
                </Button>
                <Button 
                  fullWidth 
                  onClick={handleConfirmModal}
                  className="bg-blue-800 hover:bg-blue-900"
                >
                  Confirm
                </Button>
             </div>
          </div>
        </div>
      )}

      {/* Bank Details Modal */}
      {showBankDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-xl relative">
             <button onClick={() => setShowBankDetails(false)} className="absolute right-4 top-4 text-gray-400"><X size={20}/></button>
             
             <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <Building2 size={20} className="text-blue-700"/> Account Details
             </h3>
             
             <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Bank Name</span>
                    <span className="font-medium text-gray-800">HDFC Bank Ltd</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Account No.</span>
                    <span className="font-medium text-gray-800">50100239918899</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">IFSC Code</span>
                    <span className="font-medium text-gray-800">HDFC0000123</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Branch</span>
                    <span className="font-medium text-gray-800">Mumbai Central</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-500">Type</span>
                    <span className="font-medium text-gray-800">Savings</span>
                </div>
             </div>

             <div className="mt-6">
                <Button fullWidth onClick={() => setShowBankDetails(false)} variant="secondary">Close</Button>
             </div>
          </div>
        </div>
      )}

      {/* UPI PIN / Biometric Overlay */}
      {showPinPad && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-end animate-fade-in">
          <div className="bg-white rounded-t-3xl p-6 pb-10 w-full max-w-md mx-auto relative">
            
            {/* Biometric Scan Animation Overlay */}
            {isBiometricScanning && (
                <div className="absolute inset-0 z-10 bg-white/90 rounded-t-3xl flex flex-col items-center justify-center p-6">
                    <div className="w-20 h-20 relative mb-4">
                        <ScanFace size={80} className="text-gray-300 absolute top-0 left-0" />
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-[scan_1.5s_ease-in-out_infinite]"></div>
                    </div>
                    <p className="text-gray-800 font-semibold">Verifying...</p>
                    <style>{`
                        @keyframes scan { 0% { top: 0; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
                    `}</style>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Lock size={18} className="text-blue-700"/> Enter UPI PIN
              </h3>
              <button onClick={() => !isProcessing && setShowPinPad(false)} className="p-2 text-gray-500">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex justify-between items-center px-4 mb-8">
               <div className="text-left">
                  <p className="text-xs text-gray-500 uppercase font-bold">Paying</p>
                  <p className="text-lg font-semibold text-gray-900 truncate max-w-[150px]">{data.pn || data.pa}</p>
               </div>
               <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-bold">Amount</p>
                  <p className="text-lg font-bold text-gray-900">₹{amount}</p>
               </div>
            </div>

            {/* PIN Inputs */}
            <div className="flex justify-center gap-4 mb-8">
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { pinInputRefs.current[idx] = el; }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  disabled={isProcessing}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(idx, e)}
                  className={`w-12 h-12 text-center text-2xl font-bold border-b-2 bg-transparent focus:outline-none focus:border-blue-700 transition-colors ${pinError ? 'border-red-500 text-red-600' : 'border-gray-300 text-gray-900'}`}
                />
              ))}
            </div>
            
            {pinError && (
              <p className="text-center text-red-500 text-sm mb-6 -mt-4">Incorrect PIN. Try again.</p>
            )}

            <div className="flex gap-3">
                {biometricAvailable && (
                    <button 
                        onClick={handleBiometricAuth}
                        disabled={isProcessing}
                        className="flex flex-col items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-2xl hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        title="Use Biometrics"
                    >
                        <Fingerprint size={28} />
                    </button>
                )}
                <Button 
                fullWidth 
                onClick={verifyPinAndPay}
                loading={isProcessing}
                disabled={pin.some(p => !p)}
                className="bg-blue-800 hover:bg-blue-900"
                >
                {isProcessing ? 'Verifying...' : 'Submit'}
                </Button>
            </div>
            
            <div className="mt-4 flex justify-center">
               <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-4 opacity-50 grayscale" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
