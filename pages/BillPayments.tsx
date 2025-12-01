
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { getBillers, addBiller, updateBiller, removeBiller, getBillsWithDetails, markBillPaid } from '../utils/billManager';
import { Biller } from '../types';
import { Zap, Smartphone, Tv, Wifi, Flame, Car, Plus, X, CheckCircle2, Trash2, Edit2, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/historyManager';

export const BillPayments: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'BILLS' | 'BILLERS'>('BILLS');
  const [billers, setBillers] = useState<Biller[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [showBillerModal, setShowBillerModal] = useState(false);
  
  // Payment Confirmation State
  const [billToPay, setBillToPay] = useState<any>(null);

  // Add/Edit Biller Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [category, setCategory] = useState<Biller['category']>('ELECTRICITY');
  const [billerName, setBillerName] = useState('');
  const [identifier, setIdentifier] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setBillers(getBillers());
    setBills(getBillsWithDetails());
  };

  const initiatePayment = (bill: any) => {
    setBillToPay(bill);
  };

  const confirmPayment = () => {
    if (!billToPay) return;

    navigate('/manual', {
        state: {
            initialVpa: `${billToPay.billerName.toLowerCase().replace(/\s/g, '')}@billpay`,
            initialName: billToPay.billerName,
            initialAmount: billToPay.amount,
            note: `Bill Payment - ${formatDate(billToPay.billDate)}`
        }
    });
    // In a real app, we would link the payment success to marking this bill as paid.
    // For demo, we mark it paid immediately when they click 'Pay'
    markBillPaid(billToPay.id);
    setBillToPay(null);
  };

  const openAddBiller = () => {
      setIsEditing(false);
      setEditingId(null);
      setCategory('ELECTRICITY');
      setBillerName('');
      setIdentifier('');
      setShowBillerModal(true);
  };

  const openEditBiller = (biller: Biller) => {
      setIsEditing(true);
      setEditingId(biller.id);
      setCategory(biller.category);
      setBillerName(biller.name);
      setIdentifier(biller.identifierValue);
      setShowBillerModal(true);
  };

  const handleDeleteBiller = (id: string) => {
      if (window.confirm("Are you sure you want to delete this biller?")) {
          removeBiller(id);
          loadData();
      }
  };

  const handleSaveBiller = () => {
    if (!billerName || !identifier) return;
    
    if (isEditing && editingId) {
        const updatedBiller: Biller = {
            id: editingId,
            name: billerName,
            category: category,
            identifierLabel: getIdentifierLabel(category),
            identifierValue: identifier
        };
        updateBiller(updatedBiller);
    } else {
        const newBiller: Biller = {
            id: crypto.randomUUID(),
            name: billerName,
            category: category,
            identifierLabel: getIdentifierLabel(category),
            identifierValue: identifier
        };
        addBiller(newBiller);
        setActiveTab('BILLS'); // Switch to bills to show the newly generated mock bill
    }
    
    setShowBillerModal(false);
    loadData();
  };

  const getCategoryIcon = (cat: string) => {
      switch(cat) {
          case 'ELECTRICITY': return <Zap size={20} />;
          case 'MOBILE': return <Smartphone size={20} />;
          case 'DTH': return <Tv size={20} />;
          case 'BROADBAND': return <Wifi size={20} />;
          case 'GAS': return <Flame size={20} />;
          case 'FASTAG': return <Car size={20} />;
          default: return <Zap size={20} />;
      }
  };

  const getIdentifierLabel = (cat: string) => {
      switch(cat) {
          case 'ELECTRICITY': return "Consumer Number";
          case 'MOBILE': return "Mobile Number";
          case 'DTH': return "Subscriber ID";
          case 'BROADBAND': return "Account Number";
          case 'GAS': return "Customer ID";
          case 'FASTAG': return "Vehicle Number";
          default: return "ID";
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showBack title="Bill Payments" />
      
      {/* Tabs */}
      <div className="bg-white px-4 pt-2 border-b border-gray-100 flex sticky top-16 z-10">
         <button 
           onClick={() => setActiveTab('BILLS')}
           className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'BILLS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
         >
            Bills
         </button>
         <button 
           onClick={() => setActiveTab('BILLERS')}
           className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'BILLERS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
         >
            My Billers
         </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        
        {activeTab === 'BILLS' && (
            <div className="space-y-6">
                
                {/* Pending Bills */}
                <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-3">Due Payments</h3>
                    {bills.filter(b => b.status === 'PENDING').length === 0 ? (
                        <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-gray-200">
                            <CheckCircle2 size={32} className="mx-auto mb-2 text-green-500 opacity-50" />
                            <p className="text-sm text-gray-400">No pending bills!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {bills.filter(b => b.status === 'PENDING').map(bill => (
                                <div key={bill.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                {getCategoryIcon(bill.billerCategory)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{bill.billerName}</h4>
                                                <p className="text-xs text-gray-500">Due {formatDate(bill.dueDate)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg text-gray-900">₹{formatCurrency(bill.amount)}</p>
                                        </div>
                                    </div>
                                    <Button fullWidth onClick={() => initiatePayment(bill)} className="h-10 text-sm bg-blue-700 hover:bg-blue-800">
                                        Pay Now
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Completed Bills Section */}
                <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Calendar size={14} /> Payment History
                    </h3>
                    {bills.some(b => b.status === 'PAID') ? (
                        <div className="space-y-3">
                            {bills.filter(b => b.status === 'PAID').sort((a,b) => new Date(b.paidDate || 0).getTime() - new Date(a.paidDate || 0).getTime()).map(bill => (
                                <div key={bill.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center opacity-80 hover:opacity-100 transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                            {getCategoryIcon(bill.billerCategory)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">{bill.billerName}</p>
                                            <p className="text-xs text-green-600 font-medium">
                                                Paid on {bill.paidDate ? formatDate(bill.paidDate) : 'Recently'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-800">₹{formatCurrency(bill.amount)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 text-center py-4">No past payments found.</p>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'BILLERS' && (
            <div className="space-y-4">
                <button 
                  onClick={openAddBiller}
                  className="w-full bg-white p-4 rounded-2xl border-2 border-dashed border-blue-200 text-blue-600 flex items-center justify-center gap-2 font-medium hover:bg-blue-50 transition"
                >
                    <Plus size={20} /> Add New Biller
                </button>

                {billers.map(biller => (
                    <div key={biller.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                {getCategoryIcon(biller.category)}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{biller.name}</h4>
                                <p className="text-xs text-gray-500 mb-1">{biller.identifierLabel}</p>
                                <p className="text-xs font-mono bg-gray-50 px-2 py-0.5 rounded text-gray-700 inline-block">{biller.identifierValue}</p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => openEditBiller(biller)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button 
                                onClick={() => handleDeleteBiller(biller.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}

      </div>

      {/* Add/Edit Biller Modal */}
      {showBillerModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900">{isEditing ? 'Edit Biller' : 'Add Biller'}</h3>
                      <button onClick={() => setShowBillerModal(false)} className="text-gray-400"><X size={24}/></button>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Category</label>
                          <div className="grid grid-cols-3 gap-2">
                              {['ELECTRICITY', 'MOBILE', 'DTH', 'BROADBAND', 'GAS', 'FASTAG'].map((cat) => (
                                  <button 
                                    key={cat}
                                    onClick={() => setCategory(cat as any)}
                                    className={`p-2 rounded-lg text-[10px] font-bold border transition-colors ${category === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-100'}`}
                                  >
                                      {cat}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Biller Name</label>
                          <input 
                             type="text" 
                             className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
                             placeholder="e.g. Adani Electricity"
                             value={billerName}
                             onChange={(e) => setBillerName(e.target.value)}
                          />
                      </div>

                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1">{getIdentifierLabel(category)}</label>
                          <input 
                             type="text" 
                             className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500"
                             placeholder="Enter ID/Number"
                             value={identifier}
                             onChange={(e) => setIdentifier(e.target.value)}
                          />
                      </div>
                      
                      <div className="pt-4">
                          <Button fullWidth onClick={handleSaveBiller}>
                              {isEditing ? 'Save Changes' : 'Add Biller'}
                          </Button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Bill Payment Confirmation Modal */}
      {billToPay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-xl">
                 <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Bill Payment</h3>
                 
                 <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                       <p className="text-xs text-gray-500 uppercase font-semibold">Biller</p>
                       <p className="text-sm font-bold text-gray-900">{billToPay.billerName}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                       <p className="text-xs text-gray-500 uppercase font-semibold">Due Date</p>
                       <p className="text-sm font-bold text-gray-900">{formatDate(billToPay.dueDate)}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl space-y-1 text-center">
                       <p className="text-xs text-blue-600 uppercase font-semibold">Amount</p>
                       <p className="text-2xl font-bold text-blue-800">₹{formatCurrency(billToPay.amount)}</p>
                    </div>
                 </div>

                 <div className="flex gap-3">
                    <Button 
                      fullWidth 
                      variant="secondary" 
                      onClick={() => setBillToPay(null)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-none"
                    >
                      Cancel
                    </Button>
                    <Button 
                      fullWidth 
                      onClick={confirmPayment}
                      className="bg-blue-800 hover:bg-blue-900"
                    >
                      Confirm Pay
                    </Button>
                 </div>
              </div>
          </div>
      )}
    </div>
  );
};
