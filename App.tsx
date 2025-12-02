

import React, { useEffect } from 'react';
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

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="antialiased text-gray-900 bg-gray-50 min-h-screen font-sans">
        <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative">
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
      </div>
    </HashRouter>
  );
};

export default App;