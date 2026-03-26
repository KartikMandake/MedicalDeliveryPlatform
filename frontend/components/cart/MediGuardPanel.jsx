import { useState, useEffect } from 'react';
import { analyzeCartInteractions } from '../../api/ai';

const SEVERITY_CONFIG = {
  critical: {
    border: 'border-rose-600',
    headerBg: 'bg-rose-50',
    headerText: 'text-rose-900',
    icon: 'warning',
    iconColor: 'text-rose-600',
    badgeBg: 'bg-rose-600',
    badgeText: 'text-white',
  },
  moderate: {
    border: 'border-amber-500',
    headerBg: 'bg-amber-50',
    headerText: 'text-amber-900',
    icon: 'error_outline',
    iconColor: 'text-amber-600',
    badgeBg: 'bg-amber-500',
    badgeText: 'text-white',
  },
  informational: {
    border: 'border-blue-500',
    headerBg: 'bg-blue-50',
    headerText: 'text-blue-900',
    icon: 'info',
    iconColor: 'text-blue-600',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
  },
};

export default function MediGuardPanel({ cartItemCount = 0 }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (cartItemCount < 2) { setData(null); return; }
    let cancelled = false;
    setLoading(true);
    setError('');

    analyzeCartInteractions()
      .then((res) => { if (!cancelled) setData(res.data); })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.message || 'Analysis unavailable'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [cartItemCount]);

  if (dismissed || cartItemCount < 2) return null;

  if (loading) {
    return (
      <div className="bg-white border text-slate-800 border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4 animate-pulse">
          <div className="w-8 h-8 bg-slate-200" />
          <div className="space-y-2 flex-1">
            <div className="h-2.5 w-48 bg-slate-200" />
            <div className="h-2 w-32 bg-slate-100" />
          </div>
        </div>
        <div className="h-10 bg-slate-50 border border-slate-100 animate-pulse" />
      </div>
    );
  }

  if (error || !data) return null;

  if (!data.warnings?.length && !data.hasCritical) {
    // All clear — Professional safe badge
    return (
      <div className="bg-white border border-emerald-600 border-l-4 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm mb-6">
        <div className="flex items-start sm:items-center gap-3">
          <span className="material-symbols-outlined text-emerald-600 text-[24px]">verified_user</span>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Clinical Safety Check: Passport</h3>
            <p className="text-xs text-slate-600 mt-0.5">Automated screening confirms no known adverse interactions among selected pharmacological agents.</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Safety Index</p>
          <div className="inline-flex items-center justify-center bg-emerald-600 text-white font-black text-sm px-3 py-1">
            {data.safetyScore || 100}/100
          </div>
        </div>
      </div>
    );
  }

  const highestSeverity = data.hasCritical ? 'critical' : (data.warnings[0]?.severity || 'informational');
  const mainConfig = SEVERITY_CONFIG[highestSeverity];

  return (
    <div className={`bg-white border ${mainConfig.border} border-l-4 shadow-md mb-6`}>
      {/* Header */}
      <div className={`px-5 py-3 flex items-center justify-between ${mainConfig.headerBg} border-b border-slate-200`}>
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined ${mainConfig.iconColor} text-[22px]`}>
            {mainConfig.icon}
          </span>
          <div>
            <h3 className={`font-bold text-sm uppercase tracking-wide ${mainConfig.headerText}`}>Clinical Pharmacovigilance Alert</h3>
            <p className={`text-[11px] font-semibold opacity-80 ${mainConfig.headerText}`}>
              Identified {data.warnings?.length || 0} potential interaction{data.warnings?.length !== 1 ? 's' : ''} out of {data.analyzedCount} active components
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-0.5">Safety Index</span>
            <span className={`font-black text-xs px-2 py-0.5 ${mainConfig.badgeBg} ${mainConfig.badgeText}`}>{data.safetyScore || 0}/100</span>
          </div>
          <button onClick={() => setDismissed(true)} className="text-slate-400 hover:text-slate-700 transition-colors" title="Acknowledge & Dismiss">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      {/* Warnings List */}
      <div className="divide-y divide-slate-100">
        {(data.warnings || []).map((warning, i) => {
          const config = SEVERITY_CONFIG[warning.severity] || SEVERITY_CONFIG.informational;
          return (
            <div key={i} className="p-5 flex flex-col md:flex-row gap-5">
              
              {/* Left col: Agents */}
              <div className="md:w-1/3 shrink-0 border-l-2 border-slate-200 pl-3">
                <span className={`inline-block text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 mb-2 ${config.badgeBg} ${config.badgeText}`}>
                  {warning.severity} RISK
                </span>
                <p className="text-xs font-bold text-slate-800 leading-snug">
                  {(warning.medicines || []).join(' + ')}
                </p>
              </div>

              {/* Right col: Details */}
              <div className="md:w-2/3 space-y-2">
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Mechanism / Interaction</h4>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">{warning.interaction}</p>
                </div>
                
                {warning.risk && (
                  <div className="mt-2">
                    <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Clinical Risk</h4>
                    <p className={`text-xs ${config.iconColor} font-semibold leading-relaxed`}>{warning.risk}</p>
                  </div>
                )}
                
                {warning.recommendation && (
                  <div className="mt-3 bg-slate-50 border border-slate-200 p-3">
                    <h4 className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1.5">
                      <span className="material-symbols-outlined text-[14px]">prescriptions</span>
                      Guidance
                    </h4>
                    <p className="text-xs text-slate-700 font-medium">{warning.recommendation}</p>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 bg-slate-100 flex items-center justify-between border-t border-slate-200">
        <div className="flex items-center gap-2">
           <span className="material-symbols-outlined text-slate-400 text-[14px]">policy</span>
           <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Automated AI Screening • Not medical advice</p>
        </div>
      </div>
    </div>
  );
}
