import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import ProductsNavBar from '../components/products/ProductsNavBar';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { extractPrescriptionFromFile } from '../api/upload';

function formatMoney(value) {
  return `Rs.${Number(value || 0).toFixed(2)}`;
}

function isSupportedPrescriptionFile(file) {
  const mime = String(file?.type || '').toLowerCase();
  const name = String(file?.name || '').toLowerCase();
  const allowedMime = new Set(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

  if (allowedMime.has(mime)) return true;
  return /\.(pdf|jpg|jpeg|png|webp)$/i.test(name);
}

function getPrescriptionErrorToast(err) {
  const data = err?.response?.data || {};
  const code = String(data?.errorCode || '').toUpperCase();

  if (code === 'PRESCRIPTION_INVALID') {
    return 'Prescription is not valid. Please upload a genuine doctor-issued prescription.';
  }

  if (code === 'PRESCRIPTION_UNREADABLE' || code === 'PRESCRIPTION_NO_MEDICINES') {
    return 'Could not read this prescription clearly. Please upload a clearer image/PDF with visible medicine names.';
  }

  if (code === 'OCR_SERVICE_UNAVAILABLE' || code === 'OCR_SERVICE_BUSY') {
    return 'Prescription OCR is temporarily unavailable. Please try again shortly.';
  }

  const fallback = String(data?.message || '').trim();
  if (fallback) return fallback;
  return 'Unable to process this prescription file.';
}

export default function UploadPage() {
  const { user, loading } = useAuth();
  const { fetchCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState(null);

  const matchedItems = useMemo(() => {
    const items = Array.isArray(result?.items) ? result.items : [];
    return items.filter((item) => item?.matchedProduct);
  }, [result]);

  const subtotal = useMemo(
    () => matchedItems.reduce((sum, item) => sum + Number(item.matchedProduct?.price || 0) * Number(item.quantity || 1), 0),
    [matchedItems]
  );

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const onFilePicked = async (file) => {
    if (!file) return;

    if (!isSupportedPrescriptionFile(file)) {
      showToast('Please upload a prescription as PDF, JPG, PNG, or WEBP.', 'error');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showToast('File too large. Max allowed size is 10MB.', 'error');
      return;
    }

    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const nextPreview = URL.createObjectURL(file);
    setPreviewUrl(nextPreview);

    setExtracting(true);
    setResult(null);
    try {
      const res = await extractPrescriptionFromFile(file);
      setResult(res.data || null);
      await fetchCart();
      showToast(res.data?.message || 'Prescription processed successfully.', 'success');
    } catch (err) {
      setResult(null);
      showToast(getPrescriptionErrorToast(err), 'error');
    } finally {
      setExtracting(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    onFilePicked(file);
  };

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'user') {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'agent') return <Navigate to="/agent" replace />;
    if (user.role === 'retailer') return <Navigate to="/retailer/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-surface font-body text-on-surface antialiased fixed inset-0 overflow-y-auto overflow-x-hidden">
      <ProductsNavBar />

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        <section className="lg:col-span-7 space-y-12">
          <header>
            <span className="text-primary font-bold tracking-widest text-[10px] uppercase font-headline">Clinical Portal</span>
            <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface font-headline mt-2">Upload Prescription</h1>
            <p className="text-on-surface-variant mt-4 max-w-lg leading-relaxed">Securely upload your prescription as PDF or image. Our AI engine extracts medicines and automatically adds matched products to your cart using detected dosage or quantity.</p>
          </header>

          <div className="space-y-6">
            <div
              className={`group relative flex flex-col items-center justify-center p-16 transition-all duration-300 cursor-pointer rounded-[1.5rem] border-2 border-dashed ${dragActive ? 'border-primary bg-primary/5' : 'border-outline-variant hover:bg-surface-container-low'}`}
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
              </div>
              <p className="font-headline font-bold text-lg">Drop your file here</p>
              <p className="text-on-surface-variant text-sm mt-1">PDF, JPG, PNG, WEBP (Max 10MB)</p>
              <input
                ref={fileInputRef}
                className="absolute inset-0 opacity-0 cursor-pointer"
                type="file"
                accept="application/pdf,.pdf,image/jpeg,.jpg,.jpeg,image/png,.png,image/webp,.webp"
                onChange={(e) => onFilePicked(e.target.files?.[0])}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10"
              >
                <span className="material-symbols-outlined">upload_file</span>
                Choose File
              </button>
              <button
                type="button"
                onClick={() => showToast('WhatsApp upload is coming soon for this flow.', 'info')}
                className="flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-full bg-surface-container-high text-on-surface font-headline font-bold hover:bg-surface-container-highest active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[#25D366]">chat</span>
                WhatsApp Upload
              </button>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 shadow-sm ring-1 ring-outline-variant/15">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-bold text-lg">Document Preview</h3>
              <span className="px-3 py-1 bg-primary-container/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">
                {extracting ? 'Scanning...' : previewUrl ? 'Scanned' : 'Waiting'}
              </span>
            </div>

            <div className="relative aspect-[3/4] w-full max-w-md mx-auto rounded-xl overflow-hidden bg-surface-container-low">
              {previewUrl ? (
                selectedFile?.type === 'application/pdf' || /\.pdf$/i.test(selectedFile?.name || '')
                  ? <iframe title="Prescription preview" src={previewUrl} className="w-full h-full" />
                  : <img alt="Prescription preview" src={previewUrl} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-on-surface-variant">No prescription selected yet.</div>
              )}
              {extracting && <div className="absolute top-1/3 left-0 w-full h-[2px] bg-primary/40 shadow-[0_0_15px_rgba(0,110,47,0.5)] animate-pulse" />}
            </div>
          </div>
        </section>

        <aside className="lg:col-span-5 space-y-8">
          <div className="rounded-[1.5rem] p-8 shadow-sm insight-glow">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div>
                <h2 className="font-headline font-extrabold text-xl tracking-tight">AI Extraction</h2>
                <p className="text-xs text-on-surface-variant font-medium">Fluid Intelligence Processing...</p>
              </div>
            </div>

            {extracting && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-white text-sm text-on-surface-variant">Extracting medicine names from prescription...</div>
                <div className="p-4 rounded-xl bg-white text-sm text-on-surface-variant">Matching against your live medicine inventory...</div>
                <div className="p-4 rounded-xl bg-white text-sm text-on-surface-variant">Preparing auto-cart entries with detected quantity...</div>
              </div>
            )}

            {!extracting && !result && (
              <div className="p-4 rounded-xl bg-white text-sm text-on-surface-variant">Upload a prescription PDF/image to detect medicines and auto-add matching items to cart.</div>
            )}

            {!extracting && result && (
              <>
                <div className="space-y-4 max-h-[420px] overflow-auto pr-1">
                  {(result.items || []).map((item, idx) => {
                    const matched = item.matchedProduct;
                    return (
                      <div key={`${item.medicineName}-${idx}`} className={`flex items-start gap-4 p-4 rounded-xl bg-white shadow-sm ${matched ? 'hover:translate-x-1' : ''} transition-transform duration-200 ${matched ? 'border-l-4 border-primary' : 'border border-amber-200'}`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${matched ? 'bg-primary/5 text-primary' : 'bg-amber-100 text-amber-700'}`}>
                          <span className="material-symbols-outlined">{matched ? 'pill' : 'warning'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2">
                            <span className="font-headline font-bold text-sm truncate">{item.medicineName}</span>
                            <span className={`text-xs font-bold whitespace-nowrap ${matched ? 'text-primary' : 'text-amber-700'}`}>
                              {matched ? 'Matched' : 'No Match'}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant mt-1">Qty: {item.quantity}{item.dosage ? ` • ${item.dosage}` : ''}</p>
                          {matched && (
                            <p className="text-xs text-on-surface-variant mt-1">{matched.name} • {formatMoney(matched.price)} • Stock {matched.stock}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-outline-variant/20">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-on-surface-variant font-label text-xs uppercase tracking-widest font-bold">Extraction Engine</span>
                    <span className="font-headline font-bold text-sm uppercase tracking-wide">{String(result.extractionEngine || 'ai').replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-on-surface-variant font-label text-xs uppercase tracking-widest font-bold">Matched Items</span>
                    <span className="font-headline font-extrabold text-2xl">{matchedItems.length}</span>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-on-surface-variant font-label text-xs uppercase tracking-widest font-bold">Estimated Value</span>
                    <span className="font-headline font-extrabold text-xl">{formatMoney(subtotal)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/cart')}
                    className="w-full py-5 px-6 rounded-full bg-primary text-on-primary font-headline font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                  >
                    View Updated Cart
                    <span className="material-symbols-outlined">shopping_cart_checkout</span>
                  </button>
                  <p className="text-center text-[10px] text-on-surface-variant mt-6 leading-tight uppercase font-bold tracking-tighter">{result.message || 'Extraction complete'}</p>
                </div>
              </>
            )}
          </div>

          <div className="p-6 bg-surface-container-low rounded-xl flex items-center gap-4">
            <span className="material-symbols-outlined text-secondary">help_center</span>
            <div>
              <p className="text-sm font-bold font-headline">Need assistance?</p>
              <p className="text-xs text-on-surface-variant">Our pharmacists are online 24/7</p>
            </div>
          </div>

          {selectedFile && (
            <div className="p-4 rounded-xl border border-outline-variant/30 bg-white text-xs text-on-surface-variant">
              Selected file: <span className="font-bold text-on-surface">{selectedFile.name}</span>
            </div>
          )}
        </aside>
      </main>

      <footer className="bg-zinc-50 w-full py-12 px-8 border-t border-zinc-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <div className="col-span-1 md:col-span-1">
            <span className="font-headline font-bold text-zinc-900">MediFlow AI</span>
            <p className="font-body text-xs text-zinc-500 mt-4 leading-relaxed">© 2024 MediFlow AI. Clinical Excellence and Fluid Intelligence.</p>
          </div>
          <div className="flex flex-col gap-3 font-body text-xs text-zinc-500">
            <button type="button" className="text-left hover:text-zinc-900 transition-colors" onClick={() => showToast('Privacy policy page coming soon.', 'info')}>Privacy Policy</button>
            <button type="button" className="text-left hover:text-zinc-900 transition-colors" onClick={() => showToast('Terms page coming soon.', 'info')}>Terms of Service</button>
          </div>
          <div className="flex flex-col gap-3 font-body text-xs text-zinc-500">
            <button type="button" className="text-left hover:text-zinc-900 transition-colors" onClick={() => showToast('Contact support for urgent prescription issues.', 'info')}>Contact Medical Hub</button>
            <button type="button" className="text-left hover:text-zinc-900 transition-colors" onClick={() => showToast('API docs are internal for now.', 'info')}>API Documentation</button>
          </div>
          <div className="flex justify-end items-end">
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-zinc-400">terminal</span>
              <span className="material-symbols-outlined text-zinc-400">security</span>
            </div>
          </div>
        </div>
      </footer>

      <nav className="lg:hidden fixed bottom-0 w-full z-50 rounded-t-3xl border-t border-zinc-200 bg-white/80 backdrop-blur-lg shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center px-4 pt-3 pb-8 w-full">
          <Link className="flex flex-col items-center justify-center text-zinc-400 active:scale-90 transition-transform duration-200" to="/dashboard">
            <span className="material-symbols-outlined">home</span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-headline mt-1">Home</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-zinc-400 active:scale-90 transition-transform duration-200" to="/products">
            <span className="material-symbols-outlined">grid_view</span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-headline mt-1">Categories</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-green-600 scale-110 active:scale-90 transition-transform duration-200" to="/upload">
            <span className="material-symbols-outlined">description</span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-headline mt-1">Upload</span>
          </Link>
          <Link className="flex flex-col items-center justify-center text-zinc-400 active:scale-90 transition-transform duration-200" to="/help">
            <span className="material-symbols-outlined">contact_support</span>
            <span className="text-[10px] font-bold uppercase tracking-widest font-headline mt-1">Help</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
