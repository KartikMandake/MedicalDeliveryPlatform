import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function DashboardRetailer() {
  const [isRegistered, setIsRegistered] = useState(null);
  const [loading, setLoading] = useState(true);

  // Registration Form State
  const [shopName, setShopName] = useState('');
  const [drugLicense, setDrugLicense] = useState('');
  const [gstin, setGstin] = useState('');

  // Orders State
  const [orders, setOrders] = useState([]);
  const [storeData, setStoreData] = useState(null);

  const token = localStorage.getItem('token');

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/retailers/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStoreData(data.store);
        setIsRegistered(true);
        fetchOrders();
      } else {
        setIsRegistered(false);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setIsRegistered(false);
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/retailers/orders', {
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
    fetchProfile();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/retailers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shopName, drugLicense, gstin })
      });
      if (res.ok) {
        fetchProfile();
      } else {
        alert('Failed to register store');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'packing' })
      });
      if (res.ok) {
        fetchOrders(); // Refresh queue
      } else {
        alert('Failed to accept order');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkReady = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'ready' })
      });
      if (res.ok) {
        fetchOrders(); // Refresh queue
      } else {
        alert('Failed to mark ready');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyOTP = async (orderId) => {
    const otp = prompt('To release this package, enter the 6-Digit PIN provided by the Patient/Agent:');
    if (!otp) return;

    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'delivered', otp })
      });
      if (res.ok) {
        alert('Pickup verified natively!');
        fetchOrders();
      } else {
        const d = await res.json();
        alert(d.error || 'Invalid Validation PIN');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center font-bold text-zinc-500">Loading Retailer Hub...</div>;
  }

  // Registration Overlay
  if (isRegistered === false) {
    return (
      <div className="min-h-screen bg-surface-container-low flex items-center justify-center font-body p-6">
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full border border-zinc-100">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-3xl">store</span>
          </div>
          <h1 className="text-2xl font-black font-headline text-zinc-900 mb-2">Pharmacy Verification</h1>
          <p className="text-zinc-500 text-sm mb-8 leading-relaxed">Please register your clinical or retail pharmacy to start accepting active Patient orders.</p>
          
          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="text-xs font-bold text-zinc-900 uppercase tracking-widest block mb-2">Shop Name</label>
              <input required value={shopName} onChange={e => setShopName(e.target.value)} className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20" placeholder="Central Pharmacy Inc." />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-900 uppercase tracking-widest block mb-2">Drug License No.</label>
              <input required value={drugLicense} onChange={e => setDrugLicense(e.target.value)} className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20" placeholder="DL-XXX-8291" />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-900 uppercase tracking-widest block mb-2">GSTIN</label>
              <input required value={gstin} onChange={e => setGstin(e.target.value)} className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20" placeholder="22AAAAA0000A1Z5" />
            </div>
            <button type="submit" className="w-full mt-6 py-4 bg-zinc-900 hover:bg-primary text-white rounded-xl font-bold font-headline transition-colors active:scale-95 shadow-lg flex items-center justify-center gap-2">
              Complete Setup <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const myFulfillments = orders.filter(o => o.status !== 'placed');
  const totalRevenue = myFulfillments.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const platformFee = totalRevenue * 0.05; // 5% gateway/platform fee

  const handleScanInventory = () => {
    const scanner = document.createElement('input');
    scanner.type = 'file';
    scanner.accept = 'image/*';
    scanner.capture = 'environment';
    scanner.onchange = (e) => {
      if (e.target.files.length > 0) {
        alert('Barcode scanned successfully! Inventory will sync shortly.');
      }
    };
    scanner.click();
  };

  // Main Dashboard
  return (
    <div className="bg-background font-body text-on-background min-h-screen">
      <nav className="fixed top-0 w-full z-50 glass-nav shadow-sm">
        <div className="flex justify-between items-center w-full px-6 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-2xl">medical_services</span>
            </div>
            <span className="text-xl font-bold tracking-tighter text-zinc-900 font-headline">MediFlow <span className="text-primary tracking-normal font-medium">Retailer</span></span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Accepting Orders
            </span>
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold text-sm">
              PH
            </div>
          </div>
        </div>
        <div className="bg-zinc-100/50 h-[1px]"></div>
      </nav>

      <main className="pt-24 pb-20 px-6 max-w-screen-2xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold font-headline tracking-tight text-zinc-900">Store Console</h1>
            <p className="text-zinc-500 font-medium mt-1">{storeData?.shop_name} • DL: {storeData?.drug_license}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleScanInventory} className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all">
              <span className="material-symbols-outlined text-sm">add_box</span> Scan Inventory
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Active Orders Queue */}
          <section className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-sm border border-zinc-50">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold font-headline text-zinc-900 flex items-center gap-3">
                <span className="w-2 h-8 bg-primary rounded-full"></span> Live Order Network
              </h2>
              <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-lg">{orders.length} Active</span>
            </div>
            
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-5xl text-zinc-200 mb-4">notifications_active</span>
                  <p className="text-zinc-500 font-medium">Waiting for incoming patient orders...</p>
                </div>
              ) : orders.map(order => (
                <div key={order.id} className={`border border-zinc-100 rounded-2xl p-6 transition-all ${order.status === 'packing' ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-surface-container-lowest hover:bg-zinc-50'}`}>
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black px-2 py-1 bg-zinc-900 text-white rounded-md uppercase tracking-widest">{order.order_number}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                          order.status === 'placed' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}>
                          • {order.status}
                        </span>
                        <span className="text-xs font-bold text-zinc-400 font-label">{new Date(order.placed_at).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Patient</p>
                          <p className="text-sm font-bold text-zinc-900">{order.customer_name}</p>
                          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1"><span className="material-symbols-outlined text-[14px]">call</span> {order.customer_phone}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Financials</p>
                          <p className="text-sm font-bold text-zinc-900">${Number(order.total_amount).toFixed(2)}</p>
                          <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {order.payment_status === 'paid' ? 'PAID ONLINE' : 'CASH ON DELIVERY'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center items-end border-l border-zinc-100 pl-6 gap-3 min-w-[140px]">
                      {order.status === 'placed' && (
                        <button 
                          onClick={() => handleAcceptOrder(order.id)}
                          className="w-full py-3 bg-zinc-900 text-white font-bold text-sm rounded-xl hover:bg-primary transition-all active:scale-95 shadow-lg shadow-zinc-200"
                        >
                          Accept Order
                        </button>
                      )}
                      {order.status === 'packing' && (
                        <button 
                          onClick={() => handleMarkReady(order.id)}
                          className="w-full py-3 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px]">check_box</span> Mark Ready
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button 
                          onClick={() => handleVerifyOTP(order.id)}
                          className="w-full py-3 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[16px]">verified_user</span> Verify Pickup PIN
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Metrics */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -mr-16 -mt-16"></div>
              <h2 className="text-xl font-bold font-headline mb-8 relative z-10">Today's Revenue</h2>
              <div className="relative z-10">
                <p className="text-4xl font-black font-headline tracking-tighter mb-2">${totalRevenue.toFixed(2)}</p>
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-6">
                  <span className="material-symbols-outlined text-sm">trending_up</span> Live Active Volume
                </div>
                <div className="space-y-3 pt-6 border-t border-zinc-700/50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">Total Orders</span>
                    <span className="font-bold">{myFulfillments.length} Fulfillments</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">Platform Fees (5%)</span>
                    <span className="font-bold text-zinc-500">-${platformFee.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default DashboardRetailer;
