
import { GoogleGenAI } from "@google/genai";
import { Transaction } from '../types';

// Initialize GenAI
// Note: In a real production build, ensure process.env.API_KEY is set.
// We handle the missing key gracefully for the demo.
const apiKey = process.env.API_KEY || 'DEMO_KEY';
const genAI = new GoogleGenAI({ apiKey });

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

export const generateSupportResponse = async (
  userMessage: string, 
  transactionContext?: Transaction | null,
  chatHistory?: ChatMessage[]
): Promise<string> => {
  
  // Construct system instruction with context
  let systemInstruction = `You are a helpful, polite, and professional customer support agent for 'HDFC Bank Mobile App'. 
  Keep your answers concise (under 50 words if possible) and reassuring. Always maintain the professional tone of a premier bank.`;

  if (transactionContext) {
    systemInstruction += `
    The user is asking about a specific transaction:
    - Payee: ${transactionContext.pn || transactionContext.pa}
    - Amount: ₹${transactionContext.am}
    - Date: ${new Date(transactionContext.date).toLocaleDateString()}
    - Status: ${transactionContext.status}
    - UTR: ${transactionContext.utr || 'Not generated'}
    
    If the status is FAILURE, explain that money is usually refunded within 3-5 business days to their HDFC savings account.
    If the status is SUCCESS but receiver didn't get it, suggest checking with the receiver's bank using the UTR.
    `;
  } else {
    systemInstruction += ` The user has a general query about banking, UPI, or the app.`;
  }

  try {
    // Check if we have a valid-looking key (simple check for demo purposes)
    if (apiKey === 'DEMO_KEY') {
      throw new Error("No API Key");
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: {
        parts: [{ text: systemInstruction }],
        role: 'system'
      }
    });
    
    const result = await model.generateContent({
      contents: { role: 'user', parts: [{ text: userMessage }] }
    });

    const responseText = result.response.text;
    return responseText || "I'm sorry, I didn't catch that. Could you rephrase?";

  } catch (error) {
    console.warn("AI generation failed (likely no API key), using fallback logic.", error);
    return mockResponse(userMessage, transactionContext);
  }
};

// Fallback logic when API is not available
const mockResponse = (message: string, tx?: Transaction | null): string => {
  const msg = message.toLowerCase();
  
  if (tx) {
    if (msg.includes('refund') || msg.includes('back')) return "For failed transactions, refunds are initiated instantly to your HDFC account but may take 3-5 banking days to reflect.";
    if (msg.includes('fraud') || msg.includes('scam')) return "I've flagged this transaction for review. Our HDFC fraud team will contact you within 24 hours.";
    if (msg.includes('pending') || msg.includes('wait')) return "UPI transactions usually settle instantly, but bank servers can be slow. Please wait 1 hour.";
    return `I see you have a query about the payment of ₹${tx.am} to ${tx.pn}. Since I am in offline mode, please email support@hdfcbank.com with UTR ${tx.utr || 'N/A'}.`;
  }

  if (msg.includes('hi') || msg.includes('hello')) return "Hello! Welcome to HDFC Bank Support. How can I help you today?";
  if (msg.includes('balance')) return "You can check your balance on the Profile screen by tapping the eye icon.";
  
  return "I am currently offline. Please try again later or contact support@hdfcbank.com.";
};