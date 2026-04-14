import React from "react";

const INSIGHT_THEMES = {
  stockout_risk: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    bg: "bg-[#ffffff]",
    border: "border-[#E5E7EB]",
    accent: "text-[#EF4444]",
    button: "bg-[#111827] hover:bg-black text-white",
    label: "Critical Action",
    actionText: "Restock Now"
  },
  dead_stock_warning: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    bg: "bg-[#ffffff]",
    border: "border-[#E5E7EB]",
    accent: "text-[#F59E0B]",
    button: "bg-[#111827] hover:bg-black text-white",
    label: "Inventory Shift",
    actionText: "Clear Stock"
  },
  seasonal_opportunity: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    bg: "bg-[#ffffff]",
    border: "border-[#E5E7EB]",
    accent: "text-[#3B82F6]",
    button: "bg-[#111827] hover:bg-black text-white",
    label: "AI Prediction",
    actionText: "Pre-order Stock"
  }
};

const InsightCard = ({ insight }) => {
  const theme = INSIGHT_THEMES[insight.type] || INSIGHT_THEMES.seasonal_opportunity;

  return (
    <div className={`p-5 rounded-2xl border ${theme.bg} ${theme.border} transition-all hover:scale-[1.01] shadow-md opacity-100`}>
      <div className="flex items-start gap-4">
        <div className={`mt-1 p-2.5 rounded-xl bg-slate-50 ${theme.accent} shadow-sm border border-slate-100`}>
          {theme.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
             <span className={`text-[10px] font-black uppercase tracking-widest ${theme.accent}`}>
               {theme.label}
             </span>
             {insight.severity === 'high' && (
               <span className="flex h-1.5 w-1.5 rounded-full bg-[#EF4444] animate-ping" />
             )}
          </div>
          <h4 className="text-sm font-extrabold text-[#111827] mb-1 leading-snug">
            {insight.productName ? `${insight.productName}: ` : ""}{insight.recommendation}
          </h4>
          <p className="text-xs text-[#6B7280] mb-4 font-medium leading-relaxed">
            Detected Signal: {insight.type.replace(/_/g, ' ')} with current stock at {insight.currentStock || 0} units.
          </p>
          <button 
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${theme.button}`}
            onClick={() => alert(`Initiating workflow: ${theme.actionText}`)}
          >
            {theme.actionText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ActionCenter = ({ insights = [], isLoading }) => {
  return (
    <div className="lg:col-span-1">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          Action Center
          <div className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-lg border border-rose-100">
             {insights.length} Priority Hits
          </div>
        </h3>
        <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800/40 rounded-2xl animate-pulse" />
          ))
        ) : insights.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
             <p className="text-sm text-slate-400">Inventory is healthy. No critical AI insights right now.</p>
          </div>
        ) : (
          insights.map((insight, idx) => (
            <InsightCard key={idx} insight={insight} />
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
         <div className="flex items-center gap-3 mb-2">
            <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
            </div>
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Operational Note</p>
         </div>
         <p className="text-[10px] text-slate-500 leading-relaxed italic">
            "Prioritize Red cards first. They indicate a risk of direct revenue loss within window."
         </p>
      </div>
    </div>
  );
};
