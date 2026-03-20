import React from 'react';
import { Link } from 'react-router-dom';

const CheckoutPage = () => {
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 glass-header shadow-sm">
        <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tighter text-emerald-900 font-headline">MediFlow</span>
            <div className="hidden md:flex items-center gap-6">
              <Link className="text-emerald-700 border-b-2 border-emerald-700 pb-1 font-headline text-sm font-semibold tracking-tight" to="#">Deliveries</Link>
              <Link className="text-slate-500 hover:text-emerald-600 font-headline text-sm font-semibold tracking-tight" to="#">Inventory</Link>
              <Link className="text-slate-500 hover:text-emerald-600 font-headline text-sm font-semibold tracking-tight" to="#">Analytics</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-50 transition-colors rounded-full">
              <span className="material-symbols-outlined text-emerald-800" data-icon="notifications">notifications</span>
            </button>
            <button className="p-2 hover:bg-slate-50 transition-colors rounded-full">
              <span className="material-symbols-outlined text-emerald-800" data-icon="shopping_cart">shopping_cart</span>
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30">
              <img alt="User Medical Profile" className="w-full h-full object-cover" data-alt="Close up portrait of medical professional" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-VzELQ6yGBtnB1AVwm5exVFLBtZ89IdZgRRJnpT3ivUmbX3Fs7VKCloWm3sh1vOBWHL-axU1lTopiRqQqE9EUl8wh-EhQhuCGHPNnwoKcG2s2sITWVMnaGP9udJ3MkL1eO5Bdgu88m3D2bUaxqBTMROQPcOhidsM7zbp_1qg2QlEI6VbkJ8wD4CEYJ1Km7JU8sb0uWT1bcn9xPINKIaOzRoltSKUKLiK6YBHuO2pwaU-fwBVaEIIECQNceuZk6d2LX4A9xZrymThZ" />
            </div>
          </div>
        </div>
        <div className="bg-slate-200/50 h-[1px] w-full"></div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-24 pb-16 px-6 max-w-7xl mx-auto w-full">
        {/* Progress Indicator */}
        <div className="mb-12 flex items-center justify-center max-w-2xl mx-auto">
          <div className="flex flex-col items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-sm" data-icon="check" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
            </div>
            <span className="text-xs font-semibold text-primary font-label">Cart</span>
          </div>
          <div className="h-[2px] flex-grow mx-4 bg-primary"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary ring-4 ring-primary/10">
              <span className="font-bold text-sm">2</span>
            </div>
            <span className="text-xs font-semibold text-primary font-label">Checkout</span>
          </div>
          <div className="h-[2px] flex-grow mx-4 bg-surface-container-high"></div>
          <div className="flex flex-col items-center gap-2 opacity-50">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
              <span className="font-bold text-sm">3</span>
            </div>
            <span className="text-xs font-semibold text-on-surface-variant font-label">Success</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Delivery Details */}
          <div className="lg:col-span-7 space-y-12">
            {/* Address Confirmation */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-headline tracking-tight">Address Confirmation</h2>
                <button className="text-tertiary font-semibold text-sm hover:underline">Add New Address</button>
              </div>
              <div className="space-y-4">
                <div className="p-6 rounded-xl border border-primary/20 bg-surface-container-lowest shadow-sm flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary-container/10 text-primary">
                    <span className="material-symbols-outlined" data-icon="home" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-on-surface">Home</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded-full">Default</span>
                    </div>
                    <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">4522 Medical Center Blvd, Suite 400<br />Rochester, MN 55901, USA</p>
                    <p className="text-sm text-on-surface-variant mt-2 font-medium">+1 (555) 012-3456</p>
                  </div>
                </div>
                <div className="p-6 rounded-xl bg-surface-container-low border border-transparent hover:border-outline-variant/30 transition-all cursor-pointer flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant">
                    <span className="material-symbols-outlined" data-icon="business">business</span>
                  </div>
                  <div className="flex-grow">
                    <span className="font-bold text-on-surface">St. Mary's Hospital (Ward 4)</span>
                    <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">1216 2nd St SW<br />Rochester, MN 55902, USA</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Delivery Slot Picker */}
            <section>
              <h2 className="text-2xl font-bold font-headline tracking-tight mb-6">Delivery Slot</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border-2 border-primary bg-surface-container-lowest">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-on-surface">ASAP Delivery</span>
                    <span className="material-symbols-outlined text-primary" data-icon="bolt" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                  </div>
                  <p className="text-sm text-on-surface-variant">Delivery within 45-60 mins</p>
                  <div className="mt-4 pt-4 border-t border-outline-variant/10">
                    <span className="text-primary font-bold">Free</span>
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-surface-container-low border border-transparent hover:border-outline-variant/30 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-on-surface">Schedule Time</span>
                    <span className="material-symbols-outlined text-on-surface-variant" data-icon="event">event</span>
                  </div>
                  <p className="text-sm text-on-surface-variant">Select a future time slot</p>
                  <div className="mt-4 pt-4 border-t border-outline-variant/10">
                    <span className="text-on-surface-variant text-sm font-medium">From $2.99</span>
                  </div>
                </div>
              </div>

              {/* Time Strips */}
              <div className="mt-6 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                <button className="flex-shrink-0 px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-bold">Today, 4 PM - 6 PM</button>
                <button className="flex-shrink-0 px-4 py-2 rounded-full bg-surface-container-highest text-on-surface text-xs font-semibold">Today, 6 PM - 8 PM</button>
                <button className="flex-shrink-0 px-4 py-2 rounded-full bg-surface-container-highest text-on-surface text-xs font-semibold">Tomorrow, 8 AM - 10 AM</button>
              </div>
            </section>

            {/* Prescription Review */}
            <section>
              <h2 className="text-2xl font-bold font-headline tracking-tight mb-6">Prescription Review</h2>
              <div className="p-6 rounded-xl bg-surface-container-low">
                <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/10 mb-4">
                  <div className="w-12 h-12 bg-tertiary-fixed-dim/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary" data-icon="description">description</span>
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-bold text-on-surface">RX-8829-Lipitor.pdf</p>
                    <p className="text-xs text-on-surface-variant">Uploaded Oct 24, 2024 • 1.2 MB</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">VERIFIED</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/10">
                  <div className="w-12 h-12 bg-tertiary-fixed-dim/20 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary" data-icon="description">description</span>
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-bold text-on-surface">RX-8830-Amoxicillin.jpg</p>
                    <p className="text-xs text-on-surface-variant">Uploaded Oct 24, 2024 • 2.4 MB</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">VERIFIED</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Order Summary & Payment */}
          <div className="lg:col-span-5 sticky top-24 space-y-8">
            {/* Order Summary Card */}
            <div className="p-8 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/10">
              <h3 className="text-xl font-bold font-headline tracking-tight mb-6">Order Summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Subtotal (3 items)</span>
                  <span className="font-semibold text-on-surface">$142.50</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Delivery Fee</span>
                  <span className="text-primary font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Est. Taxes</span>
                  <span className="font-semibold text-on-surface">$12.80</span>
                </div>
                <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-end">
                  <span className="text-lg font-bold font-headline">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold font-headline text-primary tracking-tight">$155.30</span>
                    <p className="text-[10px] text-on-surface-variant font-medium">Includes HIPAA convenience fee</p>
                  </div>
                </div>
              </div>

              {/* Payment Widget */}
              <div className="mb-8">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-4">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 rounded-xl border-2 border-primary bg-primary/5 flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-primary" data-icon="credit_card">credit_card</span>
                    <span className="text-xs font-bold">Card</span>
                  </button>
                  <button className="p-4 rounded-xl border border-outline-variant/30 hover:border-primary/50 transition-all flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant" data-icon="account_balance_wallet">account_balance_wallet</span>
                    <span className="text-xs font-bold">UPI</span>
                  </button>
                  <button className="p-4 rounded-xl border border-outline-variant/30 hover:border-primary/50 transition-all flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant" data-icon="account_balance">account_balance</span>
                    <span className="text-xs font-bold">Netbanking</span>
                  </button>
                  <button className="p-4 rounded-xl border border-outline-variant/30 hover:border-primary/50 transition-all flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant" data-icon="payments">payments</span>
                    <span className="text-xs font-bold">Wallet</span>
                  </button>
                </div>
              </div>

              {/* Place Order CTA */}
              <button className="w-full py-4 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Place Order
              </button>

              {/* Trust Indicators */}
              <div className="mt-8 pt-8 border-t border-outline-variant/20 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-lg" data-icon="lock">lock</span>
                  <span className="text-[10px] font-semibold text-on-surface-variant leading-tight">256-bit SSL Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-lg" data-icon="verified_user">verified_user</span>
                  <span className="text-[10px] font-semibold text-on-surface-variant leading-tight">HIPAA Compliant Logistics</span>
                </div>
              </div>
            </div>

            {/* Helper Card */}
            <div className="p-6 rounded-xl bg-surface-container-high/50 border border-outline-variant/10">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                By placing your order, you agree to MediFlow's medical privacy terms and pharmaceutical handling guidelines. We ensure all medicine is stored at required temperatures during transit.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 mt-auto bg-slate-100 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 gap-4 max-w-7xl mx-auto w-full">
          <span className="font-inter text-xs text-slate-500 font-medium tracking-tight">© 2024 MediFlow. HIPAA Compliant Secure Logistics.</span>
          <div className="flex gap-6">
            <Link className="text-slate-500 hover:text-emerald-600 font-inter text-xs font-medium" to="#">Privacy Policy</Link>
            <Link className="text-slate-500 hover:text-emerald-600 font-inter text-xs font-medium" to="#">Terms of Service</Link>
            <Link className="text-slate-500 hover:text-emerald-600 font-inter text-xs font-medium" to="#">HIPAA Statement</Link>
            <Link className="text-slate-500 hover:text-emerald-600 font-inter text-xs font-medium" to="#">Support</Link>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation Bar (Shown on small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-header border-t border-slate-200 z-50 flex justify-around items-center py-3">
        <button className="flex flex-col items-center gap-1 text-slate-500">
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          <span className="text-[10px] font-bold">Dashboard</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-emerald-700">
          <span className="material-symbols-outlined" data-icon="local_shipping" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
          <span className="text-[10px] font-bold">Shipments</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500">
          <span className="material-symbols-outlined" data-icon="ac_unit">ac_unit</span>
          <span className="text-[10px] font-bold">Cold Chain</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500">
          <span className="material-symbols-outlined" data-icon="description">description</span>
          <span className="text-[10px] font-bold">Records</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-500">
          <span className="material-symbols-outlined" data-icon="settings">settings</span>
          <span className="text-[10px] font-bold">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
