
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { getBillers, addBiller, getBillsWithDetails, markBillPaid } from '../utils/billManager';
import { Biller } from '../types';
import { Zap, Smartphone, Tv, Wifi, Flame, Car, Plus, X, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/historyManager';

export const BillPayments: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'BILLS' | 'BILLERS'>('BILLS');
  const [billers, setBillers] = useState<Biller[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Biller Form State
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

  const handlePayBill = (bill: any) => {
    navigate('/manual', {
        state: {
            initialVpa: `${bill.billerName.toLowerCase().replace(/\s/g, '')}@billpay`,
            initialName: bill.billerName,
            initialAmount: bill.amount,
            note: `Bill Payment - ${formatDate(bill.billDate)}`
        }
    });
    // In a real app, we would link the payment success to marking this bill as paid.
    // For demo, we mark it paid immediately when they click 'Pay' to simulate the flow update,
    // assuming they complete the next step.
    markBillPaid(bill.id); 
  };

  const handleAddBiller = () => {
    if (!billerName || !identifier) return;
    
    const newBiller: Biller = {
        id: crypto.randomUUID(),
        name: billerName,
        category: category,
        identifierLabel: getIdentifierLabel(category),
        identifierValue: identifier
    };
    
    addBiller(newBiller);
    setShowAddModal(false);
    setBillerName('');
    setIdentifier('');
    loadData();
    setActiveTab('BILLS'); // Switch to bills to show the newly generated mock bill
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
      <div className="bg-white px-4 pt-2 border-b border-gray-100 flex">
         <button 
           onClick={() => setActiveTab('BILLS')}
           className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'BILLS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
         >
            Upcoming Bills
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
            <div className="space-y-4">
                {bills.filter(b => b.status === 'PENDING').length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <CheckCircle2 size={48} className="mx-auto mb-3 opacity-20" />
                        <p>No pending bills!</p>
                        <Button variant="secondary" className="mt-4" onClick={() => setActiveTab('BILLERS')}>Manage Billers</Button>
                    </div>
                ) : (
                    bills.filter(b => b.status === 'PENDING').map(bill => (
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
                            <Button fullWidth onClick={() => handlePayBill(bill)} className="h-10 text-sm">
                                Pay Now
                            </Button>
                        </div>
                    ))
                )}
                
                {/* Completed Bills Section */}
                {bills.some(b => b.status === 'PAID') && (
                    <div className="pt-6">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Paid History</h3>
                        <div className="space-y-3 opacity-60">
                            {bills.filter(b => b.status === 'PAID').map(bill => (
                                <div key={bill.id} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="text-gray-400">{getCategoryIcon(bill.billerCategory)}</div>
                                        <span className="text-sm font-medium">{bill.billerName}</span>
                                    </div>
                                    <span className="text-sm font-bold line-through">₹{formatCurrency(bill.amount)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'BILLERS' && (
            <div className="space-y-4">
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="w-full bg-white p-4 rounded-2xl border-2 border-dashed border-blue-200 text-blue-600 flex items-center justify-center gap-2 font-medium hover:bg-blue-50 transition"
                >
                    <Plus size={20} /> Add New Biller
                </button>

                {billers.map(biller => (
                    <div key={biller.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                {getCategoryIcon(biller.category)}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{biller.name}</h4>
                                <p className="text-xs text-gray-500">{biller.identifierLabel}: {biller.identifierValue}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

      </div>

      {/* Add Biller Modal */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-slide-up">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Add Biller</h3>
                      <button onClick={() => setShowAddModal(false)} className="text-gray-400"><X size={24}/></button>
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
                          <Button fullWidth onClick={handleAddBiller}>Add Biller</Button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
