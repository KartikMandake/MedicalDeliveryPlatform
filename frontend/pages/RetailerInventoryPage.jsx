import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const [productType, setProductType] = useState('all'); // 'all' | 'medicine' | 'ecom'
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState('my-stock');

  // Pagination & Infinite Scroll logic
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const pageSize = 12;
  const loaderRef = useRef(null);

  // Bulk Edit Logic
  const [pendingStockUpdates, setPendingStockUpdates] = useState({});
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  // UI state
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [stockModal, setStockModal] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [predictionsLoading, setPredictionsLoading] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [stockQty, setStockQty] = useState(50);
  const [reorderLevel, setReorderLevel] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [updatingRow, setUpdatingRow] = useState(null);

  const getTypeBadge = (type) => {
    if (!type) return null;
    const t = type.toLowerCase();
    let cls = 'bg-slate-100 text-slate-600 border-slate-200';
    let icon = 'medication';
    if (t.includes('tablet') || t.includes('pill')) { cls = 'bg-blue-50 text-blue-700 border-blue-200'; icon = 'pill'; }
    else if (t.includes('syrup') || t.includes('liquid')) { cls = 'bg-pink-50 text-pink-700 border-pink-200'; icon = 'vaccines'; }
    else if (t.includes('injection')) { cls = 'bg-purple-50 text-purple-700 border-purple-200'; icon = 'syringe'; }
    else if (t.includes('drop')) { cls = 'bg-cyan-50 text-cyan-700 border-cyan-200'; icon = 'water_drop'; }
    else if (t.includes('cream') || t.includes('ointment')) { cls = 'bg-amber-50 text-amber-700 border-amber-200'; icon = 'spa'; }
    else if (t.includes('device')) { cls = 'bg-teal-50 text-teal-700 border-teal-200'; icon = 'medical_services'; }
    else if (t.includes('e-commerce') || t.includes('ecom')) { cls = 'bg-indigo-50 text-indigo-700 border-indigo-200'; icon = 'shopping_bag'; }

    return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border ${cls} uppercase tracking-wider`}><span className="material-symbols-outlined text-[11px]">{icon}</span> {type}</span>;
  };

  const renderDescription = (desc) => {
    if (!desc) return null;
    if (desc.includes('<')) {
      const cleanDesc = desc.replace(/<[^>]*$/, '...');
      return (
        <div className="space-y-3 mt-6 bg-[#f8f9fa] p-5 rounded-2xl border border-slate-200/60">
          <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Product Information</h5>
          <div
            className="text-[13px] text-slate-600 leading-relaxed [&>div>h3]:text-sm [&>div>h3]:font-bold [&>div>h3]:mb-1 [&>div>h3]:text-slate-800 [&>div>p]:mb-1"
            dangerouslySetInnerHTML={{ __html: cleanDesc }}
          />
        </div>
      );
    }
    const parts = desc.split('|').map(p => p.trim()).filter(Boolean);
    return (
      <div className="space-y-3 mt-6 bg-[#f8f9fa] p-5 rounded-2xl border border-slate-200/60">
        <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Product Information</h5>
        <div className="space-y-3">
          {parts.map((part, i) => {
            const splitIdx = part.indexOf(':');
            if (splitIdx > 0) {
              const title = part.slice(0, splitIdx).trim();
              const text = part.slice(splitIdx + 1).trim();
              return <div key={i}><strong className="text-slate-900 text-[13px] block mb-0.5">{title}</strong><span className="text-slate-500 text-[13px] leading-relaxed block">{text}</span></div>;
            }
            return <p key={i} className="text-[13px] text-slate-500 leading-relaxed block">{part}</p>;
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
    if (Array.isArray(images)) return images.find((item) => typeof item === 'string' && item.trim())?.trim() || '';
    if (typeof images === 'string') {
      const trimmed = images.trim();
      if (!trimmed) return '';
      if (/^https?:\/\//i.test(trimmed)) return trimmed;
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed.find((item) => typeof item === 'string' && item.trim())?.trim() || '';
        } catch { }
      }
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const values = [];
        const quoted = /"((?:\\.|[^"\\])*)"/g;
        let match = quoted.exec(trimmed);
        while (match) { values.push(match[1]); match = quoted.exec(trimmed); }
        if (values.length) return values[0];
        const normalized = trimmed.slice(1, -1);
        return normalized.split(',').map((x) => x.trim()).find(Boolean) || '';
      }
      if (trimmed.includes(',')) return trimmed.split(',').map((x) => x.trim().replace(/^"|"$/g, '')).find(Boolean) || '';
      return trimmed;
    }
    return '';
  }, []);

  const renderCategoryIcon = (iconValue, className = 'w-4 h-4 object-contain') => {
    if (!iconValue) return null;
    if (/^(https?:\/\/|\/)/i.test(iconValue)) return <img src={toAssetUrl(iconValue)} alt="" className={className} />;
    return <span className="material-symbols-outlined text-[16px] leading-none text-emerald-600">{iconValue}</span>;
  };

  useEffect(() => {
    getCategories().then(res => setCategories(res.data || [])).catch(console.error);
  }, []);

  const fetchMedicines = useCallback(async (page = 1, append = false) => {
    if (page === 1) setLoading(true);
    else setIsFetchingMore(true);

    try {
      const params = { limit: pageSize, offset: (page - 1) * pageSize };
      if (search.trim()) params.q = search.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (productType !== 'all') params.productType = productType;

      const res = await searchMedicines(params);

      if (append) {
        setMedicines(prev => [...prev, ...(res.data.medicines || [])]);
      } else {
        setMedicines(res.data.medicines || []);
      }
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  }, [search, selectedCategory, productType, pageSize]);

  // Initial Fetch & Filter changes resetting page
  useEffect(() => {
    setCurrentPage(1);
    fetchMedicines(1, false);
  }, [search, selectedCategory, productType, fetchMedicines, activeTab]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !isFetchingMore) {
          const isServerTab = activeTab === 'all';

          if (isServerTab) {
            const currentTotalPages = Math.ceil(total / pageSize);
            if (currentPage < currentTotalPages) {
              setCurrentPage(prev => {
                const next = prev + 1;
                fetchMedicines(next, true);
                return next;
              });
            }
          } else {
            // Local Inventory infinite scroll (slice increase)
            const currentTotalFiltered = inventory.filter(item => {
              const matchSearch = search ? (item.name?.toLowerCase().includes(search.toLowerCase()) || item.manufacturer?.toLowerCase().includes(search.toLowerCase())) : true;
              const matchCat = selectedCategory ? String(item.category_id) === String(selectedCategory) : true;
              const matchType = productType === 'all' || (productType === 'ecom' ? item.isEcom : !item.isEcom);
              return matchSearch && matchCat && matchType;
            }).length;

            if (currentPage < Math.ceil(currentTotalFiltered / pageSize)) {
              setCurrentPage(prev => prev + 1);
            }
          }
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);
    return () => { if (currentLoader) observer.unobserve(currentLoader); };
  }, [loading, isFetchingMore, currentPage, total, pageSize, fetchMedicines, activeTab, inventory, search, selectedCategory, productType]);

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
    setModalMode(mode);
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
        showToast({ type: 'success', title: 'Stock Updated', message: `${medName} â†’ ${stockQty} units` });
      }
      setStockModal(null);
      fetchMedicines(1, false);
      fetchInventory();
    } catch (err) {
      showToast({ type: 'error', title: 'Failed', message: err.response?.data?.message || `Could not ${modalMode} inventory` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStockUpdate = async (med, increment) => {
    const newStock = Math.max(0, med.stock_quantity + increment);
    if (newStock === med.stock_quantity) return;

    setUpdatingRow(med.id);

    setInventory(prev => prev.map(item =>
      item.id === med.id ? { ...item, stock_quantity: newStock } : item
    ));

    try {
      await updateInventoryItem(med.id, {
        stockQuantity: newStock,
        reorderLevel: med.reorder_level
      });
    } catch (err) {
      setInventory(prev => prev.map(item =>
        item.id === med.id ? { ...item, stock_quantity: med.stock_quantity } : item
      ));
      showToast({ type: 'error', message: 'Failed to update stock' });
    } finally {
      setUpdatingRow(null);
    }
  };

  const handleManualBulkStockEdit = (id, value) => {
    const val = parseInt(value, 10);
    if (isNaN(val) || val < 0) return;

    const originalItem = inventory.find(i => i.id === id);
    if (!originalItem) return;

    if (val === originalItem.stock_quantity) {
      setPendingStockUpdates(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      setPendingStockUpdates(prev => ({ ...prev, [id]: val }));
    }
  };

  const saveBulkChanges = async () => {
    const updateKeys = Object.keys(pendingStockUpdates);
    if (updateKeys.length === 0) return;

    setIsBulkSaving(true);
    let successCount = 0;

    // Optimistic Update
    const originalInventory = [...inventory];
    setInventory(prev => prev.map(item =>
      pendingStockUpdates[item.id] !== undefined ? { ...item, stock_quantity: pendingStockUpdates[item.id] } : item
    ));

    try {
      // Execute saves concurrently
      await Promise.all(updateKeys.map(async id => {
        const item = originalInventory.find(i => i.id === id);
        if (item) {
          await updateInventoryItem(id, { stockQuantity: pendingStockUpdates[id], reorderLevel: item.reorder_level });
          successCount++;
        }
      }));

      showToast({ type: 'success', title: 'Bulk Update Secured', message: `Updated stock levels for ${successCount} products.` });
      setPendingStockUpdates({});
    } catch (err) {
      // Partially revert if some failed. Better to just refetch entirely to resync truth.
      fetchInventory();
      showToast({ type: 'error', message: 'Some updates failed to save. Synchronizing with server.' });
    } finally {
      setIsBulkSaving(false);
    }
  };

  const handleRemoveFromStock = async (invId, name) => {
    if (!confirm(`Remove "${name}" from your inventory?`)) return;
    try {
      await deleteInventoryItem(invId);
      showToast({ type: 'success', title: 'Removed', message: `${name} removed from inventory` });

      setPendingStockUpdates(prev => {
        const next = { ...prev };
        delete next[invId];
        return next;
      });

      fetchMedicines(1, false);
      fetchInventory();
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to remove' });
    }
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

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchSearch = search ? (item.name?.toLowerCase().includes(search.toLowerCase()) || item.manufacturer?.toLowerCase().includes(search.toLowerCase())) : true;
      const matchCat = selectedCategory ? String(item.category_id) === String(selectedCategory) : true;
      const matchType = productType === 'all' || (productType === 'ecom' ? item.isEcom : !item.isEcom);
      return matchSearch && matchCat && matchType;
    });
  }, [inventory, search, selectedCategory, productType]);

  const pagedInventory = useMemo(() => {
    const currentLimit = currentPage * pageSize;
    return filteredInventory.slice(0, currentLimit);
  }, [filteredInventory, currentPage, pageSize]);

  const displayList = activeTab === 'all' ? medicines : pagedInventory;

  // Need to track server pagination visibility for the Catalog view
  const serverTotalPages = Math.ceil(total / pageSize);
  const showLoader = activeTab === 'all'
    ? currentPage < serverTotalPages
    : pagedInventory.length < filteredInventory.length;

  const totalSkus = inventory.length;
  const outOfStockCount = inventory.filter(item => item.stock_quantity === 0).length;
  const lowStockCount = inventory.filter(item => item.stock_quantity > 0 && item.stock_quantity <= (item.reorder_level || 10)).length;

  const pendingUpdateCount = Object.keys(pendingStockUpdates).length;

  return (
    <div className="bg-[#f8f9fa] font-body text-slate-900 antialiased fixed inset-0 overflow-y-auto overflow-x-hidden">
      <RetailerTopNav />
      <RetailerSidebar />

      <main className="lg:ml-56 pt-24 pb-32 md:pb-24 px-6 max-w-[1600px] mx-auto relative">
        {/* KPI Header Dashboard */}
        <header className="mb-8 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-2">Retail Workspace</p>
            <h1 className="text-3xl md:text-[36px] font-extrabold font-headline tracking-tight leading-tight mb-2">Inventory Management</h1>
            <p className="text-sm font-medium text-slate-500 max-w-lg leading-relaxed">
              Curate and track your platform stock. Respond to low-stock alerts immediately to avoid missing sales.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="px-5 py-4 bg-white rounded-[1rem] shadow-sm border border-slate-200/60 flex items-center gap-4 hover:-translate-y-0.5 transition-transform min-w-[160px]">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-slate-600 text-[20px]">inventory_2</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total SKUs</p>
                <p className="text-xl font-black text-slate-900">{totalSkus}</p>
              </div>
            </div>

            <div className="px-5 py-4 bg-white rounded-[1rem] shadow-sm border border-amber-200/60 flex items-center gap-4 hover:-translate-y-0.5 transition-transform min-w-[160px]">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-amber-500 text-[20px]">warning</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-amber-600/80 tracking-wider">Low Stock</p>
                <p className="text-xl font-black text-amber-600">{lowStockCount}</p>
              </div>
            </div>

            <div className="px-5 py-4 bg-white rounded-[1rem] shadow-sm border border-rose-200/60 flex items-center gap-4 hover:-translate-y-0.5 transition-transform min-w-[160px]">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-rose-500 text-[20px]">local_shipping</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-rose-600/80 tracking-wider">Out of Stock</p>
                <p className="text-xl font-black text-rose-600">{outOfStockCount}</p>
              </div>
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
                  className="text-[11px] font-bold bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#006e2f]/20 transition-all opacity-80 hover:opacity-100 cursor-pointer shadow-sm"
                >
                  <option value="Clear">â˜€ï¸ Simulate Clear</option>
                  <option value="Rain">ðŸŒ§ï¸ Simulate Rain</option>
                  <option value="Heatwave">ðŸ”¥ Simulate Heatwave</option>
                </select>

                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">
                  AI Insights
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predictions.map((pred, i) => {
                const isCritical = pred.status === 'CRITICAL';
                const isLow = pred.status === 'LOW';

                let cardCls = 'bg-emerald-50/50 border-emerald-100 text-emerald-800';
                let iconCls = 'text-emerald-500';
                let btnCls = 'bg-emerald-600 hover:bg-emerald-700';

                if (isCritical) {
                  cardCls = 'bg-red-50/80 border-red-100 text-red-900';
                  iconCls = 'text-red-600';
                  btnCls = 'bg-red-600 hover:bg-red-700';
                } else if (isLow) {
                  cardCls = 'bg-orange-50/80 border-orange-100 text-orange-900';
                  iconCls = 'text-orange-600';
                  btnCls = 'bg-orange-600 hover:bg-orange-700';
                }

                return (
                  <div key={i} className={`p-4 rounded-2xl border ${cardCls} flex items-center justify-between gap-4 shadow-sm backdrop-blur-sm transition-all hover:shadow-md`}>
                    <div className="flex gap-3 items-center min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center shrink-0">
                        <span className={`material-symbols-outlined ${iconCls}`}>
                          {isCritical ? 'warning' : isLow ? 'trending_down' : 'verified_user'}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-bold text-sm truncate">
                          {pred.medicine_name || 'Medicine'}
                        </h4>

                        <div className="flex flex-col gap-1.5 mt-2">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Baseline</span>
                              <span className="text-xs font-bold text-slate-500 line-through opacity-50">
                                {pred.base_days} days
                              </span>
                            </div>

                            <div className="w-px h-6 bg-slate-200" />

                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-[#006e2f] uppercase tracking-wider">Forecast</span>
                              <span className="text-xs font-extrabold">
                                {pred.smart_days} days left
                              </span>
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
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">
                        Avail: {pred.available_stock}
                      </span>

                      {(isCritical || isLow) && (
                        <button
                          onClick={() => {
                            const med = inventory.find(inv => inv.medicine_id === pred.medicine_id);
                            if (med) {
                              handleOpenModal(med, 'update');
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

        {/* Action Bar (Tabs & Filters) */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex gap-2 w-full md:w-auto p-1 bg-slate-50 rounded-xl">

            <button
              onClick={() => setActiveTab('my-stock')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'my-stock'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              My Inventory ({inventory.length})
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'all'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              <span className="material-symbols-outlined text-[18px]">language</span>
              Platform Catalog
            </button>

          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto px-2 pb-2 md:p-0">
            {/* Meds vs Ecom Toggle */}
            <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-1 shrink-0 h-[42px]">
              <button
                onClick={() => setProductType('all')}
                className={`px-4 text-xs font-bold rounded-md transition-all ${productType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                All
              </button>
              <button
                onClick={() => setProductType('medicine')}
                className={`px-4 text-xs font-bold rounded-md transition-all ${productType === 'medicine' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Medicines
              </button>
              <button
                onClick={() => setProductType('ecom')}
                className={`px-4 text-xs font-bold rounded-md transition-all ${productType === 'ecom' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                E-Com
              </button>
            </div>

            <div className="relative w-full md:w-[260px] h-[42px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or brand..."
                className="w-full h-full pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none placeholder:text-slate-400"
              />
            </div>

            {activeTab === 'all' && (
              <div className="relative min-w-[180px] h-[42px]">
                <button
                  type="button"
                  onClick={() => setCategoryMenuOpen((prev) => !prev)}
                  className="w-full h-full px-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    {selectedCategoryData ? renderCategoryIcon(selectedCategoryData.iconUrl || selectedCategoryData.icon_url) : <span className="material-symbols-outlined text-[16px]">category</span>}
                    <span className="truncate">{selectedCategoryData?.name || 'All Categories'}</span>
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-slate-400">expand_more</span>
                </button>

                {categoryMenuOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1">
                    <button
                      type="button"
                      onClick={() => { setSelectedCategory(''); setCategoryMenuOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      All Categories
                    </button>
                    <div className="max-h-72 overflow-y-auto custom-scrollbar">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => { setSelectedCategory(cat.id); setCategoryMenuOpen(false); }}
                          className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-slate-50 ${String(selectedCategory) === String(cat.id) ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600 font-medium'}`}
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
        </div>

        {/* Loading State Base */}
        {
          loading && currentPage === 1 ? (
            <div className="grid grid-cols-1 gap-4 animate-pulse">
              <div className="h-12 bg-slate-200 rounded-xl" />
              <div className="h-16 bg-white rounded-xl" />
              <div className="h-16 bg-white rounded-xl" />
              <div className="h-16 bg-white rounded-xl" />
            </div>
          ) : displayList.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center">
              <span className="material-symbols-outlined text-[64px] mb-4 text-slate-300">medication</span>
              <p className="font-extrabold font-headline text-xl mb-1 text-slate-800">
                {activeTab === 'my-stock' ? 'No items in your inventory' : 'No medicines found'}
              </p>
              <p className="text-sm font-medium text-slate-500">
                {activeTab === 'my-stock' ? 'Switch to "Platform Catalog" to discover and add products.' : 'Try adjusting your search criteria.'}
              </p>
            </div>
          ) : (
            <div className="pb-16">
              {/* View Switching based on Tab */}
              {activeTab === 'my-stock' ? (
                /* --- B2B INVENTORY DATA TABLE --- */
                <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200/60 overflow-hidden relative">

                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">Product Identity</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">Brand / Category</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">Pricing</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap">Status</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-emerald-600 whitespace-nowrap">Current Stock</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500 whitespace-nowrap text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pagedInventory.map((med) => {
                          const medImage = toAssetUrl(extractFirstImage(med.image || med.images));
                          const isLowStock = med.stock_quantity > 0 && med.stock_quantity <= (med.reorder_level || 10);
                          const isOutOfStock = med.stock_quantity === 0;
                          const catName = med.category_name;
                          const catIcon = (catName && categoryIconByName[String(catName).toLowerCase()]) || med.category_icon || '';
                          const isUpdating = updatingRow === med.id;

                          const currentInputVal = pendingStockUpdates[med.id] !== undefined ? pendingStockUpdates[med.id] : med.stock_quantity;
                          const isModified = pendingStockUpdates[med.id] !== undefined;

                          return (
                            <tr key={med.id} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                                    {medImage ? <img src={medImage} alt="" className="w-full h-full object-contain mix-blend-multiply" /> : <span className="material-symbols-outlined text-slate-300">medication</span>}
                                  </div>
                                  <div className="max-w-[250px]">
                                    <h3 onClick={() => handleOpenModal(med, 'update')} className="font-bold text-sm text-slate-900 leading-tight line-clamp-1 cursor-pointer hover:text-emerald-700 transition-colors">{med.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                      {med.is_ecom && <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">E-Com</span>}
                                      {!med.is_ecom && med.requires_rx && <span className="text-[8px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">Rx</span>}
                                      {getTypeBadge(med.type)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-1"><span className="material-symbols-outlined text-[14px] text-slate-400">factory</span> {med.manufacturer || 'Generic'}</p>
                                {catName && <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">{catIcon && renderCategoryIcon(catIcon, 'w-3 h-3 object-contain')} {catName}</p>}
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm font-extrabold text-[#15803d]">â‚¹{(med.selling_price || med.mrp || 0).toFixed(2)}</p>
                                {med.mrp && med.selling_price && med.mrp !== med.selling_price && <p className="text-[10px] font-black text-slate-400 line-through">â‚¹{med.mrp.toFixed(2)}</p>}
                              </td>
                              <td className="px-6 py-4">
                                {isOutOfStock ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-wider">Out of Stock</span>
                                ) : isLowStock ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider">Low Stock</span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">In Stock</span>
                                )}
                                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Alert at: {med.reorder_level || 10}</p>
                              </td>
                              <td className="px-6 py-4">
                                <div className={`flex items-center transition-all bg-white border rounded-lg p-0.5 w-[110px] ${isModified ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200'}`}>
                                  <button
                                    type="button"
                                    disabled={isUpdating || currentInputVal === 0}
                                    onClick={() => handleManualBulkStockEdit(med.id, currentInputVal - 1)}
                                    className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">remove</span>
                                  </button>

                                  <input
                                    type="number"
                                    min="0"
                                    value={currentInputVal}
                                    onChange={(e) => handleManualBulkStockEdit(med.id, e.target.value)}
                                    className={`w-full min-w-0 text-center font-mono text-sm font-black focus:outline-none bg-transparent ${isModified ? 'text-amber-700' : 'text-slate-800'}`}
                                  />

                                  <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() => handleManualBulkStockEdit(med.id, currentInputVal + 1)}
                                    className="w-7 h-7 rounded flex items-center justify-center text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleOpenModal(med, 'update')}
                                    className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                    title="Edit full details"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleRemoveFromStock(med.id, med.name)}
                                    className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete from inventory"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Sticky Bulk Save Action Bar */}
                  {pendingUpdateCount > 0 && (
                    <div className="sticky bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 p-4 flex items-center justify-between z-20 animate-in slide-in-from-bottom-2 duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">{pendingUpdateCount}</div>
                        <p className="text-white font-bold text-sm tracking-wide">Unsaved Stock Changes</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setPendingStockUpdates({})}
                          className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
                        >
                          Discard
                        </button>
                        <button
                          onClick={saveBulkChanges}
                          disabled={isBulkSaving}
                          className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-extrabold text-sm rounded-lg shadow-lg shadow-emerald-500/20 active:translate-y-px transition-all flex items-center gap-2"
                        >
                          {isBulkSaving ? (
                            <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span>
                          ) : (
                            <span className="material-symbols-outlined text-[18px]">save</span>
                          )}
                          Save All Changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* --- DISCOVERY GRID (Platform Catalog) --- */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {medicines.map((med) => {
                    const medName = med.name;
                    const medImage = toAssetUrl(extractFirstImage(med.image || med.images));
                    const inInventory = med.already_in_inventory;

                    return (
                      <div key={med.id} className="bg-white rounded-[1.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group relative flex flex-col border border-slate-100">
                        <div onClick={() => handleOpenModal(med, inInventory ? 'view' : 'add')} className="relative h-48 bg-[#f4f7f6] flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer">
                          {medImage ? (
                            <img src={medImage} alt={medName} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700" />
                          ) : (
                            <span className="material-symbols-outlined text-6xl text-slate-300/60">medication</span>
                          )}

                          {inInventory && (
                            <span className="absolute top-3 right-3 px-2 py-1 bg-emerald-500 text-white backdrop-blur-md text-[9px] font-black rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">verified</span> Listed
                            </span>
                          )}

                          <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
                            {med.requires_rx && (
                              <span className="px-2 py-1 bg-rose-500/90 text-white backdrop-blur-md text-[9px] font-black rounded-full shadow-sm flex items-center gap-1 uppercase tracking-widest border border-rose-400/50">
                                <span className="material-symbols-outlined text-[12px]">prescriptions</span> Rx
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex-shrink-0">{med.manufacturer || 'Generic'}</span>
                          </div>

                          <h3 onClick={() => handleOpenModal(med, inInventory ? 'view' : 'add')} className="font-extrabold text-base text-slate-800 leading-tight line-clamp-2 cursor-pointer hover:text-emerald-600 transition-colors mb-2">{medName}</h3>

                          <div className="mb-4 text-xs text-slate-500 font-medium">
                            {med.type && getTypeBadge(med.type)}
                          </div>

                          <div className="mt-auto flex items-end justify-between pt-2 border-t border-slate-50">
                            <div>
                              {med.mrp && med.selling_price && med.mrp !== med.selling_price && <span className="text-[10px] font-bold text-slate-400 line-through block mb-0.5">â‚¹{med.mrp.toFixed(2)}</span>}
                              <span className="text-xl font-extrabold text-[#15803d] tracking-tight">â‚¹{(med.selling_price || med.mrp || 0).toFixed(2)}</span>
                            </div>

                            {inInventory ? (
                              <button
                                onClick={() => handleOpenModal(med, 'update')}
                                className="h-10 px-4 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">edit</span> Update
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenModal(med, 'add')}
                                className="h-10 px-4 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-slate-900/20 hover:bg-emerald-600 hover:shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">add_circle</span> Add
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        {/* Infinite Scroll Loader */}
        {showLoader && (
          <div ref={loaderRef} className="py-12 flex justify-center w-full">
            <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-sm border border-slate-200">
              <span className="w-5 h-5 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></span>
              <span className="text-sm font-bold text-slate-500">Loading more...</span>
            </div>
          </div>
        )}
      </main>

      {/* Modern Modal */}
      {stockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setStockModal(null)} />
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/20">
            <button onClick={() => setStockModal(null)} className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white border border-slate-100 hover:bg-slate-50 rounded-full text-slate-600 shadow-sm transition-all hover:scale-105 cursor-pointer">
              <span className="material-symbols-outlined text-[18px] font-black">close</span>
            </button>
            <div className="md:w-5/12 bg-[#f4f7f6] border-r border-slate-100 flex flex-col shrink-0">
              <div className="relative h-56 md:h-64 flex items-center justify-center p-8 shrink-0">
                {extractFirstImage(stockModal.image || stockModal.images) ? (
                  <img src={toAssetUrl(extractFirstImage(stockModal.image || stockModal.images))} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                ) : (
                  <span className="material-symbols-outlined text-8xl text-slate-300">medication</span>
                )}
                {stockModal.requires_rx && (
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-sm border border-rose-100/50">
                    <span className="material-symbols-outlined text-[12px]">prescriptions</span> Rx Required
                  </div>
                )}
              </div>
              <div className="p-6 md:p-8 flex-1 overflow-y-auto min-h-0 bg-white border-t border-slate-100 rounded-tr-[2rem]">
                <div className="mb-4">
                  <h3 className="font-extrabold text-2xl font-headline text-slate-900 leading-tight mb-3">{stockModal.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">factory</span>
                      {stockModal.manufacturer || 'Generic'}
                    </span>
                    {getTypeBadge(stockModal.type)}
                  </div>
                  <div className="text-sm text-slate-500 font-medium mb-6 flex gap-2">
                    <span>Salt:</span>
                    <div className="text-slate-700 flex-1">
                      {stockModal.salt_name ? (
                        <SaltComposition saltName={stockModal.salt_name} format="text" className="text-sm mt-0" />
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-6 p-4 bg-[#f8f9fa] rounded-2xl border border-slate-100">
                    <div className="flex-1 border-r border-slate-200/60 pr-4">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Selling Price</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-[#15803d]">₹{(stockModal.selling_price || stockModal.mrp || 0).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex-1 pl-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">MRP</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${stockModal.mrp !== stockModal.selling_price ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          ₹{stockModal.mrp?.toFixed(2) || '0.00'}
                        </span>
                        {stockModal.mrp > stockModal.selling_price && (
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded flex items-center text-[10px] font-bold">
                            {Math.round(((stockModal.mrp - stockModal.selling_price) / stockModal.mrp) * 100)}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {renderDescription(stockModal.description)}
                </div>
              </div>
            </div>

            <div className="md:w-7/12 p-6 md:p-10 bg-white flex flex-col justify-center overflow-y-auto">
              <div>
                <h4 className="font-black text-2xl font-headline text-slate-900 mb-2">
                  {modalMode === 'add' ? 'Initialize Stock' : modalMode === 'update' ? 'Manage Inventory' : 'Product Details'}
                </h4>
                <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed max-w-sm">
                  {modalMode === 'add'
                    ? 'Add this medicine to your inventory. Set initial stock levels and a reorder threshold to get alerts when stock runs low.'
                    : modalMode === 'update'
                      ? 'Adjust current stock manually and update reorder alert levels as needed.'
                      : "Review this product's details. To adjust stock, switch to my inventory."}
                </p>

                {(modalMode === 'add' || modalMode === 'update') && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">inventory_2</span> Unit Stock
                      </label>
                      <div className="relative">
                        <button onClick={() => setStockQty(Math.max(0, stockQty - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">remove</span>
                        </button>
                        <input
                          type="number" min="0" value={stockQty}
                          onChange={(e) => setStockQty(parseInt(e.target.value) || 0)}
                          className="w-full px-12 py-3.5 bg-[#f8f9fa] border border-slate-200 rounded-xl text-center text-xl font-black font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                        />
                        <button onClick={() => setStockQty(stockQty + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 rounded-lg text-emerald-700 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">add</span>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">notifications_active</span>
                        Reorder Alert
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={reorderLevel}
                          onChange={(e) => setReorderLevel(parseInt(e.target.value) || 0)}
                          className="w-full pl-5 pr-14 py-3.5 bg-[#f8f9fa] border border-slate-200 rounded-xl text-xl font-black font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                        />
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none uppercase tracking-wider">
                          units
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-6 border-t border-slate-100">
                  <button onClick={() => setStockModal(null)} className="flex-1 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[14px] font-bold rounded-xl transition-colors cursor-pointer">
                    {modalMode === 'view' ? 'Close Window' : 'Cancel'}
                  </button>
                  {(modalMode === 'add' || modalMode === 'update') && (
                    <button
                      onClick={confirmModalAction} disabled={submitting}
                      className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-[14px] font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:hover:-translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">
                            {modalMode === 'add' ? 'add_circle' : 'save'}
                          </span>
                          {modalMode === 'add' ? 'Confirm Addition' : 'Save Inventory'}
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
