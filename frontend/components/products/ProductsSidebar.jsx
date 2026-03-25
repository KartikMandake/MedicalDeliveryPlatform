import { useEffect, useMemo, useState } from 'react';
import { getProductFilters } from '../../api/products';

export default function ProductsSidebar({ filters, onChange }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filtersError, setFiltersError] = useState('');
  const [brandQuery, setBrandQuery] = useState('');

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
    if (!iconValue) return <span className="material-symbols-outlined text-[16px] text-emerald-500">category</span>;
    if (/^(https?:\/\/|\/)/i.test(iconValue)) return <img src={iconValue} alt={name} className="w-4 h-4 object-contain" />;
    return <span className="material-symbols-outlined text-[16px] text-emerald-500">{iconValue}</span>;
  };

  return (
    <aside className="hidden lg:block w-[300px] h-[calc(100vh-120px)] sticky top-28 shrink-0">
      <div className="h-full rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/20 px-5 py-6 overflow-hidden flex flex-col">
        <div className="mb-6 pb-4 border-b border-slate-100">
          <h2 className="font-headline font-extrabold text-slate-900 text-2xl tracking-tight mb-1">Filters</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Refine your catalog</p>
        </div>

        {/* Ecom vs Medicine Toggle */}
        <div className="bg-slate-50 p-1.5 rounded-xl flex items-center mb-6 border border-slate-100/60 shadow-inner shrink-0">
          <button 
            type="button"
            onClick={() => onChange({ ...filters, productType: 'all' })}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${filters.productType === 'all' || !filters.productType ? 'bg-white text-slate-800 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All
          </button>
          <button 
            type="button"
            onClick={() => onChange({ ...filters, productType: 'medicine' })}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${filters.productType === 'medicine' ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <span className="material-symbols-outlined text-[14px]">prescriptions</span>
            Meds
          </button>
          <button 
            type="button"
            onClick={() => onChange({ ...filters, productType: 'ecom' })}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${filters.productType === 'ecom' ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <span className="material-symbols-outlined text-[14px]">local_mall</span>
            E-Com
          </button>
        </div>

        {filtersError && (
          <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            {filtersError}
          </div>
        )}

        <div className="overflow-y-auto custom-scrollbar pr-2 space-y-8 flex-1">
          {/* Categories Section */}
          <section>
            <h3 className="font-headline font-bold text-sm text-slate-900 mb-4 flex items-center justify-between">
              Categories
              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{categories.length}</span>
            </h3>
            <div className="max-h-56 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-1.5">
              {categories.map((cat) => {
                const isSelected = (filters.categories || []).includes(cat.name);
                return (
                  <label 
                    key={cat.id || cat.name} 
                    className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all duration-200 ${isSelected ? 'bg-emerald-50 border border-emerald-100/50' : 'hover:bg-slate-50 border border-transparent'}`}
                  >
                    <div className="relative flex items-center justify-center">
                      <input
                        className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded cursor-pointer checked:border-emerald-500 checked:bg-emerald-500 transition-colors"
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCategory(cat.name)}
                      />
                      <span className="material-symbols-outlined absolute text-white text-[12px] opacity-0 peer-checked:opacity-100 pointer-events-none" style={{ fontWeight: 900 }}>check</span>
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${isSelected ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                        {renderCategoryIcon(cat.iconUrl, cat.name)}
                      </div>
                      <span className={`text-sm truncate transition-colors ${isSelected ? 'font-bold text-emerald-800' : 'font-medium text-slate-600'}`}>
                        {cat.name}
                      </span>
                    </div>
                  </label>
                );
              })}
              {!categories.length && !filtersError && <p className="text-xs text-slate-400 italic pl-1">No categories available</p>}
            </div>
          </section>

          {/* Brands Section */}
          <section>
            <h3 className="font-headline font-bold text-sm text-slate-900 mb-3 flex items-center justify-between">
              Brands
              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{filteredBrands.length}</span>
            </h3>
            <div className="relative mb-3 group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] group-focus-within:text-emerald-500 transition-colors">search</span>
              <input
                value={brandQuery}
                onChange={(e) => setBrandQuery(e.target.value)}
                placeholder="Search brands..."
                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="max-h-52 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-1.5">
              {filteredBrands.map((brand) => {
                const isSelected = (filters.brands || []).includes(brand);
                return (
                  <label key={brand} className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all duration-200 ${isSelected ? 'bg-indigo-50 border border-indigo-100/50' : 'hover:bg-slate-50 border border-transparent'}`}>
                    <div className="relative flex items-center justify-center">
                      <input
                        className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded cursor-pointer checked:border-indigo-500 checked:bg-indigo-500 transition-colors"
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleBrand(brand)}
                      />
                      <span className="material-symbols-outlined absolute text-white text-[12px] opacity-0 peer-checked:opacity-100 pointer-events-none" style={{ fontWeight: 900 }}>check</span>
                    </div>
                    <span className={`text-sm truncate transition-colors ${isSelected ? 'font-bold text-indigo-800' : 'font-medium text-slate-600'}`}>
                      {brand}
                    </span>
                  </label>
                );
              })}
              {!filteredBrands.length && <p className="text-xs text-slate-400 italic pl-1">No brands found</p>}
            </div>
          </section>

          {/* Price Range Section */}
          <section className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline font-bold text-sm text-slate-900">Max Price</h3>
              <div className="bg-white border border-slate-200 px-2 py-1 rounded-lg text-xs font-black text-slate-800 shadow-sm">
                ₹{filters.maxPrice || 1000}
              </div>
            </div>
            <input
              className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all"
              max="1000"
              min="0"
              type="range"
              value={filters.maxPrice || 1000}
              onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
            />
            <div className="flex justify-between mt-3 text-[10px] font-black tracking-widest text-slate-400 uppercase">
              <span>₹0</span>
              <span>₹1000+</span>
            </div>
          </section>
        </div>
      </div>
    </aside>
  );
}
