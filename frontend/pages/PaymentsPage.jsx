import PaymentsSidebar from '../components/payments/PaymentsSidebar';
import PaymentsHeader from '../components/payments/PaymentsHeader';
import PaymentsStats from '../components/payments/PaymentsStats';
import PaymentsTable from '../components/payments/PaymentsTable';
import PaymentsLiveStatus from '../components/payments/PaymentsLiveStatus';

export default function PaymentsPage() {
  return (
    <div className="bg-[#f7f9fc] text-[#191c1e] min-h-screen flex">
      <PaymentsSidebar />
      <main className="flex-1 ml-72 min-h-screen relative pb-10">
        <PaymentsHeader />
        <div className="p-8 max-w-7xl mx-auto space-y-10">
          <PaymentsStats />
          <PaymentsTable />
          <PaymentsLiveStatus />
        </div>
      </main>
    </div>
  );
}
