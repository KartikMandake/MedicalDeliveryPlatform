import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Categories() {
  const [isInStockOnly, setIsInStockOnly] = useState(true);

  const categories = [
    { name: 'Pain Relief', count: 42 },
    { name: 'Diabetes', count: 28, checked: true },
    { name: 'Vitamins', count: 64 },
    { name: 'Heart Care', count: 19 }
  ];

  const brands = ['Cipla', 'Sun Pharma', "Dr. Reddy's"];

  const medicines = [
    {
      id: 1,
      name: 'Metformin Glycomet 500',
      brand: 'Cipla',
      price: 12.50,
      description: 'Advanced blood glucose management for type-2 diabetes mellitus treatment.',
      rating: 4.8,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCieq6V03g0uRJ1Zl64yIbqVN_GjEqNzNB4UOwrtGMpT8se5VllvfElIbByrFgHqZTL5uvH4ryf2ZpWKL7L1q3wg0ibS5VenXvESPI3ASI4_KqHUuvpt3RAPiOmWAF0FFITrCShyj-xjFdhwruYNiFMb5e9Fu6zjgqo_5SiERtQ2ty8Oen-RFWjlqD9cA7NVJ69YmHSnDwoo8SdWTyjjC_nssC8lfTT3mCFUCHuTHeFngGATnwYgyrBwzd-jkhxPT3ufP3DsbLrWt7c',
      rxRequired: true
    },
    {
      id: 2,
      name: 'Rosuvastatin Rosuvas 10',
      brand: 'Sun Pharma',
      price: 24.90,
      description: 'Lipid-lowering agent for the management of cardiovascular health.',
      rating: 4.2,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgk64aDbBS40t_uqZ1-8wV2ess8cdPIxfNzfL_0KTNZUJVhMQHzK9bt7KW3OABb0WBf5fqiqHdKvVmSIeLjQePkXmUKtJ_XqfQbUnCdKk9bFJycNnMIV9rlSIY0Yf1pezClZuNE6H2hXi8SV_ht13QMZSzNxgyu_R4q5Fo9JwpKsT5b88cmjvcMYH5HHQ7imUQ3HDYSR6BD5cjaRs3hIk1ftPsIeuSh6GryMpYge1WjRngqPXwKwRU3JxuGtam8ZwXDg60vjvPAA6s',
      outOfStock: true
    },
    {
      id: 3,
      name: 'Becosules Plus Capsules',
      brand: "Dr. Reddy's",
      price: 18.25,
      description: 'Essential Vitamin B-complex with minerals for daily nutritional support.',
      rating: 4.9,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcK68LEjsbCpb3-8Dcg3W_w9azgkEzDKmM8H2bMdFZqbHkahwyd83ibVK4YQ3nOyrNR3TQry5gE8UadQAFs-2eYUKfdecOJfPTAuSxLFTjvsktsxuzkd80vSXGAIeXzi705Pys6jhaTDqSAFuniOoc_R-DWOy0AOcEeRpN0nRe48mMXjpy3VVOZmJPf_TnHGG59FxCayVIT2sIB0_6B8dkfpJKaBVJz9EPTb5DkaXDgji_LFSJlrfawf05A5FcRsU0XFtilRvIHau3'
    },
    {
      id: 4,
      name: 'Dolo 650 Tablets',
      brand: 'Cipla',
      price: 8.00,
      description: 'Effective relief from fever and mild-to-moderate physical pain.',
      rating: 4.5,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbpvKRyFH3Cg_QKVfR3cELyaoUWN5nRmBxjbnrMHcmbZnSRll6LL-b7aQA0s3tWhAxVyS6CJUSWI9TeRtOiQUp4n82LUm6vd7WLjCA8C8Y1xDpBktX_E9rt8KVCh5Y0-5hU4nLoapBCYBSi6A67XA2LxOIa6v8dte1clZ9DR5Io8DluDbUmt-w4cdDYSBKumPEeuS1KgNAeJ6wY86w-8x1F9_42gHhwyM_RsYrCW0iPAblTmBRb0KIrg6yEGAeNCw9Zh4yh0BkgAtp'
    },
    {
      id: 5,
      name: 'Insulin Glargine Pen',
      brand: 'Sun Pharma',
      price: 89.00,
      description: 'Long-acting insulin analogue for glycemic control in adults.',
      rating: 4.9,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOHmhATXaaEl6P9Vlo3yLO4Pu-hIMP_ceQeKUqt5UPSSaeLhXdW8thn0OBfMr3TgH1LvMDpp9ekhdaLIp6Gbe6qPlqF3Cqfn3pn-fkLkE_sZmWlEK57jpo13Zbgxpkd8b5-FGFQxdM1KCApZnMTmH_gyotj1VDQqaIuRha_qKmJBA4xorf1b2q6RUnnOZZG6I3XW5Q9EJvGrPAlV2kfSxaSQfpN6RDT_8vqzKjBYk587rdMaopkDOMsKBnNZ-TsAvvvQncl1ooOWSa',
      rxRequired: true
    }
  ];

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 glass-nav shadow-sm dark:shadow-none">
        <div className="flex justify-between items-center w-full px-6 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <Link to="/dashboard-patient" className="text-xl font-bold tracking-tighter text-zinc-900 font-headline">MediFlow</Link>
            <nav className="hidden md:flex items-center gap-6 font-headline text-sm font-medium tracking-tight">
              <Link to="/dashboard-patient" className="text-zinc-500 hover:text-zinc-900 transition-all duration-200 px-2 py-1">Home</Link>
              <Link to="/categories" className="text-green-700 font-bold border-b-2 border-green-600 px-2 py-1">Categories</Link>
              <Link to="/orders" className="text-zinc-500 hover:text-zinc-900 transition-all duration-200 px-2 py-1">Orders</Link>
              <a className="text-zinc-500 hover:text-zinc-900 transition-all duration-200 px-2 py-1" href="#">Help</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">search</span>
              <input
                className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 w-64 transition-all"
                placeholder="Search medications..."
                type="text"
              />
            </div>
            <div className="flex items-center gap-2">
              <Link to="/cart" className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-all active:scale-95">
                <span className="material-symbols-outlined">shopping_cart</span>
              </Link>
              <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-all active:scale-95">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div className="h-8 w-8 rounded-full bg-zinc-200 overflow-hidden ml-2">
                <img
                  className="w-full h-full object-cover"
                  alt="User profile"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcPRM7lRc4AwTFNkRzknncLOfdfmxmUeDeoI6J9i7sSoD8q9mk6oH-nANra88NmRp5D3Lck7qODxNBKU5xsG6_I97FC-Kd_IJTuwsL4Z704fOvzsf76gfYZVkjyPLkmqhDl8ryPwwx9PsTNlXgusl7c5JZJoW6rHZUxDhFH8O6COL9zUPDd5bHuNh2xUn2Udc8yV0mp3si3ddVywSMfPoEGydAajIdbix5t8lI-dfQ9n-sCvYVn0X72gT-fFkkcInwFd24HeC5d4eC"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="bg-zinc-100/50 h-[1px]"></div>
      </header>

      <main className="pt-24 pb-20 px-6 max-w-screen-2xl mx-auto flex gap-10">
        {/* Sticky Sidebar Filters */}
        <aside className="hidden lg:block w-72 h-[calc(100vh-120px)] sticky top-24 overflow-y-auto custom-scrollbar pr-4">
          <div className="space-y-10">
            <div>
              <h2 className="font-headline font-black text-green-700 text-lg mb-2">Clinical Portal</h2>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">AI-Powered Inventory</p>
            </div>

            {/* Categories */}
            <section>
              <h3 className="font-headline font-bold text-sm text-on-surface mb-4">Categories</h3>
              <div className="space-y-3">
                {categories.map((cat, idx) => (
                  <label key={idx} className="flex items-center gap-3 group cursor-pointer">
                    <input
                      className="rounded border-outline-variant text-primary focus:ring-primary w-5 h-5"
                      type="checkbox"
                      defaultChecked={cat.checked}
                    />
                    <span className="text-sm text-zinc-600 group-hover:text-primary transition-colors">{cat.name}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Price Range */}
            <section>
              <h3 className="font-headline font-bold text-sm text-on-surface mb-4">Price Range</h3>
              <input className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary" type="range" />
              <div className="flex justify-between mt-2 text-xs font-medium text-zinc-400">
                <span>$0</span>
                <span>$500+</span>
              </div>
            </section>

            {/* Brands */}
            <section>
              <h3 className="font-headline font-bold text-sm text-on-surface mb-4">Brand Filter</h3>
              <div className="space-y-3">
                {brands.map((brand, idx) => (
                  <label key={idx} className="flex items-center gap-3 group cursor-pointer">
                    <input className="rounded border-outline-variant text-primary focus:ring-primary w-5 h-5" type="checkbox" />
                    <span className="text-sm text-zinc-600 group-hover:text-primary transition-colors">{brand}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Availability */}
            <section className="p-4 rounded-xl bg-surface-container-low">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-on-surface">In Stock only</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isInStockOnly}
                    onChange={() => setIsInStockOnly(!isInStockOnly)}
                  />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </section>

            <Link to="/upload-prescription" className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center">
              Upload Prescription
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Results Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-headline font-extrabold text-on-surface tracking-tight">Pharmaceutical Inventory</h1>
              <p className="text-sm text-zinc-500 mt-1">Showing 1–20 of 240 results</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sort By:</span>
              <select className="bg-surface-container-lowest border-none text-sm font-semibold text-on-surface rounded-xl shadow-sm focus:ring-primary/20 pr-10">
                <option>Most Popular</option>
                <option>Price Low to High</option>
                <option>Price High to Low</option>
              </select>
            </div>
          </div>

          {/* Medicine Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {medicines.map((med) => (
              <div key={med.id} className={`group bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 flex flex-col border border-outline-variant/10 ${med.outOfStock ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                <div className="relative h-48 overflow-hidden bg-zinc-50 p-6 flex items-center justify-center">
                  <img
                    className={`max-h-full object-contain ${!med.outOfStock ? 'group-hover:scale-110 transition-transform duration-500' : ''}`}
                    src={med.image}
                    alt={med.name}
                  />
                  {med.rxRequired && (
                    <span className="absolute top-4 left-4 px-2 py-1 bg-white/90 backdrop-blur-md rounded-md text-[10px] font-bold text-error uppercase tracking-wider border border-error/10">RX Required</span>
                  )}
                  {med.outOfStock && (
                    <span className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="px-3 py-1 bg-zinc-900 text-white text-[10px] font-bold rounded-full uppercase tracking-widest">Out of Stock</span>
                    </span>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${med.outOfStock ? 'text-zinc-400' : 'text-primary'}`}>{med.brand}</span>
                    <div className={`flex items-center gap-0.5 ${med.outOfStock ? 'text-zinc-400' : 'text-amber-500'}`}>
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className={`text-xs font-bold ${med.outOfStock ? '' : 'text-on-surface'}`}>{med.rating}</span>
                    </div>
                  </div>
                  <h3 className={`font-headline font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors ${med.outOfStock ? 'text-zinc-400' : 'text-on-surface'}`}>{med.name}</h3>
                  <p className={`text-sm line-clamp-2 mb-4 ${med.outOfStock ? 'text-zinc-400' : 'text-zinc-500'}`}>{med.description}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-400 font-medium block">Price</span>
                      <span className={`text-xl font-headline font-extrabold ${med.outOfStock ? 'text-zinc-300' : 'text-on-surface'}`}>${med.price.toFixed(2)}</span>
                    </div>
                    {med.outOfStock ? (
                      <button className="h-12 w-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-300 cursor-not-allowed" disabled>
                        <span className="material-symbols-outlined">block</span>
                      </button>
                    ) : (
                      <button className="h-12 w-12 bg-surface-container-high rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all active:scale-90">
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* AI Insights Card */}
            <div className="group insight-glow rounded-xl overflow-hidden flex flex-col p-8 border border-primary/20 relative">
              <div className="relative z-10 h-full flex flex-col">
                <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <h3 className="font-headline font-extrabold text-xl text-primary leading-tight mb-4">AI Recommended for Heart Care</h3>
                <p className="text-sm text-zinc-600 mb-8 leading-relaxed">Based on your recent heart care purchases, our intelligence suggests reviewing Vitamin D3 supplements for synergistic benefits.</p>
                <button className="mt-auto px-6 py-3 bg-white border border-primary/20 rounded-full text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all uppercase tracking-widest self-start">
                  View Bundle
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
            </div>
          </div>

          {/* Load More */}
          <div className="mt-16 flex justify-center">
            <button className="flex items-center gap-2 px-10 py-4 bg-white border border-zinc-200 rounded-full text-sm font-bold text-on-surface hover:bg-zinc-50 hover:border-primary/30 transition-all active:scale-95 group">
              <span>Load More Products</span>
              <span className="material-symbols-outlined text-zinc-400 group-hover:text-primary transition-colors">expand_more</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="w-full py-12 px-8 border-t border-zinc-100 bg-zinc-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <div className="space-y-4">
            <span className="font-headline font-bold text-zinc-900 text-lg">MediFlow AI</span>
            <p className="font-inter text-xs text-zinc-500 leading-relaxed">
              Clinical Excellence & Fluid Intelligence. Empowering patient health through advanced pharmaceutical logistics.
            </p>
            <div className="pt-2">
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mb-4">Certified Hubs</p>
              <div className="flex gap-4 grayscale opacity-50">
                <span className="material-symbols-outlined">health_metrics</span>
                <span className="material-symbols-outlined">verified_user</span>
                <span className="material-symbols-outlined">science</span>
              </div>
            </div>
          </div>
          <div>
            <h4 class="font-headline font-bold text-xs text-zinc-900 uppercase tracking-widest mb-6">Resources</h4>
            <ul class="space-y-4 font-inter text-xs text-zinc-500">
              <li><a class="hover:text-green-600 transition-colors" href="#">API Documentation</a></li>
              <li><a class="hover:text-green-600 transition-colors" href="#">Medical Whitepapers</a></li>
              <li><a class="hover:text-green-600 transition-colors" href="#">Inventory Tracker</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-headline font-bold text-xs text-zinc-900 uppercase tracking-widest mb-6">Legal</h4>
            <ul class="space-y-4 font-inter text-xs text-zinc-500">
              <li><a class="hover:text-green-600 transition-colors" href="#">Privacy Policy</a></li>
              <li><a class="hover:text-green-600 transition-colors" href="#">Terms of Service</a></li>
              <li><a class="hover:text-green-600 transition-colors" href="#">Return Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-headline font-bold text-xs text-zinc-900 uppercase tracking-widest mb-6">Contact</h4>
            <ul class="space-y-4 font-inter text-xs text-zinc-500">
              <li class="flex items-center gap-2"><span class="material-symbols-outlined text-sm">mail</span> contact@mediflow.ai</li>
              <li class="flex items-center gap-2"><span class="material-symbols-outlined text-sm">support_agent</span> Contact Medical Hub</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-zinc-200/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-inter text-[10px] text-zinc-400 uppercase tracking-widest font-bold">© 2024 MediFlow AI. Clinical Excellence & Fluid Intelligence.</p>
          <div className="flex gap-6">
            <a className="text-zinc-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">public</span></a>
            <a className="text-zinc-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">hub</span></a>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 w-full z-50 rounded-t-3xl glass-nav border-t border-zinc-200 shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center px-4 pt-3 pb-8 w-full">
          <Link to="/dashboard-patient" className="flex flex-col items-center justify-center text-zinc-400 font-manrope text-[10px] font-bold uppercase tracking-widest active:scale-90 transition-transform">
            <span className="material-symbols-outlined mb-1">home</span>
            Home
          </Link>
          <Link to="/categories" className="flex flex-col items-center justify-center text-green-600 scale-110 font-manrope text-[10px] font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
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
    </div>
  );
}

export default Categories;
