import React from 'react';
import { Link } from 'react-router-dom';

const ProfileFooter = () => {
  return (
    <footer className="w-full py-8 mt-auto border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex flex-col md:flex-row justify-between items-center px-8 gap-4">
      <p className="font-inter text-xs text-slate-500 dark:text-slate-400">© 2024 MediFlow. HIPAA Compliant Secure Logistics.</p>
      <div className="flex items-center gap-6">
        <Link className="font-inter text-xs text-slate-500 hover:text-emerald-700 transition-colors" to="#">Privacy Policy</Link>
        <Link className="font-inter text-xs text-slate-500 hover:text-emerald-700 transition-colors" to="#">Terms of Service</Link>
        <Link className="font-inter text-xs text-slate-500 hover:text-emerald-700 transition-colors" to="#">HIPAA Statement</Link>
        <Link className="font-inter text-xs text-slate-500 hover:text-emerald-700 transition-colors" to="#">Support</Link>
      </div>
    </footer>
  );
};

export default ProfileFooter;