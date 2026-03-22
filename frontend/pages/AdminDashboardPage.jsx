import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavBar from '../components/admin/AdminNavBar';
import AdminHeader from '../components/admin/AdminHeader';
import AdminKPIs from '../components/admin/AdminKPIs';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import AdminOrdersTable from '../components/admin/AdminOrdersTable';
import AdminLiveTracker from '../components/admin/AdminLiveTracker';

export default function AdminDashboardPage() {
  return (
    <div className="bg-[#f7f9fc] font-['Inter'] text-[#191c1e] fixed inset-0 overflow-y-auto overflow-x-hidden relative">
      <AdminSidebar />
      <AdminNavBar />
      <main className="ml-64 p-8 min-h-screen">
        <AdminHeader />
        <AdminKPIs />
        <AdminAnalytics />
        <AdminOrdersTable />
      </main>
      <AdminLiveTracker />
    </div>
  );
}
