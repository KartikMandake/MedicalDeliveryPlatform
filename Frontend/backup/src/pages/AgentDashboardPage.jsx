import AgentNavBar from '../components/agent/AgentNavBar';
import AgentSidebar from '../components/agent/AgentSidebar';
import AgentMapOverlay from '../components/agent/AgentMapOverlay';
import AgentOrderPopup from '../components/agent/AgentOrderPopup';
import AgentPerformanceCard from '../components/agent/AgentPerformanceCard';
import AgentMobileNav from '../components/agent/AgentMobileNav';

export default function AgentDashboardPage() {
  return (
    <div className="bg-[#f7f9fc] font-['Inter'] text-[#191c1e] antialiased overflow-hidden h-screen flex flex-col">
      <AgentNavBar />
      <div className="flex flex-1 pt-16 h-full">
        <AgentSidebar />
        <main className="flex-1 md:ml-64 relative bg-[#f2f4f7] overflow-hidden">
          <AgentMapOverlay />
          <AgentOrderPopup />
          <AgentPerformanceCard />
        </main>
      </div>
      <AgentMobileNav />
    </div>
  );
}
