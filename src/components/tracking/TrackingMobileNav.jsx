import { Link } from 'react-router-dom';

export default function TrackingMobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-slate-100 flex justify-around items-center py-3 z-50">
      <Link className="flex flex-col items-center gap-1 text-[#0d631b]" to="/tracking">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
        <span className="text-[10px] font-bold">Track</span>
      </Link>
      <Link className="flex flex-col items-center gap-1 text-slate-400" to="/dashboard">
        <span className="material-symbols-outlined">history</span>
        <span className="text-[10px] font-medium">History</span>
      </Link>
      <Link className="flex flex-col items-center gap-1 text-slate-400" to="/upload">
        <span className="material-symbols-outlined">medical_services</span>
        <span className="text-[10px] font-medium">Support</span>
      </Link>
      <Link className="flex flex-col items-center gap-1 text-slate-400" to="/agent">
        <span className="material-symbols-outlined">person</span>
        <span className="text-[10px] font-medium">Profile</span>
      </Link>
    </nav>
  );
}
