

export interface UPIData {
  pa: string | null; // Payee Address (VPA)
  pn: string | null; // Payee Name
  am: string | null; // Amount
  tn: string | null; // Transaction Note
  tr: string | null; // Transaction Reference ID
  mc: string | null; // Merchant Category Code
  cu?: string | null; // Currency Code
  rawUri: string;
  bankDetails?: {
    accNo: string;
    ifsc: string;
  };
}

export interface Transaction {
  id: string; // Internal UUID
  pa: string;
  pn: string;
  am: string;
  tn: string | null;
  date: string;
  status: 'INITIATED' | 'SUCCESS' | 'FAILURE';
  utr?: string;
  txnRef?: string;
  mc?: string | null; // Merchant Category Code
  type?: 'DEBIT' | 'CREDIT';
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  bankDetails?: {
    accNo: string;
    ifsc: string;
  };
}

export enum PaymentStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string; // acts as username/phone
  password: string;
  name: string;
  vpa: string;
  balance: number;
  phone: string;
}

export interface Reminder {
  id: string;
  pa: string;
  pn: string;
  amount?: string;
  dueDate?: string; // ISO Date string
  note?: string;
  frequency?: 'ONCE' | 'MONTHLY';
}

export interface Biller {
  id: string;
  name: string;
  category: 'ELECTRICITY' | 'MOBILE' | 'DTH' | 'BROADBAND' | 'GAS' | 'FASTAG';
  identifierLabel: string; // e.g. "Consumer Number", "Mobile Number"
  identifierValue: string;
  icon?: string;
}

export interface Bill {
  id: string;
  billerId: string;
  amount: string;
  dueDate: string;
  status: 'PENDING' | 'PAID';
  billDate: string;
  paidDate?: string;
}