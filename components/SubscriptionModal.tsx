
import React, { useState } from 'react';
import { X, Check, QrCode, CreditCard, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUpgrade: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, user, onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'half' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | null>(null);

  if (!isOpen) return null;

  const UPI_ID = "6378966541@ibl";
  const BANK_DETAILS = {
    accountNumber: "YOUR_ACCOUNT_NUMBER_HERE", // Rewrite this in code
    ifsc: "YOUR_IFSC_CODE_HERE",               // Rewrite this in code
    bankName: "YOUR_BANK_NAME",                // Rewrite this in code
    holderName: "YOUR_NAME"                    // Rewrite this in code
  };

  const plans = {
    monthly: { price: 29, duration: '1 Month', label: 'Seeker' },
    half: { price: 100, duration: '6 Months', label: 'Sage' },
    yearly: { price: 180, duration: '1 Year', label: 'Rishi' }
  };

  const handlePaymentComplete = () => {
    // In a real app, verify payment here
    setTimeout(() => {
        onUpgrade();
        onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-[#1c1917] w-full max-w-2xl rounded-2xl border border-saffron-500/30 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-800 flex justify-between items-start bg-gradient-to-r from-stone-900 to-stone-900">
           <div>
             <h2 className="text-2xl font-serif font-bold text-saffron-400">Dakshina (Subscription)</h2>
             <p className="text-stone-400 text-sm mt-1">Unlock unlimited wisdom. Your free searches (20) have ended.</p>
           </div>
           <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
             <X size={24} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {!paymentMethod ? (
                <>
                    <h3 className="text-stone-200 font-semibold mb-4">Select a Plan</h3>
                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                        {(Object.keys(plans) as Array<keyof typeof plans>).map((key) => (
                            <div 
                                key={key}
                                onClick={() => setSelectedPlan(key)}
                                className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${selectedPlan === key ? 'border-saffron-500 bg-saffron-900/10' : 'border-stone-800 bg-stone-900/40 hover:border-stone-600'}`}
                            >
                                <div className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">{plans[key].label}</div>
                                <div className="text-3xl font-serif font-bold text-white mb-1">₹{plans[key].price}</div>
                                <div className="text-sm text-stone-400">{plans[key].duration}</div>
                                {selectedPlan === key && (
                                    <div className="absolute top-2 right-2 text-saffron-500"><Check size={18} /></div>
                                )}
                            </div>
                        ))}
                    </div>

                    <h3 className="text-stone-200 font-semibold mb-4">Payment Method</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setPaymentMethod('upi')}
                            className="flex flex-col items-center justify-center p-6 bg-stone-900 border border-stone-800 rounded-xl hover:bg-stone-800 hover:border-vedic-teal-500/50 transition-all"
                        >
                            <QrCode size={32} className="text-vedic-teal-400 mb-3" />
                            <span className="font-medium text-stone-200">UPI / QR Code</span>
                        </button>
                        <button 
                            onClick={() => setPaymentMethod('card')}
                            className="flex flex-col items-center justify-center p-6 bg-stone-900 border border-stone-800 rounded-xl hover:bg-stone-800 hover:border-saffron-500/50 transition-all"
                        >
                            <CreditCard size={32} className="text-saffron-400 mb-3" />
                            <span className="font-medium text-stone-200">Card / NetBanking</span>
                        </button>
                    </div>
                </>
            ) : (
                <div className="animate-fade-in">
                    <button onClick={() => setPaymentMethod(null)} className="text-sm text-stone-500 hover:text-stone-300 mb-4 flex items-center gap-1">← Back to plans</button>
                    
                    {paymentMethod === 'upi' && (
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-white p-4 rounded-xl mb-6">
                                {/* Generating QR code for the specific VPA and Amount */}
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${UPI_ID}%26pn=VedicWisdom%26am=${plans[selectedPlan].price}%26cu=INR`} 
                                    alt="UPI QR Code" 
                                    className="w-48 h-48"
                                />
                            </div>
                            <div className="bg-stone-900 px-4 py-2 rounded-lg border border-stone-800 mb-4 flex items-center gap-2">
                                <span className="text-stone-400 text-sm">UPI ID:</span>
                                <span className="text-saffron-400 font-mono font-bold">{UPI_ID}</span>
                            </div>
                            <p className="text-stone-500 text-sm mb-6">Scan with any UPI app to pay ₹{plans[selectedPlan].price}</p>
                            <button 
                                onClick={handlePaymentComplete}
                                className="px-8 py-3 bg-vedic-teal-600 hover:bg-vedic-teal-500 text-white rounded-lg font-bold transition-all"
                            >
                                I have made the payment
                            </button>
                        </div>
                    )}

                    {paymentMethod === 'card' && (
                        <div className="space-y-6">
                            <div className="bg-stone-900 p-6 rounded-xl border border-stone-800">
                                <h4 className="text-saffron-400 font-bold mb-4 flex items-center gap-2">
                                    <ShieldCheck size={18} /> Bank Transfer Details
                                </h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-stone-800 pb-2">
                                        <span className="text-stone-500">Account Number</span>
                                        <span className="text-white font-mono">{BANK_DETAILS.accountNumber}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-stone-800 pb-2">
                                        <span className="text-stone-500">IFSC Code</span>
                                        <span className="text-white font-mono">{BANK_DETAILS.ifsc}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-stone-800 pb-2">
                                        <span className="text-stone-500">Bank Name</span>
                                        <span className="text-white">{BANK_DETAILS.bankName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-stone-500">Beneficiary Name</span>
                                        <span className="text-white">{BANK_DETAILS.holderName}</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={handlePaymentComplete}
                                className="w-full py-3 bg-saffron-600 hover:bg-saffron-500 text-white rounded-lg font-bold transition-all"
                            >
                                Confirm Transfer
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
