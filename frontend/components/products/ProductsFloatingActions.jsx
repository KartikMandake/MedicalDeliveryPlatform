export default function ProductsFloatingActions() {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col items-center gap-3 z-40">
      <button className="w-12 h-12 bg-[#2E7D32] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
        <span className="material-symbols-outlined">camera_alt</span>
      </button>
      <button className="w-12 h-12 bg-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
        <span className="material-symbols-outlined">chat</span>
      </button>
      <button className="w-12 h-12 bg-[#4dd0e1] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
        <span className="material-symbols-outlined">call</span>
      </button>
    </div>
  );
}
