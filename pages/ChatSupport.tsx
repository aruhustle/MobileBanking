
import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { getHistory, formatCurrency, formatDate } from '../utils/historyManager';
import { Transaction } from '../types';
import { Send, User, Bot, ChevronRight, HelpCircle } from 'lucide-react';
import { generateSupportResponse, ChatMessage } from '../utils/aiSupport';

export const ChatSupport: React.FC = () => {
  const [stage, setStage] = useState<'SELECT_TX' | 'CHAT'>('SELECT_TX');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load recent history for selection
    const history = getHistory();
    setTransactions(history.slice(0, 5)); // Top 5 recent
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTransactionSelect = (tx: Transaction | null) => {
    setSelectedTx(tx);
    setStage('CHAT');
    
    // Initial bot message
    const initialText = tx 
      ? `I see you want help with your payment of ₹${formatCurrency(tx.am)} to ${tx.pn || tx.pa}. What seems to be the issue?`
      : "Hi! I'm EVA, the HDFC Bank automated assistant. How can I help you today?";

    setMessages([
      {
        id: '1',
        text: initialText,
        sender: 'bot',
        timestamp: Date.now()
      }
    ]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // AI Response
    try {
      const responseText = await generateSupportResponse(userMsg.text, selectedTx, messages);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const renderTxSelector = () => (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
        <h2 className="font-bold text-blue-800 text-lg mb-1">Select a Transaction</h2>
        <p className="text-sm text-blue-600">
          To help us serve you better, please select the transaction you are facing issues with.
        </p>
      </div>

      <div className="space-y-3">
        {transactions.map(tx => (
          <div 
            key={tx.id}
            onClick={() => handleTransactionSelect(tx)}
            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-400 cursor-pointer transition-colors flex justify-between items-center"
          >
            <div>
              <p className="font-bold text-gray-800">{tx.pn || tx.pa}</p>
              <p className="text-xs text-gray-500">{formatDate(tx.date)}</p>
            </div>
            <div className="text-right flex items-center gap-3">
              <div>
                <p className="font-bold text-gray-900">₹{formatCurrency(tx.am)}</p>
                <p className={`text-[10px] font-bold uppercase ${tx.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.status}
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => handleTransactionSelect(null)}
        className="w-full py-4 text-center text-sm font-medium text-gray-500 hover:text-blue-600 transition"
      >
        I have a general query
      </button>
    </div>
  );

  const renderChat = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Context Banner */}
        {selectedTx && (
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center mb-4 text-xs text-gray-600">
            <span>Ref: {selectedTx.txnRef || selectedTx.utr || 'N/A'}</span>
            <span className="font-bold">₹{formatCurrency(selectedTx.am)}</span>
          </div>
        )}

        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-blue-800 text-white' : 'bg-white border border-gray-200 text-blue-800'}`}>
                {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm ${
                msg.sender === 'user' 
                  ? 'bg-blue-800 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-pulse">
             <div className="bg-gray-100 px-4 py-2 rounded-full text-xs text-gray-500 ml-10">
               EVA is typing...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-blue-800 text-white p-3 rounded-full hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showBack title="HDFC Chat Support" />
      <div className="flex-1 flex flex-col overflow-hidden">
        {stage === 'SELECT_TX' ? renderTxSelector() : renderChat()}
      </div>
    </div>
  );
};