export default function PaymentsHeader() {
  return (
    <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl docked full-width top-0 sticky z-40 shadow-[0_12px_32px_-4px_rgba(25,28,30,0.06)] flex justify-between items-center px-8 h-20 w-full">
      <div className="flex items-center gap-4">
        <h1 className="font-['Manrope'] font-bold tracking-tight text-slate-900 dark:text-slate-100 text-2xl">Payment Management</h1>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input className="pl-10 pr-4 py-2 bg-[#f2f4f7] border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-[#0d631b]/20" placeholder="Search transactions..." type="text"/>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors duration-200 active:scale-95">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors duration-200 active:scale-95">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="h-10 w-10 rounded-full overflow-hidden ml-2 border-2 border-[#a3f69c]">
            <img alt="Administrator Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBkzSwXn4BFVddT8U5_Nxe8Cf7kMZGkSLoJ-3Nbgq_HVUTKcrHjmxwPA7QgzCWQWruajaEqF1TtDbWNmSNwzW5AWwG0qYAQc7XdD3tzjoHfwVIfn4apaDOOD8K4AW6maVNYImHbp7IpoflrO949KrutCKUrv9zGfVhwnsUE3IsDfp74qKp-cyvVOMz6QyM7YfPnFmj0zM3gEVqAPKy_IU5RRYaLC8CKGlkRqAkqrh_MM99p7F7RGdxWLscytVjtDiCg3OB5ahi2-KD"/>
          </div>
        </div>
      </div>
    </header>
  );
}
