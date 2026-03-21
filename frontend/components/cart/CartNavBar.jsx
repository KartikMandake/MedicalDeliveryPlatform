import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function CartNavBar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const profileRef = useRef(null);
  const navigate = useNavigate();

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

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav shadow-sm">
      <div className="flex justify-between items-center w-full px-6 py-3 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tighter text-zinc-900 font-headline">MediFlow</span>
          <div className="hidden md:flex gap-6 items-center">
            <Link className="font-headline text-sm font-medium tracking-tight text-zinc-500 hover:text-zinc-900 transition-all duration-200" to="/">Home</Link>
            <Link className="font-headline text-sm font-medium tracking-tight text-zinc-500 hover:text-zinc-900 transition-all duration-200" to="/products">Categories</Link>
            <Link className="font-headline text-sm tracking-tight text-green-700 font-bold border-b-2 border-green-600" to="/cart">Orders</Link>
            <a className="font-headline text-sm font-medium tracking-tight text-zinc-500 hover:text-zinc-900 transition-all duration-200" href="#">Help</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">search</span>
            <input
              className="pl-10 pr-4 py-2 bg-surface-container-low rounded-full text-sm border-none focus:ring-2 focus:ring-primary w-64"
              placeholder="Search precision inventory..."
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit();
              }}
            />
          </div>
          <Link to="/cart" className="relative p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-all scale-95 active:opacity-80">
            <span className="material-symbols-outlined">shopping_cart</span>
            {user && itemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-primary text-white text-[10px] font-bold leading-none rounded-full flex items-center justify-center">{itemCount}</span>
            )}
          </Link>
          <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-all scale-95 active:opacity-80" type="button">
            <span className="material-symbols-outlined">notifications</span>
          </button>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  navigate('/login');
                  return;
                }
                setProfileOpen((prev) => !prev);
              }}
              className="w-8 h-8 rounded-full border border-outline-variant/30 overflow-hidden bg-zinc-200"
            >
              {user ? (
                <span className="w-full h-full flex items-center justify-center text-xs font-extrabold text-zinc-700 bg-emerald-100">
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </span>
              ) : (
                <img alt="User Avatar" className="w-8 h-8 rounded-full border border-outline-variant/30" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw-ZZ-051kYNh6hwKhGTFTwX-rd_lPuEyObLsKYY3zMNa3epokt87siyTj7PzqBLLmdoFOc3sp_ym6akkVpLQ5Yosf0mUysNwpsEQrdEmfugL2AQQIN0MhmyuQB0NK4fOm9b6Mde70fuToTHzjLZzZ47-KoqQiZO5QtvO1klQrhlp0VM994Qr5oxElrRxqlXHF5YkdXq0xa27mDZ9FEXihCRhm8o4Ux71Nc-IpAliu6KEUi6YQxRAk0xvEVb248yHaTEgBVg82NE-e" />
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
          </div>
        </div>
      </div>
      <div className="bg-zinc-100/50 h-[1px]"></div>
    </nav>
  );
}
