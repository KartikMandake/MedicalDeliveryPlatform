import { Link } from 'react-router-dom';

export default function UploadFooter() {
  return (
    <footer className="w-full py-12 border-t border-slate-200 bg-slate-50 mt-12">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-['Manrope'] font-bold text-emerald-800">MediFlow</div>
        <div className="flex flex-wrap justify-center gap-6">
          <Link className="font-['Inter'] text-sm text-slate-500 hover:text-emerald-600 underline transition-all" to="/upload">Privacy Policy</Link>
          <Link className="font-['Inter'] text-sm text-slate-500 hover:text-emerald-600 underline transition-all" to="/upload">Terms of Service</Link>
          <Link className="font-['Inter'] text-sm text-slate-500 hover:text-emerald-600 underline transition-all" to="/products">Medical Disclaimer</Link>
          <Link className="font-['Inter'] text-sm text-slate-500 hover:text-emerald-600 underline transition-all" to="/dashboard">Contact Us</Link>
        </div>
        <div className="font-['Inter'] text-sm text-slate-500">
          © 2024 MediFlow. Clinical Grade Delivery.
        </div>
      </div>
    </footer>
  );
}
