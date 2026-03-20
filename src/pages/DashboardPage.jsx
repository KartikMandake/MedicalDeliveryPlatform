import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import IncomingOrderPopup from '../components/dashboard/IncomingOrderPopup';
import KPICards from '../components/dashboard/KPICards';
import EfficiencyAnalysis from '../components/dashboard/EfficiencyAnalysis';
import RecentOrdersTable from '../components/dashboard/RecentOrdersTable';
import LiveTrackerOverlay from '../components/dashboard/LiveTrackerOverlay';

export default function DashboardPage() {
  return (
    <div className="bg-[#f7f9fc] font-['Inter'] text-[#191c1e] antialiased min-h-screen">
      <DashboardSidebar />
      <main className="ml-64 min-h-screen pb-12">
        <DashboardHeader />
        <div className="p-8 max-w-7xl mx-auto space-y-10 relative">
          <IncomingOrderPopup />
          <KPICards />
          <EfficiencyAnalysis />
          <RecentOrdersTable />
        </div>
      </main>
      <LiveTrackerOverlay />
    </div>
  );
}
