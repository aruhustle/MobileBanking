
import { UPIData } from '../types';

// Helper to format VPA handle into a readable name
// e.g. "amazon.pay@hdfc" -> "Amazon Pay"
const deriveNameFromVPA = (vpa: string): string => {
  try {
    if (!vpa) return 'Unknown Merchant';
    const handle = vpa.split('@')[0];
    // Replace dots, underscores, hyphens with spaces and capitalize words
    return handle
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
      .trim();
  } catch (e) {
    return 'Merchant';
  }
};

// Helper to parse Additional Data (Tag 62) in BharatQR
const parseAdditionalData = (tlv: string) => {
  const data: Record<string, string> = {};
  let i = 0;
  while (i < tlv.length) {
    // Sub-tag ID (2 chars)
    const id = tlv.substring(i, i + 2);
    // Length (2 chars)
    const len = parseInt(tlv.substring(i + 2, i + 4), 10);
    if (isNaN(len)) break;
    // Value
    const val = tlv.substring(i + 4, i + 4 + len);
    
    if (id === '01') data.billNumber = val;
    if (id === '05') data.referenceId = val;
    if (id === '07') data.terminalId = val;
    if (id === '08') data.storeId = val;
    
    i += 4 + len;
  }
  return data;
};

// Helper to parse EMV TLV data (BharatQR)
const parseBharatQR = (data: string): UPIData | null => {
  try {
    // EMV QR codes usually start with '00' (Payload Format Indicator)
    if (!data.startsWith('00')) return null;

    const tags: Record<string, string> = {};
    let index = 0;

    while (index < data.length) {
      const id = data.substring(index, index + 2);
      const length = parseInt(data.substring(index + 2, index + 4), 10);
      if (isNaN(length)) break;
      const value = data.substring(index + 4, index + 4 + length);
      
      tags[id] = value;
      index += 4 + length;
    }

    // Tag 26-51: Merchant Account Information. 
    // Tag 26 is specifically reserved for UPI in India.
    let vpa = null;
    if (tags['26']) {
       const merchantInfo = tags['26'];
       let subIndex = 0;
       while (subIndex < merchantInfo.length) {
         const subId = merchantInfo.substring(subIndex, subIndex + 2);
         const subLen = parseInt(merchantInfo.substring(subIndex + 2, subIndex + 4), 10);
         const subVal = merchantInfo.substring(subIndex + 4, subIndex + 4 + subLen);
         
         if (subId === '01') {
            vpa = subVal;
            break;
         }
         subIndex += 4 + subLen;
       }
    }

    if (!vpa) return null; // Minimal requirement

    const amount = tags['54'] || null; // Transaction Amount
    let name = tags['59'] || null; // Merchant Name
    const mcc = tags['52'] || null; // Merchant Category Code
    
    // Tag 53: Transaction Currency Code (ISO 4217)
    // 356 = INR
    const currencyCode = tags['53'];
    let currency = 'INR';
    if (currencyCode === '356') currency = 'INR';
    else if (currencyCode) currency = currencyCode; // Use raw if not 356

    // Tag 58: Country Code (ISO 3166-1 alpha-2) e.g., 'IN'
    const country = tags['58'] || 'IN';

    // Tag 60: Merchant City
    const city = tags['60'] || null;

    // Tag 61: Postal Code
    const postalCode = tags['61'] || null;

    // Tag 62: Additional Data Template
    let txnRef = null;
    let billNumber = null;
    
    if (tags['62']) {
        const additional = parseAdditionalData(tags['62']);
        txnRef = additional.referenceId || null;
        billNumber = additional.billNumber || null;
    }

    // Fallback for missing name
    if (!name && vpa) {
      name = deriveNameFromVPA(vpa);
    }

    return {
      pa: vpa,
      pn: name,
      am: amount,
      tn: billNumber ? `Bill: ${billNumber}` : null, // Use bill number as note if available
      tr: txnRef,
      mc: mcc,
      cu: currency,
      merchantDetails: {
        city: city || undefined,
        country: country || undefined,
        postalCode: postalCode || undefined
      },
      rawUri: data
    };

  } catch (e) {
    console.error("Error parsing Bharat QR", e);
    return null;
  }
};

export const parseUPIUri = (uri: string): UPIData | null => {
  if (!uri) return null;

  // Check if it's a Bharat QR (EMV TLV) string
  if (/^\d+$/.test(uri) || uri.startsWith('00')) {
      const bharatQrData = parseBharatQR(uri);
      if (bharatQrData) return bharatQrData;
  }

  // Basic check for upi:// scheme, but remain flexible for raw params
  const lowerUri = uri.toLowerCase();
  
  // Try to extract query string
  let queryString = '';
  if (lowerUri.includes('?')) {
      queryString = uri.split('?')[1];
  } else if (lowerUri.includes('pa=')) {
      // It might be just the query params
      queryString = uri;
  } else {
      return null; 
  }

  try {
    const params = new URLSearchParams(queryString);
    
    const pa = params.get('pa');
    if (!pa) return null; // VPA is mandatory

    let pn = params.get('pn');
    if (!pn) {
      pn = deriveNameFromVPA(pa);
    }

    // Extract aliases
    // tr = Transaction Reference ID
    // tid = Transaction ID (often used interchangeably in simple QR gens)
    const tr = params.get('tr') || params.get('tid');
    
    // mc = Merchant Category Code
    // mcc = Common alias
    const mc = params.get('mc') || params.get('mcc');

    const data: UPIData = {
      pa: pa,
      pn: pn,
      am: params.get('am'),
      tn: params.get('tn'),
      tr: tr,
      mc: mc,
      cu: params.get('cu') || params.get('curr') || 'INR',
      rawUri: uri
    };

    return data;
  } catch (e) {
    console.error("Error parsing UPI URI", e);
    return null;
  }
};

export const formatCurrency = (amount: string | null | undefined): string => {
  if (!amount) return '0.00';
  const num = parseFloat(amount);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
};
