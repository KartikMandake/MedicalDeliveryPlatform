import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import RetailerSidebar from '../components/retailer/RetailerSidebar';
import RetailerTopNav from '../components/retailer/RetailerTopNav';
import RetailerFooter from '../components/retailer/RetailerFooter';
import { searchMedicines, getCategories, addToInventory, updateInventoryItem, getInventory, deleteInventoryItem, getPredictions } from '../api/retailer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navigate } from 'react-router-dom';
import SaltComposition from '../components/ui/SaltComposition';

export default function RetailerInventoryPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'my-stock'
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [stockModal, setStockModal] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [predictionsLoading, setPredictionsLoading] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [stockQty, setStockQty] = useState(50);
  const [reorderLevel, setReorderLevel] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const pageSize = 12;

  const getTypeBadge = (type) => {
    if (!type) return null;
    const t = type.toLowerCase();
    let cls = 'bg-zinc-100 text-zinc-600 border-zinc-200';
    let icon = 'medication';
    if (t.includes('tablet') || t.includes('pill')) { cls = 'bg-blue-50 text-blue-700 border-blue-200'; icon = 'pill'; }
    else if (t.includes('syrup') || t.includes('liquid')) { cls = 'bg-pink-50 text-pink-700 border-pink-200'; icon = 'vaccines'; }
    else if (t.includes('injection')) { cls = 'bg-purple-50 text-purple-700 border-purple-200'; icon = 'syringe'; }
    else if (t.includes('drop')) { cls = 'bg-cyan-50 text-cyan-700 border-cyan-200'; icon = 'water_drop'; }
    else if (t.includes('cream') || t.includes('ointment')) { cls = 'bg-amber-50 text-amber-700 border-amber-200'; icon = 'spa'; }
    else if (t.includes('device')) { cls = 'bg-teal-50 text-teal-700 border-teal-200'; icon = 'medical_services'; }
    else if (t.includes('e-commerce') || t.includes('ecom')) { cls = 'bg-indigo-50 text-indigo-700 border-indigo-200'; icon = 'shopping_bag'; }

    return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${cls} uppercase tracking-wider`}><span className="material-symbols-outlined text-[13px]">{icon}</span> {type}</span>;
  };

  const renderDescription = (desc) => {
    if (!desc) return null;
    if (desc.includes('<')) {
      const cleanDesc = desc.replace(/<[^>]*$/, '...');
      return (
        <div className="space-y-3 mt-6 bg-[#f8f9fa] p-5 rounded-2xl border border-zinc-100">
          <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-4">Product Information</h5>
          <div
            className="text-[13px] text-zinc-600 leading-relaxed [&>div>h3]:text-sm [&>div>h3]:font-bold [&>div>h3]:mb-1 [&>div>h3]:text-zinc-800 [&>div>p]:mb-1"
            dangerouslySetInnerHTML={{ __html: cleanDesc }}
          />
        </div>
      );
    }
    const parts = desc.split('|').map(p => p.trim()).filter(Boolean);
    return (
      <div className="space-y-3 mt-6 bg-[#f8f9fa] p-5 rounded-2xl border border-zinc-100">
        <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.15em] mb-4">Product Information</h5>
        <div className="space-y-3">
          {parts.map((part, i) => {
            const splitIdx = part.indexOf(':');
            if (splitIdx > 0) {
              const title = part.slice(0, splitIdx).trim();
              const text = part.slice(splitIdx + 1).trim();
              return <div key={i}><strong className="text-zinc-900 text-[13px] block mb-0.5">{title}</strong><span className="text-zinc-500 text-[13px] leading-relaxed block">{text}</span></div>;
            }
            return <p key={i} className="text-[13px] text-zinc-500 leading-relaxed block">{part}</p>;
          })}
        </div>
      </div>
    );
  };

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const uploadBase = apiBase.replace(/\/api\/?$/, '');

  const toAssetUrl = useCallback((value) => {
    if (!value || typeof value !== 'string') return '';
    const clean = value.trim().replace(/^"|"$/g, '');
    if (!clean) return '';
    if (/^(https?:\/\/|data:|blob:)/i.test(clean)) return clean;
    return `${uploadBase}${clean.startsWith('/') ? '' : '/'}${clean}`;
  }, [uploadBase]);

  const extractFirstImage = useCallback((images) => {
    if (!images) return '';

    if (Array.isArray(images)) {
      return images.find((item) => typeof item === 'string' && item.trim())?.trim() || '';
    }

    if (typeof images === 'string') {
      const trimmed = images.trim();
      if (!trimmed) return '';

      // Some records store a single CDN URL containing comma-separated transform params.
      if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
      }

      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed.find((item) => typeof item === 'string' && item.trim())?.trim() || '';
          }
        } catch {
          // continue to fallback parser
        }
      }

      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const values = [];
        const quoted = /"((?:\\.|[^"\\])*)"/g;
        let match = quoted.exec(trimmed);
        while (match) {
          values.push(match[1]);
          match = quoted.exec(trimmed);
        }
        if (values.length) return values[0];

        const normalized = trimmed.slice(1, -1);
        return normalized.split(',').map((x) => x.trim()).find(Boolean) || '';
      }

      if (trimmed.includes(',')) {
        return trimmed.split(',').map((x) => x.trim().replace(/^"|"$/g, '')).find(Boolean) || '';
      }

      return trimmed;
    }

    return '';
  }, []);

  const renderCategoryIcon = (iconValue, className = 'w-4 h-4 object-contain') => {
    if (!iconValue) return null;
    if (/^(https?:\/\/|\/)/i.test(iconValue)) {
      return <img src={toAssetUrl(iconValue)} alt="" className={className} />;
    }
    return <span className="material-symbols-outlined text-[16px] leading-none">{iconValue}</span>;
  };

  // Fetch categories
  useEffect(() => {
    getCategories().then(res => setCategories(res.data || [])).catch(console.error);
  }, []);

  // Fetch medicines
  const fetchMedicines = useCallback(() => {
    setLoading(true);
    const params = { limit: pageSize, offset: (currentPage - 1) * pageSize };
    if (search.trim()) params.q = search.trim();
    if (selectedCategory) params.category = selectedCategory;
    searchMedicines(params)
      .then(res => {
        setMedicines(res.data.medicines || []);
        setTotal(res.data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, selectedCategory, currentPage]);

  useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

  // Fetch inventory for "my stock" tab
  const fetchInventory = useCallback(() => {
    getInventory().then(res => setInventory(res.data || [])).catch(console.error);
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  // Fetch predictions
  const fetchPredictions = useCallback(() => {
    setPredictionsLoading(true);
    getPredictions()
      .then(res => setPredictions(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        console.error('Prediction fetch error:', err);
        showToast({ type: 'error', message: 'Failed to load stock predictions' });
      })
      .finally(() => setPredictionsLoading(false));
  }, [showToast]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  const simulateWeather = async (type) => {
    try {
      let temp = 25;
      if (type === 'Rain') temp = 18;
      if (type === 'Heatwave') temp = 38;

      await axios.post(`${apiBase}/predictions/simulate`, {
        condition: type === 'Heatwave' ? 'Clear' : type,
        temp: temp
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      showToast({ type: 'success', title: 'Simulation Active', message: `Weather changed to ${type}. Recalculating...` });
      fetchPredictions();
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to simulate weather' });
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, selectedCategory]);

  if (authLoading) return null;
  if (!user || user.role !== 'retailer') return <Navigate to="/login" replace />;

  const handleOpenModal = (med, mode) => {
    setStockModal(med);
    setModalMode(mode); // 'add' | 'update' | 'view'
    if (mode === 'update' || mode === 'view') {
      const isInv = activeTab === 'my-stock';
      setStockQty(isInv ? med.stock_quantity : (med.current_stock || 0));
      setReorderLevel(isInv ? med.reorder_level : (med.current_reorder_level || 10));
    } else {
      setStockQty(50);
      setReorderLevel(10);
    }
  };

  const confirmModalAction = async () => {
    if (!stockModal) return;
    setSubmitting(true);
    const isInv = activeTab === 'my-stock';
    const medName = stockModal.name;
    const invId = modalMode === 'update' ? (isInv ? stockModal.id : stockModal.inventory_id) : null;
    try {
      if (modalMode === 'add') {
        await addToInventory({
          medicineId: stockModal.medicine_id || stockModal.id,
          isEcom: stockModal.isEcom || false,
          stockQuantity: stockQty,
          reorderLevel: reorderLevel,
          maxCapacity: 500,
        });
        showToast({ type: 'success', title: 'Added to Inventory', message: `${medName} added with ${stockQty} units` });
      } else if (modalMode === 'update') {
        await updateInventoryItem(invId, { stockQuantity: stockQty, reorderLevel });
        showToast({ type: 'success', title: 'Stock Updated', message: `${medName} → ${stockQty} units` });
      }
      setStockModal(null);
      fetchMedicines();
      fetchInventory();
    } catch (err) {
      showToast({ type: 'error', title: 'Failed', message: err.response?.data?.message || `Could not ${modalMode} inventory` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveFromStock = async (invId, name) => {
    if (!confirm(`Remove "${name}" from your inventory?`)) return;
    try {
      await deleteInventoryItem(invId);
      showToast({ type: 'success', title: 'Removed', message: `${name} removed from inventory` });
      fetchMedicines();
      fetchInventory();
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to remove' });
    }
  };

  const getStockBadge = (med) => {
    if (!med.already_in_inventory) return null;
    if (med.current_stock === 0) return { label: 'Out of Stock', cls: 'bg-red-100/80 text-red-700 border-red-200' };
    if (med.current_stock <= (med.current_reorder_level || 10)) return { label: 'Low Stock', cls: 'bg-orange-100/80 text-orange-700 border-orange-200' };
    return { label: 'In Stock', cls: 'bg-emerald-100/80 text-[#006e2f] border-emerald-200' };
  };

  const selectedCategoryData = useMemo(
    () => categories.find((cat) => String(cat.id) === String(selectedCategory)),
    [categories, selectedCategory]
  );

  const categoryIconByName = useMemo(() => {
    const map = {};
    for (const cat of categories) {
      if (!cat?.name) continue;
      map[String(cat.name).toLowerCase()] = cat.iconUrl || cat.icon_url || '';
    }
    return map;
  }, [categories]);

  const pagedInventory = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return inventory.slice(start, start + pageSize);
  }, [inventory, currentPage]);

  const displayList = activeTab === 'all' ? medicines : pagedInventory;
  const totalItems = activeTab === 'all' ? Number(total || 0) : inventory.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const visiblePageNumbers = useMemo(() => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let p = start; p <= end; p += 1) pages.push(p);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="bg-[#f8f9fa] font-body text-[#191c1d] antialiased fixed inset-0 overflow-y-auto overflow-x-hidden">
      <RetailerTopNav />
      <RetailerSidebar />

      <main className="lg:ml-56 pt-24 pb-24 md:pb-12 px-6">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2">Retail Workspace</p>
            <h1 className="text-3xl md:text-[34px] font-extrabold font-headline text-[#191c1d] tracking-tight leading-tight mb-1.5">Inventory Hub</h1>
            <p className="text-sm text-zinc-500 max-w-md leading-relaxed">
              Curate platform medicines, track stock precisely, and update inventory faster.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <div className="px-4 py-2 bg-white rounded-xl shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006e2f] text-lg">inventory_2</span>
              <span>{inventory.length} items in stock</span>
            </div>
            <div className="px-4 py-2 bg-white rounded-xl shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006e2f] text-lg">view_cozy</span>
              <span>{totalItems} total results</span>
            </div>
          </div>
        </header>

        {/* Smart Predictions Section */}
        {predictions.length > 0 && (
          <div className="mb-8 animate-in slide-in-from-top-4 fade-in duration-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold font-headline text-[#191c1d] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006e2f]">insights</span>
                Smart Stock Predictions
              </h2>
              <div className="flex items-center gap-3">
                <select
                  onChange={(e) => simulateWeather(e.target.value)}
                  className="text-[11px] font-bold bg-white border border-zinc-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#006e2f]/20 transition-all opacity-80 hover:opacity-100 cursor-pointer shadow-sm"
                >
                  <option value="Clear">☀️ Simulate Clear</option>
                  <option value="Rain">🌧️ Simulate Rain</option>
                  <option value="Heatwave">🔥 Simulate Heatwave</option>
                </select>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 px-2 py-1 rounded-md">AI Insights</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predictions.map((pred, i) => {
                const isCritical = pred.status === 'CRITICAL';
                const isLow = pred.status === 'LOW';

                let cardCls = 'bg-emerald-50/50 border-emerald-100 text-emerald-800';
                let iconCls = 'text-emerald-500';
                let btnCls = 'bg-emerald-600 hover:bg-emerald-700';
                let statusText = 'Stock sufficient';

                if (isCritical) {
                  cardCls = 'bg-red-50/80 border-red-100 text-red-900';
                  iconCls = 'text-red-600';
                  btnCls = 'bg-red-600 hover:bg-red-700';
                  statusText = 'Restock immediately';
                } else if (isLow) {
                  cardCls = 'bg-orange-50/80 border-orange-100 text-orange-900';
                  iconCls = 'text-orange-600';
                  btnCls = 'bg-orange-600 hover:bg-orange-700';
                  statusText = 'Running low';
                }

                return (
                  <div key={i} className={`p-4 rounded-2xl border ${cardCls} flex items-center justify-between gap-4 shadow-sm backdrop-blur-sm transition-all hover:shadow-md`}>
                    <div className="flex gap-3 items-center min-w-0">
                      <div className={`w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center shrink-0`}>
                        <span className={`material-symbols-outlined ${iconCls}`}>
                          {isCritical ? 'warning' : isLow ? 'trending_down' : 'verified_user'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm truncate">{pred.medicine_name || 'Medicine'}</h4>
                        <div className="flex flex-col gap-1.5 mt-2">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Baseline</span>
                              <span className="text-xs font-bold text-zinc-500 line-through opacity-50">{pred.base_days} days</span>
                            </div>
                            <div className="w-px h-6 bg-zinc-200" />
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-[#006e2f] uppercase tracking-wider">Forecast</span>
                              <span className="text-xs font-extrabold">{pred.smart_days} days left</span>
                            </div>
                          </div>

                          {pred.reason && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold bg-blue-500 text-white px-2.5 py-1 rounded-lg w-fit shadow-sm animate-pulse">
                              <span className="material-symbols-outlined text-[12px]">wb_sunny</span>
                              Forecast: {pred.reason} (+{(pred.multiplier * 100 - 100).toFixed(0)}%)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">Avail: {pred.available_stock}</span>
                      {(isCritical || isLow) && (
                        <button
                          onClick={() => {
                            const med = inventory.find(inv => inv.medicine_id === pred.medicine_id);
                            if (med) {
                              if (activeTab === 'all') {
                                handleOpenModal({
                                  ...med,
                                  current_stock: med.stock_quantity,
                                  current_reorder_level: med.reorder_level,
                                  inventory_id: med.id
                                }, 'update');
                              } else {
                                handleOpenModal(med, 'update');
                              }
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-white font-bold text-[11px] transition-all shadow-sm ${btnCls}`}
                        >
                          Restock
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-[#006e2f] text-white shadow-lg shadow-[#006e2f]/20' : 'bg-white text-zinc-600 hover:bg-zinc-100'}`}
          >
            All Platform Medicines
          </button>
          <button
            onClick={() => setActiveTab('my-stock')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'my-stock' ? 'bg-[#006e2f] text-white shadow-lg shadow-[#006e2f]/20' : 'bg-white text-zinc-600 hover:bg-zinc-100'}`}
          >
            My Inventory ({inventory.length})
          </button>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search medicines by name, salt, or manufacturer..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-[#006e2f] text-sm"
              />
            </div>

            {activeTab === 'all' && (
              <div className="relative md:min-w-[260px]">
                <button
                  type="button"
                  onClick={() => setCategoryMenuOpen((prev) => !prev)}
                  className="w-full px-4 py-3.5 bg-white rounded-xl shadow-sm text-sm font-semibold text-zinc-700 flex items-center justify-between gap-3 hover:bg-zinc-50"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {selectedCategoryData ? renderCategoryIcon(selectedCategoryData.iconUrl || selectedCategoryData.icon_url) : <span className="material-symbols-outlined text-[16px]">category</span>}
                    <span className="truncate">{selectedCategoryData?.name || 'All Categories'}</span>
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-zinc-500">expand_more</span>
                </button>

                {categoryMenuOpen && (
                  <div className="absolute z-20 mt-2 w-full bg-white border border-zinc-100 rounded-xl shadow-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('');
                        setCategoryMenuOpen(false);
                      }}
                      className="w-full px-3 py-2.5 text-left text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                    >
                      All Categories
                    </button>
                    <div className="max-h-72 overflow-y-auto">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            setCategoryMenuOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 ${String(selectedCategory) === String(cat.id) ? 'bg-[#006e2f]/5 text-[#006e2f] font-bold' : 'text-zinc-700'}`}
                        >
                          {renderCategoryIcon(cat.iconUrl || cat.icon_url)}
                          <span className="truncate">{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-white shadow-sm text-zinc-600 font-semibold">
              {activeTab === 'all' ? 'Platform catalog mode' : 'My stock mode'}
            </span>
            {selectedCategoryData && (
              <span className="px-3 py-1 rounded-full bg-[#006e2f]/10 text-[#006e2f] font-semibold flex items-center gap-1.5">
                {renderCategoryIcon(selectedCategoryData.iconUrl || selectedCategoryData.icon_url)}
                {selectedCategoryData.name}
              </span>
            )}
            {(search || selectedCategory) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('');
                  setCategoryMenuOpen(false);
                }}
                className="px-3 py-1 rounded-full bg-zinc-900 text-white font-semibold hover:opacity-90"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-xs text-zinc-400 mb-4 font-semibold uppercase" style={{ letterSpacing: '0.05em' }}>
            {activeTab === 'all'
              ? `Showing page ${currentPage} of ${totalPages} · ${total} medicines`
              : `Showing page ${currentPage} of ${totalPages} · ${inventory.length} inventory items`}
          </p>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
                <div className="w-full h-40 bg-zinc-100 rounded-xl mb-4" />
                <div className="h-4 w-3/4 bg-zinc-100 rounded mb-2" />
                <div className="h-3 w-1/2 bg-zinc-100 rounded mb-4" />
                <div className="flex justify-between">
                  <div className="h-5 w-16 bg-zinc-100 rounded" />
                  <div className="h-8 w-24 bg-zinc-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : displayList.length === 0 ? (
          <div className="text-center py-20 text-zinc-400">
            <span className="material-symbols-outlined text-6xl mb-4 block">medication</span>
            <p className="font-bold text-lg mb-1">
              {activeTab === 'my-stock' ? 'No items in your inventory' : 'No medicines found'}
            </p>
            <p className="text-sm">
              {activeTab === 'my-stock' ? 'Switch to "All Platform Medicines" to add items.' : 'Try a different search or category filter.'}
            </p>
          </div>
        ) : (
          /* Medicine Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(activeTab === 'all' ? medicines : inventory).map((med) => {
              const isInv = activeTab === 'my-stock';
              const medName = med.name;
              const medImage = toAssetUrl(extractFirstImage(med.image || med.images));
              const badge = activeTab === 'all' ? getStockBadge(med) : (() => {
                if (med.stock_quantity === 0) return { label: 'Out of Stock', cls: 'bg-red-100/80 text-red-700 border-red-200' };
                if (med.stock_quantity <= (med.reorder_level || 10)) return { label: 'Low Stock', cls: 'bg-orange-100/80 text-orange-700 border-orange-200' };
                return { label: 'In Stock', cls: 'bg-emerald-100/80 text-[#006e2f] border-emerald-200' };
              })();
              const inInventory = activeTab === 'all' ? med.already_in_inventory : true;
              const invId = isInv ? med.id : med.inventory_id;
              const stock = isInv ? med.stock_quantity : med.current_stock;
              const catName = med.category_name;
              const catIcon = (catName && categoryIconByName[String(catName).toLowerCase()]) || med.category_icon || '';

              return (
                <div key={med.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group relative flex flex-col border border-zinc-100">
                  {/* Medicine Image */}
                  <div onClick={() => handleOpenModal(med, inInventory ? 'view' : 'add')} className="relative h-48 bg-zinc-50 overflow-hidden flex-shrink-0 cursor-pointer">
                    {medImage ? (
                      <img src={medImage} alt={medName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-100/50">
                        <span className="material-symbols-outlined text-6xl text-zinc-300">medication</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                    {badge && (
                      <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md ${badge.cls}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {badge.label}
                      </span>
                    )}

                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                      {med.requires_rx && (
                        <span className="px-2 py-1 bg-red-500/90 text-white backdrop-blur-md text-[10px] font-bold rounded-lg shadow-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">prescriptions</span> Rx
                        </span>
                      )}
                      {med.type && (
                        <span className="px-2.5 py-1 bg-white/90 text-zinc-700 backdrop-blur-md text-[10px] font-bold rounded-lg shadow-sm capitalize border border-white/20">
                          {med.type}
                        </span>
                      )}
                    </div>

                    {catName && (
                      <span className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-black/40 backdrop-blur-md border border-white/20 rounded-xl text-[10px] text-white font-bold shadow-sm">
                        {catIcon && renderCategoryIcon(catIcon, 'w-3 h-3 object-contain')}
                        {catName}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1 bg-white">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 onClick={() => handleOpenModal(med, inInventory ? 'view' : 'add')} className="font-bold text-[15px] text-zinc-900 leading-tight line-clamp-2 cursor-pointer hover:text-[#006e2f] transition-colors">{medName}</h3>
                    </div>

                    <p className="text-xs text-zinc-500 mb-3 line-clamp-1 flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[14px]">factory</span>
                      {med.manufacturer}
                    </p>

                    <div className="mt-auto">
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-xl font-extrabold font-headline text-zinc-900 tracking-tight">₹{(med.selling_price || med.mrp || 0).toFixed(2)}</span>
                        {med.mrp && med.selling_price && med.mrp !== med.selling_price && (
                          <span className="text-[11px] font-bold text-zinc-400 line-through">₹{med.mrp.toFixed(2)}</span>
                        )}
                      </div>

                      {inInventory ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs bg-zinc-50 border border-zinc-100 rounded-xl p-2.5">
                            <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Available Stock</span>
                            <strong className="text-zinc-900 text-sm font-bold">{stock} units</strong>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenModal(med, 'update')}
                              className="flex-1 py-2.5 bg-[#006e2f]/10 text-[#006e2f] hover:bg-[#006e2f] hover:text-white text-[13px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                              Update
                            </button>
                            <button
                              onClick={() => handleRemoveFromStock(invId, medName)}
                              className="w-10 flex items-center justify-center border border-zinc-200 text-zinc-400 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all font-bold"
                              title="Remove from inventory"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenModal(med, 'add')}
                          className="w-full py-2.5 bg-[#006e2f] hover:bg-[#005c27] text-white text-[13px] font-bold rounded-xl shadow-md shadow-[#006e2f]/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[18px]">add_circle</span>
                          Add to Inventory
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-9 px-3 rounded-lg bg-white border border-zinc-200 text-sm font-semibold text-zinc-600 disabled:opacity-40"
            >
              Prev
            </button>

            {visiblePageNumbers[0] > 1 && (
              <>
                <button type="button" onClick={() => setCurrentPage(1)} className="h-9 min-w-9 px-2 rounded-lg bg-white border border-zinc-200 text-sm font-semibold text-zinc-600">1</button>
                {visiblePageNumbers[0] > 2 && <span className="px-1 text-zinc-400">...</span>}
              </>
            )}

            {visiblePageNumbers.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={`h-9 min-w-9 px-2 rounded-lg text-sm font-bold ${p === currentPage ? 'bg-[#006e2f] text-white shadow-lg shadow-[#006e2f]/20' : 'bg-white border border-zinc-200 text-zinc-600'}`}
              >
                {p}
              </button>
            ))}

            {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages && (
              <>
                {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages - 1 && <span className="px-1 text-zinc-400">...</span>}
                <button type="button" onClick={() => setCurrentPage(totalPages)} className="h-9 min-w-9 px-2 rounded-lg bg-white border border-zinc-200 text-sm font-semibold text-zinc-600">{totalPages}</button>
              </>
            )}

            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-9 px-3 rounded-lg bg-white border border-zinc-200 text-sm font-semibold text-zinc-600 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* Stock Modal */}
      {stockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setStockModal(null)} />
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/20">
            <button onClick={() => setStockModal(null)} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white backdrop-blur-md rounded-full text-zinc-900 shadow-sm transition-all hover:scale-105">
              <span className="material-symbols-outlined text-[20px] font-bold">close</span>
            </button>
            <div className="md:w-5/12 bg-[#f8f9fa] border-r border-zinc-100 flex flex-col">
              <div className="relative h-56 md:h-64 bg-white flex items-center justify-center p-8 shrink-0">
                {extractFirstImage(stockModal.image || stockModal.images) ? (
                  <img src={toAssetUrl(extractFirstImage(stockModal.image || stockModal.images))} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                ) : (
                  <span className="material-symbols-outlined text-8xl text-zinc-200">medication</span>
                )}
                {stockModal.requires_rx && (
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl font-bold text-xs shadow-sm border border-red-100">
                    <span className="material-symbols-outlined text-[14px]">prescriptions</span> Rx Required
                  </div>
                )}
              </div>
              <div className="p-6 md:p-8 flex-1 overflow-y-auto min-h-0">
                <div className="mb-3">
                  <h3 className="font-extrabold text-2xl font-headline text-zinc-900 leading-tight mb-3">{stockModal.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-sm font-semibold text-zinc-600 bg-zinc-200/50 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">factory</span>
                      {stockModal.manufacturer}
                    </span>
                    {getTypeBadge(stockModal.type)}
                  </div>
                  <div className="text-sm text-zinc-500 font-medium mb-6 flex gap-2">
                    <span>Salt:</span>
                    <div className="text-zinc-700 flex-1">
                      {stockModal.salt_name ? <SaltComposition saltName={stockModal.salt_name} format="text" className="text-sm mt-0" /> : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6 p-4 bg-white rounded-2xl shadow-sm border border-zinc-100/50">
                  <div className="flex-1 border-r border-zinc-100 pr-4">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Selling Price</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#006e2f]">₹{(stockModal.selling_price || stockModal.mrp || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex-1 pl-2">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">MRP</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${stockModal.mrp !== stockModal.selling_price ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>₹{stockModal.mrp?.toFixed(2) || '0.00'}</span>
                      {stockModal.mrp > stockModal.selling_price && (
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded flex items-center text-[10px] font-bold">
                          {Math.round(((stockModal.mrp - stockModal.selling_price) / stockModal.mrp) * 100)}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {renderDescription(stockModal.description)}
                {stockModal.hsn_code && (
                  <p className="mt-4 text-[11px] font-bold text-zinc-400 uppercase tracking-widest border border-dashed rounded px-2 py-1 inline-block">HSN: <span className="text-zinc-600">{stockModal.hsn_code}</span></p>
                )}
              </div>
            </div>

            <div className="md:w-7/12 p-6 md:p-8 md:pl-10 bg-white flex flex-col justify-center overflow-y-auto">
              <div>
                <h4 className="font-bold text-xl font-headline text-zinc-900 mb-2">
                  {modalMode === 'add' ? 'Add to Inventory' : modalMode === 'update' ? 'Update Stock Levels' : 'Inventory Details'}
                </h4>
                <p className="text-sm text-zinc-500 mb-8 leading-relaxed max-w-sm">
                  {modalMode === 'add' ? 'Set your initial stock quantity and a reorder threshold to get alerts when stock runs low.' :
                    modalMode === 'update' ? 'Adjust current stock manually and modify your reorder points.' :
                      'Review this product\'s details. To adjust stock, switch to my inventory.'}
                </p>

                {(modalMode === 'add' || modalMode === 'update') && (
                  <div className="grid grid-cols-2 gap-5 mb-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">inventory_2</span> Available Stock
                      </label>
                      <div className="relative">
                        <button onClick={() => setStockQty(Math.max(0, stockQty - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 rounded-lg text-zinc-600 transition-colors">
                          <span className="material-symbols-outlined text-lg">remove</span>
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={stockQty}
                          onChange={(e) => setStockQty(parseInt(e.target.value) || 0)}
                          className="w-full px-12 py-3.5 bg-zinc-50 border-zinc-200 rounded-xl text-center text-lg font-bold text-zinc-900 focus:ring-2 focus:ring-[#006e2f] focus:bg-white transition-all outline-none"
                        />
                        <button onClick={() => setStockQty(stockQty + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#006e2f]/10 hover:bg-[#006e2f]/20 rounded-lg text-[#006e2f] transition-colors">
                          <span className="material-symbols-outlined text-lg">add</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">warning</span> Reorder Alert
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={reorderLevel}
                          onChange={(e) => setReorderLevel(parseInt(e.target.value) || 0)}
                          className="w-full pl-4 pr-14 py-3.5 bg-zinc-50 border-zinc-200 rounded-xl text-lg font-bold text-zinc-900 focus:ring-2 focus:ring-[#006e2f] focus:bg-white transition-all outline-none"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400 pointer-events-none">units</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-zinc-100">
                  <button onClick={() => setStockModal(null)} className="flex-1 py-3.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-[15px] font-bold rounded-xl transition-colors">
                    {modalMode === 'view' ? 'Close' : 'Cancel'}
                  </button>
                  {(modalMode === 'add' || modalMode === 'update') && (
                    <button
                      onClick={confirmModalAction}
                      disabled={submitting}
                      className="flex-1 py-3.5 bg-[#006e2f] hover:bg-[#005c27] text-white text-[15px] font-bold rounded-xl shadow-lg shadow-[#006e2f]/20 hover:shadow-xl transition-all disabled:opacity-60 disabled:hover:shadow-none flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">
                            {modalMode === 'add' ? 'add_circle' : 'save'}
                          </span>
                          {modalMode === 'add' ? 'Add to Stock' : 'Save Changes'}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <RetailerFooter />
    </div>
  );
}
