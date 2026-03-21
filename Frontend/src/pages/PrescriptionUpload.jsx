import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function PrescriptionUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(true); // Default to true to show the Stitch design state

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      {/* Top Navigation Bar */}
      <header className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl fixed top-0 w-full z-50 shadow-sm dark:shadow-none">
        <div className="flex justify-between items-center w-full px-6 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <Link to="/dashboard-patient" className="text-xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50 font-headline">MedPrecision</Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/dashboard-patient" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-manrope text-sm font-medium tracking-tight px-3 py-1 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-200">Home</Link>
              <Link to="/categories" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-manrope text-sm font-medium tracking-tight px-3 py-1 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-200">Categories</Link>
              <Link to="/orders" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-manrope text-sm font-medium tracking-tight px-3 py-1 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-200">Orders</Link>
              <a className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-manrope text-sm font-medium tracking-tight px-2 py-1" href="#">Help</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/cart" className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-all active:scale-95">
              <span className="material-symbols-outlined">shopping_cart</span>
            </Link>
            <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-all active:scale-95">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-8 w-8 rounded-full bg-zinc-200 overflow-hidden ml-2">
              <img 
                className="w-full h-full object-cover" 
                alt="User profile" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOQnwkH_hKO_pg_MNpY4oJ_LnYnbmkSvvTtwFLnC0elaY_hKfC6v6SCjAYYolDvxSmvDTJdaIZ5PPxjjUaSRG4sj1tVEpMZyGgVknf7sda8PXkv8PwJadE_H1b1DvWF8KkjoNVARTHLqHjo3khTsPJSWuP0XEHstQCcvUCuiALtAeZV546IDVDkujYzuDNOeU2aG-GJ-ne4xRhnvxcJ5ArOgz7y1DjohQiGDGXe-whchMYhUI2Tn8DReQ595UAxp-rhi1-53FRPWqn"
              />
            </div>
          </div>
        </div>
        <div className="bg-zinc-100/50 dark:bg-zinc-800/50 h-[1px]"></div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Upload Section */}
        <section className="lg:col-span-7 space-y-12">
          <header>
            <span className="text-primary font-bold tracking-widest text-[10px] uppercase font-headline">Clinical Portal</span>
            <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface font-headline mt-2">Upload Prescription</h1>
            <p className="text-on-surface-variant mt-4 max-w-lg leading-relaxed font-body">
              Securely upload your medical documentation. Our AI-powered engine will instantly analyze and extract clinical data for your order.
            </p>
          </header>

          <div className="space-y-6">
            {/* Large Drag & Drop Box */}
            <div className="dashed-box group relative flex flex-col items-center justify-center p-16 transition-all duration-300 hover:bg-surface-container-low cursor-pointer rounded-[1.5rem]">
              <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
              </div>
              <p className="font-headline font-bold text-lg">Drop your file here</p>
              <p className="text-on-surface-variant text-sm mt-1">PDF, JPG, PNG (Max 10MB)</p>
              <input 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                type="file" 
                onChange={() => {
                  setIsUploading(true);
                  setTimeout(() => {
                    setIsUploading(false);
                    setShowPreview(true);
                  }, 2000);
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10">
                <span className="material-symbols-outlined">upload_file</span>
                Choose File
              </button>
              <button className="flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-full bg-surface-container-high text-on-surface font-headline font-bold hover:bg-surface-container-highest active:scale-95 transition-all">
                <span className="material-symbols-outlined text-[#25D366]">chat</span>
                WhatsApp Upload
              </button>
            </div>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-sm ring-1 ring-outline-variant/15 animate-in fade-in slide-in-from-bottom-5 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline font-bold text-lg">Document Preview</h3>
                <span className="px-3 py-1 bg-primary-container/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">Scanned</span>
              </div>
              <div className="relative aspect-[3/4] w-full max-w-md mx-auto rounded-xl overflow-hidden bg-surface-container-low shadow-inner">
                <img 
                  className="w-full h-full object-cover opacity-80 mix-blend-multiply grayscale" 
                  alt="Medical prescription document" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQ5bXht6sR3002BF3wZODcOUhjqBXlOtE6CA3nK7XiCh5Gty7RSeeHQxCYiXlU28FVOhzQGv_yMWh9LLSAShZTzYOoYilxpIHyBEfE-i0_LK_hugVu5GMC9w_YaodUHSzCi0YcQyC2lCmbDCO3er9LglS_QZT1EK0tW83AV4DeuAQwKOnuAwrnDuXdehqLePzhoMCe4vJqJKmDfzZAG-_bpcKi0i-g8Zc_MkMSM2NwV1l7Clp1ZlktXjYuFtEnzzjUoGHH2ywkaUwT"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/40 to-transparent"></div>
                {/* AI Scan Line Animation */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/40 shadow-[0_0_15px_rgba(0,110,47,0.5)] animate-scan"></div>
              </div>
            </div>
          )}
        </section>

        {/* AI Simulation & Extraction Panel */}
        <aside className="lg:col-span-5 space-y-8">
          <div className="insight-glow rounded-[1.5rem] p-8 shadow-sm border border-primary/10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div>
                <h2 className="font-headline font-extrabold text-xl tracking-tight">AI Extraction</h2>
                <p className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">Fluid Intelligence Processing...</p>
              </div>
            </div>

            {/* Medicines List */}
            <div className="space-y-6">
              {[
                { name: 'Amoxicillin 500mg', desc: '15 Capsules • Twice Daily', confidence: '98%', icon: 'pill' },
                { name: 'Lisinopril 10mg', desc: '30 Tablets • Once Daily', confidence: '95%', icon: 'vaccines' },
                { name: 'Ventolin HFA', desc: 'Inhaler • As needed', confidence: '92%', icon: 'medication_liquid', highlighted: true }
              ].map((med, idx) => (
                <div key={idx} className={`flex items-start gap-4 p-4 rounded-xl bg-white shadow-sm hover:translate-x-1 transition-transform duration-200 ${med.highlighted ? 'border-l-4 border-primary' : ''}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-primary ${med.highlighted ? 'bg-primary/5' : 'bg-surface'}`}>
                    <span className="material-symbols-outlined">{med.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-headline font-bold text-sm text-on-surface">{med.name}</span>
                      <span className="text-primary text-[10px] font-bold uppercase tracking-wider">{med.confidence} Match</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 font-body">{med.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary & CTA */}
            <div className="mt-12 pt-8 border-t border-outline-variant/15">
              <div className="flex justify-between items-center mb-6">
                <span className="text-on-surface-variant font-label text-xs uppercase tracking-widest font-bold">Total Items</span>
                <span className="font-headline font-extrabold text-2xl">3</span>
              </div>
              <button className="w-full py-5 px-6 rounded-full bg-primary text-white font-headline font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group">
                Add all to cart
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">shopping_cart_checkout</span>
              </button>
              <p className="text-center text-[10px] text-zinc-400 mt-6 leading-tight uppercase font-bold tracking-tighter">
                Verified by MedPrecision AI System • Clinical Grade Extraction
              </p>
            </div>
          </div>

          {/* Help Card */}
          <div className="p-6 bg-surface-container-low rounded-xl flex items-center gap-4 border border-outline-variant/5">
            <span className="material-symbols-outlined text-secondary">help_center</span>
            <div>
              <p className="text-sm font-bold font-headline text-on-surface">Need assistance?</p>
              <p className="text-xs text-on-surface-variant font-body">Our pharmacists are online 24/7</p>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-50 dark:bg-zinc-950 w-full py-12 px-8 border-t border-zinc-100 dark:border-zinc-900 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <div className="space-y-4">
            <span className="font-manrope font-bold text-zinc-900 dark:text-zinc-100">MedPrecision AI</span>
            <p className="font-inter text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              © 2024 MedPrecision AI. Clinical Excellence & Fluid Intelligence.
            </p>
          </div>
          <div className="flex flex-col gap-3 font-inter text-xs text-zinc-500 dark:text-zinc-400">
            <a className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" href="#">Terms of Service</a>
          </div>
          <div className="flex flex-col gap-3 font-inter text-xs text-zinc-500 dark:text-zinc-400">
            <a className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" href="#">Contact Medical Hub</a>
            <a className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" href="#">API Documentation</a>
          </div>
          <div className="flex justify-end items-end gap-4 text-zinc-400/50">
            <span className="material-symbols-outlined">terminal</span>
            <span className="material-symbols-outlined">security</span>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 w-full z-50 rounded-t-3xl border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center px-4 pt-3 pb-8 w-full">
          <Link to="/dashboard-patient" className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 active:scale-90 transition-transform duration-200">
            <span className="material-symbols-outlined">home</span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-manrope mt-1">Home</span>
          </Link>
          <Link to="/categories" className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 active:scale-90 transition-transform duration-200">
            <span className="material-symbols-outlined">grid_view</span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-manrope mt-1">Categories</span>
          </Link>
          <Link to="/orders" className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 active:scale-90 transition-transform duration-200">
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-manrope mt-1">Orders</span>
          </Link>
          <a className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 active:scale-90 transition-transform duration-200" href="#">
            <span className="material-symbols-outlined">contact_support</span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-manrope mt-1">Help</span>
          </a>
        </div>
      </nav>
    </div>
  );
}

export default PrescriptionUpload;
