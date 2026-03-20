import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ShoppingCart() {
  const [items, setItems] = useState([
    {
      id: 1,
      name: 'Lisinopril High-Accuracy Dose',
      subtitle: 'Batch #MP-99201 • 10mg / 30 Tabs',
      price: 42.00,
      quantity: 1,
      tag: 'Prescription Grade',
      tagColor: 'primary',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOEUAMpXAGOp86igwult0McKzDtTwTq26ePW5XdmbjHjt12hiwKFE0I_5Yu4_PRh1XFj1weKgmDqXr3PILqekK-X6B2BiRdY0Ql6OFdEVqdj0pwIUWEVz775-_qLjyCQzhwIGSXh5NXPH8nmWao7arF1EesRNMoujWiBwX9A0AEhQFF_mP2ZN3Uo0XEjyPK4Tbu4g4yGWBZV3-8vI9CtuRhgLTiaQA3TCSZ8SrSQGtfVDuFHNVwfvRP-bIzWtHT69Ck8qMQHakSTIB'
    },
    {
      id: 2,
      name: 'Infrared Pro-Sensor T-900',
      subtitle: 'Clinical Accuracy ±0.1°C • Dual Mode',
      price: 128.50,
      quantity: 2,
      tag: 'Diagnostic Tool',
      tagColor: 'secondary',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5PmZX5s1HYkyMulAmVVgWMbgYRgWogsxuheyJrmX7Lhw05EhDpmMYCoqotWCf-wW9Pxru2uo4UwAxwQ1QJRpctEJI1dISDT0W-H8rAFjaZY_ibSMJzkPI5JXxmhzOPeDtenQl2GsNJ8Qwp2Cz-iLC8c5lxfXeQN6EZ_9EdpUTRjfJAQwJ-bFdVYHAz9UoPUUZfzEmYtDJf5YhIItwhmewT286pN3W-Kzm_m7Muqhai4BlwzuFGezj4rE3zJRj9wQXq1PCblbN3KLF'
    },
    {
      id: 3,
      name: 'AI-Optimized Multivitamins',
      subtitle: '90-Day Bio-available Supply',
      price: 55.00,
      quantity: 1,
      tag: 'Stock Item',
      tagColor: 'primary',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRKS0y3QcvUXN0E3pKfgMtclx-auWUkz_xyKG3uzZgLAj5zpwVr3CkmeZbUNCCu5uu6maX5j-0_rbwqUBY7qH4VygbbwDfVzjJDcFQ84ZoSXrWeZZ2r-Kx44tbaJLNMaZD7SE5e1wlTBUaGW68NjYuYXdJhVh90M7Pbp5FPpPGqNy-pleaGE0HSh4rfc2fMRMzH5K0RLcyj6bTloS75luLXqaQU_bH9YueP5-Gvk0TAs43BWuFBjfaaoYlOmWIc9EFH-Wz9LKiGGmb'
    }
  ]);

  const updateQuantity = (id, delta) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="bg-background font-body text-on-surface min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 glass-nav shadow-sm">
        <div className="flex justify-between items-center w-full px-6 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <Link to="/dashboard-patient" className="text-xl font-bold tracking-tighter text-zinc-900 font-headline">MediFlow</Link>
            <div className="hidden md:flex gap-6 items-center">
              <Link to="/dashboard-patient" className="font-headline text-sm font-medium tracking-tight text-zinc-500 hover:text-zinc-900 transition-all duration-200">Home</Link>
              <Link to="/categories" className="font-headline text-sm font-medium tracking-tight text-zinc-500 hover:text-zinc-900 transition-all duration-200">Categories</Link>
              <Link to="/orders" className="font-headline text-sm font-medium tracking-tight text-zinc-500 hover:text-zinc-900 transition-all duration-200">Orders</Link>
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
              />
            </div>
            <Link to="/cart" className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-all scale-95 active:opacity-80">
              <span className="material-symbols-outlined">shopping_cart</span>
            </Link>
            <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-all scale-95 active:opacity-80">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <img
              alt="User Avatar"
              className="w-8 h-8 rounded-full border border-outline-variant/30"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw-ZZ-051kYNh6hwKhGTFTwX-rd_lPuEyObLsKYY3zMNa3epokt87siyTj7PzqBLLmdoFOc3sp_ym6akkVpLQ5Yosf0mUysNwpsEQrdEmfugL2AQQIN0MhmyuQB0NK4fOm9b6Mde70fuToTHzjLZzZ47-KoqQiZO5QtvO1klQrhlp0VM994Qr5oxElrRxqlXHF5YkdXq0xa27mDZ9FEXihCRhm8o4Ux71Nc-IpAliu6KEUi6YQxRAk0xvEVb248yHaTEgBVg82NE-e"
            />
          </div>
        </div>
        <div className="bg-zinc-100/50 h-[1px]"></div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Precision Cart</h1>
          <p className="text-on-surface-variant font-medium">Review your clinical selections before processing.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT: Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            {items.length > 0 ? items.map((item) => (
              <div key={item.id} className="bg-surface-container-lowest rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center group transition-all duration-200 hover:translate-x-1 shadow-[0_8px_24px_rgba(25,28,29,0.04)]">
                <div className="w-32 h-32 bg-surface-container-low rounded-lg overflow-hidden flex-shrink-0">
                  <img alt={item.name} className="w-full h-full object-cover" src={item.image} />
                </div>
                <div className="flex-grow space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest font-headline block mb-1 ${item.tagColor === 'primary' ? 'text-primary' : 'text-secondary'
                        }`}>{item.tag}</span>
                      <h3 className="text-lg font-bold font-headline text-on-surface leading-tight">{item.name}</h3>
                      <p className="text-sm text-on-surface-variant">{item.subtitle}</p>
                    </div>
                    <span className="text-xl font-bold font-headline text-on-surface">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center bg-surface-container-low rounded-full px-2 py-1 gap-4">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-colors text-on-surface-variant"
                      >
                        <span className="material-symbols-outlined text-lg">remove</span>
                      </button>
                      <span className="font-bold text-sm w-4 text-center">{item.quantity.toString().padStart(2, '0')}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-colors text-on-surface-variant"
                      >
                        <span className="material-symbols-outlined text-lg">add</span>
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="flex items-center gap-2 text-error text-xs font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-20 bg-surface-container-low rounded-xl">
                <span className="material-symbols-outlined text-6xl text-zinc-300 mb-4">shopping_cart_off</span>
                <p className="text-zinc-500">Your cart is empty.</p>
                <Link to="/categories" className="text-primary font-bold hover:underline mt-4 inline-block">Back to Inventory</Link>
              </div>
            )}
          </div>

          {/* RIGHT: Summary */}
          <aside className="lg:col-span-4 sticky top-28">
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_16px_32px_rgba(0,110,47,0.08)] insight-glow">
              <h2 className="text-xl font-bold font-headline text-on-surface mb-6">Order Intelligence</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Total Items</span>
                  <span className="font-semibold">{items.reduce((acc, i) => acc + i.quantity, 0).toString().padStart(2, '0')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Clinical Delivery Fee</span>
                  <span className="font-semibold text-primary">FREE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Estimated Tax</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="bg-surface-container-low h-[1px] mb-6"></div>
              <div className="flex justify-between items-baseline mb-8">
                <span className="text-lg font-bold font-headline">Total Price</span>
                <div className="text-right">
                  <span className="text-3xl font-extrabold font-headline text-primary tracking-tight">${total.toFixed(2)}</span>
                  <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mt-1">USD • Inc. All Taxes</p>
                </div>
              </div>
              <button className="w-full py-4 px-6 rounded-full btn-primary-gradient text-white font-bold font-headline flex items-center justify-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20">
                Proceed to Checkout
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <div className="mt-8 flex items-center gap-3 p-4 bg-primary-container/10 rounded-xl border border-primary/10">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <p className="text-[11px] font-medium leading-relaxed text-on-primary-fixed-variant">Clinical-grade encryption protects your medical and payment data during checkout.</p>
              </div>
            </div>
            <Link to="/categories" className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors py-2">
              <span className="material-symbols-outlined text-lg">chevron_left</span>
              Continue Inventory Selection
            </Link>
          </aside>
        </div>
      </main>

      <footer className="bg-zinc-50 border-t border-zinc-100 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto py-16 px-8">
          <div className="space-y-4">
            <span className="font-headline font-bold text-zinc-900 text-lg">MediFlow AI</span>
            <p className="text-zinc-500 text-xs leading-relaxed font-inter">Advanced medical inventory systems powered by clinical intelligence and fluid design patterns.</p>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-zinc-900 mb-6">Legal</h4>
            <ul className="space-y-3">
              <li><a className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors" href="#">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest text-zinc-900 mb-6">Support</h4>
            <ul className="space-y-3">
              <li><a className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors" href="#">Contact Medical Hub</a></li>
              <li><a className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors" href="#">API Documentation</a></li>
            </ul>
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest text-zinc-900 mb-6">Certification</h4>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-200 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-zinc-600">health_and_safety</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-zinc-200 flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-zinc-600">security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Nav */}
      <nav className="lg:hidden fixed bottom-0 w-full z-50 glass-nav rounded-t-3xl shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)] border-t border-zinc-200">
        <div className="flex justify-around items-center px-4 pt-3 pb-8 w-full">
          <Link to="/dashboard-patient" className="flex flex-col items-center justify-center text-zinc-400">
            <span className="material-symbols-outlined">home</span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-manrope mt-1">Home</span>
          </Link>
          <Link to="/categories" className="flex flex-col items-center justify-center text-zinc-400">
            <span className="material-symbols-outlined">grid_view</span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-manrope mt-1">Categories</span>
          </Link>
          <Link to="/orders" className="flex flex-col items-center justify-center text-green-600 scale-110">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-manrope mt-1">Orders</span>
          </Link>
          <a className="flex flex-col items-center justify-center text-zinc-400" href="#">
            <span className="material-symbols-outlined">contact_support</span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-manrope mt-1">Help</span>
          </a>
        </div>
      </nav>
    </div>
  );
}

export default ShoppingCart;
