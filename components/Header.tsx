
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MoreVertical, User, HeadphonesIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showMenu?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack = false, showMenu = false, onBack }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBack = () => {
    if (onBack) {
        onBack();
        return;
    }
    
    // Robust back navigation
    if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
    } else {
        navigate('/');
    }
  };

  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack && (
          <button 
            onClick={handleBack} 
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <ArrowLeft size={24} />
          </button>
        )}
        {title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
        {!title && !showBack && (
           <div className="flex items-center gap-2">
             <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-md">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg" 
                  alt="HDFC Bank" 
                  className="w-full h-full object-cover object-left" 
                />
             </div>
             <span className="font-bold text-xl tracking-tight text-gray-900">MobileBanking</span>
           </div>
        )}
      </div>
      
      {showMenu && (
        <div className="relative" ref={menuRef}>
           <button 
             onClick={() => setIsMenuOpen(!isMenuOpen)}
             className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
           >
             <MoreVertical size={24} />
           </button>

           {isMenuOpen && (
             <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in z-50">
                <button 
                  onClick={() => { setIsMenuOpen(false); navigate('/profile'); }}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <User size={18} />
                  Profile
                </button>
                <div className="h-px bg-gray-100 mx-4 my-1"></div>
                <button 
                  onClick={() => { setIsMenuOpen(false); navigate('/support'); }}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <HeadphonesIcon size={18} />
                  Customer Support
                </button>
             </div>
           )}
        </div>
      )}
      
      {!showMenu && <div className="w-10" />} {/* Spacer */}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
