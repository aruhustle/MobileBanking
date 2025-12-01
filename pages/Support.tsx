
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { MessageCircle, Phone, ChevronDown } from 'lucide-react';

export const Support: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showBack title="Help & Support" />
      
      <div className="flex-1 p-4 space-y-6">
        
        {/* Contact Options */}
        <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => navigate('/chat-support')}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 text-center cursor-pointer hover:bg-blue-50 transition group"
            >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition">
                    <MessageCircle size={24} />
                </div>
                <span className="text-sm font-semibold text-gray-800">Chat with Us</span>
            </div>
            <div 
              onClick={() => alert('Phone lines are currently busy. Please use Chat.')}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-3 text-center cursor-pointer hover:bg-green-50 transition group"
            >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-200 transition">
                    <Phone size={24} />
                </div>
                <span className="text-sm font-semibold text-gray-800">Call Support</span>
            </div>
        </div>

        {/* Recent Queries */}
        <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3">Recent Queries</h3>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
                No recent tickets found.
            </div>
        </div>

        {/* FAQ */}
        <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3">Frequently Asked Questions</h3>
            <div className="space-y-2">
                {[
                    "How do I check my bank balance?",
                    "Transaction failed but money debited",
                    "How to change UPI PIN?",
                    "Daily transaction limits"
                ].map((q, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50">
                        <span className="text-sm text-gray-700 font-medium">{q}</span>
                        <ChevronDown size={16} className="text-gray-400" />
                    </div>
                ))}
            </div>
        </div>

        {/* Bottom Contact */}
        <div className="bg-blue-600 rounded-2xl p-6 text-white flex items-center justify-between">
            <div>
                <h4 className="font-bold text-lg">Still need help?</h4>
                <p className="text-blue-100 text-xs mt-1">Our support team is available 24/7</p>
            </div>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-bold">
                Email Us
            </button>
        </div>

      </div>
    </div>
  );
};
