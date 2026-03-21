import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function DashboardDelivery() {
  const [activeTab, setActiveTab] = useState('active');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/agent/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAccept = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/agent/orders/${orderId}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchOrders();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to accept order');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    let payload = { status: newStatus };
    if (newStatus === 'delivered') {
      const otp = prompt('Please enter the 6-digit Delivery PIN provided by the Patient:');
      if (!otp) return; // User cancelled
      payload.otp = otp;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/agent/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        if (newStatus === 'delivered') alert('Delivery verified instantly!');
        fetchOrders();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to sync status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeShipments = orders.filter(o => o.status !== 'delivered');
  const completedHistory = orders.filter(o => o.status === 'delivered');

  // Flat 10% agent commission 
  const totalRevenue = completedHistory.reduce((sum, o) => sum + (Number(o.total_amount) * 0.10), 0);
  
  const stats = [
    { label: 'Total Earnings', value: `$${totalRevenue.toFixed(2)}`, trend: 'Lifetime', icon: 'payments', color: 'primary' },
    { label: 'Completed Deliveries', value: completedHistory.length, trend: 'Lifetime', icon: 'task_alt', color: 'green-500' },
    { label: 'Active Shipments', value: activeShipments.length, trend: 'In Transit', icon: 'local_shipping', color: 'amber-500' },
    { label: 'Performance Rating', value: '5.0', trend: 'Perfect', icon: 'star', color: 'secondary' }
  ];

  return (
    <div className="bg-background font-body text-on-background min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 glass-nav shadow-sm">
        <div className="flex justify-between items-center w-full px-6 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-2xl">medical_services</span>
            </div>
            <span className="text-xl font-bold tracking-tighter text-zinc-900 font-headline">MediFlow <span className="text-secondary">Delivery</span></span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-4 mr-4 text-sm font-bold text-zinc-500">
               <span className="flex items-center gap-1 text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Online
              </span>
            </div>
            <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-all active:scale-95">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0 bg-secondary flex items-center justify-center text-white font-bold">
              DA
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-6 max-w-screen-2xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold font-headline tracking-tight text-zinc-900">Agent Dashboard</h1>
            <p className="text-zinc-500 font-medium mt-1">Authorized Logistics Network</p>
          </div>
          <div className="flex bg-surface-container-high p-1 rounded-2xl">
            <button 
              onClick={() => setActiveTab('active')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Active Shipments
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Delivery History
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="insight-glow bg-white p-6 rounded-[2rem] border border-zinc-50 shadow-sm transition-all hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center
                  ${stat.color === 'primary' ? 'bg-primary/10 text-primary' : 
                    stat.color === 'green-500' ? 'bg-green-100 text-green-600' :
                    stat.color === 'secondary' ? 'bg-secondary-container text-secondary' :
                    'bg-amber-100 text-amber-600'}`}>
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
                <span className="text-[10px] font-black px-2 py-1 bg-zinc-100 text-zinc-600 rounded-full uppercase tracking-tighter">
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest font-label mb-1">{stat.label}</h3>
              <p className="text-2xl font-black text-zinc-900">{stat.value}</p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Content Area */}
          <section className="lg:col-span-2 space-y-6">
            {activeTab === 'active' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-bold font-headline text-zinc-900">Live Network</h2>
                    <span className="text-sm font-bold text-primary">{activeShipments.length} Pending Routes</span>
                </div>
                
                {loading ? (
                  <p className="text-zinc-500 p-8 text-center font-bold">Scanning Logistics Nodes...</p>
                ) : activeShipments.length === 0 ? (
                  <div className="bg-white p-12 rounded-[2.5rem] text-center shadow-sm border border-zinc-50">
                    <span className="material-symbols-outlined text-6xl text-zinc-200 mb-4">maps_ugc</span>
                    <p className="text-zinc-500 font-bold">No active packages waiting.</p>
                  </div>
                ) : activeShipments.map((shipment, i) => (
                  <div key={i} className={`bg-white p-8 rounded-[2.5rem] border hover:shadow-xl transition-all group ${shipment.status === 'ready' ? 'border-primary/30 shadow-md bg-primary/5' : 'shadow-sm border-zinc-50'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-4 items-center">
                          <span className="text-[10px] font-black px-2 py-1 bg-zinc-900 text-white rounded-md uppercase tracking-wider">{shipment.order_number}</span>
                          <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${shipment.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {shipment.payment_status === 'paid' ? 'ONLINE PRE-PAID' : 'COLLECT CASH'}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Pharmacy Pickup</p>
                            <h3 className="text-sm font-bold text-zinc-900">{shipment.pharmacy_name}</h3>
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-2">Patient Dropoff</p>
                            <h3 className="text-md font-bold text-zinc-900">{shipment.customer_name} • {shipment.customer_phone}</h3>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-end gap-3 min-w-[160px]">
                         {shipment.status === 'ready' && (
                           <button onClick={() => handleAccept(shipment.id)} className="w-full py-4 bg-zinc-900 text-white rounded-2xl text-xs font-bold hover:bg-primary transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2">
                             <span className="material-symbols-outlined text-sm">front_hand</span> Accept Transfer
                           </button>
                         )}
                         {shipment.status === 'picked_up' && (
                           <button onClick={() => handleStatusUpdate(shipment.id, 'in_transit')} className="w-full py-4 bg-primary text-white rounded-2xl text-xs font-bold hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                             <span className="material-symbols-outlined text-sm">local_shipping</span> Start Transit
                           </button>
                         )}
                         {shipment.status === 'in_transit' && (
                           <button onClick={() => handleStatusUpdate(shipment.id, 'delivered')} className="w-full py-4 bg-green-600 text-white rounded-2xl text-xs font-bold hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-600/30 flex items-center justify-center gap-2">
                             <span className="material-symbols-outlined text-sm">verified_user</span> Validate OTP Drop
                           </button>
                         )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-zinc-50">
                    <h2 className="text-xl font-bold font-headline text-zinc-900 mb-8">Archived Transfers</h2>
                    <div className="space-y-6">
                        {completedHistory.length === 0 ? <p className="text-zinc-400 font-bold">No completed drops yet.</p> : null}
                        {completedHistory.map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-4 border-b border-zinc-50 last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-zinc-900">{item.order_number} \u2192 Patient {item.customer_name}</h4>
                                        <p className="text-[10px] text-zinc-400">{new Date(item.placed_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-green-600 text-sm">+${(Number(item.total_amount) * 0.1).toFixed(2)} Fee</p>
                                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">{item.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </section>

          {/* Sidebar Area */}
          <section className="space-y-8">
            <div className="bg-zinc-900 text-white rounded-[2.5rem] overflow-hidden shadow-xl aspect-square relative">
                {/* Mock Map Background */}
                <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuBK0JdZtDI310gtWg8eCr5pbRzhhGWqK3lW3kUTl_XDmTiN5obPci31m58eDe_x2sRioLZ9d4Dv__Khkc1-keodmLfUXPVc8_31Cqq93j6bYKITuDIixuuU2RItP8D2FRdmEXaBJVR7QB6KMjedUqAnqJm4oWs6ls39a9DP_QOofYEC-Zk12KRXfMRXOaLhzyFfqy-S91yhxPQTjEVWxtanFCO4AWcxZqdlepF-GPyT2ql8Xv2kHU9_X_w43wo1TGhF9lvD3ZZ-v6wv')] opacity-30 mix-blend-luminosity grayscale bg-cover"></div>
                <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold font-headline mb-2">Live Route Nav</h2>
                        <p className="text-xs text-zinc-400">Locked to internal coordinates</p>
                    </div>
                    <div className="space-y-4">
                        <button className="w-full py-4 bg-primary hover:bg-primary-container text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                             <span className="material-symbols-outlined text-sm">navigation</span> Sync Maps
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
                 <h2 className="text-lg font-bold font-headline text-zinc-900 mb-6">Network Alerts</h2>
                 <div className="space-y-4">
                    {[
                        { icon: 'info', text: 'Secure all OTP handoffs properly.', color: 'text-amber-500' },
                        { icon: 'bolt', text: 'Cold-chain required for Insulin packages.', color: 'text-primary' }
                    ].map((alert, i) => (
                        <div key={i} className="flex gap-3">
                            <span className={`material-symbols-outlined text-sm ${alert.color}`}>{alert.icon}</span>
                            <p className="text-xs font-medium text-zinc-500">{alert.text}</p>
                        </div>
                    ))}
                 </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default DashboardDelivery;
