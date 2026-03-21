import { Link } from 'react-router-dom';

export default function CartFooter() {
  return (
    <>
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
        <div className="max-w-7xl mx-auto px-8 py-6 border-t border-zinc-100">
          <p className="font-inter text-xs text-zinc-500">© 2024 MediFlow AI. Clinical Excellence &amp; Fluid Intelligence.</p>
        </div>
      </footer>

      <nav className="lg:hidden fixed bottom-0 w-full z-50 glass-nav rounded-t-3xl shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)] border-t border-zinc-200">
        <div className="flex justify-around items-center px-4 pt-3 pb-8 w-full">
          <Link className="flex flex-col items-center justify-center text-zinc-400" to="/">
            <span className="material-symbols-outlined">home</span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-manrope mt-1">Home</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-zinc-400" to="/products">
            <span className="material-symbols-outlined">grid_view</span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-manrope mt-1">Categories</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-green-600 scale-110" to="/cart">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-manrope mt-1">Orders</span>
          </Link>
          <a className="flex flex-col items-center justify-center text-zinc-400" href="#">
            <span className="material-symbols-outlined">contact_support</span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-manrope mt-1">Help</span>
          </a>
        </div>
      </nav>
    </>
  );
}
