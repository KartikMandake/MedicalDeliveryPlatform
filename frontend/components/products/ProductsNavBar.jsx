import { Link } from 'react-router-dom';

export default function ProductsNavBar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white shadow-sm">
      <nav className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#2E7D32] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            </div>
            <span className="text-2xl font-bold tracking-tighter text-emerald-900 font-headline">MediFlow</span>
          </Link>
          <div className="hidden lg:flex items-center gap-8 font-['Manrope'] font-semibold text-sm tracking-tight">
            <Link className="text-slate-600 hover:text-emerald-800 transition-all" to="/">Home</Link>
            <Link className="text-emerald-700 border-b-2 border-emerald-600 pb-1" to="/products">Categories</Link>
            <a className="text-slate-600 hover:text-emerald-800 transition-all" href="#">Orders</a>
            <a className="text-slate-600 hover:text-emerald-800 transition-all" href="#">Help</a>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
            <input className="pl-10 pr-4 py-2.5 bg-[#f1f3f4] border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 w-80" placeholder="Search medicines or symptoms" type="text"/>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-700 hover:bg-slate-50 rounded-full">
              <span className="material-symbols-outlined">shopping_cart</span>
              <span className="absolute top-0 right-0 w-5 h-5 bg-[#2E7D32] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">2</span>
            </button>
            <button className="flex items-center gap-2 bg-[#2E7D32] text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-[#1b5e20] transition-colors">
              <span className="material-symbols-outlined text-lg">person</span>
              Login
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
