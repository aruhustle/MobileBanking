
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { getHistory, formatDate, formatCurrency } from '../utils/historyManager';
import { Transaction } from '../types';
import { Calendar, MessageSquare, ChevronRight, Hash, CheckCircle2, XCircle, Clock, Search, Filter, ArrowDownLeft, ArrowUpRight, MapPin, Copy, Share2, HelpCircle, X, Landmark, CloudOff } from 'lucide-react';
import { Button } from '../components/Button';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FAILURE'>('ALL');

  useEffect(() => {
    const loadTransactions = () => {
        const history = getHistory();
        setAllTransactions(history);
        setFilteredTransactions(history); // Reset filter on load
    };

    loadTransactions();

    // Listen for updates (e.g. sync completion or new offline tx)
    window.addEventListener('transaction_updated', loadTransactions);
    return () => window.removeEventListener('transaction_updated', loadTransactions);
  }, []);

  useEffect(() => {
    let result = allTransactions;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(tx => 
        (tx.pn && tx.pn.toLowerCase().includes(q)) || 
        (tx.pa && tx.pa.toLowerCase().includes(q)) ||
        (tx.am && tx.am.includes(q)) ||
        (tx.utr && tx.utr.toLowerCase().includes(q)) ||
        (tx.bankDetails && tx.bankDetails.accNo.includes(q))
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(tx => tx.status === statusFilter);
    }

    setFilteredTransactions(result);
  }, [searchQuery, statusFilter, allTransactions]);

  const handleTransactionClick = (tx: Transaction) => {
    setSelectedTx(tx);
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'SUCCESS': return <CheckCircle2 size={14} />;
      case 'FAILURE': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'SUCCESS': return 'text-green-600 bg-green-50';
      case 'FAILURE': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showBack title="Payment History" />
      
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 border-b border-gray-100 sticky top-16 z-20 shadow-sm">
        <div className="relative mb-3">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           <input 
             type="text" 
             placeholder="Search by name, UPI ID or amount" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
           />
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
           <button 
             onClick={() => setStatusFilter('ALL')}
             className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${statusFilter === 'ALL' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
           >
             All
           </button>
           <button 
             onClick={() => setStatusFilter('SUCCESS')}
             className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${statusFilter === 'SUCCESS' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
           >
             Successful
           </button>
           <button 
             onClick={() => setStatusFilter('FAILURE')}
             className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${statusFilter === 'FAILURE' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
           >
             Failed
           </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Search size={48} className="mb-4 opacity-20" />
            <p>No transactions found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => {
              const isCredit = tx.type === 'CREDIT';
              return (
                <div 
                  key={tx.id} 
                  onClick={() => handleTransactionClick(tx)}
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 active:scale-[0.98] transition-transform cursor-pointer hover:shadow-md relative"
                >
                  <div className="flex items-center justify-between">
                      {/* Left Side: Icon & Payee */}
                      <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isCredit ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {isCredit ? <ArrowDownLeft size={18}/> : (
                                  tx.bankDetails ? <Landmark size={18} /> : (tx.pn || tx.pa || '?').charAt(0).toUpperCase()
                              )}
                          </div>
                          <div>
                              <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{tx.pn || tx.pa}</h4>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                  <Calendar size={10} />
                                  <span>{formatDate(tx.date)}</span>
                              </div>
                          </div>
                      </div>

                      {/* Right Side: Amount & Status */}
                      <div className="text-right">
                          <p className={`font-bold text-base ${isCredit ? 'text-green-600' : 'text-gray-900'}`}>
                            {isCredit ? '+' : '-'} ₹{formatCurrency(tx.am)}
                          </p>
                          <div className="flex items-center justify-end gap-2 mt-1">
                              {tx.isOffline && (
                                  <span className="flex items-center gap-1 text-[10px] text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-100">
                                      <CloudOff size={10} /> Saved Offline
                                  </span>
                              )}
                              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(tx.status)}`}>
                                  {getStatusIcon(tx.status)}
                                  <span>{tx.status}</span>
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  {/* Bottom Row: UTR & Note */}
                  {(tx.utr || tx.tn || tx.bankDetails) && (
                    <div className="flex items-start gap-3 pt-2 border-t border-gray-50 mt-1">
                        {tx.utr && !tx.bankDetails && (
                          <div className="flex-1 flex items-center gap-1.5 text-xs text-gray-400">
                             <Hash size={12} />
                             <span className="font-mono">UTR: {tx.utr}</span>
                          </div>
                        )}
                        {tx.bankDetails && (
                          <div className="flex-1 flex items-center gap-1.5 text-xs text-gray-400">
                             <Landmark size={12} />
                             <span className="font-mono">Acc: {tx.bankDetails.accNo.slice(-4).padStart(tx.bankDetails.accNo.length, '*')}</span>
                          </div>
                        )}
                        {tx.tn && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 italic max-w-[50%] truncate">
                              <MessageSquare size={12} />
                              <span>{tx.tn}</span>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-gray-900">Transaction Details</h3>
                  <button onClick={() => setSelectedTx(null)} className="p-1 text-gray-500 hover:bg-gray-200 rounded-full transition"><X size={20}/></button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                 {/* Main Status */}
                 <div className="text-center mb-6">
                     <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${selectedTx.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                         {selectedTx.status === 'SUCCESS' ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                     </div>
                     <p className="text-gray-500 text-sm mb-1">{selectedTx.status === 'SUCCESS' ? 'Payment Successful' : 'Payment Failed'}</p>
                     <h2 className="text-3xl font-bold text-gray-900">₹{formatCurrency(selectedTx.am)}</h2>
                     {selectedTx.isOffline && (
                        <p className="text-xs text-orange-500 font-medium mt-1 flex items-center justify-center gap-1">
                            <CloudOff size={12} /> Pending Sync
                        </p>
                     )}
                 </div>

                 {/* Key Details */}
                 <div className="space-y-4 text-sm">
                     <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="text-gray-500">Paid to</span>
                        <div className="text-right">
                           <p className="font-bold text-gray-900">{selectedTx.pn}</p>
                           {selectedTx.bankDetails ? (
                               <p className="text-xs text-gray-400 font-mono">
                                   A/c: {selectedTx.bankDetails.accNo}<br/>
                                   IFSC: {selectedTx.bankDetails.ifsc}
                               </p>
                           ) : (
                               <p className="text-xs text-gray-400">{selectedTx.pa}</p>
                           )}
                        </div>
                     </div>
                     <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="text-gray-500">Date</span>
                        <span className="font-medium text-gray-900">{new Date(selectedTx.date).toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="text-gray-500">Debited from</span>
                        <span className="font-medium text-gray-900">HDFC Bank **** 8899</span>
                     </div>
                     
                     <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="text-gray-500">Category (MCC)</span>
                        <span className="font-medium text-gray-900">{selectedTx.mc || 'N/A'}</span>
                     </div>

                     <div className="flex justify-between py-2 border-b border-gray-50">
                        <span className="text-gray-500">Note</span>
                        <span className="font-medium text-gray-900 italic">{selectedTx.tn || 'N/A'}</span>
                     </div>

                     <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between text-xs">
                           <span className="text-gray-500">UPI Ref ID</span>
                           <span className="font-mono text-gray-700">{selectedTx.txnRef || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                           <span className="text-gray-500">UTR Number</span>
                           <div className="flex gap-2">
                              <span className="font-mono text-gray-700">{selectedTx.utr || 'N/A'}</span>
                              <Copy size={12} className="text-blue-600 cursor-pointer" onClick={() => navigator.clipboard.writeText(selectedTx.utr || '')} />
                           </div>
                        </div>
                     </div>
                     
                     {/* Map / Location if available */}
                     {selectedTx.location && (
                        <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2 text-gray-700 font-medium">
                                <MapPin size={16} /> Location
                            </div>
                            <div className="bg-blue-50 rounded-xl p-3 flex items-center justify-between">
                                <span className="text-xs text-blue-800 truncate">{selectedTx.location.address || `${selectedTx.location.lat}, ${selectedTx.location.lng}`}</span>
                                <a 
                                  href={`https://www.google.com/maps/search/?api=1&query=${selectedTx.location.lat},${selectedTx.location.lng}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-xs font-bold text-blue-600 hover:underline"
                                >
                                    View on Map
                                </a>
                            </div>
                        </div>
                     )}
                 </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-100 grid grid-cols-2 gap-3 bg-white">
                  <Button variant="outline" className="text-xs" onClick={() => navigate('/chat-support')}>
                     <HelpCircle size={14} className="mr-2" /> Get Help
                  </Button>
                  <Button className="text-xs bg-blue-800" onClick={() => navigate('/result', { state: { transaction: selectedTx } })}>
                     <Share2 size={14} className="mr-2" /> View Receipt
                  </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};