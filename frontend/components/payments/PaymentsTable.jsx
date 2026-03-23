import { useState, useEffect } from 'react';
import { getPayments } from '../../api/payments';

export default function PaymentsTable() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPayments().then((r) => setPayments(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <section className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Order ID</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Payment ID</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-6 py-5"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : payments.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No payments yet</td></tr>
              ) : payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-5">
                    <span className="font-mono font-bold text-slate-900">#{p.orderId}</span>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-5 text-sm text-slate-700">{p.user?.name || p.userId?.slice(0, 8)}</td>
                  <td className="px-6 py-5 font-bold text-slate-900">₹{p.total?.toFixed(2)}</td>
                  <td className="px-6 py-5 text-xs font-mono text-slate-500">{p.paymentId || '—'}</td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#91f78e] text-[#00731e]">
                      {p.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 text-sm text-slate-500">
          {payments.length} paid orders
        </div>
      </div>
    </section>
  );
}
