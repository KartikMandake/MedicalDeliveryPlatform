import React from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      {/* TopAppBar Suppressed as per Navigation Shell Mandate for Transactional Pages */}
      <main className="flex-grow flex flex-col md:flex-row">
        {/* Left Column: Branding & Imagery */}
        <div className="hidden md:flex md:w-1/2 primary-gradient relative overflow-hidden flex-col justify-center px-16 text-white">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <svg height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" width="100%">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white"></path>
            </svg>
          </div>
          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur-md text-primary-fixed font-semibold text-sm">
                Precision CareChain
              </span>
              <h1 className="font-headline font-extrabold text-5xl tracking-tight leading-tight">
                Fast &amp; Reliable <br />Medicine Delivery
              </h1>
              <p className="text-xl text-primary-fixed/80 max-w-md font-medium">
                24/7 service for your healthcare needs, ensuring life-saving supplies reach the right hands at the right time.
              </p>
            </div>
            <div className="pt-8">
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 inline-flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">local_shipping</span>
                </div>
                <div>
                  <p className="font-bold text-lg">99.9% Success Rate</p>
                  <p className="text-sm opacity-70">Over 2 million clinical deliveries tracked</p>
                </div>
              </div>
            </div>
          </div>
          {/* Illustration Mockup */}
          <div className="absolute bottom-0 right-0 w-3/4 opacity-20 translate-y-1/4 translate-x-1/4">
            <img
              alt="Medical delivery drone and vehicle"
              className="w-full object-contain"
              data-alt="Abstract illustration of medical delivery drones and smart vehicles"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTEscCQEhGsP5qX-TFbBJiyvNrCQ30_W-umBORH-eengo2kVBQQVDbnq5Kakh4sCYkKWWKNY9cFLUXxelZkrynuuR_OdxuUxp44-vc_Kvcksf4G49Gl9MBxBGlA4RJugjvg-pThNQlZI-pkiFE-N-mAITufpl1k9k3Elatn0j-W_Q06_KD-KLWJ94YpznocKXfJAZEIQrOoO9oefkkjmpnzZQh39rJTlFwU-oKVqB9AnyO2MxERuutTz_gl2to2uOu5ENSVsQbIcHh"
            />
          </div>
        </div>
        
        {/* Right Column: Login Card */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-24 bg-surface">
          <div className="w-full max-w-md space-y-8 bg-surface-container-lowest p-8 md:p-10 rounded-xl soft-shadow">
            {/* Brand Anchor Header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 mb-6">
                <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
                <span className="font-headline font-black text-2xl text-emerald-900 tracking-tighter">MedPrecision</span>
              </div>
              <h2 className="font-headline font-bold text-2xl text-on-surface">Welcome Back</h2>
              <p className="text-slate-500 font-medium">Login to continue to your dashboard</p>
            </div>
            
            {/* Role Selection (Shared Component Logic) */}
            <div className="flex border-b border-surface-container-high">
              <button className="flex-1 py-3 text-sm font-semibold text-primary border-b-2 border-primary transition-all">User</button>
              <button className="flex-1 py-3 text-sm font-medium text-slate-500 hover:text-primary transition-all">Retailer</button>
              <button className="flex-1 py-3 text-sm font-medium text-slate-500 hover:text-primary transition-all">Agent</button>
            </div>
            
            {/* Form Section */}
            <form className="space-y-6">
              {/* User/Agent Role View (Default) */}
              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 block">Phone Number</span>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">+91</span>
                    <input className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-0 rounded-lg focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all outline-none" placeholder="Enter mobile number" type="tel" />
                  </div>
                </label>
                <button className="w-full py-4 primary-gradient text-white font-bold rounded-xl shadow-lg shadow-emerald-900/10 active:scale-95 transition-all" style={{ background: '#2E7D32' }} type="button">
                  Send OTP
                </button>
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-surface-container-high"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-surface-container-lowest px-2 text-slate-400 font-bold tracking-widest">OR</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center space-x-2 py-3 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors border border-surface-container-highest" type="button">
                    <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCRLPf_mWwr9OtTVmjf9_jTt2HMi5C7yvX2zkIE4qLD-mfZmVCuHPSv03oDtdr_i_zLKoAQ4yRjEnOtY0Wv9jc3PQlJATrILwZ1Tz2NloI6H2ywhTwnWreOUX9IHT2X-IIRNpt4iZB7LHrOe857otEeaAW6Lh50t01OALVWYMhtkpkxRBY1U3pMAbzFh0ExIHikmx28CmwRR4XtC9Rw9fr1ixPAda0BCGQLYISzzHnqS4L0CPGxtwT5a3r7JPq2E3JGrbwN_q6OfAt" />
                    <span className="text-sm font-bold text-on-surface font-headline">Google</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 py-3 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors border border-surface-container-highest" type="button">
                    <span className="material-symbols-outlined text-xl text-slate-600">smartphone</span>
                    <span className="text-sm font-bold text-on-surface font-headline">Phone</span>
                  </button>
                </div>
              </div>
            </form>
            
            {/* Card Footer */}
            <div className="pt-6 text-center space-y-4">
              <p className="text-sm font-medium text-slate-500">
                New user? <Link className="text-primary font-bold hover:underline underline decoration-2" to="#">Sign up</Link>
              </p>
              <p className="text-xs font-medium text-slate-400">
                Need help? <Link className="text-primary hover:underline" to="#">Contact support</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer Shared Component (Minimal Style) */}
      <footer className="w-full mt-auto flex flex-col md:flex-row justify-between items-center px-12 py-8 bg-white dark:bg-slate-900 border-t-0">
        <span className="font-inter text-xs text-slate-500">© 2024 Clinical Curator Logistics. All rights reserved.</span>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Link className="font-inter text-xs text-slate-500 hover:text-emerald-500 transition-colors" to="#">Privacy Policy</Link>
          <Link className="font-inter text-xs text-slate-500 hover:text-emerald-500 transition-colors" to="#">Terms of Service</Link>
          <Link className="font-inter text-xs text-slate-500 hover:text-emerald-500 transition-colors" to="#">HIPAA Compliance</Link>
          <Link className="font-inter text-xs text-slate-500 hover:text-emerald-500 transition-colors" to="#">Support</Link>
        </div>
      </footer>
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-4 z-50">
        <button className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path>
          </svg>
        </button>
        <button className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-3xl">call</span>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
