import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [trackingOrderId, setTrackingOrderId] = useState(null);

  const handleReorder = async (orderDetails) => {
    try {
      const token = localStorage.getItem('token');
      for (const item of orderDetails) {
        await fetch('http://localhost:5000/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ medicineId: item.medicine_id, quantity: item.quantity })
        });
      }
      alert('Items reordered! Redirecting to cart...');
      window.location.href = '/cart';
    } catch (err) {
      console.error(err);
      alert('Failed to reorder items');
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Error loading orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      {/* Top Navigation Bar */}
      <header className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl fixed top-0 w-full z-50 shadow-sm dark:shadow-none">
        <div className="flex justify-between items-center w-full px-6 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <Link to="/dashboard-patient" className="text-xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-50 font-headline">MediFlow</Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/dashboard-patient" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-manrope text-sm font-medium tracking-tight hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-200 px-3 py-1">Home</Link>
              <Link to="/categories" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-manrope text-sm font-medium tracking-tight hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-200 px-3 py-1">Categories</Link>
              <Link to="/orders" className="text-green-700 dark:text-green-400 font-bold border-b-2 border-green-600 font-manrope text-sm tracking-tight px-3 py-1">Orders</Link>
              <a className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 font-manrope text-sm font-medium tracking-tight hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-200 px-3 py-1" href="#">Help</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/cart" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-200 scale-95 active:opacity-80 transition-transform">
              <span className="material-symbols-outlined text-zinc-600">shopping_cart</span>
            </Link>
            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-200 scale-95 active:opacity-80 transition-transform">
              <span className="material-symbols-outlined text-zinc-600">notifications</span>
            </button>
            <img
              alt="User Avatar"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container/20"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSTLul4PosWt0yR8lAGGHrImoGXgOci4XIE04BArtaqu98hyBrj8dNNNCU_CaacZBXcHTZbBxk8aUzjjDfr1MyXFR93TeNIHUkPOJDmYb07AD8kjA3Gb7BrTBbZ9pqJz0gt-FZF2OZYuI6v80ObhUHfjYWZZSKo_CxVjBaTz4SIzpedpqgXZUxTCLebVRrCTGRXU5ArBXBOKhMrJSusSeomiJxkLCYpnb17morcs3JqFhe58dbQH0w4Wq9ZJ7onZ397AcnwvfnJhBQ"
            />
          </div>
        </div>
        <div className="bg-zinc-100/50 dark:bg-zinc-800/50 h-[1px]"></div>
      </header>

      <div className="flex min-h-screen pt-16">
        {/* SideNavBar */}
        <aside className="hidden lg:flex flex-col p-4 gap-4 h-[calc(100vh-64px)] w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 sticky top-16">
          <div className="px-2 py-4">
            <h2 className="text-lg font-black text-green-700 dark:text-green-500 font-headline">Clinical Portal</h2>
            <p className="text-xs text-zinc-500 font-manrope">AI-Powered Inventory</p>
          </div>
          <nav className="flex-1 space-y-2">
            <Link to="/dashboard-patient" className="flex items-center gap-3 px-4 py-3 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl hover:translate-x-1 transition-transform duration-200 font-manrope text-sm">
              <span className="material-symbols-outlined">dashboard</span>
              <span>Dashboard</span>
            </Link>
            <Link to="/categories" className="flex items-center gap-3 px-4 py-3 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl hover:translate-x-1 transition-transform duration-200 font-manrope text-sm">
              <span className="material-symbols-outlined">category</span>
              <span>Categories</span>
            </Link>
            <Link to="/orders" className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-900 text-green-700 dark:text-green-400 shadow-sm rounded-xl font-semibold hover:translate-x-1 transition-transform duration-200 font-manrope text-sm">
              <span className="material-symbols-outlined">package_2</span>
              <span>Order History</span>
            </Link>
            <a className="flex items-center gap-3 px-4 py-3 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl hover:translate-x-1 transition-transform duration-200 font-manrope text-sm" href="#">
              <span className="material-symbols-outlined">description</span>
              <span>Prescriptions</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl hover:translate-x-1 transition-transform duration-200 font-manrope text-sm" href="#">
              <span className="material-symbols-outlined">help_center</span>
              <span>Support</span>
            </a>
          </nav>
          <Link to="/upload-prescription" className="btn-primary-gradient text-white rounded-xl py-3 px-4 font-semibold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all mb-8 flex items-center justify-center">
            Upload Prescription
          </Link>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
          <header className="mb-12">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block font-label">Transaction Repository</span>
            <h1 className="text-4xl font-extrabold text-on-surface font-headline tracking-tighter">Order History</h1>
            <p className="text-on-surface-variant mt-2 max-w-xl font-body text-sm leading-relaxed">
              A precise record of your medical supplies and prescriptions, verified by our fluid intelligence engine.
            </p>
          </header>

          {/* Insight Component */}
          <div className="insight-glow rounded-xl p-6 mb-12 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div>
                <h4 className="font-headline font-bold text-on-surface">Precision Insight</h4>
                <p className="text-sm text-on-surface-variant">Your insulin supply is projected to last 14 more days. Reorder suggested by Oct 12.</p>
              </div>
            </div>
            <button className="px-6 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:scale-105 transition-transform active:scale-95">
              Schedule Auto-Refill
            </button>
          </div>

          {/* Orders Layout */}
          <div className="space-y-6">
            {orders.map((order, idx) => (
              <div key={idx} className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_8px_24px_rgba(25,28,29,0.04)] hover:shadow-[0_16px_32px_rgba(0,110,47,0.08)] transition-all duration-300 group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-label">Order ID: {order.id}</span>
                    <h3 className="font-headline font-bold text-lg text-on-surface">{order.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant mt-1">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span> {order.date}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">inventory_2</span> {order.items} Items</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xl font-black text-on-surface font-headline">${order.price.toFixed(2)}</div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${order.statusColor === 'primary' ? 'bg-primary-container/10 text-primary' :
                          order.statusColor === 'secondary' ? 'bg-secondary-container/20 text-secondary' :
                            'bg-error-container/20 text-error'
                        }`}>
                        {order.status}
                      </span>
                      {order.status !== 'Delivered' && order.status !== 'Cancelled' && order.statusColor !== 'error' && (
                        <p className="text-[10px] font-bold text-zinc-500 mt-2 font-manrope">OTP: <span className="text-primary font-black tracking-widest">{order.deliveryOtp}</span></p>
                      )}
                    </div>
                    <div className="h-10 w-[1px] bg-zinc-100 hidden md:block"></div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          setExpandedOrderId(expandedOrderId === order.id ? null : order.id);
                          setTrackingOrderId(null);
                        }}
                        className={`p-2 rounded-lg transition-colors ${expandedOrderId === order.id ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                      {order.status === 'Processing' || order.status === 'Packing' || order.status === 'Placed' || order.status === 'Ready' ? (
                        <button 
                          onClick={() => {
                            setTrackingOrderId(trackingOrderId === order.id ? null : order.id);
                            setExpandedOrderId(null);
                          }}
                          className={`px-5 py-2 rounded-full text-xs font-bold transition-colors active:scale-95 ${trackingOrderId === order.id ? 'bg-primary text-white shadow-lg' : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'}`}
                        >
                          Track
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleReorder(order.orderDetails)}
                          className="btn-primary-gradient text-white px-5 py-2 rounded-full text-xs font-bold hover:scale-105 transition-transform active:scale-95 shadow-md"
                        >
                          Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Tracking View */}
                {trackingOrderId === order.id && (
                  <div className="mt-6 pt-6 border-t border-surface-container-high animate-in slide-in-from-top-4 fade-in duration-200">
                    <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-6">Live Delivery Pipeline</h4>
                    <div className="flex items-center justify-between relative mb-4 px-4 sm:px-12">
                      <div className="absolute top-1/2 left-8 right-8 sm:left-16 sm:right-16 h-1.5 bg-zinc-100 -z-10 -translate-y-1/2 rounded-full"></div>
                      <div 
                        className="absolute top-1/2 left-8 sm:left-16 h-1.5 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-1000" 
                        style={{ width: order.status === 'Placed' ? '0%' : order.status === 'Packing' ? '33%' : order.status === 'Ready' ? '66%' : '100%' }}
                      ></div>
                      
                      {['Placed', 'Packing', 'Ready', 'Delivered'].map((step, idx) => {
                        const states = ['Placed', 'Packing', 'Ready', 'Delivered'];
                        const currentIdx = states.indexOf(order.status);
                        const isCompleted = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;
                        
                        return (
                          <div key={step} className="flex flex-col items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] transition-all duration-500 ${isCurrent ? 'bg-primary text-white shadow-[0_0_20px_rgba(0,110,47,0.4)] scale-110 ring-4 ring-primary/20' : isCompleted ? 'bg-primary text-white' : 'bg-surface-container-high text-zinc-400 border-2 border-white'}`}>
                              {isCompleted ? <span className="material-symbols-outlined text-[20px]">check</span> : idx + 1}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${isCurrent ? 'text-primary' : isCompleted ? 'text-on-surface' : 'text-zinc-400'}`}>{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Expandable Order Details */}
                {expandedOrderId === order.id && (
                  <div className="mt-6 pt-6 border-t border-surface-container-high animate-in slide-in-from-top-4 fade-in duration-200">
                    <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Included Clinical Items</h4>
                    <div className="space-y-3">
                      {(order.orderDetails || []).map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl">
                          <div>
                            <p className="text-sm font-bold text-on-surface">{item.name}</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">Qty {item.quantity} × ${Number(item.unit_price).toFixed(2)}</p>
                          </div>
                          <span className="text-sm font-bold font-headline">${Number(item.total_price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <button className="text-on-surface-variant text-sm font-medium flex items-center gap-2 hover:text-primary transition-colors group">
              View more historical data
              <span className="material-symbols-outlined text-sm group-hover:translate-y-1 transition-transform">expand_more</span>
            </button>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-zinc-50 dark:bg-zinc-950 w-full py-12 px-8 border-t border-zinc-100 dark:border-zinc-900 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <div className="space-y-4">
            <span className="font-manrope font-bold text-zinc-900 dark:text-zinc-100">MediFlow AI</span>
            <p className="font-inter text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              © 2024 MediFlow AI. Clinical Excellence & Fluid Intelligence.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <a className="font-inter text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
            <a className="font-inter text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors opacity-80 hover:opacity-100" href="#">Terms of Service</a>
          </div>
          <div className="flex flex-col gap-2">
            <a className="font-inter text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors opacity-80 hover:opacity-100" href="#">Contact Medical Hub</a>
            <a className="font-inter text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors opacity-80 hover:opacity-100" href="#">API Documentation</a>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-label">System Status</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[10px] font-bold text-primary font-label">Node Active: Precision V2.4</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden flex justify-around items-center px-4 pt-3 pb-8 w-full fixed bottom-0 z-50 rounded-t-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-lg shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)] border-t border-zinc-200 dark:border-zinc-800">
        <Link to="/dashboard-patient" className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 tap-highlight-transparent active:scale-90 transition-transform duration-200">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold uppercase tracking-widest font-manrope mt-1">Home</span>
        </Link>
        <Link to="/categories" className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 tap-highlight-transparent active:scale-90 transition-transform duration-200">
          <span className="material-symbols-outlined">grid_view</span>
          <span className="text-[10px] font-bold uppercase tracking-widest font-manrope mt-1">Categories</span>
        </Link>
        <Link to="/orders" className="flex flex-col items-center justify-center text-green-600 dark:text-green-400 scale-110 tap-highlight-transparent active:scale-90 transition-transform duration-200">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
          <span className="text-[10px] font-bold uppercase tracking-widest font-manrope mt-1">Orders</span>
        </Link>
        <a className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 tap-highlight-transparent active:scale-90 transition-transform duration-200" href="#">
          <span className="material-symbols-outlined">contact_support</span>
          <span className="text-[10px] font-bold uppercase tracking-widest font-manrope mt-1">Help</span>
        </a>
      </nav>
    </div>
  );
}

export default OrderHistory;
