import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import NotificationDropdown from './ui/NotificationDropdown';

export default function TopNavBar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const handleLogout = () => { logout(); navigate('/'); };
  const handleSearchSubmit = () => {
    const query = searchText.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : '/products');
  };

  return (
    <header className="fixed top-0 w-full z-50 glass-header shadow-sm">
      <div className="flex items-center justify-between px-8 py-4 max-w-full mx-auto">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-emerald-900 font-headline">MediFlow</Link>
        <div className="hidden md:flex flex-1 max-w-md mx-12">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              className="w-full bg-surface-container-high border-none rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary/40 text-sm"
              placeholder="Search medicines or symptoms"
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit();
              }}
            />
          </div>
        </div>
        <nav className="hidden lg:flex items-center gap-8 font-headline font-semibold text-sm tracking-tight">
          <Link className="text-emerald-700 border-b-2 border-emerald-600 pb-1" to="/">Home</Link>
          <Link className="text-slate-600 hover:text-emerald-800 transition-all" to="/products">Products</Link>
          {user && <Link className="text-slate-600 hover:text-emerald-800 transition-all" to="/orders">My Orders</Link>}
        </nav>
        <div className="flex items-center gap-4 ml-8">
          {user ? (
            <>
              <Link to="/cart" className="relative p-2 rounded-full hover:bg-emerald-50/50 transition-all">
                <span className="material-symbols-outlined text-emerald-800">shopping_cart</span>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#0d631b] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{itemCount}</span>
                )}
              </Link>
              <NotificationDropdown />
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 rounded-full hover:bg-emerald-50/50 transition-all">
                  <span className="material-symbols-outlined text-emerald-800">account_circle</span>
                  <span className="text-sm font-semibold text-slate-700 hidden lg:block">{user.name?.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 hidden group-hover:block z-50">
                  {user.role === 'admin' && <Link to="/admin" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Admin Panel</Link>}
                  {user.role === 'retailer' && <Link to="/retailer/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Dashboard</Link>}
                  {user.role === 'agent' && <Link to="/agent" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Agent Dashboard</Link>}
                  <Link to="/orders" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">My Orders</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign Out</button>
                </div>
              </div>
            </>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-[#0d631b] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">Sign In</Link>
          )}
        </div>
      </div>
    </header>
  );
}
