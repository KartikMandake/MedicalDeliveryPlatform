import { Link } from 'react-router-dom';

export default function TrackingNavBar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between px-6 py-3 w-full max-w-none">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-emerald-900 dark:text-emerald-100 tracking-tighter font-headline">Clinical Curator</Link>
          <nav className="hidden md:flex gap-6 items-center">
            <Link className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 font-['Manrope'] font-semibold text-sm tracking-tight transition-colors" to="/tracking">Deliveries</Link>
            <Link className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 font-['Manrope'] font-semibold text-sm tracking-tight transition-colors" to="/products">Inventory</Link>
            <Link className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 font-['Manrope'] font-semibold text-sm tracking-tight transition-colors" to="/dashboard">Reports</Link>
            <Link className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 font-['Manrope'] font-semibold text-sm tracking-tight transition-colors" to="/admin">Compliance</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-emerald-50/50 rounded-full transition-colors active:scale-95 duration-200">
            <span className="material-symbols-outlined text-emerald-800">notifications</span>
          </button>
          <button className="p-2 hover:bg-emerald-50/50 rounded-full transition-colors active:scale-95 duration-200">
            <span className="material-symbols-outlined text-emerald-800">settings</span>
          </button>
          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border border-emerald-200">
            <img alt="User Medical Profile" className="w-full h-full object-cover" data-alt="Close up of a medical professional portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6Ws0Z8P7EUQIqQDA_gwQ1Tq0GEJEf12buyV_sfM1xF-FtxDqd0KBeNBnDV6Feceo075MS8FpcP4rlB0_ObvVmYEsLeFFTrTn02PtuaQzWZHPkUi-fa35MadYX_oHCzdamM9XVOGMTx2U1_yavbVXtR0W7Az_At_IcDKcms1F2yN3l0x2EQXMyL7aobBEdqpxLPl7MB8oSAJ4WTCf-Z2Mytij83rl-MXRzVKMcZqUXY28jlUdCVCxhjuAwKgx6yhMJl30ihDmGi7YB"/>
          </div>
        </div>
      </div>
    </header>
  );
}
