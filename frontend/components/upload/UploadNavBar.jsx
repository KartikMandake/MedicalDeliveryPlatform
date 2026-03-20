import { Link } from 'react-router-dom';

export default function UploadNavBar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center w-full">
        <Link to="/" className="text-2xl font-extrabold text-[#0d631b] tracking-tight font-['Manrope']">MediFlow</Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/upload" className="text-[#0d631b] border-b-2 border-[#0d631b] pb-1 font-['Manrope'] font-bold text-lg">Upload</Link>
          <a className="text-[#40493d] hover:text-[#0d631b] transition-colors font-['Manrope'] font-bold text-lg" href="#">Orders</a>
          <a className="text-[#40493d] hover:text-[#0d631b] transition-colors font-['Manrope'] font-bold text-lg" href="#">Pharmacy</a>
          <a className="text-[#40493d] hover:text-[#0d631b] transition-colors font-['Manrope'] font-bold text-lg" href="#">Support</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/cart" className="p-2 hover:bg-slate-50 rounded-full transition-all duration-200">
            <span className="material-symbols-outlined text-[#0d631b]">shopping_cart</span>
          </Link>
          <button className="p-2 hover:bg-slate-50 rounded-full transition-all duration-200">
            <span className="material-symbols-outlined text-[#0d631b]">account_circle</span>
          </button>
        </div>
      </div>
      <div className="bg-slate-100 h-[1px] w-full"></div>
    </header>
  );
}
