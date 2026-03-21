import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Categories() {
  const [medicines, setMedicines] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [maxPrice, setMaxPrice] = useState(500);
  const [sortBy, setSortBy] = useState('rating');
  const [isInStockOnly, setIsInStockOnly] = useState(true);

  const [filtersData, setFiltersData] = useState({ brands: [], categories: [] });
  const [brandSearchTerm, setBrandSearchTerm] = useState('');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  React.useEffect(() => {
    const fetchFilters = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/medicines/filters', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setFiltersData(await res.json());
      } catch (err) { console.error(err); }
    };
    fetchFilters();
  }, []);

  React.useEffect(() => {
    const fetchMeds = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams({ page, limit: 12, maxPrice });
        if (selectedCategories.length > 0) queryParams.append('category', selectedCategories.join(','));
        if (selectedBrands.length > 0) queryParams.append('brand', selectedBrands.join(','));
        if (isInStockOnly) queryParams.append('inStock', 'true');
        if (globalSearch.trim() !== '') queryParams.append('search', globalSearch.trim());
        queryParams.append('sort', sortBy);

        const res = await fetch(`http://localhost:5000/api/medicines?${queryParams.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setMedicines(page === 1 ? data : [...medicines, ...data]);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchMeds();
  }, [page, selectedCategories, selectedBrands, maxPrice, isInStockOnly, sortBy, globalSearch]);

  const handleCategoryToggle = (cat) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    setPage(1); setMedicines([]);
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
    setPage(1); setMedicines([]);
  };

  const handlePriceChange = (e) => {
    setMaxPrice(Number(e.target.value));
    setPage(1); setMedicines([]);
  };

  const handleStockToggle = () => {
    setIsInStockOnly(!isInStockOnly);
    setPage(1); setMedicines([]);
  };

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
                value={globalSearch}
                onChange={(e) => { setGlobalSearch(e.target.value); setPage(1); setMedicines([]); }}
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

            {/* Availability */}
            <section className="mb-8 p-4 rounded-xl bg-surface-container-low">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-on-surface">In Stock only</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isInStockOnly}
                    onChange={handleStockToggle}
                  />
                  <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </section>

            {/* Categories */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline font-bold text-sm text-on-surface">Categories</h3>
                <span className="text-xs font-bold text-zinc-400">{filtersData.categories.length}</span>
              </div>
              <div className="relative mb-4 group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">search</span>
                <input
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Search category"
                  type="text"
                  value={categorySearchTerm}
                  onChange={(e) => setCategorySearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {filtersData.categories.filter(c => c.name && c.name.toLowerCase().includes(categorySearchTerm.toLowerCase())).map((cat, idx) => (
                  <label key={idx} className="flex items-center gap-3 group cursor-pointer">
                    <input
                      className="rounded border-outline-variant text-primary focus:ring-primary w-5 h-5 flex-shrink-0 cursor-pointer"
                      type="checkbox"
                      checked={selectedCategories.includes(cat.name)}
                      onChange={() => handleCategoryToggle(cat.name)}
                    />
                    <span className="material-symbols-outlined text-primary text-[20px]">{cat.icon_url || 'medical_services'}</span>
                    <span className="text-sm font-medium text-zinc-600 group-hover:text-primary transition-colors flex-1 truncate">{cat.name} <span className="text-zinc-400">({cat.count})</span></span>
                  </label>
                ))}
              </div>
            </section>

            {/* Price Range */}
            <section className="mb-8">
              <h3 className="font-headline font-bold text-sm text-on-surface mb-4">Price Range: ${maxPrice}</h3>
              <input 
                className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary" 
                type="range" 
                min="0" 
                max="500" 
                step="10"
                value={maxPrice}
                onChange={handlePriceChange}
              />
              <div className="flex justify-between mt-2 text-xs font-medium text-zinc-400">
                <span>$0</span>
                <span>$500+</span>
              </div>
            </section>

            {/* Brands */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline font-bold text-sm text-on-surface">Brand Filter</h3>
                <span className="text-xs font-bold text-zinc-400">{filtersData.brands.length}</span>
              </div>
              <div className="relative mb-4 group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">search</span>
                <input
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Search brand"
                  type="text"
                  value={brandSearchTerm}
                  onChange={(e) => setBrandSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {filtersData.brands.filter(b => b.brand && b.brand.toLowerCase().includes(brandSearchTerm.toLowerCase())).map((brand, idx) => (
                  <label key={idx} className="flex items-center gap-3 group cursor-pointer">
                    <input 
                      className="rounded border-outline-variant text-primary focus:ring-primary w-5 h-5 flex-shrink-0 cursor-pointer" 
                      type="checkbox" 
                      checked={selectedBrands.includes(brand.brand)}
                      onChange={() => handleBrandToggle(brand.brand)}
                    />
                    <span className="text-sm font-medium text-zinc-600 group-hover:text-primary transition-colors flex-1 truncate">{brand.brand} <span className="text-zinc-400">({brand.count})</span></span>
                  </label>
                ))}
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
            {loading && medicines.length === 0 ? (
              <div className="col-span-1 sm:col-span-2 xl:col-span-3 2xl:col-span-4 flex flex-col items-center justify-center py-20">
                <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-4" style={{ animationDuration: '2s' }}>progress_activity</span>
                <p className="font-headline font-bold text-zinc-500">Loading medications...</p>
              </div>
            ) : medicines.length === 0 ? (
              <div className="col-span-1 sm:col-span-2 xl:col-span-3 2xl:col-span-4 flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/50">
                <span className="material-symbols-outlined text-4xl text-zinc-300 mb-4">search_off</span>
                <p className="font-headline font-bold text-zinc-500">No medications found matching your criteria</p>
              </div>
            ) : (
              medicines.map((med) => (
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
            ))
          )}

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
            <button 
              className="flex items-center gap-2 px-10 py-4 bg-white border border-zinc-200 rounded-full text-sm font-bold text-on-surface hover:bg-zinc-50 hover:border-primary/30 transition-all active:scale-95 group disabled:opacity-50"
              onClick={() => setPage(page + 1)}
              disabled={loading}
            >
              {loading ? (
                <span className="material-symbols-outlined text-zinc-400 animate-spin">progress_activity</span>
              ) : (
                <>
                  <span>Load More Products</span>
                  <span className="material-symbols-outlined text-zinc-400 group-hover:text-primary transition-colors">expand_more</span>
                </>
              )}
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
            <h4 className="font-headline font-bold text-xs text-zinc-900 uppercase tracking-widest mb-6">Resources</h4>
            <ul className="space-y-4 font-inter text-xs text-zinc-500">
              <li><a className="hover:text-green-600 transition-colors" href="#">API Documentation</a></li>
              <li><a className="hover:text-green-600 transition-colors" href="#">Medical Whitepapers</a></li>
              <li><a className="hover:text-green-600 transition-colors" href="#">Inventory Tracker</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-bold text-xs text-zinc-900 uppercase tracking-widest mb-6">Legal</h4>
            <ul className="space-y-4 font-inter text-xs text-zinc-500">
              <li><a className="hover:text-green-600 transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-green-600 transition-colors" href="#">Terms of Service</a></li>
              <li><a className="hover:text-green-600 transition-colors" href="#">Return Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-bold text-xs text-zinc-900 uppercase tracking-widest mb-6">Contact</h4>
            <ul className="space-y-4 font-inter text-xs text-zinc-500">
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">mail</span> contact@mediflow.ai</li>
              <li className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">support_agent</span> Contact Medical Hub</li>
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
