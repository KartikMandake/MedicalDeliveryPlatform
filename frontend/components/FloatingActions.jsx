import { Link } from 'react-router-dom';

export default function FloatingActions() {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col-reverse items-center gap-4 z-50">
      <button className="bg-emerald-800/90 backdrop-blur-lg shadow-2xl p-4 rounded-full text-white hover:scale-110 active:scale-90 transition-all group relative">
        <span className="material-symbols-outlined">call</span>
        <span className="absolute right-16 bg-emerald-900 text-white px-3 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Call Pharmacist</span>
      </button>
      <button className="bg-emerald-800/90 backdrop-blur-lg shadow-2xl p-4 rounded-full text-white hover:scale-110 active:scale-90 transition-all group relative">
        <span className="material-symbols-outlined">chat</span>
        <span className="absolute right-16 bg-emerald-900 text-white px-3 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">WhatsApp Support</span>
      </button>
      <Link to="/upload" className="bg-white rounded-full p-4 text-emerald-800 shadow-2xl hover:scale-110 active:scale-90 transition-all group relative border border-emerald-100 flex items-center justify-center">
        <span className="material-symbols-outlined">photo_camera</span>
        <span className="absolute right-16 bg-white text-emerald-900 px-3 py-1 rounded text-xs shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-emerald-50">Snap Prescription</span>
      </Link>
      <div className="bg-emerald-800 text-white px-6 py-4 rounded-2xl shadow-xl mb-4 hidden lg:block">
        <p className="font-bold text-sm">Emergency &amp; Support</p>
        <p className="text-[10px] opacity-80">Immediate assistance available 24/7</p>
      </div>
    </div>
  );
}
