import React from 'react';
import { Search, ShoppingCart, Bell } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { getCart } from '../../lib/api';
import { DEMO_USER_ID } from '../../lib/constants';

const navLinkClass = ({ isActive }) =>
  `font-headline text-sm font-medium tracking-tight transition-all duration-200 ${
    isActive
      ? 'text-green-700 font-bold relative after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-green-600'
      : 'text-zinc-500 hover:text-zinc-900'
  }`;

const CartNavBar = () => {
  const location = useLocation();
  const [cartCount, setCartCount] = React.useState(0);

  React.useEffect(() => {
    let active = true;

    const loadCartCount = async () => {
      try {
        const cart = await getCart(DEMO_USER_ID);
        if (active) {
          setCartCount(Number(cart?.summary?.totalItems || 0));
        }
      } catch {
        if (active) {
          setCartCount(0);
        }
      }
    };

    loadCartCount();
    const interval = setInterval(loadCartCount, 6000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [location.pathname]);

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav shadow-sm border-b border-zinc-100/50">
      <div className="flex justify-between items-center w-full px-6 py-3 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8">
          <span className="text-xl font-extrabold tracking-tighter text-zinc-900 font-headline">MedPrecision</span>
          <div className="hidden md:flex gap-6 items-center">
            <NavLink className={navLinkClass} to="/">Home</NavLink>
            <NavLink className={navLinkClass} to="/products">Categories</NavLink>
            <NavLink className={navLinkClass} to="/tracking">Orders</NavLink>
            <NavLink className={navLinkClass} to="/upload">Help</NavLink>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input
              className="pl-10 pr-4 py-2 bg-surface-container-low rounded-full text-sm border-none focus:ring-2 focus:ring-primary w-64 outline-none transition-all"
              placeholder="Search precision inventory..."
              type="text"
            />
          </div>
          <Link className="relative p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-all active:scale-95" to="/cart">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] leading-[18px] text-center font-bold">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
          <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-all active:scale-95">
            <Bell className="w-5 h-5" />
          </button>
          <img
            alt="User Avatar"
            className="w-8 h-8 rounded-full border border-outline-variant/30 cursor-pointer hover:opacity-80 transition-opacity"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw-ZZ-051kYNh6hwKhGTFTwX-rd_lPuEyObLsKYY3zMNa3epokt87siyTj7PzqBLLmdoFOc3sp_ym6akkVpLQ5Yosf0mUysNwpsEQrdEmfugL2AQQIN0MhmyuQB0NK4fOm9b6Mde70fuToTHzjLZzZ47-KoqQiZO5QtvO1klQrhlp0VM994Qr5oxElrRxqlXHF5YkdXq0xa27mDZ9FEXihCRhm8o4Ux71Nc-IpAliu6KEUi6YQxRAk0xvEVb248yHaTEgBVg82NE-e"
          />
        </div>
      </div>
    </nav>
  );
};

export default CartNavBar;
