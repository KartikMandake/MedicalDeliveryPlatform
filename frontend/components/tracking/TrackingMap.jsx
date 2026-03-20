export default function TrackingMap({ agentLocation }) {
  return (
    <div className="lg:col-span-7 bg-white rounded-xl overflow-hidden min-h-[500px] relative shadow-sm border border-slate-200">
      <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
        <img alt="Live Map View" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/ADBb0uhjyByrxTO97kY3nduefThV_lgPfHx6YjD4NKOST6ZSn4TcQkoO6botg_gTlA28yKpIySJCgK-a2aZNqiS5EabANOFsVlS4INcHOCsIZc8OfHUnsJ15_pvvCXTez5MXB0Gr9KQbQyOBgDJyPsWuqsyXlV7stCxjFNpJAPHq2x2AisqtpH3mWtTDw-6OcvMzFxxXum_1eVSym05lgokQtPfbscAeCygcIXHWiix39NyaCxa6DSl87CkWM6i18OmxcgvOwVN_Eg7r9Pg"/>
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
      {agentLocation ? (
        <div className="absolute top-6 left-6 backdrop-blur-md px-4 py-2 rounded-lg border border-white/50 shadow-sm flex items-center gap-3 bg-white/90">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white animate-pulse"></div>
          </div>
          <span className="text-xs font-bold text-slate-700 tracking-tight">
            AGENT LIVE — {agentLocation.lat?.toFixed(4)}, {agentLocation.lng?.toFixed(4)}
          </span>
        </div>
      ) : (
        <div className="absolute top-6 left-6 backdrop-blur-md px-4 py-2 rounded-lg border border-white/50 shadow-sm flex items-center gap-3 bg-white/90">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
          </div>
          <span className="text-xs font-bold text-slate-500 tracking-tight">WAITING FOR AGENT LOCATION</span>
        </div>
      )}
    </div>
  );
}
