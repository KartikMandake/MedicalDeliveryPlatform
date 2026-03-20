import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function DashboardDelivery() {
  const [activeTab, setActiveTab] = useState('active');

  const stats = [
    { label: 'Today\'s Earnings', value: '$84.50', trend: '+15%', icon: 'payments', color: 'primary' },
    { label: 'Completed Today', value: '12', trend: 'Goal: 15', icon: 'task_alt', color: 'green-500' },
    { label: 'Active Shipments', value: '2', trend: 'In Transit', icon: 'local_shipping', color: 'amber-500' },
    { label: 'Performance Rating', value: '4.9', trend: 'Top 5%', icon: 'star', color: 'secondary' }
  ];

  const activeShipments = [
    { id: '#DEL-9901', pharmacy: 'MediFlow Central', destination: 'Sector 42, H-Block', items: '2 Items', ett: '8 mins' },
    { id: '#DEL-9902', pharmacy: 'Apollo Clinical', destination: 'DLF Phase 3, G-12', items: '1 Item', ett: '15 mins' }
  ];

  const recentHistory = [
    { id: '#DEL-9895', date: 'Today, 2:30 PM', amount: '$6.50', status: 'Delivered' },
    { id: '#DEL-9894', date: 'Today, 1:45 PM', amount: '$8.20', status: 'Delivered' },
    { id: '#DEL-9893', date: 'Today, 12:15 PM', amount: '$5.80', status: 'Delivered' }
  ];

  return (
    <div className="bg-background font-body text-on-background selection:bg-primary-container selection:text-on-primary-container min-h-screen">
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
            <p className="text-zinc-500 font-medium mt-1">Agent ID: #AG-772 | Status: Active Shift</p>
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
                    <h2 className="text-xl font-bold font-headline text-zinc-900">Current Assignments</h2>
                    <span className="text-sm font-bold text-primary">2 Active Shipments</span>
                </div>
                {activeShipments.map((shipment, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-50 hover:shadow-xl transition-all group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-zinc-900 rounded-[1.5rem] flex flex-col items-center justify-center text-white text-xs font-black">
                           <span className="material-symbols-outlined">directions_bike</span>
                           {shipment.ett}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase tracking-tighter">Priority</span>
                            <span className="text-sm font-bold text-zinc-900">{shipment.id}</span>
                          </div>
                          <h3 className="text-lg font-bold text-zinc-800">{shipment.destination}</h3>
                          <p className="text-sm text-zinc-500">Pick up: {shipment.pharmacy} • {shipment.items}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                         <button className="px-6 py-3 bg-zinc-100 text-zinc-900 rounded-2xl text-xs font-bold hover:bg-zinc-200 transition-all active:scale-95 flex items-center gap-2">
                           <span className="material-symbols-outlined text-sm">map</span> Route
                         </button>
                         <button className="px-8 py-3 bg-zinc-900 text-white rounded-2xl text-xs font-bold hover:bg-primary transition-all active:scale-95">
                           Mark Delivered
                         </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-zinc-50">
                    <h2 className="text-xl font-bold font-headline text-zinc-900 mb-8">Completed Deliveries</h2>
                    <div className="space-y-6">
                        {recentHistory.map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-4 border-b border-zinc-50 last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-zinc-900">{item.id}</h4>
                                        <p className="text-[10px] text-zinc-400">{item.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-zinc-900 text-sm">{item.amount}</p>
                                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">{item.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </section>

          {/* Sidebar / Map Card */}
          <section className="space-y-8">
            <div className="bg-zinc-900 text-white rounded-[2.5rem] overflow-hidden shadow-xl aspect-square relative">
                {/* Mock Map Background */}
                <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuBK0JdZtDI310gtWg8eCr5pbRzhhGWqK3lW3kUTl_XDmTiN5obPci31m58eDe_x2sRioLZ9d4Dv__Khkc1-keodmLfUXPVc8_31Cqq93j6bYKITuDIixuuU2RItP8D2FRdmEXaBJVR7QB6KMjedUqAnqJm4oWs6ls39a9DP_QOofYEC-Zk12KRXfMRXOaLhzyFfqy-S91yhxPQTjEVWxtanFCO4AWcxZqdlepF-GPyT2ql8Xv2kHU9_X_w43wo1TGhF9lvD3ZZ-v6wv')] opacity-30 mix-blend-luminosity grayscale bg-cover"></div>
                <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold font-headline mb-2">Live Route Map</h2>
                        <p className="text-xs text-zinc-400">Optimizing for current traffic conditions</p>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-zinc-800/80 backdrop-blur p-4 rounded-2xl border border-zinc-700">
                             <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                <p className="text-xs font-bold text-zinc-300">Next stop: 1.2 km away</p>
                             </div>
                        </div>
                        <button className="w-full py-4 bg-primary hover:bg-primary-container text-white rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                             <span className="material-symbols-outlined text-sm">navigation</span> Start Navigation
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
                 <h2 className="text-lg font-bold font-headline text-zinc-900 mb-6">Recent Alerts</h2>
                 <div className="space-y-4">
                    {[
                        { icon: 'info', text: 'Heavy rain expected in Sector 42', color: 'text-amber-500' },
                        { icon: 'bolt', text: 'Rush hour bonus active: +$2.00', color: 'text-primary' }
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

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 w-full z-50 rounded-t-3xl glass-nav border-t border-zinc-200 shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center px-4 pt-3 pb-8 w-full">
          <Link to="/dashboard-delivery" className="flex flex-col items-center justify-center text-secondary scale-110 font-manrope text-[10px] font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
            Shipments
          </Link>
          <a className="flex flex-col items-center justify-center text-zinc-400 font-manrope text-[10px] font-bold uppercase tracking-widest" href="#">
            <span className="material-symbols-outlined mb-1">map</span>
            Route
          </a>
          <a className="flex flex-col items-center justify-center text-zinc-400 font-manrope text-[10px] font-bold uppercase tracking-widest" href="#">
            <span className="material-symbols-outlined mb-1">payments</span>
            Earnings
          </a>
        </div>
      </nav>
    </div>
  );
}

export default DashboardDelivery;
