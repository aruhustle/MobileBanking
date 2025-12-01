
import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Check, Share2, XCircle, Clock, Home, ArrowLeft, Copy, BellPlus, List } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/historyManager';
import { saveReminder } from '../utils/reminderManager';
import { getCurrentUser } from '../utils/authManager';
import html2canvas from 'html2canvas';

export const Result: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const transaction = location.state?.transaction as Transaction | undefined;
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  
  if (!transaction) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <p className="mb-4 text-gray-500">Transaction details not found.</p>
                <Button onClick={() => navigate('/')}>Go Home</Button>
            </div>
        </div>
    );
  }

  // Determine theme based on status
  const getTheme = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return {
          bg: 'bg-green-600',
          iconBg: 'bg-white',
          iconColor: 'text-green-600',
          Icon: Check,
          title: 'Payment Successful',
          textColor: 'text-white'
        };
      case 'FAILURE':
        return {
          bg: 'bg-red-600',
          iconBg: 'bg-white',
          iconColor: 'text-red-600',
          Icon: XCircle,
          title: 'Payment Failed',
          textColor: 'text-white'
        };
      default: // PROCESSING / INITIATED
        return {
          bg: 'bg-yellow-500',
          iconBg: 'bg-white',
          iconColor: 'text-yellow-600',
          Icon: Clock,
          title: 'Processing',
          textColor: 'text-white'
        };
    }
  };

  const theme = getTheme(transaction.status);
  const Icon = theme.Icon;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleCopyDetails = () => {
      const details = [
          `Transaction Status: ${transaction.status}`,
          `Amount: ₹${transaction.am}`,
          `Payee: ${transaction.pn}`,
          `VPA: ${transaction.pa}`,
          `Date: ${new Date(transaction.date).toLocaleString()}`,
          `UPI Ref: ${transaction.txnRef || 'N/A'}`,
          `UTR: ${transaction.utr || 'N/A'}`,
          transaction.mc ? `MCC: ${transaction.mc}` : '',
          transaction.tn ? `Note: ${transaction.tn}` : ''
      ].filter(Boolean).join('\n');

      copyToClipboard(details);
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
        // Capture receipt screenshot
        let file: File | null = null;
        if (receiptRef.current) {
            const canvas = await html2canvas(receiptRef.current, {
                backgroundColor: window.getComputedStyle(receiptRef.current).backgroundColor,
                useCORS: true,
                scale: 2 // Higher resolution
            });
            
            const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
            if (blob) {
                file = new File([blob], `receipt_${transaction.txnRef || 'hdfc'}.png`, { type: 'image/png' });
            }
        }

        const shareData: ShareData = {
            title: 'Payment Receipt',
            text: `Paid ₹${formatCurrency(transaction.am)} to ${transaction.pn} via HDFC Bank. UTR: ${transaction.utr}`,
        };

        // If file generation worked and browser supports file sharing
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
            shareData.files = [file];
        }

        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // Fallback for desktop/unsupported
            copyToClipboard(`Paid ₹${formatCurrency(transaction.am)} to ${transaction.pn}. UTR: ${transaction.utr}`);
        }
    } catch (error) {
        console.log('Error sharing', error);
        copyToClipboard(`Paid ₹${formatCurrency(transaction.am)} to ${transaction.pn}. UTR: ${transaction.utr}`);
    } finally {
        setIsSharing(false);
    }
  };

  const handleSetReminder = () => {
      saveReminder({
          id: crypto.randomUUID(),
          pa: transaction.pa,
          pn: transaction.pn,
          amount: transaction.am,
          frequency: 'MONTHLY',
          note: transaction.tn || 'Payment Reminder'
      });
      alert("Reminder set successfully!");
      navigate('/reminders');
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.textColor} flex flex-col transition-colors duration-300`}>
      
      {/* Header */}
      <div className="p-4">
         <button 
           onClick={() => navigate(-1)}
           className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition text-white"
         >
           <ArrowLeft size={24} />
         </button>
      </div>

      {/* Content Wrapper for Screenshot */}
      <div className="flex-1 flex flex-col" ref={receiptRef}>
        {/* Status Section */}
        <div className={`flex-1 flex flex-col items-center justify-center p-6 pb-10 -mt-10 ${theme.bg} ${theme.textColor}`}>
            <div className={`w-20 h-20 ${theme.iconBg} rounded-full flex items-center justify-center shadow-lg mb-6 animate-bounce-small`}>
            <Icon size={40} className={`${theme.iconColor} stroke-[3]`} />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">{theme.title}</h2>
            <p className={`mb-6 text-lg opacity-90`}>
                ₹<span className="font-bold text-3xl ml-1">{formatCurrency(transaction.am)}</span>
            </p>
            
            <div className="text-center opacity-90 text-sm font-medium">
            {formatDate(transaction.date)}
            </div>
        </div>

        {/* Receipt Card */}
        <div className="bg-white text-gray-900 rounded-t-3xl p-6 flex-1 shadow-2xl animate-slide-up min-h-[50vh]">
            
            <div className="space-y-6">
                {/* Payee */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                    <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Paid to</p>
                        <p className="text-lg font-bold text-gray-900">{transaction.pn}</p>
                        <p className="text-sm text-gray-500">{transaction.pa}</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                        {transaction.pn.charAt(0).toUpperCase()}
                    </div>
                </div>

                {/* Bank Details */}
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Debited from</p>
                        <p className="text-sm font-medium text-gray-900">HDFC Bank **** 8899</p>
                    </div>
                    <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg" 
                        alt="Bank" 
                        className="h-8 w-auto opacity-80" 
                    />
                </div>

                {/* Transaction IDs */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">UPI Ref ID</span>
                        <span className="text-xs font-mono font-medium text-gray-700">{transaction.txnRef || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">UTR Number</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-medium text-gray-700">{transaction.utr || 'N/A'}</span>
                            {/* Hide this copy button from screenshot as it's interactive */}
                            {transaction.utr && (
                                <button 
                                    onClick={() => copyToClipboard(transaction.utr!)} 
                                    className="text-blue-600 hover:text-blue-700"
                                    data-html2canvas-ignore
                                >
                                    <Copy size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                    {transaction.mc && (
                        <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
                            <span className="text-xs text-gray-500">Merchant Category</span>
                            <span className="text-xs font-mono font-medium text-gray-700">{transaction.mc}</span>
                        </div>
                    )}
                    {transaction.tn && (
                    <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                        <span className="text-xs text-gray-500">Note</span>
                        <span className="text-xs font-medium text-gray-700 italic">{transaction.tn}</span>
                    </div>
                    )}
                </div>
            </div>

            {/* Action Buttons - Ignored by screenshot */}
            <div className="mt-6 grid grid-cols-2 gap-3" data-html2canvas-ignore>
                <Button variant="outline" onClick={handleSetReminder} className="border-gray-200 text-gray-600 text-xs h-10 px-2">
                    <BellPlus size={16} className="mr-2" /> Set Reminder
                </Button>
                <Button 
                    variant="secondary" 
                    onClick={handleShare} 
                    disabled={isSharing}
                    className="bg-gray-100 text-gray-800 hover:bg-gray-200 text-xs h-10 px-2"
                >
                    {isSharing ? 'Capturing...' : <><Share2 size={16} className="mr-2"/> Share Receipt</>}
                </Button>
            </div>
            
            <div className="mt-3" data-html2canvas-ignore>
               <Button 
                  variant="ghost" 
                  fullWidth 
                  onClick={handleCopyDetails}
                  className="border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 text-xs h-10"
               >
                   <List size={16} className="mr-2" /> Copy Details
               </Button>
            </div>

            <div className="mt-4" data-html2canvas-ignore>
                <Button fullWidth onClick={() => navigate('/')} className="bg-blue-800 hover:bg-blue-900">
                    <Home size={18} className="mr-2" /> Done
                </Button>
            </div>

            <div className="mt-6 flex justify-center">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                    Powered by UPI <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" className="h-3 ml-1 opacity-40 grayscale" alt=""/>
                </span>
            </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
        }
        @keyframes bounce-small {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        .animate-bounce-small {
            animation: bounce-small 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
