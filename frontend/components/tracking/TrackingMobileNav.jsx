export default function TrackingMobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-slate-100 flex justify-around items-center py-3 z-50">
      <a className="flex flex-col items-center gap-1 text-[#0d631b]" href="#">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
        <span className="text-[10px] font-bold">Track</span>
      </a>
      <a className="flex flex-col items-center gap-1 text-slate-400" href="#">
        <span className="material-symbols-outlined">history</span>
        <span className="text-[10px] font-medium">History</span>
      </a>
      <a className="flex flex-col items-center gap-1 text-slate-400" href="#">
        <span className="material-symbols-outlined">medical_services</span>
        <span className="text-[10px] font-medium">Support</span>
      </a>
      <a className="flex flex-col items-center gap-1 text-slate-400" href="#">
        <span className="material-symbols-outlined">person</span>
        <span className="text-[10px] font-medium">Profile</span>
      </a>
    </nav>
  );
}
