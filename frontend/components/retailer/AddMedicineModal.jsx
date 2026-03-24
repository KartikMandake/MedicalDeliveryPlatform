import { useState } from 'react';
import { searchMedicines, addToInventory } from '../../api/retailer';
import SaltComposition from '../ui/SaltComposition';

export default function AddMedicineModal({ onClose, onAdded }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [stockForm, setStockForm] = useState({ stockQuantity: 50, reorderLevel: 10, maxCapacity: 100 });
  const [selectedMed, setSelectedMed] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await searchMedicines({ q: query.trim(), limit: 20 });
      setResults(res.data || []);
    } catch (err) {
      setError('Failed to search medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (med) => {
    setAddingId(med.id);
    setError('');
    try {
      await addToInventory({
        medicineId: med.id,
        stockQuantity: stockForm.stockQuantity,
        reorderLevel: stockForm.reorderLevel,
        maxCapacity: stockForm.maxCapacity,
      });
      setResults(results.map(r => r.id === med.id ? { ...r, already_in_inventory: true } : r));
      setSelectedMed(null);
      onAdded?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-['Manrope'] font-bold text-lg text-slate-900">Add Medicine from Platform</h3>
            <p className="text-sm text-slate-400 mt-1">Search platform medicines to add to your inventory</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-50">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by medicine name, salt, or manufacturer..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#0d631b] text-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-5 py-3 bg-[#0d631b] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {results.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 block">medication</span>
              <p className="font-semibold">Search for medicines to add</p>
              <p className="text-sm">Only medicines registered on the platform can be added.</p>
            </div>
          )}
          {results.map((med) => (
            <div key={med.id} className={`p-4 rounded-xl border transition-all ${selectedMed?.id === med.id ? 'border-[#0d631b] bg-emerald-50/30' : 'border-slate-100 hover:border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {med.images?.[0] && (
                    <img src={med.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-100 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{med.name}</p>
                    <div className="text-xs text-slate-400 truncate flex items-center gap-1">
                      {med.salt_name && <SaltComposition saltName={med.salt_name} format="text" />}
                      {med.salt_name && med.manufacturer && <span>·</span>}
                      <span>{med.manufacturer}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{med.type}</span>
                      <span className="text-xs text-slate-400">{med.category_name}</span>
                      {med.requires_rx && <span className="text-xs text-orange-600 font-bold">Rx</span>}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4 text-right">
                  <p className="text-sm font-bold text-slate-900">₹{med.selling_price?.toFixed(2)}</p>
                  <p className="text-xs text-slate-400 line-through">₹{med.mrp?.toFixed(2)}</p>
                  {med.already_in_inventory ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold mt-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Added
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelectedMed(selectedMed?.id === med.id ? null : med)}
                      className="mt-1 text-xs text-[#0d631b] font-bold hover:underline"
                    >
                      {selectedMed?.id === med.id ? 'Cancel' : 'Select'}
                    </button>
                  )}
                </div>
              </div>

              {/* Stock input when selected */}
              {selectedMed?.id === med.id && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Initial Stock</label>
                      <input type="number" min="0" value={stockForm.stockQuantity}
                        onChange={(e) => setStockForm({ ...stockForm, stockQuantity: parseInt(e.target.value) || 0 })}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0d631b]" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Reorder Level</label>
                      <input type="number" min="0" value={stockForm.reorderLevel}
                        onChange={(e) => setStockForm({ ...stockForm, reorderLevel: parseInt(e.target.value) || 0 })}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0d631b]" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-1">Max Capacity</label>
                      <input type="number" min="0" value={stockForm.maxCapacity}
                        onChange={(e) => setStockForm({ ...stockForm, maxCapacity: parseInt(e.target.value) || 0 })}
                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#0d631b]" />
                    </div>
                  </div>
                  <button
                    onClick={() => handleAdd(med)}
                    disabled={addingId === med.id}
                    className="w-full py-2.5 bg-[#0d631b] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    {addingId === med.id ? 'Adding...' : 'Add to Inventory'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
