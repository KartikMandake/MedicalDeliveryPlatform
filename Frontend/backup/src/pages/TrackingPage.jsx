import { Link } from 'react-router-dom';
import TrackingNavBar from '../components/tracking/TrackingNavBar';
import TrackingSidebar from '../components/tracking/TrackingSidebar';
import TrackingMobileNav from '../components/tracking/TrackingMobileNav';
import TrackingMap from '../components/tracking/TrackingMap';
import TrackingOrderDetails from '../components/tracking/TrackingOrderDetails';
import TrackingFooter from '../components/tracking/TrackingFooter';

export default function TrackingPage() {
  return (
    <div className="bg-[#f7f9fc] font-['Inter'] text-[#191c1e] min-h-screen antialiased">
      <TrackingNavBar />
      <TrackingSidebar />
      <main className="lg:ml-64 pt-20 min-h-screen flex flex-col">
        <div className="w-full p-6 md:p-8 flex-1">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 mb-6 text-sm text-slate-500 font-medium">
            <Link className="hover:text-[#0d631b] transition-colors" to="/">Home</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <Link className="hover:text-[#0d631b] transition-colors" to="/tracking">My Orders</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-slate-900 font-semibold tracking-tight">Tracking #MP-82910</span>
          </nav>
          
          {/* ETA Banner */}
          <div className="mb-8 p-6 rounded-2xl bg-[#2e7d32] text-[#cbffc2] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-full bg-[#0d631b]/30 -skew-x-12 transform translate-x-20"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-headline font-extrabold tracking-tighter text-white">Estimated Delivery: 12 mins</h1>
              <p className="font-medium text-[#cbffc2] opacity-90">Medical Courier is currently in transit to your location.</p>
            </div>
            <div className="relative z-10 bg-white/20 backdrop-blur px-4 py-2 rounded-full border border-white/30 text-sm font-bold flex items-center gap-2 text-white">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              ORDER #MP-82910
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
            <TrackingMap />
            <TrackingOrderDetails />
          </div>
        </div>
        <TrackingFooter />
      </main>
      <TrackingMobileNav />
    </div>
  );
}
