import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductsNavBar() {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchText(params.get('search') || '');
  }, [location.search]);

  useEffect(() => {
    const onDocumentClick = (event) => {
      if (!profileRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocumentClick);
    return () => document.removeEventListener('mousedown', onDocumentClick);
  }, []);

  const handleSearchSubmit = () => {
    const query = searchText.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : '/products');
  };

  const pathname = location.pathname;
  const isHomePage = pathname === '/dashboard' || pathname === '/home' || pathname === '/';
  const isProductsPage = pathname === '/products' || pathname.startsWith('/products/');
  const isOrdersPage = pathname === '/orders' || pathname === '/tracking' || pathname === '/upload';
  const isHelpPage = pathname === '/help';
  const isCartPage = pathname === '/cart';

  const navLinkClass = (active) => (
    active
      ? 'text-green-700 font-bold border-b-2 border-green-600 px-2 py-1'
      : 'text-zinc-500 hover:text-zinc-900 transition-all duration-200 px-2 py-1'
  );

  return (
    <header className="fixed top-0 w-full z-50 glass-nav shadow-sm dark:shadow-none">
      <div className="flex justify-between items-center w-full px-6 py-3 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tighter text-zinc-900 font-headline">MediFlow</span>
          <nav className="hidden md:flex items-center gap-6 font-headline text-sm font-medium tracking-tight">
            <Link className={navLinkClass(isHomePage)} to="/dashboard">Home</Link>
            <Link className={navLinkClass(isProductsPage)} to="/products">Categories</Link>
            <Link className={navLinkClass(isOrdersPage)} to="/orders">Orders</Link>
            <Link className={navLinkClass(isHelpPage)} to="/help">Help</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">search</span>
            <input
              className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 w-64 transition-all"
              placeholder="Search medications..."
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit();
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/cart"
              className={`relative p-2 rounded-lg transition-all active:scale-95 ${isCartPage ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'text-zinc-500 hover:bg-zinc-100'}`}
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              {user && itemCount > 0 && (
                <span className={`absolute -top-1 -right-1 min-w-4 h-4 px-1 text-[10px] font-bold leading-none rounded-full flex items-center justify-center ${isCartPage ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                  {itemCount}
                </span>
              )}
            </Link>
            <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-all active:scale-95" type="button">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="relative ml-2" ref={profileRef}>
              <button
                type="button"
                onClick={() => {
                  if (!user) return;
                  setProfileOpen((prev) => !prev);
                }}
                className="h-8 w-8 rounded-full bg-zinc-200 overflow-hidden block"
                title={user ? 'Open profile menu' : 'Login'}
              >
                {user ? (
                  <span className="w-full h-full flex items-center justify-center text-xs font-extrabold text-zinc-700 bg-emerald-100">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <img
                    className="w-full h-full object-cover"
                    alt="User profile avatar portrait"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcPRM7lRc4AwTFNkRzknncLOfdfmxmUeDeoI6J9i7sSoD8q9mk6oH-nANra88NmRp5D3Lck7qODxNBKU5xsG6_I97FC-Kd_IJTuwsL4Z704fOvzsf76gfYZVkjyPLkmqhDl8ryPwwx9PsTNlXgusl7c5JZJoW6rHZUxDhFH8O6COL9zUPDd5bHuNh2xUn2Udc8yV0mp3si3ddVywSMfPoEGydAajIdbix5t8lI-dfQ9n-sCvYVn0X72gT-fFkkcInwFd24HeC5d4eC"
                  />
                )}
              </button>

              {user && profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="px-3 py-2 border-b border-zinc-100">
                    <p className="text-xs text-zinc-400">Signed in as</p>
                    <p className="text-sm font-semibold text-zinc-700 truncate">{user.email || user.phone || 'User'}</p>
                  </div>
                  <Link to="/orders" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50">My Orders</Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}

              {!user && (
                <Link to="/login" className="absolute inset-0" aria-label="Login" />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="bg-zinc-100/50 h-[1px]"></div>
    </header>
  );
}
