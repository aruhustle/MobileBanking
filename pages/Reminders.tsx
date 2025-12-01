
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { getReminders, deleteReminder } from '../utils/reminderManager';
import { Reminder } from '../types';
import { Bell, Trash2, Send } from 'lucide-react';
import { formatCurrency } from '../utils/historyManager';

export const Reminders: React.FC = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = () => {
    setReminders(getReminders());
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this reminder?")) {
      deleteReminder(id);
      loadReminders();
    }
  };

  const handlePay = (reminder: Reminder) => {
    navigate('/manual', {
      state: {
        initialVpa: reminder.pa,
        initialName: reminder.pn,
        initialAmount: reminder.amount
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showBack title="Payment Reminders" />
      
      <div className="flex-1 p-4">
        {reminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-center">
            <Bell size={48} className="mb-4 opacity-20" />
            <p>No reminders set.</p>
            <p className="text-xs mt-2 max-w-xs">Set reminders from your transaction history to pay bills on time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                            {reminder.pn.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm">{reminder.pn}</h4>
                            <p className="text-xs text-gray-500">{reminder.pa}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-gray-900">₹{formatCurrency(reminder.amount || 0)}</p>
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{reminder.frequency || 'Once'}</span>
                    </div>
                </div>
                
                {reminder.note && (
                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg mb-4 italic">
                        "{reminder.note}"
                    </p>
                )}

                <div className="flex gap-3 border-t border-gray-50 pt-3">
                    <button 
                        onClick={() => handleDelete(reminder.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                    >
                        <Trash2 size={18} />
                    </button>
                    <Button fullWidth onClick={() => handlePay(reminder)} className="h-10 text-sm">
                        <Send size={16} className="mr-2" /> Pay Now
                    </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
