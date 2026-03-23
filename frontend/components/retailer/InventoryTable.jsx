import { useState, useEffect } from 'react';
import { getInventory, updateInventoryItem, deleteInventoryItem } from '../../api/retailer';

export default function InventoryTable({ onAddClick, refreshKey }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchInventory = () => {
    setLoading(true);
    getInventory()
      .then((res) => setInventory(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInventory(); }, [refreshKey]);

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ stockQuantity: item.stock_quantity, reorderLevel: item.reorder_level, maxCapacity: item.max_capacity });
  };

  const handleSave = async () => {
    try {
      await updateInventoryItem(editingId, editForm);
      setEditingId(null);
      fetchInventory();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove "${name}" from your inventory?`)) return;
    try {
      await deleteInventoryItem(id);
      fetchInventory();
    } catch (err) { console.error(err); }
  };

  const getStockStatus = (item) => {
    if (item.stock_quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700' };
    if (item.stock_quantity <= item.reorder_level) return { label: 'Low Stock', color: 'bg-orange-100 text-orange-700' };
    return { label: 'In Stock', color: 'bg-emerald-100 text-[#0d631b]' };
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-['Manrope'] font-bold text-xl text-slate-900">Inventory</h2>
          <p className="text-sm text-slate-400 mt-1">{inventory.length} items in stock</p>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0d631b] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add from Platform
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <th className="px-6 py-4">Medicine</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Price (MRP / Sell)</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Reorder</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-6 py-5"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : inventory.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center text-slate-400">
                  <span className="material-symbols-outlined text-5xl mb-3 block">inventory_2</span>
                  <p className="font-semibold mb-1">No inventory items yet</p>
                  <p className="text-sm">Add medicines from the platform to start managing your stock.</p>
                </td>
              </tr>
            ) : inventory.map((item) => {
              const status = getStockStatus(item);
              const isEditing = editingId === item.id;
              return (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      {item.images?.[0] && (
                        <img src={item.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate max-w-[200px]">{item.name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">{item.salt_name || item.manufacturer}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">{item.category_name || '—'}</td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-semibold uppercase text-slate-500 bg-slate-100 px-2 py-1 rounded">{item.type}</span>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">
                    <span className="text-slate-400 line-through">₹{item.mrp?.toFixed(2)}</span>
                    <span className="ml-2 font-bold text-slate-900">₹{item.selling_price?.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-5">
                    {isEditing ? (
                      <input type="number" value={editForm.stockQuantity} min="0"
                        onChange={(e) => setEditForm({ ...editForm, stockQuantity: parseInt(e.target.value) || 0 })}
                        className="w-20 text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0d631b]" />
                    ) : (
                      <span className="text-sm font-bold text-slate-900">{item.stock_quantity}</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {isEditing ? (
                      <input type="number" value={editForm.reorderLevel} min="0"
                        onChange={(e) => setEditForm({ ...editForm, reorderLevel: parseInt(e.target.value) || 0 })}
                        className="w-20 text-sm border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0d631b]" />
                    ) : (
                      <span className="text-sm text-slate-500">{item.reorder_level}</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-[11px] font-bold ${status.color}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <button onClick={handleSave} className="p-1.5 rounded-lg bg-emerald-50 text-[#0d631b] hover:bg-emerald-100 transition-colors" title="Save">
                            <span className="material-symbols-outlined text-lg">check</span>
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors" title="Cancel">
                            <span className="material-symbols-outlined text-lg">close</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="Edit">
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button onClick={() => handleDelete(item.id, item.name)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors" title="Remove">
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
