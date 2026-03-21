import { Link } from 'react-router-dom';

export default function TopNavBar() {
  return (
    <header className="fixed top-0 w-full z-50 glass-header shadow-sm">
      <div className="flex items-center justify-between px-8 py-4 max-w-full mx-auto">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-emerald-900 dark:text-emerald-100 font-headline">MediFlow</Link>
        <div className="hidden md:flex flex-1 max-w-md mx-12">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input className="w-full bg-surface-container-high border-none rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary/40 text-sm" placeholder="Search medicines or symptoms" type="text"/>
          </div>
        </div>
        <nav className="hidden lg:flex items-center gap-8 font-headline font-semibold text-sm tracking-tight">
          <Link className="text-emerald-700 border-b-2 border-emerald-600 pb-1" to="/">Home</Link>
          <Link className="text-slate-600 hover:text-emerald-800 transition-all" to="/products">Categories</Link>
          <Link className="text-slate-600 hover:text-emerald-800 transition-all" to="/orders">Orders</Link>
          <Link className="text-slate-600 hover:text-emerald-800 transition-all" to="/dashboard">Dashboard</Link>
        </nav>
        <div className="flex items-center gap-4 ml-8">
          <Link to="/cart" className="p-2 rounded-full hover:bg-emerald-50/50 transition-all relative">
            <span className="material-symbols-outlined text-emerald-800">shopping_cart</span>
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">2</span>
          </Link>
          <Link to="/profile" className="p-2 rounded-full hover:bg-emerald-50/50 transition-all">
            <span className="material-symbols-outlined text-emerald-800">account_circle</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
