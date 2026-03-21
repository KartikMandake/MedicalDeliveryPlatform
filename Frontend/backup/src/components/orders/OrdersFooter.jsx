import React from 'react';
import { Link } from 'react-router-dom';

const OrdersFooter = () => {
  return (
    <footer className="w-full py-12 mt-20 border-t border-slate-200 bg-slate-100 flex flex-col md:flex-row justify-between items-center px-8 gap-4">
      <p className="font-body text-xs text-slate-500">© 2024 MediFlow. HIPAA Compliant Secure Logistics.</p>
      <div className="flex gap-6">
        <Link className="font-body text-xs text-slate-500 hover:text-emerald-700 transition-colors" to="#">Privacy Policy</Link>
        <Link className="font-body text-xs text-slate-500 hover:text-emerald-700 transition-colors" to="#">Terms of Service</Link>
        <Link className="font-body text-xs text-slate-500 hover:text-emerald-700 transition-colors" to="#">HIPAA Statement</Link>
        <Link className="font-body text-xs text-slate-500 hover:text-emerald-700 transition-colors" to="#">Support</Link>
      </div>
    </footer>
  );
};

export default OrdersFooter;
