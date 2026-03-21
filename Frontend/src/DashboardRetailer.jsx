import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function DashboardRetailer() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const stats = [
    { label: 'Total Revenue', value: '$12,450.80', trend: '+12.5%', icon: 'payments', color: 'primary' },
    { label: 'Pending Orders', value: '18', trend: '5 Urgent', icon: 'shopping_basket', color: 'amber-500' },
    { label: 'Low Stock Items', value: '4', trend: '2 Critical', icon: 'inventory_2', color: 'error' },
    { label: 'Prescriptions to Verify', value: '12', trend: 'Next 1h', icon: 'verified_user', color: 'secondary' }
  ];

  const pendingOrders = [
    { id: '#ORD-7721', patient: 'Vanshika Sharma', items: 'Atorvastatin 20mg x2', time: '12 min ago', status: 'Pending' },
    { id: '#ORD-7722', patient: 'Rahul Gupta', items: 'Vitamin C Complex x1', time: '25 min ago', status: 'Urgent' },
    { id: '#ORD-7723', patient: 'Priya Mehta', items: 'Insulin Pen x3', time: '34 min ago', status: 'Pending' }
  ];

  const prescriptions = [
    { id: '#RX-8821', patient: 'Arjun Singh', doctor: 'Dr. K. Saxena', date: '21 Mar 2026', file: 'rx_01.pdf' },
    { id: '#RX-8822', patient: 'Neha Verma', doctor: 'Dr. S. Kapoor', date: '20 Mar 2026', file: 'rx_02.pdf' }
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
            <span className="text-xl font-bold tracking-tighter text-zinc-900 font-headline">MediFlow <span className="text-primary">Retailer</span></span>
          </div>
          
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
              <input
                className="w-full bg-surface-container-low border-none rounded-full py-2.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-zinc-400 outline-none"
                placeholder="Search orders, stock, or patients..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-4 mr-4 text-sm font-bold text-zinc-500">
              <span className="flex items-center gap-1 text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                System Online
              </span>
            </div>
            <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-all active:scale-95 relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
            </button>
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0 bg-primary-container flex items-center justify-center text-white font-bold">
              RP
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-6 max-w-screen-2xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold font-headline tracking-tight text-zinc-900">Retailer Dashboard</h1>
            <p className="text-zinc-500 font-medium mt-1">Pharmacy ID: #PHARM-CL-902 | Central Clinical Station</p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all">
              <span className="material-symbols-outlined text-sm">add_box</span> Add Inventory
            </button>
            <button className="px-6 py-2.5 bg-white border border-zinc-200 text-zinc-900 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-50 transition-all">
              <span className="material-symbols-outlined text-sm">download</span> Report
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="insight-glow bg-white p-6 rounded-[2rem] border border-zinc-50 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center
                  ${stat.color === 'primary' ? 'bg-primary/10 text-primary' : 
                    stat.color === 'error' ? 'bg-error-container text-error' :
                    stat.color === 'secondary' ? 'bg-secondary-container text-secondary' :
                    'bg-amber-100 text-amber-600'}`}>
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter
                  ${stat.trend.includes('+') ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'}`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest font-label mb-1">{stat.label}</h3>
              <p className="text-2xl font-black text-zinc-900">{stat.value}</p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Pending Orders */}
          <section className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-zinc-50">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold font-headline text-zinc-900 flex items-center gap-3">
                <span className="w-2 h-8 bg-primary rounded-full"></span> Incoming Order Queue
              </h2>
              <button className="text-sm font-bold text-primary hover:underline">View All Queue</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-50">
                    <th className="pb-4">Order ID</th>
                    <th className="pb-4">Patient</th>
                    <th className="pb-4">Items</th>
                    <th className="pb-4">Received</th>
                    <th className="pb-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {pendingOrders.map((order, i) => (
                    <tr key={i} className="group hover:bg-zinc-50/50 transition-colors">
                      <td className="py-5 font-bold text-zinc-900 text-sm">{order.id}</td>
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-500 uppercase">
                            {order.patient.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm font-medium text-zinc-700">{order.patient}</span>
                        </div>
                      </td>
                      <td className="py-5 text-sm text-zinc-500">{order.items}</td>
                      <td className="py-5">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${order.status === 'Urgent' ? 'bg-error-container text-error animate-pulse' : 'bg-zinc-100 text-zinc-600'}`}>
                          {order.time}
                        </span>
                      </td>
                      <td className="py-5 text-right">
                        <button className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-primary transition-all active:scale-95">
                          Fulfill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Quick Tasks */}
          <section className="space-y-8">
            <div className="bg-zinc-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -mr-16 -mt-16"></div>
              <h2 className="text-xl font-bold font-headline mb-6 relative z-10">Prescription Verification</h2>
              <div className="space-y-6 relative z-10">
                {prescriptions.map((rx, i) => (
                  <div key={i} className="bg-zinc-800/50 border border-zinc-700 p-4 rounded-2xl hover:bg-zinc-800 transition-colors group cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-sm">{rx.patient}</h4>
                        <span className="material-symbols-outlined text-zinc-500 group-hover:text-primary transition-colors">content_paste_search</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mb-3">{rx.doctor} • {rx.date}</p>
                    <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-[10px] font-bold transition-all">Preview RX</button>
                        <button className="flex-1 py-2 bg-primary hover:bg-primary-container text-white rounded-lg text-[10px] font-bold transition-all">Verify</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-3 bg-white text-zinc-900 rounded-2xl text-xs font-bold hover:bg-zinc-100 transition-all flex items-center justify-center gap-2">
                Open Full Queue <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

            <div className="bg-surface-container-high p-8 rounded-[2.5rem] border border-zinc-100">
              <h2 className="text-lg font-bold font-headline text-zinc-900 mb-6">Inventory Pulse</h2>
              <div className="space-y-6">
                {[
                  { name: 'Insulin Glargine', level: 12, max: 100, status: 'low' },
                  { name: 'Amoxicillin 500mg', level: 85, max: 200, status: 'good' },
                  { name: 'Paracetamol Syrup', level: 5, max: 50, status: 'critical' }
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className={item.status === 'critical' ? 'text-error' : 'text-zinc-700'}>{item.name}</span>
                      <span className="text-zinc-400">{item.level}/{item.max} Units</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${item.status === 'critical' ? 'bg-error' : item.status === 'low' ? 'bg-amber-500' : 'bg-green-500'}`}
                        style={{ width: `${(item.level / item.max) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Low Stock Detailed Grid */}
      </main>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 w-full z-50 rounded-t-3xl glass-nav border-t border-zinc-200 shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center px-4 pt-3 pb-8 w-full">
          <Link to="/dashboard-retailer" className="flex flex-col items-center justify-center text-primary scale-110 font-manrope text-[10px] font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            Dashboard
          </Link>
          <a className="flex flex-col items-center justify-center text-zinc-400 font-manrope text-[10px] font-bold uppercase tracking-widest" href="#">
            <span className="material-symbols-outlined mb-1">inventory_2</span>
            Stocks
          </a>
          <a className="flex flex-col items-center justify-center text-zinc-400 font-manrope text-[10px] font-bold uppercase tracking-widest" href="#">
            <span className="material-symbols-outlined mb-1">receipt_long</span>
            Orders
          </a>
        </div>
      </nav>
    </div>
  );
}

export default DashboardRetailer;
