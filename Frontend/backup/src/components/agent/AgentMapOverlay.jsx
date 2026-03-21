export default function AgentMapOverlay() {
  return (
    <>
      {/* Map Simulation */}
      <div className="absolute inset-0 z-0">
        <img className="w-full h-full object-cover grayscale opacity-40 contrast-75" alt="Minimalist desaturated city map with navigation path" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwtAJuzhXmR2l3vliNQCD34Hx5ZKckSMRBMm8HxNQLIVgP0GzOeTdVzNiLgiPd9U68tzDwD7QJhosNGGxxj80YxX-N2kDD6TLr2NHunLtV5Oo79h9CfdK1La7f9FqQD_Svrthrg5cLUSDhk60Op032q9EFyXspivF6_v08c5dgo8tu-Cjo2ew_3lM6MfQ-xPLONi1ExEeTMF3ExsBjiELt4XVZoFN3AXeyMmx0LaTGZp6JMVOUYW9wEJH4Arc5wvo_Xh9WgFtfasSN"/>
        {/* SVG Route Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 1000">
          <path className="opacity-60" d="M 200 800 Q 400 600 600 400 T 800 200" fill="none" stroke="#0d631b" strokeDasharray="8 8" strokeWidth="4"></path>
          {/* Courier Location Marker */}
          <circle cx="200" cy="800" fill="#0d631b" r="10"></circle>
          <circle cx="200" cy="800" fill="#0d631b" fillOpacity="0.2" r="20">
            <animate attributeName="r" dur="1.5s" from="15" repeatCount="indefinite" to="25"></animate>
            <animate attributeName="fill-opacity" dur="1.5s" from="0.3" repeatCount="indefinite" to="0"></animate>
          </circle>
          {/* Destination Marker */}
          <circle cx="800" cy="200" fill="#00BFA5" r="8"></circle>
        </svg>
      </div>
      {/* Floating Map UI: Stats */}
      <div className="absolute top-6 left-6 flex flex-col gap-3 z-10">
        <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-white/40 flex items-center gap-4 min-w-[200px]">
          <div className="w-12 h-12 rounded-full bg-[#a3f69c] flex items-center justify-center text-[#0d631b]">
            <span className="material-symbols-outlined">route</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Distance Remaining</p>
            <p className="text-xl font-headline font-extrabold text-[#191c1e]">1.2 km</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-white/40 flex items-center gap-4 min-w-[200px]">
          <div className="w-12 h-12 rounded-full bg-[#91f78e] flex items-center justify-center text-[#006e1c]">
            <span className="material-symbols-outlined">schedule</span>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Estimated Arrival</p>
            <p className="text-xl font-headline font-extrabold text-[#191c1e]">12 min</p>
          </div>
        </div>
      </div>
    </>
  );
}
