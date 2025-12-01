
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { getHistory, formatDate, formatCurrency } from '../utils/historyManager';
import { Transaction } from '../types';
import { Calendar, MessageSquare, ChevronRight, Hash, CheckCircle2, XCircle, Clock, Search, Filter, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FAILURE'>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const history = getHistory();
    setAllTransactions(history);
    setFilteredTransactions(history);
  }, []);

  useEffect(() => {
    let result = allTransactions;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(tx => 
        (tx.pn && tx.pn.toLowerCase().includes(q)) || 
        (tx.pa && tx.pa.toLowerCase().includes(q)) ||
        (tx.am && tx.am.includes(q)) ||
        (tx.utr && tx.utr.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(tx => tx.status === statusFilter);
    }

    setFilteredTransactions(result);
  }, [searchQuery, statusFilter, allTransactions]);

  const handleTransactionClick = (tx: Transaction) => {
    navigate('/result', { state: { transaction: tx } });
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
                  className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 active:scale-[0.98] transition-transform cursor-pointer hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                      {/* Left Side: Icon & Payee */}
                      <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isCredit ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {isCredit ? <ArrowDownLeft size={18}/> : (tx.pn || tx.pa || '?').charAt(0).toUpperCase()}
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
                          <div className={`flex items-center justify-end gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1 w-fit ml-auto ${getStatusColor(tx.status)}`}>
                              {getStatusIcon(tx.status)}
                              <span>{tx.status}</span>
                          </div>
                      </div>
                  </div>
                  
                  {/* Bottom Row: UTR & Note */}
                  {(tx.utr || tx.tn) && (
                    <div className="flex items-start gap-3 pt-2 border-t border-gray-50 mt-1">
                        {tx.utr && (
                          <div className="flex-1 flex items-center gap-1.5 text-xs text-gray-400">
                             <Hash size={12} />
                             <span className="font-mono">UTR: {tx.utr}</span>
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
    </div>
  );
};