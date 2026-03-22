import RetailerSidebar from '../components/retailer/RetailerSidebar';
import RetailerTopNav from '../components/retailer/RetailerTopNav';
import RetailerOrdersTable from '../components/retailer/RetailerOrdersTable';
import RetailerFooter from '../components/retailer/RetailerFooter';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function RetailerOrdersPage() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user || user.role !== 'retailer') return <Navigate to="/login" replace />;

  return (
    <div className="bg-[#f8f9fa] font-body text-[#191c1d] antialiased min-h-screen">
      <RetailerTopNav />
      <RetailerSidebar />

      <main className="lg:ml-56 pt-24 pb-24 md:pb-12 px-5">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2">Retail Workspace</p>
            <h1 className="text-3xl md:text-[34px] font-extrabold font-headline text-[#191c1d] tracking-tight mb-1">Order Tracking</h1>
            <p className="text-sm text-zinc-500 max-w-md">Manage incoming orders, status transitions, and dispatch readiness.</p>
          </div>
        </header>
        <RetailerOrdersTable />
      </main>

      <RetailerFooter />
    </div>
  );
}
