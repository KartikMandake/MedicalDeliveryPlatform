import { useEffect, useMemo, useState } from 'react';
import { getProductFilters } from '../../api/products';

export default function ProductsSidebar({ filters, onChange }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filtersError, setFiltersError] = useState('');
  const [brandQuery, setBrandQuery] = useState('');
  const [showPriceHint, setShowPriceHint] = useState(false);

  useEffect(() => {
    getProductFilters()
      .then((res) => {
        setFiltersError('');
        setCategories(res.data?.categories || []);
        setBrands((res.data?.brands || []).map((b) => b.name));
      })
      .catch(() => {
        setCategories([]);
        setBrands([]);
        setFiltersError('Filters are temporarily unavailable. Retrying...');
      });
  }, []);

  const filteredBrands = useMemo(
    () => brands.filter((brand) => brand.toLowerCase().includes(brandQuery.trim().toLowerCase())),
    [brands, brandQuery]
  );

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

  const renderCategoryIcon = (iconValue, name) => {
    if (!iconValue) {
      return <span className="material-symbols-outlined text-sm text-zinc-500">category</span>;
    }

    if (/^(https?:\/\/|\/)/i.test(iconValue)) {
      return <img src={iconValue} alt={name} className="w-3.5 h-3.5 object-contain" />;
    }

    return <span className="material-symbols-outlined text-sm text-zinc-500">{iconValue}</span>;
  };

  return (
    <aside className="hidden lg:block w-72 h-[calc(100vh-96px)] sticky top-20">
      <div className="h-full rounded-2xl border border-zinc-200 bg-white/95 shadow-sm px-4 py-4 overflow-hidden flex flex-col">
        <div className="mb-4 pb-3 border-b border-zinc-100">
          <h2 className="font-headline font-black text-green-700 text-base mb-1">Clinical Filters</h2>
          <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">Fast Selection Mode</p>
        </div>

        {filtersError && <p className="text-xs text-amber-700 mb-3">{filtersError}</p>}

        <div className="overflow-y-auto custom-scrollbar pr-1 space-y-6">
          <section className="rounded-xl border border-zinc-100 p-3 bg-zinc-50/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-headline font-bold text-sm text-on-surface">Brand Filter</h3>
              <span className="text-[11px] font-semibold text-zinc-400">{filteredBrands.length}</span>
            </div>
            <div className="relative mb-3">
              <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 text-base">search</span>
              <input
                value={brandQuery}
                onChange={(e) => setBrandQuery(e.target.value)}
                placeholder="Search brand"
                className="w-full h-9 rounded-lg border border-zinc-200 bg-white pl-8 pr-3 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
              {filteredBrands.map((brand) => (
                <label key={brand} className="flex items-center gap-2.5 group cursor-pointer">
                  <input
                    className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4"
                    type="checkbox"
                    checked={(filters.brands || []).includes(brand)}
                    onChange={() => toggleBrand(brand)}
                  />
                  <span className="text-sm text-zinc-600 group-hover:text-primary transition-colors truncate">{brand}</span>
                </label>
              ))}
              {!filteredBrands.length && <p className="text-xs text-zinc-400">No brands match</p>}
            </div>
          </section>

          <section className="rounded-xl border border-zinc-100 p-3 bg-zinc-50/30">
            <h3 className="font-headline font-bold text-sm text-on-surface mb-3">Categories</h3>
            <div className="space-y-2.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {categories.map((cat) => (
                <label key={cat.id || cat.name} className="flex items-center gap-2.5 group cursor-pointer">
                  <input
                    className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4"
                    type="checkbox"
                    checked={(filters.categories || []).includes(cat.name)}
                    onChange={() => toggleCategory(cat.name)}
                  />
                  {renderCategoryIcon(cat.iconUrl, cat.name)}
                  <span className="text-sm text-zinc-600 group-hover:text-primary transition-colors">
                    {cat.name}
                    <span className="ml-1 text-zinc-400">({cat.productCount || 0})</span>
                  </span>
                </label>
              ))}
              {!categories.length && <p className="text-xs text-zinc-400">No categories available</p>}
            </div>
          </section>

          <section className="rounded-xl border border-zinc-100 p-3 bg-zinc-50/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-headline font-bold text-sm text-on-surface">Price Range</h3>
              <span className="text-xs font-bold text-primary">Max ₹{filters.maxPrice || 1000}</span>
            </div>
            {showPriceHint && (
              <p className="text-[11px] text-zinc-500 mb-2">Release to set max price at ₹{filters.maxPrice || 1000}</p>
            )}
            <input
              className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
              max="1000"
              min="0"
              type="range"
              value={filters.maxPrice || 1000}
              title={`Set max price to ₹${filters.maxPrice || 1000}`}
              onMouseEnter={() => setShowPriceHint(true)}
              onMouseLeave={() => setShowPriceHint(false)}
              onFocus={() => setShowPriceHint(true)}
              onBlur={() => setShowPriceHint(false)}
              onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
            />
            <div className="flex justify-between mt-2 text-xs font-medium text-zinc-400">
              <span>₹0</span>
              <span>₹1000</span>
            </div>
          </section>

          <button className="w-full py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all">
            Upload Prescription
          </button>
        </div>
      </div>
    </aside>
  );
}
