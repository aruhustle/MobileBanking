
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { QrCode, Building2, ChevronRight, Smartphone, Shield, LogOut, Eye, EyeOff, Download, X, Camera, MapPin, Fingerprint, ToggleRight, ToggleLeft, Database, Copy, Check } from 'lucide-react';
import { getCurrentUser, logoutUser } from '../utils/authManager';
import { User } from '../types';
import { formatCurrency } from '../utils/historyManager';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [showBalance, setShowBalance] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [displayedBalance, setDisplayedBalance] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setDisplayedBalance(currentUser.balance);
    } else {
      navigate('/login');
    }
    
    const bioPref = localStorage.getItem('hdfc_biometric') === 'true';
    setBiometricEnabled(bioPref);
  }, [navigate]);

  // Live Balance Simulation
  useEffect(() => {
      let interval: any;
      if (showBalance && user) {
          // Initial sync
          setDisplayedBalance(user.balance);
          
          interval = setInterval(() => {
             // Fluctuate balance slightly to simulate real-time updates
             const fluctuation = (Math.random() - 0.5) * 50; // +/- 25 rupees
             setDisplayedBalance(prev => Math.max(0, prev + fluctuation));
          }, 2000);
      }
      return () => clearInterval(interval);
  }, [showBalance, user]);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const toggleBiometric = () => {
      const newState = !biometricEnabled;
      if (newState) {
          const confirm = window.confirm("Enable biometric authentication for payments?");
          if (confirm) {
              setBiometricEnabled(true);
              localStorage.setItem('hdfc_biometric', 'true');
          }
      } else {
          setBiometricEnabled(false);
          localStorage.setItem('hdfc_biometric', 'false');
      }
  };

  const handleExportData = () => {
    const history = localStorage.getItem('hdfc_history_v2');
    if (history) {
        navigator.clipboard.writeText(history).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
            alert("Data copied to clipboard! Please paste this to the developer to save your history permanently.");
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert("Failed to copy data. Please try again.");
        });
    } else {
        alert("No history data found to export.");
    }
  };

  if (!user) return null;

  // Generate QR Code URL using a public API for demonstration
  const upiString = `upi://pay?pa=${user.vpa}&pn=${encodeURIComponent(user.name)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}&color=000000&bgcolor=ffffff&margin=10`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <Header showBack title="My Profile" />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* User Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-3xl font-bold mb-4">
                {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500 text-sm mb-4">+91 {user.phone}</p>
            
            <div className="bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-mono text-gray-700">
                <span>{user.vpa}</span>
                <QrCode size={16} className="text-blue-700 ml-2" />
            </div>
        </div>

        {/* Balance Section */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-2xl p-6 shadow-md text-white">
            <div className="flex justify-between items-center mb-2">
               <span className="text-blue-100 text-sm font-medium">Bank Balance</span>
               <button onClick={() => setShowBalance(!showBalance)} className="text-blue-100 hover:text-white transition-colors">
                  {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
               </button>
            </div>
            <div className="text-2xl font-bold tracking-wide tabular-nums">
               {showBalance ? `₹ ${formatCurrency(displayedBalance)}` : '••••••'}
            </div>
            <div className="text-xs text-blue-200 mt-1">
               HDFC Bank •••• 8899
            </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
            <h3 className="font-semibold text-gray-800 mb-4">My HDFC QR Code</h3>
            <div className="bg-white p-2 rounded-xl border-2 border-dashed border-gray-200 mb-4">
                 <img src={qrUrl} alt="My UPI QR" className="w-48 h-48 rounded-lg" />
            </div>
            <div className="flex gap-4">
                 <button onClick={() => window.open(qrUrl, '_blank')} className="flex items-center gap-2 text-blue-700 text-sm font-medium hover:bg-blue-50 px-4 py-2 rounded-full transition">
                    <Download size={16} /> Download
                 </button>
            </div>
        </div>

        {/* Bank Accounts */}
        <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 pl-2">Payment Methods</h3>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1.5 border border-gray-100 overflow-hidden">
                             <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg" 
                                alt="HDFC" 
                                className="w-full h-full object-cover object-left" 
                             />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">HDFC Bank</p>
                            <p className="text-xs text-gray-500">Savings Account •••• 8899</p>
                        </div>
                    </div>
                    <div className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md">PRIMARY</div>
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer text-blue-700 font-medium text-sm">
                    + Add Bank Account
                </div>
            </div>
        </div>

        {/* Settings */}
        <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 pl-2">Settings</h3>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                    <div className="flex items-center gap-3 text-gray-700">
                        <Shield size={20} />
                        <span className="text-sm font-medium">Privacy & Security</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                </div>
                
                {/* Biometric Option */}
                <div 
                    className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer border-b border-gray-50"
                    onClick={toggleBiometric}
                >
                    <div className="flex items-center gap-3 text-gray-700">
                        <Fingerprint size={20} />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Biometric Login</span>
                            <span className="text-[10px] text-gray-400">Use fingerprint/face for payments</span>
                        </div>
                    </div>
                    {biometricEnabled ? (
                        <ToggleRight size={24} className="text-green-500" />
                    ) : (
                        <ToggleLeft size={24} className="text-gray-300" />
                    )}
                </div>

                <div 
                    className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                    onClick={() => setShowPermissions(true)}
                >
                    <div className="flex items-center gap-3 text-gray-700">
                        <Smartphone size={20} />
                        <span className="text-sm font-medium">App Permissions</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                </div>
            </div>
        </div>

        {/* Developer Backup Section */}
        <div>
             <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 pl-2">Developer Tools</h3>
             <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden p-4">
                 <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 text-gray-700">
                        <Database size={20} />
                        <div>
                            <p className="text-sm font-medium">Backup Data</p>
                            <p className="text-[10px] text-gray-400">Copy history to send to developer</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleExportData}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${copySuccess ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        {copySuccess ? <Check size={14} /> : <Copy size={14} />}
                        {copySuccess ? 'Copied' : 'Copy JSON'}
                    </button>
                 </div>
                 <p className="text-[10px] text-gray-400 leading-relaxed bg-gray-50 p-2 rounded-lg">
                    Use this feature to save your local transaction history before a major app update. Paste the copied code to the developer to make it permanent.
                 </p>
             </div>
        </div>

        <Button variant="outline" fullWidth onClick={handleLogout} className="text-red-600 border-red-100 hover:bg-red-50">
           <LogOut size={18} className="mr-2" /> Logout
        </Button>

        <div className="text-center text-xs text-gray-400 pt-2 pb-8">
            HDFC Bank App Version 2.2.0
        </div>
      </div>

      {/* Permissions Modal */}
      {showPermissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-xl relative">
                <button 
                    onClick={() => setShowPermissions(false)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={20} />
                </button>
                
                <h3 className="text-lg font-bold mb-6 text-gray-900">App Permissions</h3>
                
                <ul className="space-y-4">
                    <li className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                            <Camera size={20} />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 text-sm">Camera</p>
                            <p className="text-xs text-gray-500 mt-0.5">Required for scanning UPI QR codes.</p>
                            <p className="text-[10px] text-green-600 font-bold mt-1">ALLOWED</p>
                        </div>
                    </li>
                    <li className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 shrink-0">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 text-sm">Location</p>
                            <p className="text-xs text-gray-500 mt-0.5">Used to detect fraud and secure payments.</p>
                            <p className="text-[10px] text-gray-400 font-bold mt-1">NOT ALLOWED</p>
                        </div>
                    </li>
                </ul>

                <div className="mt-8">
                    <Button fullWidth onClick={() => setShowPermissions(false)}>Close</Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
