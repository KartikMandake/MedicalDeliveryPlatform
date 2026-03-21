import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function PaymentsLiveStatus() {
  const [nextRun, setNextRun] = useState(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    api.get('/payments/next-disbursement').then((res) => setNextRun(res.data.nextRun)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!nextRun) return;
    const interval = setInterval(() => {
      const diff = new Date(nextRun) - Date.now();
      if (diff <= 0) { setCountdown('Now'); clearInterval(interval); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setCountdown(`${h}h : ${String(m).padStart(2, '0')}m`);
    }, 1000);
    return () => clearInterval(interval);
  }, [nextRun]);

  return (
    <div className="sticky bottom-8 max-w-lg mx-auto bg-white/70 backdrop-blur-xl p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/50">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#88d982] rounded-full flex items-center justify-center text-[#0d631b]">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">Next Disbursement</h4>
          <p className="text-xs text-slate-500">Automated run in {countdown || '—'}</p>
        </div>
      </div>
      <button className="text-xs font-bold uppercase tracking-widest text-[#2e7d32] px-4 py-2 hover:underline">
        View Schedule
      </button>
    </div>
  );
}
