export default function TrackingMap() {
  return (
    <div className="lg:col-span-7 bg-white rounded-xl overflow-hidden min-h-[500px] relative shadow-sm border border-slate-200">
      <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
        <img alt="Live Map View" className="w-full h-full object-cover" data-alt="Detailed realistic map view with medical route" src="https://lh3.googleusercontent.com/aida/ADBb0uhjyByrxTO97kY3nduefThV_lgPfHx6YjD4NKOST6ZSn4TcQkoO6botg_gTlA28yKpIySJCgK-a2aZNqiS5EabANOFsVlS4INcHOCsIZc8OfHUnsJ15_pvvCXTez5MXB0Gr9KQbQyOBgDJyPsWuqsyXlV7stCxjFNpJAPHq2x2AisqtpH3mWtTDw-6OcvMzFxxXum_1eVSym05lgokQtPfbscAeCygcIXHWiix39NyaCxa6DSl87CkWM6i18OmxcgvOwVN_Eg7r9Pg"/>
      </div>
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-slate-600 hover:text-[#0d631b] transition-colors">
          <span className="material-symbols-outlined">add</span>
        </button>
        <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-slate-600 hover:text-[#0d631b] transition-colors">
          <span className="material-symbols-outlined">remove</span>
        </button>
        <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-slate-600 hover:text-[#0d631b] transition-colors">
          <span className="material-symbols-outlined">my_location</span>
        </button>
      </div>
      <div className="absolute top-6 left-6 backdrop-blur-md px-4 py-2 rounded-lg border border-white/50 shadow-sm flex items-center gap-3 bg-white/90">
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white"></div>
          <div className="w-6 h-6 rounded-full bg-emerald-200 border-2 border-white"></div>
        </div>
        <span className="text-xs font-bold text-slate-700 tracking-tight">2 CRITICAL CHECKPOINTS PASSED</span>
      </div>
      <div className="absolute top-20 left-6 flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg border border-white/50 shadow-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[#0d631b] text-sm">route</span>
          <span className="text-xs font-bold text-slate-700 tracking-tight uppercase">Distance Remaining: 1.2 km</span>
        </div>
        <div className="bg-[#0d631b] text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">schedule</span>
          <span className="text-xs font-bold tracking-tight uppercase">Estimated Time: 12 mins</span>
        </div>
      </div>
    </div>
  );
}
