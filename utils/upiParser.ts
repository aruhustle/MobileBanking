import { UPIData } from '../types';

// Helper to parse EMV TLV data
const parseBharatQR = (data: string): UPIData | null => {
  try {
    // EMV QR codes usually start with '00' (Payload Format Indicator)
    if (!data.startsWith('00')) return null;

    const tags: Record<string, string> = {};
    let index = 0;

    while (index < data.length) {
      const id = data.substring(index, index + 2);
      const length = parseInt(data.substring(index + 2, index + 4), 10);
      const value = data.substring(index + 4, index + 4 + length);
      
      tags[id] = value;
      index += 4 + length;
    }

    // Extract fields based on EMVCo and NPCI specs
    // Tag 26-51: Merchant Account Information. 
    // In India, Tag 26 is often used for UPI. Inside 26, Subtag 01 is usually the VPA.
    let vpa = null;
    
    // Check Tag 26 for VPA (common in BharatQR)
    if (tags['26']) {
       const merchantInfo = tags['26'];
       // Parse sub-tags
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

    // Fallback: sometimes VPA is directly in other merchant tags or custom tags depending on aggregator
    // For this demo, we rely on Tag 26 -> 01.

    if (!vpa) return null; // Minimal requirement

    const amount = tags['54'] || null; // Transaction Amount
    const name = tags['59'] || null; // Merchant Name
    const mcc = tags['52'] || null; // Merchant Category Code
    const txnRef = tags['62'] ? parseSubTag(tags['62'], '05') : null; // Tag 62 (Additional Data) -> 05 (Reference ID)

    return {
      pa: vpa,
      pn: name,
      am: amount,
      tn: null, // Transaction Note often not in basic BharatQR
      tr: txnRef,
      mc: mcc,
      rawUri: data
    };

  } catch (e) {
    console.error("Error parsing Bharat QR", e);
    return null;
  }
};

const parseSubTag = (tlvString: string, targetId: string): string | null => {
   let index = 0;
   while(index < tlvString.length) {
      const id = tlvString.substring(index, index + 2);
      const len = parseInt(tlvString.substring(index + 2, index + 4), 10);
      const val = tlvString.substring(index + 4, index + 4 + len);
      if (id === targetId) return val;
      index += 4 + len;
   }
   return null;
}

export const parseUPIUri = (uri: string): UPIData | null => {
  if (!uri) return null;

  // Check if it's a Bharat QR (EMV TLV) string
  // These are typically long numeric strings starting with '00'
  if (/^\d+$/.test(uri) || uri.startsWith('00')) {
      const bharatQrData = parseBharatQR(uri);
      if (bharatQrData) return bharatQrData;
  }

  // Basic check for upi:// scheme
  if (!uri.toLowerCase().startsWith('upi://pay')) {
    // It might be a raw string or BharatQR, but for this web demo we focus on standard URIs
    // If it doesn't start with upi://, we try to treat it as query params if it contains "pa="
    if (!uri.includes('pa=')) {
        return null;
    }
  }

  try {
    // Create a dummy URL to leverage URLSearchParams if possible, 
    // or manual parsing if the scheme causes issues in some browsers.
    const queryString = uri.split('?')[1];
    if (!queryString) return null;

    const params = new URLSearchParams(queryString);

    const data: UPIData = {
      pa: params.get('pa'),
      pn: params.get('pn'),
      am: params.get('am'),
      tn: params.get('tn'),
      tr: params.get('tr'),
      mc: params.get('mc'),
      rawUri: uri
    };

    // VPA is mandatory for a valid UPI intent
    if (!data.pa) return null;

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