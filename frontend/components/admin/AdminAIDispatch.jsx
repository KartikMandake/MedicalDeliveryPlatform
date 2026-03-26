import { useState, useEffect } from 'react';
import { runDispatchOptimization } from '../../api/ai';
import { updateOrderStatus } from '../../api/orders';

export default function AdminAIDispatch({ onDispatchComplete }) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);

  const handleRunAI = async () => {
    setLoading(true);
    setError('');
    setPlan(null);
    try {
      const res = await runDispatchOptimization();
      if (res.data.success) {
        setPlan(res.data);
      } else {
        setError(res.data.message || 'Optimization failed');
      }
    } catch (err) {
      setError('Could not reach AI Dispatch service.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAssignments = async () => {
    if (!plan || !plan.assignments.length) return;
    setConfirming(true);
    try {
      // Execute each assignment sequentially to ensure DB consistency
      for (const assignment of plan.assignments) {
        await updateOrderStatus(assignment.orderId, 'assigned', assignment.agentId);
      }
      setPlan(null);
      if (onDispatchComplete) onDispatchComplete();
    } catch (err) {
      setError('Failed to confirm assignments.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <section className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#f2f4f7] mb-8">
      <div className="px-8 py-6 border-b border-[#f2f4f7] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="material-symbols-outlined text-[#68fadd] text-[20px] animate-pulse">route</span>
             <h3 className="text-lg font-bold">Smart Dispatch AI</h3>
             <span className="bg-[#68fadd]/20 text-[#68fadd] text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wider ml-2">Beta</span>
          </div>
          <p className="text-sm text-slate-400">Optimize routing and load-balance pending orders across available agents.</p>
        </div>
        
        {!plan && (
          <button
            onClick={handleRunAI}
            disabled={loading}
            className="flex items-center gap-2 bg-[#68fadd] hover:bg-[#4ceada] text-slate-900 font-bold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                Analyzing Fleet...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">magic_button</span>
                Run Optimization
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 border-b border-red-100 text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      {plan && (
        <div className="p-8">
          <div className="mb-6 pb-6 border-b border-slate-100 flex justify-between items-center">
             <div>
                <p className="text-sm font-bold text-slate-800 mb-1">Routing Plan Generated</p>
                <p className="text-xs text-slate-500">{plan.clusterSummary}</p>
             </div>
             <div className="text-right">
                <p className="text-2xl font-black text-[#0d631b]">{plan.metrics.totalRouted}</p>
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Orders Routed</p>
             </div>
          </div>

          <div className="space-y-3 mb-8">
            {plan.assignments.map((assignment, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl gap-4">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-800">Assign Order #{assignment.orderId}</p>
                     <p className="text-xs text-slate-500 font-medium">To: <span className="text-blue-700">{assignment.agentName}</span></p>
                   </div>
                 </div>
                 
                 <div className="sm:text-right bg-white px-3 py-2 rounded-lg border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">AI Reasoning</p>
                    <p className="text-xs text-slate-700 font-medium">{assignment.reasoning}</p>
                 </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
             <button
               onClick={() => setPlan(null)}
               disabled={confirming}
               className="px-5 py-2.5 text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors disabled:opacity-50"
             >
               Discard Plan
             </button>
             <button
               onClick={handleConfirmAssignments}
               disabled={confirming}
               className="flex items-center gap-2 bg-[#0d631b] hover:bg-[#0a4d15] text-white font-bold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
             >
               {confirming ? (
                 <>
                   <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                   Dispatching...
                 </>
               ) : (
                 <>
                   <span className="material-symbols-outlined text-[18px]">send</span>
                   Confirm & Dispatch Fleet
                 </>
               )}
             </button>
          </div>
        </div>
      )}
    </section>
  );
}
