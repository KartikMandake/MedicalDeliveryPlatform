import React from 'react';
import { Link } from 'react-router-dom';

const ProductDetailNavBar = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold tracking-tighter text-emerald-900 font-headline">MediFlow</Link>
          <nav className="hidden md:flex items-center gap-6 font-manrope text-sm font-semibold tracking-tight">
            <Link className="text-slate-500 hover:text-emerald-600" to="/products">Categories</Link>
            <Link className="text-slate-500 hover:text-emerald-600" to="/orders">Orders</Link>
            <Link className="text-slate-500 hover:text-emerald-600" to="/dashboard">Dashboard</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <input className="bg-surface-container border-none rounded-full px-4 py-2 text-sm w-64 focus:ring-2 focus:ring-primary/20" placeholder="Search medicines..." type="text" />
          </div>
          <Link to="/cart" className="material-symbols-outlined text-emerald-800 hover:bg-slate-50 p-2 rounded-full transition-colors flex items-center justify-center" data-icon="shopping_cart">shopping_cart</Link>
          <button className="material-symbols-outlined text-emerald-800 hover:bg-slate-50 p-2 rounded-full transition-colors" data-icon="notifications">notifications</button>
          <img className="w-8 h-8 rounded-full border border-outline-variant/15" alt="User profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJgL0pB1SxdL6GJ3CV_PbUTL0w0Dr-_O5sXNaK7u4ABQ9Ur7YmZtXcid0gUz3S5pF_m5yb6uMQIqNC8gtw38Vxo2Ak8ITnepAtj0tVspEgyHt20SrpdA4R4XFFpkdIS6TdcdF8c57sQgBabpYHZAI6nqhwimdxoPB4Xv9LiovrYY-hWkQg80gXLXJ9Sw8_eGLNO6N_hbiYX3GGTWn9_1Su5B0Ajg4Z3moTFzNG3Mv7rGfomzr87VXv_sN3T1gvyYTfc4yoImn4d-JT" />
        </div>
      </div>
      <div className="bg-slate-200/50 h-[1px] w-full"></div>
    </header>
  );
};

export default ProductDetailNavBar;
