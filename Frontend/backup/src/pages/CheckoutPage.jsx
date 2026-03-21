import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CheckoutPage = () => {
  const [selectedAddress, setSelectedAddress] = useState('home');
  const [selectedPayment, setSelectedPayment] = useState('card');

  return (
    <div className="bg-background text-on-surface font-body antialiased min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center w-full px-6 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tighter text-zinc-900 font-headline">MedPrecision</span>
            <nav className="hidden md:flex gap-6 items-center">
              <Link className="text-zinc-500 font-manrope text-sm font-medium tracking-tight hover:text-zinc-900 transition-all" to="/">Home</Link>
              <Link className="text-zinc-500 font-manrope text-sm font-medium tracking-tight hover:text-zinc-900 transition-all" to="/products">Categories</Link>
              <Link className="text-green-700 font-bold border-b-2 border-green-600 font-manrope text-sm tracking-tight" to="/orders">Orders</Link>
              <Link className="text-zinc-500 font-manrope text-sm font-medium tracking-tight hover:text-zinc-900 transition-all" to="/help">Help</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-zinc-100 rounded-lg transition-all">
              <span className="material-symbols-outlined text-zinc-600">shopping_cart</span>
            </button>
            <img alt="User Avatar" className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/10" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKzCrhrRxS1777wpNfUO6i6CdlPPi5IX-RMm05U6kxgv-quk37F1Fm59wx25hJ-ujpDmdX7dnvw529Z_m0a4ek63C7jFAzEc702t3dt2JP_3DX0rTVFFrhCAsI2ESeOphXhmubsNlBTWxGbOhPMI0hVqf2d8b-yvVGg1fzk3TpINygogA9baRWy-d76RfiQofrJevrKbtOgFJ0ta4sQnnff-JiLgy_D9POvqSnUaSXQv5y9TmiEkGFADgOfs4ngjlvMT4yT0KDZ5fK" />
          </div>
        </div>
        <div className="bg-zinc-100/50 h-[1px] w-full"></div>
      </header>

      <main className="flex-grow pt-24 pb-32 px-4 max-w-7xl mx-auto w-full">
        {/* Progress Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-3xl mx-auto relative z-0">
            {/* Line background */}
            <div className="absolute top-5 left-0 w-full h-[2px] bg-zinc-200 -z-10"></div>
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 group relative z-10">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold font-headline step-active shadow-[0_0_20px_rgba(34,197,94,0.2)]">1</div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary font-label">Address</span>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 group relative z-10">
              <div className="w-10 h-10 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold font-headline">2</div>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 font-label opacity-60">Validation</span>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2 group relative z-10">
              <div className="w-10 h-10 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold font-headline">3</div>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 font-label opacity-60">Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Checkout Steps */}
          <div className="lg:col-span-8 space-y-10">
            {/* STEP 1: ADDRESS */}
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <h2 className="text-2xl font-bold font-headline tracking-tight">Delivery Address</h2>
                </div>
                <button className="text-primary font-semibold text-sm hover:underline">Add New</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="relative block cursor-pointer group">
                  <input 
                    checked={selectedAddress === 'home'} 
                    onChange={() => setSelectedAddress('home')} 
                    className="peer sr-only" 
                    name="address" 
                    type="radio" 
                  />
                  <div className="p-6 rounded-xl bg-surface-container-low border-2 border-transparent peer-checked:border-primary peer-checked:bg-white transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold font-headline">Home</span>
                      <span className="material-symbols-outlined text-primary opacity-0 peer-checked:opacity-100" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      124 Clinical Heights, Silicon Valley<br />
                      California, 94025<br />
                      Contact: +1 (555) 012-3456
                    </p>
                  </div>
                </label>
                <label className="relative block cursor-pointer group">
                  <input 
                    checked={selectedAddress === 'office'} 
                    onChange={() => setSelectedAddress('office')} 
                    className="peer sr-only" 
                    name="address" 
                    type="radio" 
                  />
                  <div className="p-6 rounded-xl bg-surface-container-low border-2 border-transparent peer-checked:border-primary peer-checked:bg-white transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold font-headline">Office</span>
                      <span className="material-symbols-outlined text-primary opacity-0 peer-checked:opacity-100" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      Precision Lab Hub, Block 4C<br />
                      Palo Alto, CA 94301<br />
                      Contact: +1 (555) 987-6543
                    </p>
                  </div>
                </label>
              </div>
            </section>

            {/* STEP 2: PRESCRIPTION VALIDATION */}
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <span className="material-symbols-outlined text-primary">description</span>
                <h2 className="text-2xl font-bold font-headline tracking-tight">Prescription Validation</h2>
              </div>
              <div className="bg-primary/5 rounded-xl border-t-2 border-primary/20 p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Required for Med-Alpha 400mg</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">According to clinical protocols, this item requires a valid medical prescription from a registered practitioner.</p>
                </div>
                <div className="w-full md:w-auto">
                  <label className="flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed border-outline-variant rounded-xl cursor-pointer hover:bg-white/50 transition-all">
                    <span className="material-symbols-outlined text-primary text-3xl mb-2">upload_file</span>
                    <span className="text-sm font-bold text-primary">Upload PDF/JPG</span>
                    <input className="hidden" type="file" />
                  </label>
                </div>
              </div>
              {/* Insight Glow AI Alert */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-surface-container-lowest to-primary/5 border-t border-primary/20 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                  <div>
                    <p className="text-sm font-medium text-on-surface">AI Verification Active</p>
                    <p className="text-xs text-on-surface-variant">Our system will instantly scan your upload for regulatory compliance.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* STEP 3: PAYMENT */}
            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                <h2 className="text-2xl font-bold font-headline tracking-tight">Payment Method</h2>
              </div>
              <div className="space-y-4">
                <div 
                  className={`p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-all ${selectedPayment === 'upi' ? 'bg-white border-2 border-primary shadow-sm' : 'bg-surface-container-low hover:bg-surface-container-high border-2 border-transparent'}`}
                  onClick={() => setSelectedPayment('upi')}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedPayment === 'upi' ? 'bg-primary/10' : 'bg-white'}`}>
                    <span className={`material-symbols-outlined ${selectedPayment === 'upi' ? 'text-primary' : 'text-on-surface'}`}>contactless</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">UPI Transfer</p>
                    <p className="text-xs text-on-surface-variant">Instant verification via PhonePe, Google Pay, BHIM</p>
                  </div>
                  <span className={`material-symbols-outlined ${selectedPayment === 'upi' ? 'text-primary' : 'text-outline'}`} style={selectedPayment === 'upi' ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {selectedPayment === 'upi' ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>

                <div 
                  className={`p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-all ${selectedPayment === 'card' ? 'bg-white border-2 border-primary shadow-sm' : 'bg-surface-container-low hover:bg-surface-container-high border-2 border-transparent'}`}
                  onClick={() => setSelectedPayment('card')}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedPayment === 'card' ? 'bg-primary/10' : 'bg-white'}`}>
                    <span className={`material-symbols-outlined ${selectedPayment === 'card' ? 'text-primary' : 'text-on-surface'}`}>credit_card</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Debit / Credit Card</p>
                    <div className="flex gap-2 mt-1">
                      <div className="h-4 w-6 bg-zinc-200 rounded-sm"></div>
                      <div className="h-4 w-6 bg-zinc-200 rounded-sm"></div>
                    </div>
                  </div>
                  <span className={`material-symbols-outlined ${selectedPayment === 'card' ? 'text-primary' : 'text-outline'}`} style={selectedPayment === 'card' ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {selectedPayment === 'card' ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>

                <div 
                  className={`p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-all ${selectedPayment === 'cod' ? 'bg-white border-2 border-primary shadow-sm' : 'bg-surface-container-low hover:bg-surface-container-high border-2 border-transparent'}`}
                  onClick={() => setSelectedPayment('cod')}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedPayment === 'cod' ? 'bg-primary/10' : 'bg-white'}`}>
                    <span className={`material-symbols-outlined ${selectedPayment === 'cod' ? 'text-primary' : 'text-on-surface'}`}>payments</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Cash on Delivery</p>
                    <p className="text-xs text-on-surface-variant">Available for this location</p>
                  </div>
                  <span className={`material-symbols-outlined ${selectedPayment === 'cod' ? 'text-primary' : 'text-outline'}`} style={selectedPayment === 'cod' ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {selectedPayment === 'cod' ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <aside className="lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-outline-variant/10">
              <h3 className="text-xl font-bold font-headline mb-6">Order Summary</h3>
              <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg bg-surface-container-low flex-shrink-0 overflow-hidden">
                    <img alt="Med-Alpha 400mg" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMaPPqEWcbQ4LaYalKb72sazDZj6ZG-L8hUSeHh_fUAP0mQOGtyKN06fJaCkkeLHhSkMz4Lj3bzRdRvzh5F8ENRqHEj3-KiVKYcGSDasV0vMHdujztcllLUv36qrasRJoyhSFEUkerfbXaWiBEfWquygvrm8b5IQxYoiEEZdfFbIUs1NZpH6DVnD9BFFaZy7bUCL2Ud7lUUyhJD3dmd9aTAvuEwNkRdXzZ813S9lpTxshCr3clw6jS2b11wx8vuncondrFlZ5lgaCW" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold leading-tight">Med-Alpha 400mg Complex</h4>
                    <p className="text-xs text-on-surface-variant">Qty: 2 Packs</p>
                    <p className="text-sm font-bold mt-1 text-primary">$124.50</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg bg-surface-container-low flex-shrink-0 overflow-hidden">
                    <img alt="Oxy-Cleanse Filter" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMWs6E-TJIcsRy088JFjqzTKTD0x0E00GEQGPmnekeBdzYoNhOTDFAQVRq_Alcn0t-HAHE9Ab3ELf2ox4XybB_O2IzGiSnLeBqVUseYKKifemqFaSBOR9Z_PSc1nlOwzvpeydzDQ1d3gX1gxQX8GTNONcY_NAIMhdMQBTiDBGxXyaViCUsQmO7Jj9bciESldNrjdTAbxH4Cj_KFf71R9mvJHk6oXudPBNzWV93EIa_2oVJjpQlMwCAeiDXEj8hlvdLPXMujDt5oKGe" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold leading-tight">Precision Filter Case</h4>
                    <p className="text-xs text-on-surface-variant">Qty: 1 Unit</p>
                    <p className="text-sm font-bold mt-1 text-primary">$45.00</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 py-6 border-t border-zinc-100">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-medium">$169.50</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Shipping Fee</span>
                  <span className="font-medium text-primary">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Taxes (Clinical GST)</span>
                  <span className="font-medium">$12.40</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-zinc-100 mb-8">
                <span className="text-lg font-bold font-headline">Total Amount</span>
                <span className="text-2xl font-black text-primary font-headline tracking-tighter">$181.90</span>
              </div>

              <button className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary py-4 rounded-full font-bold font-headline shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                Place Order
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
              
              <p className="text-[10px] text-center mt-6 text-on-surface-variant font-medium uppercase tracking-widest">
                Clinical Excellence Guaranteed
              </p>
            </div>
            {/* Security Note */}
            <div className="mt-6 flex items-center justify-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-lg">verified_user</span>
              <span className="text-xs font-label">256-bit SSL Encrypted Payment</span>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-50 border-t border-zinc-100 py-12 px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto w-full">
          <div className="col-span-1 md:col-span-1">
            <span className="font-manrope font-bold text-zinc-900 block mb-4">MedPrecision AI</span>
            <p className="text-zinc-500 font-inter text-xs leading-relaxed">© 2024 MedPrecision AI. Clinical Excellence &amp; Fluid Intelligence.</p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Policies</h4>
            <Link className="text-zinc-500 font-inter text-xs hover:text-zinc-900 transition-colors" to="#">Privacy Policy</Link>
            <Link className="text-zinc-500 font-inter text-xs hover:text-zinc-900 transition-colors" to="#">Terms of Service</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Support</h4>
            <Link className="text-zinc-500 font-inter text-xs hover:text-zinc-900 transition-colors" to="#">Contact Medical Hub</Link>
            <Link className="text-zinc-500 font-inter text-xs hover:text-zinc-900 transition-colors" to="#">API Documentation</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Network</h4>
            <p className="text-zinc-500 font-inter text-xs">Global Laboratory Network</p>
            <div className="flex gap-4 mt-2">
              <span className="material-symbols-outlined text-zinc-400 text-sm">public</span>
              <span className="material-symbols-outlined text-zinc-400 text-sm">shield</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom NavBar */}
      <nav className="lg:hidden fixed bottom-0 w-full z-50 rounded-t-3xl bg-white/80 backdrop-blur-lg border-t border-zinc-200 shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center px-4 pt-3 pb-8 w-full">
          <Link to="/" className="flex flex-col items-center justify-center text-zinc-400">
            <span className="material-symbols-outlined">home</span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-manrope mt-1">Home</span>
          </Link>
          <Link to="/products" className="flex flex-col items-center justify-center text-zinc-400">
            <span className="material-symbols-outlined">grid_view</span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-manrope mt-1">Categories</span>
          </Link>
          <Link to="/orders" className="flex flex-col items-center justify-center text-green-600 scale-110">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-manrope mt-1">Orders</span>
          </Link>
          <Link to="/help" className="flex flex-col items-center justify-center text-zinc-400">
            <span className="material-symbols-outlined">contact_support</span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-manrope mt-1">Help</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default CheckoutPage;
