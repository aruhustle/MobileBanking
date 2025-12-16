
import React, { useEffect, useState, useCallback } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { Scan } from './pages/Scan';
import { ConfirmPayment } from './pages/ConfirmPayment';
import { Result } from './pages/Result';
import { ManualEntry } from './pages/ManualEntry';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { Support } from './pages/Support';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Reminders } from './pages/Reminders';
import { ChatSupport } from './pages/ChatSupport';
import { BillPayments } from './pages/BillPayments';
import { BankTransfer } from './pages/BankTransfer';
import { getCurrentUser } from './utils/authManager';
import { syncOfflineTransactions } from './utils/historyManager';
import { WifiOff, RefreshCw, CheckCircle2, X, RotateCcw, CloudOff } from 'lucide-react';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true, state: { from: location } });
    }
  }, [user, navigate, location]);

  return user ? <>{children}</> : null;
};

const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      // Bypass cache to check real network connectivity
      await fetch(`/?_ping=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
      
      // If we reach here, we are online
      if (!isOnline) {
         handleOnline();
      }
      setIsOnline(true);
    } catch (e) {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  }, [isOnline]);

  const handleOnline = () => {
    setIsOnline(true);
    setIsSyncing(true);
    setDismissed(false); // Reset dismissal on reconnection
    
    // Perform Sync
    syncOfflineTransactions();

    // Simulate sync delay for UX
    setTimeout(() => {
      setIsSyncing(false);
      setSyncDone(true);
      // Hide success message after 3s
      setTimeout(() => setSyncDone(false), 3000);
    }, 1500);
  };

  useEffect(() => {
    const onOnline = () => handleOnline();
    const onOffline = () => setIsOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // Initial check on mount
    checkConnection();

    // Poll if offline
    let interval: any;
    if (!isOnline) {
        interval = setInterval(checkConnection, 5000);
    }

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      if (interval) clearInterval(interval);
    };
  }, [isOnline, checkConnection]);

  if (isSyncing) {
    return (
      <div className="bg-blue-600 text-white text-xs py-2 px-4 flex items-center justify-center gap-2 animate-pulse fixed bottom-4 left-4 right-4 rounded-lg shadow-lg z-50">
        <RefreshCw size={14} className="animate-spin" />
        <span>Syncing...</span>
      </div>
    );
  }

  if (syncDone) {
    return (
      <div className="bg-green-600 text-white text-xs py-2 px-4 flex items-center justify-center gap-2 fixed bottom-4 left-4 right-4 rounded-lg shadow-lg z-50 animate-fade-in-up">
        <CheckCircle2 size={14} />
        <span>Online & Synced</span>
      </div>
    );
  }

  if (!isOnline && !dismissed) {
    return (
      <div className="bg-gray-800 text-white text-xs py-3 px-4 flex items-center justify-between gap-2 fixed bottom-4 left-4 right-4 rounded-xl shadow-xl z-50 animate-fade-in-up border border-gray-700">
        <div className="flex items-center gap-2">
            <CloudOff size={16} className="text-orange-400" />
            <div>
              <p className="font-bold">Offline Mode</p>
              <p className="text-[10px] text-gray-400">Transactions saved locally</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={checkConnection} 
                disabled={isChecking}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md text-[10px] font-bold transition"
            >
                <RotateCcw size={10} className={isChecking ? 'animate-spin' : ''} />
                {isChecking ? '...' : 'RECONNECT'}
            </button>
            <button onClick={() => setDismissed(true)} className="p-1 hover:bg-white/20 rounded-full text-gray-400 hover:text-white">
                <X size={16} />
            </button>
        </div>
      </div>
    );
  }

  return null;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="antialiased text-gray-900 bg-gray-50 min-h-screen font-sans">
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative flex flex-col">
          <div className="flex-1 relative">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
              <Route path="/confirm" element={<ProtectedRoute><ConfirmPayment /></ProtectedRoute>} />
              <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />
              <Route path="/manual" element={<ProtectedRoute><ManualEntry /></ProtectedRoute>} />
              <Route path="/bank-transfer" element={<ProtectedRoute><BankTransfer /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
              <Route path="/chat-support" element={<ProtectedRoute><ChatSupport /></ProtectedRoute>} />
              <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
              <Route path="/bills" element={<ProtectedRoute><BillPayments /></ProtectedRoute>} />
            </Routes>
          </div>
          {/* Banner rendered last to float on top */}
          <OfflineBanner />
        </div>
        <style>{`
          @keyframes fade-in-up {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </HashRouter>
  );
};

export default App;
