

import { Biller, Bill } from '../types';

const BILLERS_KEY = 'hdfc_billers';
const BILLS_KEY = 'hdfc_bills';

export const getBillers = (): Biller[] => {
  try {
    return JSON.parse(localStorage.getItem(BILLERS_KEY) || '[]');
  } catch { return []; }
};

export const addBiller = (biller: Biller) => {
  const billers = getBillers();
  billers.push(biller);
  localStorage.setItem(BILLERS_KEY, JSON.stringify(billers));
  
  // When adding a biller, verify and fetch a mock pending bill
  generateMockBill(biller.id);
};

export const updateBiller = (updatedBiller: Biller) => {
  const billers = getBillers();
  const index = billers.findIndex(b => b.id === updatedBiller.id);
  if (index !== -1) {
    billers[index] = updatedBiller;
    localStorage.setItem(BILLERS_KEY, JSON.stringify(billers));
  }
};

export const removeBiller = (id: string) => {
  const billers = getBillers();
  const filtered = billers.filter(b => b.id !== id);
  localStorage.setItem(BILLERS_KEY, JSON.stringify(filtered));
};

export const getBills = (): Bill[] => {
  try {
    return JSON.parse(localStorage.getItem(BILLS_KEY) || '[]');
  } catch { return []; }
};

export const markBillPaid = (billId: string) => {
  const bills = getBills();
  const idx = bills.findIndex(b => b.id === billId);
  if (idx > -1) {
    bills[idx].status = 'PAID';
    bills[idx].paidDate = new Date().toISOString();
    localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
  }
};

const generateMockBill = (billerId: string) => {
  const bills = getBills();
  // Don't add if pending bill exists
  if (bills.find(b => b.billerId === billerId && b.status === 'PENDING')) return;

  const amount = (Math.floor(Math.random() * 2000) + 100).toString();
  const newBill: Bill = {
    id: crypto.randomUUID(),
    billerId,
    amount,
    billDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 15).toISOString(), // 15 days from now
    status: 'PENDING'
  };
  
  bills.push(newBill);
  localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
};

// Helper to get bills with biller details
export const getBillsWithDetails = () => {
    const bills = getBills();
    const billers = getBillers();
    
    return bills.map(bill => {
        const biller = billers.find(b => b.id === bill.billerId);
        return {
            ...bill,
            billerName: biller?.name || 'Unknown Biller',
            billerCategory: biller?.category,
            billerIcon: biller?.icon
        };
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
};