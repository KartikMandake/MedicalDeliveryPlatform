export default function ProductsSidebar({ filters, onChange }) {
  const categories = ['Pain Relief', 'Antibiotics', 'Vitamins', 'Supplements', 'Diabetes Care', 'Heart Health'];
  const brands = ['Cipla', 'Sun Pharma', "Dr. Reddy's", 'Himalaya'];

  const toggleCategory = (cat) => {
    const current = filters.categories || [];
    const updated = current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat];
    onChange({ ...filters, categories: updated });
  };

  const toggleBrand = (brand) => {
    const current = filters.brands || [];
    const updated = current.includes(brand) ? current.filter((b) => b !== brand) : [...current, brand];
    onChange({ ...filters, brands: updated });
  };

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-xl p-6 tonal-card border border-slate-100">
        <h2 className="font-bold text-lg mb-6">Filters</h2>
        <div className="space-y-8">
          <div>
            <h3 className="font-bold text-sm mb-4">Category</h3>
            <div className="space-y-3 custom-scrollbar max-h-48 overflow-y-auto pr-2">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    className="w-4 h-4 rounded border-slate-300 text-[#2E7D32] focus:ring-[#2E7D32]"
                    type="checkbox"
                    checked={(filters.categories || []).includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  <span className="text-sm text-slate-600 group-hover:text-emerald-700">{cat}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-4">Price Range</h3>
            <input
              className="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-[#2E7D32]"
              max="1000" min="0" type="range"
              value={filters.maxPrice || 1000}
              onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
            />
            <div className="flex justify-between items-center mt-2 text-xs font-medium text-slate-500">
              <span>₹0</span>
              <span>₹{filters.maxPrice || 1000}</span>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-4">Brand</h3>
            <div className="space-y-3">
              {brands.map((brand) => (
                <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    className="w-4 h-4 rounded border-slate-300 text-[#2E7D32] focus:ring-[#2E7D32]"
                    type="checkbox"
                    checked={(filters.brands || []).includes(brand)}
                    onChange={() => toggleBrand(brand)}
                  />
                  <span className="text-sm text-slate-600 group-hover:text-emerald-700">{brand}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
