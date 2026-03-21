import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function DashboardPatient() {
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false);
  const [isChatbotModalOpen, setIsChatbotModalOpen] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [user, setUser] = useState({ name: 'Guest' });
  const [loadingMeds, setLoadingMeds] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const fetchMeds = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/medicines/recommended', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMedicines(data);
        }
      } catch (err) {
        console.error('Error fetching medicines:', err);
      } finally {
        setLoadingMeds(false);
      }
    };
    fetchMeds();
  }, []);

  const handleAddToCart = async (medicineId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ medicineId, quantity: 1 })
      });
      if (res.ok) {
        showToast('Item successfully added to your cart!', 'success');
      } else {
        showToast('Failed to add item to cart', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error connecting to backend', 'error');
    }
  };

  const toggleContactMenu = () => {
    setIsContactMenuOpen(!isContactMenuOpen);
    if (!isContactMenuOpen) {
      setIsChatbotModalOpen(false);
    }
  };

  const toggleChatbotModal = () => {
    setIsChatbotModalOpen(!isChatbotModalOpen);
    if (!isChatbotModalOpen) {
      setIsContactMenuOpen(false);
    }
  };

  return (
    <div className="bg-background font-body text-on-background selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 glass-nav shadow-sm">
        <div className="flex justify-between items-center w-full px-6 py-3 max-w-screen-2xl mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-2xl">medical_services</span>
            </div>
            <span className="text-xl font-bold tracking-tighter text-zinc-900 font-headline">MediFlow</span>
          </div>
          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
              <input
                className="w-full bg-surface-container-low border-none rounded-full py-2.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-zinc-400 outline-none"
                placeholder="Search medicines or symptoms..."
                type="text"
              />
            </div>
          </div>
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 font-headline text-sm font-medium tracking-tight">
            <Link to="/dashboard-patient" className="text-zinc-900 font-bold border-b-2 border-zinc-900 px-2 py-1">Home</Link>
            <Link to="/categories" className="text-zinc-500 hover:text-zinc-900 transition-all duration-200 px-2 py-1">Categories</Link>
            <Link to="/orders" className="text-zinc-500 hover:text-zinc-900 transition-all duration-200 px-2 py-1">Orders</Link>
            <a className="text-zinc-500 hover:text-zinc-900 transition-all duration-200 px-2 py-1" href="#">Help</a>
          </nav>
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link to="/cart" className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-all active:scale-95">
              <span className="material-symbols-outlined">shopping_cart</span>
            </Link>
            <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-all active:scale-95">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
              <img
                alt="User Avatar"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYr8SqKGXllny9xrFQEtt9QwJTPTI_F-VPCq0_iBYo6BqvQ9BXSthDUDZSpZhf-um_eXgw6zISf3MSKOenHd7LNZw5iohhIZD2V9KttqMOEPETAFs11b0cMgAhfo8zQ5T1dROy5LQLJohMjR7RZU3SsUBij_1BJ4ss1OnWnzZjBXTkLWsquYfHQXXSSowKrWfB6aBZwfTiCbScyOwoN1ScQfopoteiHm-dEHPWH6uQhDOG0Qps0UhYCXMg-dX79ruyV9i-YKXbWuCx"
              />
            </div>
          </div>
        </div>
        <div className="bg-zinc-100/50 h-[1px] w-full"></div>
      </nav>

      <main className="pt-24 pb-20 px-6 max-w-screen-2xl mx-auto">
        {/* Greeting Section */}
        <header className="mb-12">
          <h1 className="text-3xl font-extrabold font-headline tracking-tight text-zinc-900">Good Evening, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-zinc-500 font-medium mt-1">Your AI-monitored health hub is up to date.</p>
        </header>

        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold tracking-widest uppercase font-label">
                <span className="material-symbols-outlined text-sm">bolt</span> Ultra Fast Clinical Delivery
              </span>
              <h2 className="text-5xl lg:text-6xl font-black font-headline leading-[1.1] text-zinc-900">
                24/7 Medicine <br /> Delivery in <span className="text-primary italic">Minutes</span>
              </h2>
              <p className="text-lg text-zinc-500 max-w-md font-body leading-relaxed">
                Access life-saving prescriptions and wellness essentials with MediFlow's predictive inventory tracking.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to="/upload-prescription" className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-bold shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                <span className="material-symbols-outlined">upload_file</span> Upload Prescription
              </Link>
              <Link to="/categories" className="px-8 py-4 bg-surface-container-high text-on-surface rounded-full font-bold hover:bg-surface-container-highest transition-all active:scale-95">
                Browse Medicines
              </Link>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl shadow-zinc-200/50 border border-zinc-100">
              <img
                alt="Delivery illustration"
                className="w-full h-[400px] object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrKwKcXq93bEhIE1eA87-dxEiPHMrri6j_Pfv9ZBnfQKzNrRbyIQ_k3BTUdauiHgnSDCXDb1wN82YJJjjiIyzfT0yxgUiTpGcooG5mgj33b5TYIo8JeBRkcG_0Sv7b9O-_mxImrLeldFiLcprWl8OVx93MHbMJNMSL79mzNzyI-6BRP65FV-oFa-hXbcMcOE5ghVSeZc3u73jcqGg_UOZwDia_uMX-qQntMNNLY5bCpMZOuns8aNRrq9u4JlHxu-eHgKTX77MfNK0h"
              />
              <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur rounded-2xl shadow-xl flex items-center gap-3 border border-white">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">verified</span>
                </div>
                <span className="text-sm font-bold text-zinc-900 font-headline">Verified Medicines</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Bento Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { icon: 'prescriptions', title: 'Upload Prescription', desc: 'Get AI verification in seconds', color: 'primary', to: '/upload-prescription' },
            { icon: 'e911_emergency', title: 'Emergency Order', desc: 'Priority 10-min dispatch', color: 'error', to: '/categories' },
            { icon: 'history', title: 'Reorder Medicines', desc: 'Based on previous history', color: 'secondary', to: '/orders' },
            { icon: 'near_me', title: 'Find Nearby Pharmacies', desc: 'View stock in real-time', color: 'zinc-900', to: '/categories' }
          ].map((action, idx) => (
            <Link key={idx} to={action.to} className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group border border-zinc-50 block">
              <div className={`w-12 h-12 flex items-center justify-center mb-4 rounded-2xl transition-colors active:scale-95
                ${action.color === 'primary' ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' :
                  action.color === 'error' ? 'bg-error-container text-error group-hover:bg-error group-hover:text-white' :
                    action.color === 'secondary' ? 'bg-secondary-container text-secondary group-hover:bg-secondary group-hover:text-white' :
                      'bg-surface-container-high text-on-surface-variant group-hover:bg-zinc-900 group-hover:text-white'}`}>
                <span className="material-symbols-outlined">{action.icon}</span>
              </div>
              <h3 className="font-bold text-zinc-900 font-headline">{action.title}</h3>
              <p className="text-xs text-zinc-400 mt-1">{action.desc}</p>
            </Link>
          ))}
        </section>

        <div className="flex flex-col lg:flex-row gap-8 items-start mb-16">
          {/* Filter Sidebar */}
          <aside className="w-full lg:w-72 lg:sticky lg:top-24 space-y-10">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-400 font-label mb-6">Categories</h4>
              <ul className="space-y-2">
                <li><Link className="flex items-center justify-between p-3 rounded-xl bg-white text-primary font-bold shadow-sm border border-zinc-50" to="/categories">Cardiology <span className="material-symbols-outlined text-sm">chevron_right</span></Link></li>
                {['Dermatology', 'Pediatrics', 'Diabetic Care'].map((cat) => (
                  <li key={cat}><Link className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-600" to="/categories">{cat} <span className="material-symbols-outlined text-sm">chevron_right</span></Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-400 font-label mb-6">Price Range</h4>
              <input className="w-full accent-primary h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer" type="range" />
              <div className="flex justify-between text-xs font-bold text-zinc-500 mt-2">
                <span>$0</span>
                <span>$500+</span>
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <div className="flex-1 space-y-16">
            {/* Health Alerts */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black font-headline text-zinc-900">Health Alerts in Your Area</h2>
                <Link className="text-primary text-sm font-bold flex items-center gap-1 hover:underline" to="/categories">View Local Map <span className="material-symbols-outlined text-sm">map</span></Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'Dengue Alert', sub: 'High risk in Sector 42', icon: 'warning', border: 'border-error', iconColor: 'text-error', tags: ['Mosquito Nets', 'Odomos'] },
                  { title: 'Flu Season', sub: 'Moderate activity detected', icon: 'thermometer', border: 'border-amber-400', iconColor: 'text-amber-500', tags: ['Sanitizer', 'N95 Masks'] },
                  { title: 'Allergy Warning', sub: 'High pollen count today', icon: 'eco', border: 'border-primary', iconColor: 'text-primary', tags: ['Cetirizine', 'Eye Drops'] }
                ].map((alert, idx) => (
                  <div key={idx} className={`insight-glow p-6 rounded-3xl border-l-4 ${alert.border} shadow-sm border border-zinc-50`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-zinc-900 font-headline">{alert.title}</h3>
                        <p className="text-xs text-zinc-500 mt-1">{alert.sub}</p>
                      </div>
                      <span className={`material-symbols-outlined ${alert.iconColor}`}>{alert.icon}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {alert.tags.map(tag => (
                        <button key={tag} className="px-3 py-1.5 bg-white shadow-sm border border-zinc-100 rounded-full text-[10px] font-bold text-zinc-600 hover:border-primary transition-colors">{tag}</button>
                      ))}
                    </div>
                    <button className="w-full mt-6 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-primary transition-colors active:scale-95">Add Essentials to Cart</button>
                  </div>
                ))}
              </div>
            </section>

            {/* Medicine Grid */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black font-headline text-zinc-900">Recommended Medicines</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {loadingMeds ? (
                  <p className="text-zinc-500 font-bold col-span-full">Loading recommendations via AI...</p>
                ) : (
                  medicines.map((med, idx) => (
                    <div key={idx} className="group bg-surface-container-lowest rounded-3xl p-5 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col border border-zinc-50">
                      <div className="relative h-48 rounded-2xl overflow-hidden mb-5">
                        <img alt={med.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={med.img} />
                        {med.demand && (
                          <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-[10px] font-bold text-primary flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">bolt</span> Predicted Demand High
                          </div>
                        )}
                        {med.rx && (
                          <div className="absolute top-3 right-3 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">RX Required</div>
                        )}
                        {med.lowStock && (
                          <div className="absolute bottom-3 right-3 px-2 py-1 bg-error/10 text-error rounded-lg text-[10px] font-bold">Low Stock</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-label">{med.brand}</span>
                        <h3 className="text-lg font-bold text-zinc-900 font-headline mb-1 group-hover:text-primary transition-colors">{med.name}</h3>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-50">
                          <div className="flex flex-col">
                            {med.oldPrice && <span className="text-xs text-zinc-400 line-through">{med.oldPrice}</span>}
                            <span className="text-xl font-black text-zinc-900">{med.price}</span>
                          </div>
                          <button
                            onClick={() => handleAddToCart(med.id)}
                            className="w-12 h-12 bg-zinc-900 text-white rounded-full flex items-center justify-center hover:bg-primary transition-colors group-hover:scale-110 active:scale-90"
                          >
                            <span className="material-symbols-outlined">add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )))}
              </div>
            </section>

            {/* Order Tracker */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="bg-zinc-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div>
                    <h2 className="text-xl font-bold font-headline">Live Track Order</h2>
                    <p className="text-xs text-zinc-400">Order ID: #MP-29104-X</p>
                  </div>
                  <span className="px-3 py-1 bg-primary text-[10px] font-black rounded-full uppercase tracking-tighter">Out for Delivery</span>
                </div>
                <div className="relative z-10 space-y-8">
                  {[
                    { title: 'Order Placed', time: 'Today, 4:30 PM', done: true },
                    { title: 'Confirmed & Packed', time: 'Today, 4:45 PM', done: true },
                    { title: 'Out for Delivery', time: 'Estimated: 12 mins away', active: true },
                    { title: 'Delivered', time: 'Arriving soon', future: true }
                  ].map((step, idx) => (
                    <div key={idx} className={`flex gap-4 ${step.future ? 'opacity-40' : ''}`}>
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg 
                          ${step.done ? 'bg-primary shadow-primary/20' : step.active ? 'bg-primary-fixed text-on-primary-fixed shadow-primary-fixed/30 w-10 h-10 -ml-1' : 'bg-zinc-700'}`}>
                          <span className="material-symbols-outlined text-sm">{step.done ? 'check' : step.active ? 'delivery_dining' : 'flag'}</span>
                        </div>
                        {idx !== 3 && <div className={`w-0.5 h-10 ${step.done ? 'bg-primary' : 'bg-zinc-700 border-dashed border-l border-zinc-600'}`}></div>}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${step.active ? 'text-primary-fixed' : ''}`}>{step.title}</h4>
                        <p className={`text-[10px] ${step.active ? 'text-zinc-300 font-medium' : 'text-zinc-400'}`}>{step.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-10 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95">
                  <span className="material-symbols-outlined text-sm">call</span> Contact Delivery Partner
                </button>
              </div>

              {/* History */}
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-100">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold font-headline text-zinc-900">Recent History</h2>
                  <button className="text-xs font-bold text-primary">See All</button>
                </div>
                <div className="space-y-6">
                  {['pill', 'medical_information', 'masks'].map((icon, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center group-hover:bg-primary-container/10 transition-colors">
                          <span className="material-symbols-outlined text-zinc-400 group-hover:text-primary">{icon}</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-zinc-900">Health Kit #{i + 1}</h4>
                          <p className="text-[10px] text-zinc-400">12 Aug 2024 • 3 Items</p>
                        </div>
                      </div>
                      <Link to="/orders" className="mt-auto px-4 py-2 bg-on-secondary-container text-secondary-container rounded-lg text-xs font-bold hover:scale-105 transition-transform active:scale-95 self-start">
                        Track Order
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Floating Action Menu */}
      <div
        className={`fixed bottom-24 lg:bottom-10 right-10 z-[70] flex flex-col items-center gap-4 transition-all duration-300`}
        style={{ transform: isContactMenuOpen || isChatbotModalOpen ? 'translateY(0)' : 'translateY(0)' }}
      >
        <div className={`flex flex-col items-center gap-4 transition-all duration-300 ${isContactMenuOpen ? 'opacity-100 scale-100 pointer-events-auto translate-y-0' : 'opacity-0 scale-50 pointer-events-none translate-y-10'}`}>
          <a href="#" className="w-12 h-12 lg:w-14 lg:h-14 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
            <img alt="WhatsApp" className="w-6 h-6 lg:w-7 lg:h-7" src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" />
          </a>
          <button onClick={toggleChatbotModal} className="w-12 h-12 lg:w-14 lg:h-14 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-2xl lg:text-3xl">forum</span>
          </button>
        </div>
        <button
          onClick={toggleContactMenu}
          className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary to-primary-container text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all relative z-10"
        >
          <span className={`material-symbols-outlined text-2xl lg:text-3xl transition-transform duration-300 ${isContactMenuOpen ? 'rotate-90' : 'rotate-0'}`}>
            {isContactMenuOpen ? 'close' : 'chat'}
          </span>
        </button>
      </div>

      {/* Chatbot Modal */}
      {isChatbotModalOpen && (
        <div className="fixed bottom-24 lg:bottom-10 right-10 z-[80] animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="w-80 bg-white rounded-[2rem] shadow-2xl border border-zinc-100 overflow-hidden flex flex-col">
            <div className="bg-zinc-900 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-bold">MediFlow Assistant</span>
              </div>
              <button onClick={() => setIsChatbotModalOpen(false)} className="text-zinc-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="p-4 h-64 overflow-y-auto space-y-4 text-xs font-medium">
              <div className="bg-zinc-100 p-3 rounded-2xl rounded-tl-none self-start mr-8 text-zinc-600">
                Hello Vanshika! How can I assist you with your health logistics today?
              </div>
              <div className="bg-primary-container text-white p-3 rounded-2xl rounded-tr-none self-end ml-8 shadow-sm">
                I need to check my order status.
              </div>
            </div>
            <div className="p-4 border-t border-zinc-50 flex gap-2">
              <input className="flex-1 bg-zinc-50 border-none rounded-xl py-2 px-3 text-xs outline-none focus:ring-1 focus:ring-primary/20" placeholder="Type here..." type="text" />
              <button className="w-8 h-8 bg-zinc-900 text-white rounded-xl flex items-center justify-center active:scale-90 transition-transform">
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-zinc-950 pt-20 pb-12 px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">medical_services</span>
              </div>
              <span className="text-xl font-bold tracking-tighter text-white font-headline">MediFlow AI</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Pioneering clinical excellence through predictive intelligence and fluid distribution networks.
            </p>
          </div>
          <div className="space-y-6">
            <h5 className="text-white font-bold font-headline">Platform</h5>
            <ul className="space-y-4 text-zinc-500 text-sm">
              <li><Link className="hover:text-primary transition-colors" to="/categories">Categories</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/orders">Order History</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/orders">Track Delivery</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="text-white font-bold font-headline">Medical Hub</h5>
            <ul className="space-y-4 text-zinc-500 text-sm">
              <li><a className="hover:text-primary transition-colors" href="#">Consult Doctor</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Health Alerts</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="text-white font-bold font-headline">Download</h5>
            <div className="flex flex-col gap-3">
              <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 flex items-center gap-4 cursor-pointer hover:border-zinc-700 transition-colors">
                <span className="material-symbols-outlined text-zinc-400 text-2xl">phone_iphone</span>
                <span className="text-xs font-bold text-white">App Store</span>
              </div>
              <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 flex items-center gap-4 cursor-pointer hover:border-zinc-700 transition-colors">
                <span className="material-symbols-outlined text-zinc-400 text-2xl">ad_units</span>
                <span className="text-xs font-bold text-white">Google Play</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">© 2024 MediFlow AI. Clinical Excellence.</p>
        </div>
      </footer>
      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 w-full z-50 rounded-t-3xl glass-nav border-t border-zinc-200 shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center px-4 pt-3 pb-8 w-full">
          <Link to="/dashboard-patient" className="flex flex-col items-center justify-center text-green-600 scale-110 font-manrope text-[10px] font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            Home
          </Link>
          <Link to="/categories" className="flex flex-col items-center justify-center text-zinc-400 font-manrope text-[10px] font-bold uppercase tracking-widest active:scale-90 transition-transform">
            <span className="material-symbols-outlined mb-1">grid_view</span>
            Categories
          </Link>
          <Link to="/orders" className="flex flex-col items-center justify-center text-zinc-400 font-manrope text-[10px] font-bold uppercase tracking-widest active:scale-90 transition-transform">
            <span className="material-symbols-outlined mb-1">receipt_long</span>
            Orders
          </Link>
          <a className="flex flex-col items-center justify-center text-zinc-400 font-manrope text-[10px] font-bold uppercase tracking-widest active:scale-90 transition-transform" href="#">
            <span className="material-symbols-outlined mb-1">contact_support</span>
            Help
          </a>
        </div>
      </nav>

      {/* Custom Toast */}
      {toast.show && (
        <div className={`fixed bottom-32 lg:bottom-10 right-1/2 translate-x-1/2 lg:translate-x-0 lg:right-10 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10 ${toast.type === 'success' ? 'bg-zinc-900 text-white' : 'bg-error text-white'}`}>
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="font-bold text-sm tracking-wide">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default DashboardPatient;
