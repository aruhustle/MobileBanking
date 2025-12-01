
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, Send, History, Bell, User, Receipt, Contact as ContactIcon } from 'lucide-react';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { getRecentPayees } from '../utils/historyManager';

interface Contact {
  id: string;
  name: string;
  color: string;
}

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    setContacts(getRecentPayees());
  }, []);

  const handleContactClick = (contact: Contact) => {
    navigate('/manual', { 
        state: { 
            initialVpa: contact.id, 
            initialName: contact.name 
        }
    });
  };

  const pickContact = async () => {
    const nav = navigator as any;
    // Feature detection for Contact Picker API
    if ('contacts' in nav && 'select' in nav.contacts) {
      try {
        const props = ['name', 'tel'];
        const opts = { multiple: false };
        const contacts = await nav.contacts.select(props, opts);
        
        if (contacts.length) {
            const contact = contacts[0];
            const name = contact.name?.[0] || 'Unknown';
            // Extract raw number, remove non-digits
            let phone = contact.tel?.[0] || '';
            phone = phone.replace(/\D/g, '').slice(-10); // Last 10 digits
            
            if (phone.length === 10) {
                 navigate('/manual', {
                    state: {
                        initialVpa: `${phone}@hdfc`, // Assuming HDFC VPA pattern
                        initialName: name
                    }
                 });
            } else {
                alert("Selected contact does not have a valid 10-digit mobile number.");
                navigate('/manual');
            }
        }
      } catch (ex) {
        // User cancelled or error
        console.log("Contact picker cancelled or failed", ex);
      }
    } else {
      // Fallback for iOS / Desktop where API is not supported
      // Directly navigate to manual entry without error message
      navigate('/manual');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header showMenu />
      
      <div className="p-4 space-y-6">
        
        {/* Hero Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
             <Scan className="text-blue-700" size={32} />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Scan & Pay</h2>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Scan any UPI QR code to pay instantly from your HDFC Bank account.
          </p>
          <div className="pt-2">
            <Button onClick={() => navigate('/scan')} fullWidth className="bg-blue-800 hover:bg-blue-900">
              Scan QR Code
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4">
           <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => navigate('/manual')}
                className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 hover:bg-indigo-200 transition"
              >
                <Send size={20} />
              </button>
              <span className="text-xs font-medium text-gray-600">Pay ID</span>
           </div>
           
           <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => navigate('/bills')}
                className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 hover:bg-orange-200 transition"
              >
                <Receipt size={20} />
              </button>
              <span className="text-xs font-medium text-gray-600">Bills</span>
           </div>

           <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => navigate('/reminders')}
                className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 hover:bg-purple-200 transition"
              >
                <Bell size={20} />
              </button>
              <span className="text-xs font-medium text-gray-600">Remind</span>
           </div>

           <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => navigate('/history')}
                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
              >
                <History size={20} />
              </button>
              <span className="text-xs font-medium text-gray-600">History</span>
           </div>
        </div>

        {/* People & Bills */}
        <div>
          <h3 className="text-md font-bold text-gray-800 mb-4">Send Money</h3>
          <div className="grid grid-cols-4 gap-y-6 gap-x-2">
            
            {/* Contacts Button */}
            <div 
              className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80"
              onClick={pickContact}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold bg-blue-50 text-blue-600 border border-blue-100">
                 <ContactIcon size={24} />
              </div>
              <span className="text-xs text-gray-600 font-medium text-center truncate w-full px-1">
                Contacts
              </span>
            </div>

            {contacts.map(contact => (
              <div 
                key={contact.id} 
                className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80"
                onClick={() => handleContactClick(contact)}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${contact.color}`}>
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-gray-600 font-medium text-center truncate w-full px-1">
                  {contact.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Promo Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-4 text-white shadow-md">
           <h3 className="font-bold text-lg mb-1">Invite friends</h3>
           <p className="text-blue-100 text-sm mb-3">Get rewards when you invite your friends to HDFC Bank.</p>
           <button className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg font-medium hover:bg-white/30">
             Invite Now
           </button>
        </div>
      </div>
    </div>
  );
};