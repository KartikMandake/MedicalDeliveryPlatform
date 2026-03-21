import { Link } from 'react-router-dom';

export default function ProductsFooter() {
  return (
    <>
      <footer className="w-full py-12 px-8 border-t border-zinc-100 bg-zinc-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <div className="space-y-4">
            <span className="font-headline font-bold text-zinc-900 text-lg">MediFlow AI</span>
            <p className="font-inter text-xs text-zinc-500 leading-relaxed">
              Clinical Excellence &amp; Fluid Intelligence. Empowering patient health through advanced pharmaceutical logistics.
            </p>
            <div className="pt-2">
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mb-4">Certified Hubs</p>
              <div className="flex gap-4 grayscale opacity-50">
                <span className="material-symbols-outlined">health_metrics</span>
                <span className="material-symbols-outlined">verified_user</span>
                <span className="material-symbols-outlined">science</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-headline font-bold text-xs text-zinc-900 uppercase tracking-widest mb-6">Resources</h4>
            <ul className="space-y-4 font-inter text-xs text-zinc-500">
              <li><a className="hover:text-green-600 transition-colors" href="#">API Documentation</a></li>
              <li><a className="hover:text-green-600 transition-colors" href="#">Medical Whitepapers</a></li>
              <li><a className="hover:text-green-600 transition-colors" href="#">Inventory Tracker</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-bold text-xs text-zinc-900 uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-4 font-inter text-xs text-zinc-500">
              <li><a className="hover:text-green-600 transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-green-600 transition-colors" href="#">Terms of Service</a></li>
              <li><a className="hover:text-green-600 transition-colors" href="#">Return Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-bold text-xs text-zinc-900 uppercase tracking-widest mb-6">Contact</h4>
            <ul className="space-y-4 font-inter text-xs text-zinc-500">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">mail</span> contact@mediflow.ai</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">support_agent</span> Contact Medical Hub</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-200/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-inter text-[10px] text-zinc-400 uppercase tracking-widest font-bold">© 2024 MediFlow AI. Clinical Excellence &amp; Fluid Intelligence.</p>
          <div className="flex gap-6">
            <a className="text-zinc-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">public</span></a>
            <a className="text-zinc-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">hub</span></a>
          </div>
        </div>
      </footer>

      <nav className="lg:hidden fixed bottom-0 w-full z-50 rounded-t-3xl glass-nav border-t border-zinc-200 shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center px-4 pt-3 pb-8 w-full">
          <Link className="flex flex-col items-center justify-center text-zinc-400 font-manrope text-[10px] font-bold uppercase tracking-widest active:scale-90 transition-transform" to="/">
            <span className="material-symbols-outlined mb-1">home</span>
            Home
          </Link>
          <Link className="flex flex-col items-center justify-center text-green-600 scale-110 font-manrope text-[10px] font-bold uppercase tracking-widest" to="/products">
            <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
            Categories
          </Link>
          <Link className="flex flex-col items-center justify-center text-zinc-400 font-manrope text-[10px] font-bold uppercase tracking-widest active:scale-90 transition-transform" to="/orders">
            <span className="material-symbols-outlined mb-1">receipt_long</span>
            Orders
          </Link>
          <a className="flex flex-col items-center justify-center text-zinc-400 font-manrope text-[10px] font-bold uppercase tracking-widest active:scale-90 transition-transform" href="#">
            <span className="material-symbols-outlined mb-1">contact_support</span>
            Help
          </a>
        </div>
      </nav>
    </>
  );
}
