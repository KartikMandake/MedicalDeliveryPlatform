import React from 'react';

const ProductFooter = () => {
  return (
    <footer className="w-full py-12 mt-auto bg-slate-100 border-t border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 gap-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-bold text-emerald-900 font-headline">MediFlow</span>
          <p className="font-inter text-xs text-slate-500">© 2024 MediFlow. HIPAA Compliant Secure Logistics.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <a className="font-inter text-xs text-slate-500 hover:text-emerald-600 transition-colors" href="#">Privacy Policy</a>
          <a className="font-inter text-xs text-slate-500 hover:text-emerald-600 transition-colors" href="#">Terms of Service</a>
          <a className="font-inter text-xs text-slate-500 hover:text-emerald-600 transition-colors" href="#">HIPAA Statement</a>
          <a className="font-inter text-xs text-slate-500 hover:text-emerald-600 transition-colors" href="#">Support</a>
        </div>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-slate-400">security</span>
          <span className="material-symbols-outlined text-slate-400">health_and_safety</span>
        </div>
      </div>
    </footer>
  );
};

export default ProductFooter;
