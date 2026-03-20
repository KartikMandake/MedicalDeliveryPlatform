import { Link } from 'react-router-dom';

export default function ProductsFooter() {
  return (
    <footer className="w-full py-12 px-8 bg-slate-50 border-t border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2E7D32] rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            </div>
            <span className="text-lg font-bold text-slate-900 font-headline">MediFlow</span>
          </div>
          <p className="text-sm text-slate-500">Surgical Precision in Every Parcel. Your trusted partner in healthcare delivery.</p>
        </div>
        <div className="space-y-4">
          <h5 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Quick Links</h5>
          <nav className="flex flex-col gap-2 text-sm text-slate-500">
            <Link className="hover:text-[#2E7D32] transition-colors" to="/dashboard">About Us</Link>
            <Link className="hover:text-[#2E7D32] transition-colors" to="/upload">Contact Support</Link>
            <Link className="hover:text-[#2E7D32] transition-colors" to="/products">Medicine Categories</Link>
          </nav>
        </div>
        <div className="space-y-4">
          <h5 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Legal</h5>
          <nav className="flex flex-col gap-2 text-sm text-slate-500">
            <Link className="hover:text-[#2E7D32] transition-colors" to="/upload">Privacy Policy</Link>
            <Link className="hover:text-[#2E7D32] transition-colors" to="/upload">Terms &amp; Conditions</Link>
            <Link className="hover:text-[#2E7D32] transition-colors" to="/payments">Refund Policy</Link>
          </nav>
        </div>
        <div className="space-y-4">
          <h5 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Newsletter</h5>
          <div className="flex gap-2">
            <input className="bg-white border-slate-200 text-sm px-4 py-2.5 rounded-lg w-full focus:ring-1 focus:ring-primary" placeholder="Enter email" type="email"/>
            <button className="bg-[#2E7D32] text-white p-2.5 rounded-lg hover:bg-[#1b5e20] transition-colors">
              <span className="material-symbols-outlined text-sm">send</span>
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-400 font-medium">© 2024 MediFlow Delivery. All rights reserved.</p>
      </div>
    </footer>
  );
}
