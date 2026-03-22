import RetailerSidebar from '../components/retailer/RetailerSidebar';
import RetailerTopNav from '../components/retailer/RetailerTopNav';
import RetailerKPI from '../components/retailer/RetailerKPI';
import RetailerOrdersTable from '../components/retailer/RetailerOrdersTable';
import RetailerFooter from '../components/retailer/RetailerFooter';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';

export default function RetailerDashboardPage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) return null;
  if (!user || user.role !== 'retailer') return <Navigate to="/login" replace />;

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-[#f8f9fa] font-body text-[#191c1d] antialiased min-h-screen">
      <RetailerTopNav />
      <RetailerSidebar />

      <main className="lg:ml-56 pt-24 pb-24 md:pb-12 px-5">
        {/* Header Section */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2">Retail Workspace</p>
            <h1 className="text-3xl md:text-[34px] font-extrabold font-headline text-[#191c1d] tracking-tight mb-1">Store Intelligence</h1>
            <p className="text-sm text-zinc-500 max-w-md">Real-time inventory signals and smarter demand guidance for {user?.name || 'your store'}.</p>
          </div>
          <div className="flex gap-3">
            <div className="px-3.5 py-2 bg-[#f3f4f5] rounded-lg flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#006e2f] text-[18px]">calendar_today</span>
              <span className="text-xs font-semibold">{today}</span>
            </div>
            <div className="px-3.5 py-2 bg-[#22c55e]/10 rounded-lg flex items-center gap-2.5 text-[#004b1e]">
              <span className="material-symbols-outlined text-[#006e2f] text-[18px] animate-pulse">sensors</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.08em]">Live System</span>
            </div>
          </div>
        </header>

        {/* Analytics Bento Grid (KPIs) */}
        <RetailerKPI />

        {/* Main Dashboard Content — 3 column grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left 2 Columns */}
          <div className="xl:col-span-2 space-y-6">
            {/* Order workflow snapshot */}
            <RetailerOrdersTable compact />
          </div>

          {/* Right Sidebar — AI Column */}
          <div className="space-y-6">
            {/* Demand Forecast */}
            <section className="space-y-3.5">
              <h2 className="text-base font-bold font-headline flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006e2f] text-[18px]">insights</span>
                Demand Forecast
              </h2>
              <div className="space-y-3.5">
                <div className="p-4 rounded-xl border border-[#006e2f]/10 shadow-sm" style={{ background: 'linear-gradient(135deg, #ffffff 0%, rgba(74, 225, 118, 0.05) 100%)', borderTop: '2px solid rgba(0, 110, 47, 0.2)' }}>
                  <p className="text-[10px] font-bold uppercase text-[#006e2f] mb-2" style={{ letterSpacing: '0.05em' }}>Seasonal Trends</p>
                  <h4 className="font-semibold text-sm mb-2.5 text-[#191c1d]">High Demand Expected</h4>
                  <div className="h-16 flex items-end gap-1 mb-3">
                    <div className="w-full bg-[#006e2f]/20 h-1/4 rounded-t-sm" />
                    <div className="w-full bg-[#006e2f]/20 h-1/3 rounded-t-sm" />
                    <div className="w-full bg-[#006e2f]/40 h-1/2 rounded-t-sm" />
                    <div className="w-full bg-[#006e2f]/60 h-2/3 rounded-t-sm" />
                    <div className="w-full bg-[#006e2f] h-full rounded-t-sm" />
                    <div className="w-full bg-[#006e2f] h-3/4 rounded-t-sm" />
                  </div>
                  <p className="text-[11px] text-zinc-600 leading-relaxed">Monitor inventory levels and restock frequently ordered medicines before stockouts.</p>
                </div>

                {/* AI Recommendation */}
                <div className="bg-[#f3f4f5] p-4 rounded-xl border border-transparent hover:border-[#22c55e] transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[#22c55e]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_fix_high</span>
                    <p className="text-[10px] font-bold uppercase text-[#3d4a3d]" style={{ letterSpacing: '0.05em' }}>AI Recommended</p>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">Review low-stock items</h4>
                  <p className="text-[11px] text-zinc-500">Check your inventory hub for items running below reorder level.</p>
                  <Link
                    to="/retailer/inventory"
                    className="mt-4 w-full py-2 border border-[#006e2f] text-[#006e2f] text-xs font-bold rounded-lg hover:bg-[#006e2f]/5 transition-colors flex items-center justify-center gap-1"
                  >
                    Go to Inventory Hub
                  </Link>
                </div>
              </div>
            </section>

            {/* Weekend Surge Highlight */}
            <section className="bg-[#191c1d] text-white p-5 rounded-xl relative overflow-hidden">
              <div className="relative z-10">
                <span className="px-2 py-0.5 bg-[#006e2f] text-[10px] font-bold rounded mb-3 inline-block">INSIGHT</span>
                <h3 className="text-lg font-bold font-headline leading-tight mb-2">Keep Stock Updated</h3>
                <p className="text-zinc-400 text-[11px] mb-3.5">Regular updates keep availability high and reduce lost orders from stock gaps.</p>
                <div className="flex items-center gap-4">
                  <Link to="/retailer/inventory" className="text-[#22c55e] text-xs font-bold hover:underline">
                    Manage Inventory →
                  </Link>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#006e2f]/20 blur-[60px] rounded-full" />
            </section>

            {/* Quick Status */}
            <section className="bg-white p-5 rounded-xl shadow-sm">
              <h3 className="text-xs font-bold mb-3 uppercase tracking-[0.08em]">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/retailer/inventory" className="flex items-center justify-between p-3 bg-[#f3f4f5] rounded-xl hover:bg-zinc-200/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#006e2f] text-[19px]">inventory_2</span>
                    <span className="text-xs font-semibold">Update Stock</span>
                  </div>
                  <span className="material-symbols-outlined text-zinc-400 text-sm">chevron_right</span>
                </Link>
                <Link to="/retailer/orders" className="flex items-center justify-between p-3 bg-[#f3f4f5] rounded-xl hover:bg-zinc-200/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#006e2f] text-[19px]">local_shipping</span>
                    <span className="text-xs font-semibold">Track Orders</span>
                  </div>
                  <span className="material-symbols-outlined text-zinc-400 text-sm">chevron_right</span>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      <RetailerFooter />
    </div>
  );
}
