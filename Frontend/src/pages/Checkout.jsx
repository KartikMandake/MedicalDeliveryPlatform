import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Checkout() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleCompletePurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert('Order Placed Successfully! Your medical supplies are on the way.');
      navigate('/orders');
    }, 2000);
  };

  return (
    <div className="bg-background font-body text-on-surface min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 glass-nav shadow-sm">
        <div className="flex justify-between items-center w-full px-6 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <Link to="/dashboard-patient" className="text-xl font-bold tracking-tighter text-zinc-900 font-headline">MediFlow</Link>
          </div>
          <div className="flex items-center gap-4 text-sm font-bold text-zinc-500">
             <span className="flex items-center gap-1 text-primary">
                <span className="material-symbols-outlined text-sm">lock</span>
                Secure Checkout
             </span>
          </div>
        </div>
        <div className="bg-zinc-100/50 h-[1px]"></div>
      </nav>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT: Shipping & Payment */}
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-50">
              <h2 className="text-xl font-bold font-headline mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-black">1</span>
                Shipping Destination
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border-2 border-primary bg-primary/5 cursor-pointer relative">
                    <span className="absolute top-4 right-4 material-symbols-outlined text-primary text-sm">check_circle</span>
                    <h4 className="font-bold text-sm mb-1">Home (Default)</h4>
                    <p className="text-xs text-zinc-500">Sector 42, H-Block, Rosewood Apts<br/>Gurugram, HR 122001</p>
                </div>
                <div className="p-4 rounded-2xl border border-zinc-100 hover:border-zinc-200 cursor-pointer transition-all">
                    <h4 className="font-bold text-sm mb-1">Office</h4>
                    <p className="text-xs text-zinc-500">Cyber Hub, Building 10C, 4th Floor<br/>Gurugram, HR 122002</p>
                </div>
              </div>
              <button className="mt-6 text-primary text-xs font-bold flex items-center gap-2 hover:underline">
                <span className="material-symbols-outlined text-sm">add</span> Add New Address
              </button>
            </section>

            <section className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-50">
              <h2 className="text-xl font-bold font-headline mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-black">2</span>
                Payment Method
              </h2>
              <div className="space-y-4">
                {[
                    { id: 'card', name: 'Credit / Debit Card', icon: 'credit_card' },
                    { id: 'apple', name: 'Apple Pay', icon: 'apple' },
                    { id: 'google', name: 'Google Pay', icon: 'account_balance_wallet' }
                ].map((method) => (
                    <label key={method.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer 
                      ${paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-zinc-100 hover:border-zinc-200'}`}>
                        <div className="flex items-center gap-4">
                            <input 
                              type="radio" 
                              name="payment" 
                              className="sr-only" 
                              checked={paymentMethod === method.id}
                              onChange={() => setPaymentMethod(method.id)}
                            />
                            <span className={`material-symbols-outlined ${paymentMethod === method.id ? 'text-primary' : 'text-zinc-400'}`}>{method.icon}</span>
                            <span className="text-sm font-medium">{method.name}</span>
                        </div>
                        {paymentMethod === method.id && <span className="material-symbols-outlined text-primary text-sm">check_circle</span>}
                    </label>
                ))}
              </div>
              
              {paymentMethod === 'card' && (
                  <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2 space-y-1">
                              <label className="text-[10px] font-bold uppercase text-zinc-400">Card Number</label>
                              <input className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="xxxx xxxx xxxx xxxx" type="text" />
                          </div>
                          <div className="space-y-1">
                               <label className="text-[10px] font-bold uppercase text-zinc-400">Expiry</label>
                               <input className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="MM/YY" type="text" />
                          </div>
                          <div className="space-y-1">
                               <label className="text-[10px] font-bold uppercase text-zinc-400">CVV</label>
                               <input className="w-full bg-zinc-50 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="***" type="password" />
                          </div>
                      </div>
                  </div>
              )}
            </section>
          </div>

          {/* RIGHT: Order Summary */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900 text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -mr-16 -mt-16"></div>
               <h2 className="text-xl font-bold font-headline mb-8 relative z-10">Order Summary</h2>
               <div className="space-y-4 mb-8 relative z-10">
                  <div className="flex justify-between text-xs text-zinc-400">
                      <span>Clinical Selections (3)</span>
                      <span className="font-bold text-white">$225.50</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                      <span>Premium Delivery</span>
                      <span className="text-primary font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                      <span>Clinical Tax</span>
                      <span className="font-bold text-white">$18.04</span>
                  </div>
               </div>
               <div className="h-[1px] bg-zinc-800 mb-6 relative z-10"></div>
               <div className="flex justify-between items-baseline mb-10 relative z-10">
                   <span className="text-sm font-bold text-zinc-400">Total Price</span>
                   <span className="text-3xl font-black text-white">$243.54</span>
               </div>
               
               <button 
                 onClick={handleCompletePurchase}
                 disabled={isProcessing}
                 className={`w-full py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-primary-container transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed`}
               >
                 {isProcessing ? (
                   <>
                     <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                     Processing...
                   </>
                 ) : (
                   <>
                     Complete Purchase
                     <span className="material-symbols-outlined">verified</span>
                   </>
                 )}
               </button>
               
               <p className="text-[10px] text-center text-zinc-500 mt-6 px-4">
                 By completing purchase, you agree to our clinical service terms and automatic inventory synchronization.
               </p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-sm">security</span>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-zinc-900 mb-1">Secure Transactions</h4>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">Medical-grade encryption (TLS 1.3) ensures your PCI data never touches our servers directly.</p>
                </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-zinc-50 border-t border-zinc-100 mt-20">
         <div className="max-w-7xl mx-auto py-8 px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest">© 2026 MediFlow Clinical Network</p>
            <div className="flex gap-8">
                <Link to="/cart" className="text-[10px] font-bold text-zinc-500 hover:text-zinc-900">Return to Cart</Link>
                <Link to="/categories" className="text-[10px] font-bold text-zinc-500 hover:text-zinc-900">Health Hub</Link>
            </div>
         </div>
      </footer>
    </div>
  );
}

export default Checkout;
