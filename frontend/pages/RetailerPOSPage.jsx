import { useState, useEffect, useCallback, useRef } from 'react';
import RetailerSidebar from '../components/retailer/RetailerSidebar';
import RetailerTopNav from '../components/retailer/RetailerTopNav';
import RetailerFooter from '../components/retailer/RetailerFooter';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Navigate } from 'react-router-dom';
import { getInventory, createOfflineSale, getOfflineSales } from '../api/retailer';

// ── helpers ──────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n || 0).toFixed(2)}`;
const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const PAYMENT_OPTS = [
  { value: 'cash', label: 'Cash', icon: 'payments' },
  { value: 'card', label: 'Card', icon: 'credit_card' },
  { value: 'upi', label: 'UPI', icon: 'qr_code_scanner' },
];

// ── Receipt Modal ─────────────────────────────────────────────────
function ReceiptModal({ sale, storeName, onClose }) {
  if (!sale) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#006e2f] text-white px-6 py-5 text-center relative">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-200 mb-1">Sale Complete</p>
          <h2 className="text-2xl font-extrabold font-headline">{fmt(sale.totalAmount)}</h2>
          <p className="text-emerald-200 text-xs mt-1 capitalize">{sale.paymentMethod} payment</p>
        </div>

        {/* Store + Date */}
        <div className="px-6 pt-4 pb-2 border-b border-dashed border-slate-200">
          <p className="text-center font-bold text-slate-800 text-sm">{storeName || 'Your Store'}</p>
          <p className="text-center text-xs text-slate-400 mt-0.5">{fmtDate(sale.createdAt)}</p>
          {sale.customerName && (
            <p className="text-center text-xs text-slate-500 mt-1">Customer: <span className="font-semibold text-slate-700">{sale.customerName}</span></p>
          )}
        </div>

        {/* Items */}
        <div className="px-6 py-3 max-h-48 overflow-y-auto space-y-2">
          {(sale.items || []).map((item, i) => (
            <div key={i} className="flex justify-between items-start text-sm">
              <div>
                <p className="font-semibold text-slate-800 text-xs leading-tight">{item.medicine_name}</p>
                <p className="text-xs text-slate-400">x{item.quantity} × {fmt(item.unit_price)}</p>
              </div>
              <p className="font-bold text-slate-900 text-sm">{fmt(item.subtotal)}</p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mx-6 mb-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex justify-between items-center">
          <span className="text-sm font-black text-emerald-800 uppercase tracking-wide">Total</span>
          <span className="text-lg font-black text-emerald-700">{fmt(sale.totalAmount)}</span>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#191c1d] text-white rounded-2xl font-bold text-sm hover:bg-[#006e2f] transition-colors"
          >
            New Sale
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main POS Page ─────────────────────────────────────────────────
export default function RetailerPOSPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  // Inventory + search
  const [inventory, setInventory] = useState([]);
  const [invLoading, setInvLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const searchBoxRef = useRef(null);

  // Cart
  const [cart, setCart] = useState([]);

  // Barcode scanner
  const [scannerActive, setScannerActive] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeRef = useRef(null);
  const videoRef = useRef(null);
  const scannerControlRef = useRef(null);

  // Checkout
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);

  // History tab
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'history'
  const [salesHistory, setSalesHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedSale, setExpandedSale] = useState(null);

  if (authLoading) return null;
  if (!user || user.role !== 'retailer') return <Navigate to="/login" replace />;

  // ── Load inventory ─────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setInvLoading(true);
    getInventory()
      .then(res => setInventory(res.data || []))
      .catch(() => showToast({ type: 'error', message: 'Failed to load inventory' }))
      .finally(() => setInvLoading(false));
  }, []);

  // ── Load history when tab switches ────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (activeTab !== 'history') return;
    setHistoryLoading(true);
    getOfflineSales()
      .then(res => setSalesHistory(res.data?.sales || []))
      .catch(() => showToast({ type: 'error', message: 'Failed to load sales history' }))
      .finally(() => setHistoryLoading(false));
  }, [activeTab]);

  // ── Barcode scanner (camera) ───────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const startScanner = useCallback(async () => {
    setScannerActive(true);
    try {
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();
      scannerControlRef.current = reader;
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const deviceId = devices[devices.length - 1]?.deviceId; // prefer rear cam
      reader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
        if (result) {
          const code = result.getText();
          handleBarcodeScanned(code);
        }
      });
    } catch {
      showToast({ type: 'error', message: 'Camera not available. Use search instead.' });
      setScannerActive(false);
    }
  }, [inventory]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const stopScanner = useCallback(() => {
    if (scannerControlRef.current) {
      try { scannerControlRef.current.reset?.(); } catch { /* noop */ }
      scannerControlRef.current = null;
    }
    setScannerActive(false);
  }, []);

  // Cleanup on unmount
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => () => stopScanner(), []);

  const handleBarcodeScanned = (code) => {
    stopScanner();
    const match = inventory.find(item =>
      item.name?.toLowerCase().includes(code.toLowerCase()) ||
      item.barcode === code
    );
    if (match) {
      addToCart(match);
      showToast({ type: 'success', title: 'Scanned!', message: `${match.name} added to cart` });
    } else {
      setSearchQuery(code);
      setShowSuggestions(true);
      showToast({ type: 'info', message: `Barcode: ${code} — select from search results` });
    }
  };

  // USB barcode gun — watches focused barcode input
  const handleBarcodeKeyDown = (e) => {
    if (e.key === 'Enter' && barcodeInput.trim().length > 0) {
      handleBarcodeScanned(barcodeInput.trim());
      setBarcodeInput('');
    }
  };

  // ── Cart helpers ───────────────────────────────────────────────
  const addToCart = (item) => {
    if (item.stock_quantity === 0) {
      showToast({ type: 'error', message: `${item.name} is out of stock` });
      return;
    }
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) {
        if (existing.qty >= item.stock_quantity) {
          showToast({ type: 'error', message: `Only ${item.stock_quantity} units available` });
          return prev;
        }
        return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, {
        id: item.id,
        inventoryId: item.id,
        name: item.name,
        unitPrice: Number(item.selling_price || item.mrp) || 0,
        qty: 1,
        maxStock: item.stock_quantity,
      }];
    });
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newQty = Math.max(1, Math.min(c.maxStock, c.qty + delta));
      return { ...c, qty: newQty };
    }));
  };

  const setQtyDirect = (id, val) => {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 1) return;
    setCart(prev => prev.map(c => {
      if (c.id !== id) return c;
      return { ...c, qty: Math.min(c.maxStock, n) };
    }));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id));
  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, c) => sum + c.unitPrice * c.qty, 0);

  // ── Suggestions ────────────────────────────────────────────────
  const suggestions = searchQuery.trim().length > 0
    ? inventory.filter(item =>
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  // Close suggestions on outside click
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const handler = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Complete sale ──────────────────────────────────────────────
  const completeSale = async () => {
    if (cart.length === 0) {
      showToast({ type: 'error', message: 'Cart is empty' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await createOfflineSale({
        items: cart.map(c => ({
          inventoryId: c.inventoryId,
          quantity: c.qty,
          unitPrice: c.unitPrice,
        })),
        paymentMethod,
        customerName: customerName.trim() || null,
        customerPhone: customerPhone.trim() || null,
      });
      setReceipt(res.data.sale);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      // Refresh inventory
      getInventory().then(r => setInventory(r.data || [])).catch(() => {});
    } catch (err) {
      showToast({ type: 'error', title: 'Sale Failed', message: err.response?.data?.message || err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // ───────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#f8f9fa] font-body text-slate-900 antialiased fixed inset-0 overflow-y-auto overflow-x-hidden">
      <RetailerTopNav />
      <RetailerSidebar />

      <main className="lg:ml-56 pt-24 pb-32 px-5 max-w-[1400px] mx-auto">

        {/* ── Page Header ────────────────────────────────────────── */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-2">Retail Workspace</p>
            <h1 className="text-3xl md:text-[34px] font-extrabold font-headline tracking-tight mb-1">POS Billing</h1>
            <p className="text-sm text-slate-500 max-w-md">Scan or search medicines, build a cart, complete the sale — stock updates automatically.</p>
          </div>
          <div className="flex gap-3">
            {/* Tab switcher */}
            <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('pos')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'pos' ? 'bg-[#006e2f] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <span className="material-symbols-outlined text-[17px]">point_of_sale</span>
                Billing
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-[#006e2f] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <span className="material-symbols-outlined text-[17px]">history</span>
                History
              </button>
            </div>
          </div>
        </header>

        {/* ── POS TAB ────────────────────────────────────────────── */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

            {/* LEFT — Search + Cart (3 cols) */}
            <div className="xl:col-span-3 space-y-5">

              {/* Search Box */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006e2f] text-[18px]">search</span>
                  Search & Add Medicine
                </h2>

                {/* Scanner + Search row */}
                <div className="flex gap-3 mb-3">
                  {/* Barcode manual input (USB gun) */}
                  <div className="relative flex-1" ref={searchBoxRef}>
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">medication</span>
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Type medicine name or paste barcode…"
                      className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                    />

                    {/* USB barcode input (hidden, auto-focused when scanner gun fires) */}
                    <input
                      ref={barcodeRef}
                      type="text"
                      value={barcodeInput}
                      onChange={e => setBarcodeInput(e.target.value)}
                      onKeyDown={handleBarcodeKeyDown}
                      className="sr-only"
                      aria-label="Barcode scanner input"
                    />

                    {/* Suggestions dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                        {suggestions.map(item => {
                          const isOutOfStock = item.stock_quantity === 0;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              disabled={isOutOfStock}
                              onClick={() => addToCart(item)}
                              className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-emerald-50 transition-colors ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <div>
                                <p className="text-sm font-bold text-slate-800 leading-tight">{item.name}</p>
                                <p className="text-xs text-slate-400">{item.manufacturer}</p>
                              </div>
                              <div className="text-right shrink-0 ml-3">
                                <p className="text-sm font-black text-[#006e2f]">{fmt(item.selling_price || item.mrp)}</p>
                                <p className={`text-[10px] font-bold ${isOutOfStock ? 'text-rose-500' : 'text-slate-400'}`}>
                                  {isOutOfStock ? 'Out of stock' : `${item.stock_quantity} left`}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Camera scan button */}
                  <button
                    onClick={scannerActive ? stopScanner : startScanner}
                    className={`h-11 px-4 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                      scannerActive
                        ? 'bg-rose-500 text-white hover:bg-rose-600'
                        : 'bg-[#191c1d] text-white hover:bg-[#006e2f]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{scannerActive ? 'stop_circle' : 'qr_code_scanner'}</span>
                    <span className="hidden sm:inline">{scannerActive ? 'Stop' : 'Scan'}</span>
                  </button>
                </div>

                {/* Camera viewfinder */}
                {scannerActive && (
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border-2 border-[#006e2f] mb-2">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    {/* Aiming overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-28 border-2 border-emerald-400 rounded-xl relative">
                        <span className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr" />
                        <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl" />
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br" />
                        <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-400/50 animate-pulse" />
                      </div>
                    </div>
                    <p className="absolute bottom-2 inset-x-0 text-center text-[11px] text-emerald-300 font-bold">
                      Point camera at barcode on medicine box
                    </p>
                  </div>
                )}
              </div>

              {/* Cart */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006e2f] text-[18px]">shopping_cart</span>
                    Cart
                    {cart.length > 0 && (
                      <span className="bg-[#006e2f] text-white text-[10px] font-black px-2 py-0.5 rounded-full">{cart.length}</span>
                    )}
                  </h2>
                  {cart.length > 0 && (
                    <button onClick={clearCart} className="text-xs text-rose-500 font-bold hover:text-rose-700 transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
                      Clear All
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="py-16 flex flex-col items-center text-center px-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-slate-300 text-3xl">shopping_cart</span>
                    </div>
                    <p className="font-bold text-slate-500 text-sm">Cart is empty</p>
                    <p className="text-xs text-slate-400 mt-1">Search for a medicine or scan a barcode to add items</p>
                  </div>
                ) : (
                  <div>
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">Product</th>
                          <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">Qty</th>
                          <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right">Price</th>
                          <th className="px-3 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right">Total</th>
                          <th className="px-3 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {cart.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3">
                              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center mb-1 float-left mr-3">
                                <span className="material-symbols-outlined text-emerald-600 text-[16px]">medication</span>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800 leading-tight">{item.name}</p>
                                <p className="text-[10px] text-slate-400">Max: {item.maxStock} units</p>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1 justify-center">
                                <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors text-slate-700">
                                  <span className="material-symbols-outlined text-[14px]">remove</span>
                                </button>
                                <input
                                  type="number"
                                  value={item.qty}
                                  onChange={e => setQtyDirect(item.id, e.target.value)}
                                  className="w-10 text-center text-sm font-black text-slate-900 bg-transparent outline-none border-b border-slate-200 focus:border-emerald-500"
                                  min={1}
                                  max={item.maxStock}
                                />
                                <button onClick={() => updateQty(item.id, 1)} disabled={item.qty >= item.maxStock} className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors text-slate-700 disabled:opacity-40">
                                  <span className="material-symbols-outlined text-[14px]">add</span>
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-right text-sm text-slate-500">{fmt(item.unitPrice)}</td>
                            <td className="px-3 py-3 text-right text-sm font-black text-slate-900">{fmt(item.unitPrice * item.qty)}</td>
                            <td className="px-3 py-3 text-right">
                              <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                <span className="material-symbols-outlined text-[18px]">close</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-emerald-50 border-t-2 border-emerald-100">
                          <td colSpan={3} className="px-5 py-4 font-black text-emerald-800 uppercase text-xs tracking-wider">Total</td>
                          <td className="px-3 py-4 text-right text-xl font-black text-[#006e2f]">{fmt(cartTotal)}</td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — Checkout panel (2 cols) */}
            <div className="xl:col-span-2 space-y-5">

              {/* Payment method */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006e2f] text-[18px]">payments</span>
                  Payment Method
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {PAYMENT_OPTS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setPaymentMethod(opt.value)}
                      className={`py-3 flex flex-col items-center gap-1.5 rounded-xl border-2 font-bold text-xs transition-all ${
                        paymentMethod === opt.value
                          ? 'border-[#006e2f] bg-[#006e2f]/5 text-[#006e2f]'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]" style={paymentMethod === opt.value ? { fontVariationSettings: "'FILL' 1" } : {}}>{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer info (optional) */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5">
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006e2f] text-[18px]">person</span>
                  Customer <span className="text-slate-400 font-medium normal-case tracking-normal">(optional)</span>
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">Phone</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Order summary */}
              <div className="bg-[#191c1d] text-white rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#006e2f]/20 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Order Summary</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Items</span>
                      <span className="font-bold">{cart.reduce((s, c) => s + c.qty, 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Subtotal</span>
                      <span className="font-bold">{fmt(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Tax (GST)</span>
                      <span className="font-bold text-zinc-500">Incl.</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between">
                      <span className="font-black text-emerald-400 uppercase tracking-wide text-sm">Total</span>
                      <span className="text-2xl font-black text-white">{fmt(cartTotal)}</span>
                    </div>
                  </div>

                  <button
                    onClick={completeSale}
                    disabled={submitting || cart.length === 0}
                    className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                      cart.length === 0
                        ? 'bg-white/5 text-white/30 cursor-not-allowed'
                        : 'bg-[#006e2f] hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-900/40 active:scale-95'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Complete Sale · {fmt(cartTotal)}
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-zinc-500 mt-3 font-medium">
                    Stock will deduct automatically after sale
                  </p>
                </div>
              </div>

              {/* USB tip card */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-blue-500 text-[18px]">usb</span>
                </div>
                <div>
                  <p className="text-xs font-black text-slate-700">USB Barcode Scanner</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Connect a USB barcode gun — it works like a keyboard. Just scan any medicine box and it auto-searches.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div>
            {historyLoading ? (
              <div className="grid gap-3 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-white rounded-2xl border border-slate-200/60" />
                ))}
              </div>
            ) : salesHistory.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
                <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">receipt_long</span>
                <p className="font-bold text-slate-600 text-lg">No offline sales yet</p>
                <p className="text-sm text-slate-400 mt-1">Complete your first walk-in sale using the Billing tab.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006e2f] text-[18px]">receipt_long</span>
                    Offline Sales History
                  </h2>
                  <span className="text-xs text-slate-400 font-semibold">{salesHistory.length} records</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {salesHistory.map(sale => {
                    const isExpanded = expandedSale === sale.id;
                    const pmOpt = PAYMENT_OPTS.find(p => p.value === sale.payment_method);
                    return (
                      <div key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                        <button
                          onClick={() => setExpandedSale(isExpanded ? null : sale.id)}
                          className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-emerald-600 text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>receipt</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">
                                {sale.customer_name || 'Walk-in Customer'}
                              </p>
                              <p className="text-[11px] text-slate-400">{fmtDate(sale.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg">
                              <span className="material-symbols-outlined text-slate-500 text-[13px]">{pmOpt?.icon || 'payments'}</span>
                              <span className="text-[11px] font-bold text-slate-600 capitalize">{sale.payment_method}</span>
                            </div>
                            <span className="text-base font-black text-[#006e2f]">{fmt(sale.total_amount)}</span>
                            <span className={`material-symbols-outlined text-slate-400 text-[18px] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                          </div>
                        </button>

                        {/* Expanded items */}
                        {isExpanded && (
                          <div className="px-5 pb-4">
                            <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-slate-200">
                                    <th className="px-4 py-2.5 text-left text-[10px] font-black uppercase text-slate-400">Medicine</th>
                                    <th className="px-4 py-2.5 text-center text-[10px] font-black uppercase text-slate-400">Qty</th>
                                    <th className="px-4 py-2.5 text-right text-[10px] font-black uppercase text-slate-400">Price</th>
                                    <th className="px-4 py-2.5 text-right text-[10px] font-black uppercase text-slate-400">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {(sale.items || []).map((item, i) => (
                                    <tr key={i}>
                                      <td className="px-4 py-2 font-semibold text-slate-800 text-xs">{item.medicine_name}</td>
                                      <td className="px-4 py-2 text-center text-xs text-slate-500">{item.quantity}</td>
                                      <td className="px-4 py-2 text-right text-xs text-slate-500">{fmt(item.unit_price)}</td>
                                      <td className="px-4 py-2 text-right text-xs font-bold text-slate-800">{fmt(item.subtotal)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="border-t border-slate-200 bg-emerald-50">
                                    <td colSpan={3} className="px-4 py-2.5 text-xs font-black text-emerald-700 uppercase tracking-wide">Total</td>
                                    <td className="px-4 py-2.5 text-right font-black text-emerald-700">{fmt(sale.total_amount)}</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <RetailerFooter />

      {/* Receipt Modal */}
      {receipt && (
        <ReceiptModal
          sale={receipt}
          storeName={user?.name}
          onClose={() => setReceipt(null)}
        />
      )}
    </div>
  );
}
