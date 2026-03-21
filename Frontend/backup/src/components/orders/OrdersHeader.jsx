import React from 'react';
import { Link } from 'react-router-dom';

const OrdersHeader = () => {
  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-30 glass-header flex items-center justify-between px-6 py-3 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="md:hidden material-symbols-outlined text-emerald-800" data-icon="menu">menu</span>
        <h2 className="font-headline font-extrabold text-emerald-900 text-xl tracking-tighter">MediFlow</h2>
      </div>
      <div className="flex items-center gap-6">
        <nav className="hidden lg:flex items-center gap-8">
          <Link className="font-headline text-sm font-semibold tracking-tight text-slate-500 hover:text-emerald-600" to="#">Deliveries</Link>
          <Link className="font-headline text-sm font-semibold tracking-tight text-slate-500 hover:text-emerald-600" to="#">Inventory</Link>
          <Link className="font-headline text-sm font-semibold tracking-tight text-slate-500 hover:text-emerald-600" to="#">Analytics</Link>
        </nav>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-emerald-800 cursor-pointer" data-icon="shopping_cart">shopping_cart</span>
          <div className="relative">
            <span className="material-symbols-outlined text-emerald-800 cursor-pointer" data-icon="notifications">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
          </div>
          <img alt="User Medical Profile" className="w-8 h-8 rounded-full border border-outline-variant/20" data-alt="Portrait of a medical professional user profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDyRA5E2XbJF5nSIQXNujC2ZAg0AkfXQR8pJN5YW4dPQBNry0wHyglM8HRJPxX182QFFhoZiZGEfTylYp-aWTN21UDSKFLjXORlcSFzESBDc_UUeNe0HZbypkMVfkh61wxJXTX3n9wAwIT7StKKbLLpm2XfCdQt9razdzl_c2LjNiXZhHNRNIlthdLovSvFdCFUezQXmPtkUrVZW-zU4-JND6asoHp4-NQCEBHBWHNfJVA11H9dUTrcjhO-yxAQEFKWXhirhWzmk13" />
        </div>
      </div>
    </header>
  );
};

export default OrdersHeader;
