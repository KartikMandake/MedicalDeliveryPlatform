import { Link } from 'react-router-dom';

export default function ProductsGrid() {
  return (
    <div className="flex-1">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">Showing <span className="font-bold text-slate-900">1-12</span> of 240 results</p>
        <div className="flex items-center gap-4">
          <select className="text-sm font-semibold border-none bg-transparent focus:ring-0 cursor-pointer">
            <option>Most Popular</option>
            <option>Newest first</option>
          </select>
          <div className="flex gap-1">
            <button className="p-1.5 bg-emerald-50 text-[#2E7D32] rounded border border-emerald-100">
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
            </button>
            <button className="p-1.5 text-slate-400 hover:text-[#2E7D32] transition-colors">
              <span className="material-symbols-outlined text-[20px]">view_list</span>
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Product Card 1 */}
        <Link to="/product" className="group bg-white rounded-2xl overflow-hidden border border-slate-100 tonal-card flex flex-col transition-all duration-300 hover:shadow-xl">
          <div className="relative aspect-[4/3] product-image-container overflow-hidden">
            <img className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500" data-alt="Omeprazole medicine" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtAr2G6oLMC24sWFObYW5Z0r8NvZIQYtxqyoK5ylKgUQrK4gqatRhLrM9sw4ETuaSVuHAidjmjs1t7VJf5wcOKQ8azDqrc-vXBLyygj7_fjxtyMUUaUGW4nIj1W9chSRZxDgdcaK6vqLLBPdmdFm7RsPRqzvXABDozNMantY8gCc0gqXk7Jul9ztB9Ql76Z48wlBzGyiePgMk6NKLb5nbcPUtHrBkfYGbocnw4W3P6XA7_o6dS-Jzof4AD8Wy8UNrBZduq903oFgPS"/>
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dr. Reddy's</span>
            <h3 className="font-bold text-base text-slate-900 mb-1">Omeprazole 20mg</h3>
            <p className="text-xs text-slate-500 line-clamp-2 mb-3">Reduces stomach acid for heartburn and ulcer relief...</p>
            <div className="flex items-center gap-1 mb-4">
              <span className="material-symbols-outlined text-yellow-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="text-xs font-bold text-slate-900">4.6</span>
              <span className="text-xs text-slate-400">(345)</span>
            </div>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-xl font-extrabold text-[#2E7D32]">₹95</span>
              <button className="w-10 h-10 bg-[#00c2a7] text-white rounded-lg flex items-center justify-center hover:bg-[#00a891] transition-colors shadow-lg shadow-emerald-100">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>
          </div>
        </Link>

        {/* Product Card 2 (Rx Required) */}
        <Link to="/product" className="group bg-white rounded-2xl overflow-hidden border border-slate-100 tonal-card flex flex-col transition-all duration-300 hover:shadow-xl">
          <div className="relative aspect-[4/3] product-image-container overflow-hidden">
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Rx Required</span>
            </div>
            <img className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500" data-alt="Metformin medicine" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz0qdTEeItjdMoLgnJHEMFew2huXz8pnH3iJUdn8zD61DaMXveZFd1yvGx2510RbZ2lyiTL19QEu_lm7E77pIn8HPKCTdDZbLItANxdN_nR9yMBomYapI3VsnrdN4ovz9Njkq0zlsUpixE6V18x5D1UQbruOA4F5jWGEYmqdHH8eEV0zdlmwlyDUMU0ymdr3_gQq3tBLgDMgUr5c9VbnzxOaRV_j9y66DN2iHmcJhqXEtCPPN3BFjMlLKmE4doReut8MHPicw9w1I_"/>
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sun Pharma</span>
            <h3 className="font-bold text-base text-slate-900 mb-1">Metformin 500mg</h3>
            <p className="text-xs text-slate-500 line-clamp-2 mb-3">Diabetes medication to control blood sugar levels.</p>
            <div className="flex items-center gap-1 mb-4">
              <span className="material-symbols-outlined text-yellow-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="text-xs font-bold text-slate-900">4.7</span>
              <span className="text-xs text-slate-400">(678)</span>
            </div>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-xl font-extrabold text-[#2E7D32]">₹125</span>
              <button className="w-10 h-10 bg-[#00c2a7] text-white rounded-lg flex items-center justify-center hover:bg-[#00a891] transition-colors shadow-lg shadow-emerald-100">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>
          </div>
        </Link>

        {/* Product Card 3 (Out of Stock) */}
        <Link to="/product" className="group bg-white rounded-2xl overflow-hidden border border-slate-100 tonal-card flex flex-col transition-all duration-300 hover:shadow-xl opacity-90">
          <div className="relative aspect-[4/3] product-image-container overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 z-10 flex items-center justify-center">
              <span className="bg-white/90 text-slate-900 font-bold px-4 py-2 rounded-lg text-sm shadow-xl">Out of Stock</span>
            </div>
            <div className="absolute top-3 left-3 z-20">
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Rx Required</span>
            </div>
            <img className="w-full h-full object-contain p-6" data-alt="Amoxicillin medicine" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQOMoYtylNo1sYfLjTeMTAF-70GPB-Y_ckmHROrHhcCVw1ehgmBlWzs24wbYaXNtZJRsW_GnxGjrzqSIgzCtauK4xzPacf4ZrdW8wsXcL8xVeAW0YEz8zT9C2roCnm3XUjdEAXvngz2F_7WHDGBnjbd6xhaCHRqHsKKUEBxaONumly_NLDOEhkTfXqgZvxrHrbpkAHIpZU3qB2umvitag1YhyKDnY1tHgILTKKoKxk0m-koyTUnFobaOSLZIEbd1PSvFW4I-EXOZBb"/>
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dr. Reddy's</span>
            <h3 className="font-bold text-base text-slate-900 mb-1">Amoxicillin 500mg</h3>
            <p className="text-xs text-slate-500 line-clamp-2 mb-3">Broad-spectrum antibiotic for various infections.</p>
            <div className="flex items-center gap-1 mb-4">
              <span className="material-symbols-outlined text-yellow-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="text-xs font-bold text-slate-900">4.5</span>
              <span className="text-xs text-slate-400">(289)</span>
            </div>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-xl font-extrabold text-[#2E7D32]">₹165</span>
              <button className="w-10 h-10 bg-emerald-100 text-emerald-400 rounded-lg flex items-center justify-center cursor-not-allowed">
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>
          </div>
        </Link>

        {/* Additional Grid Items Skeletons */}
        <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 tonal-card flex flex-col transition-all duration-300">
          <div className="relative aspect-[4/3] product-image-container flex items-center justify-center p-8">
            <div className="w-full h-full bg-slate-50 rounded animate-pulse"></div>
          </div>
          <div className="p-5 space-y-3">
            <div className="h-2 w-16 bg-slate-100 rounded"></div>
            <div className="h-4 w-40 bg-slate-100 rounded"></div>
            <div className="h-3 w-full bg-slate-50 rounded"></div>
            <div className="flex justify-between items-center pt-4">
              <div className="h-6 w-16 bg-emerald-50 rounded"></div>
              <div className="h-10 w-10 bg-slate-50 rounded-lg"></div>
            </div>
          </div>
        </div>
        <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 tonal-card flex flex-col transition-all duration-300">
          <div className="relative aspect-[4/3] product-image-container flex items-center justify-center p-8">
            <div className="w-full h-full bg-slate-50 rounded animate-pulse"></div>
          </div>
          <div className="p-5 space-y-3">
            <div className="h-2 w-16 bg-slate-100 rounded"></div>
            <div className="h-4 w-40 bg-slate-100 rounded"></div>
            <div className="h-3 w-full bg-slate-50 rounded"></div>
            <div className="flex justify-between items-center pt-4">
              <div className="h-6 w-16 bg-emerald-50 rounded"></div>
              <div className="h-10 w-10 bg-slate-50 rounded-lg"></div>
            </div>
          </div>
        </div>
        <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 tonal-card flex flex-col transition-all duration-300">
          <div className="relative aspect-[4/3] product-image-container flex items-center justify-center p-8">
            <div className="w-full h-full bg-slate-50 rounded animate-pulse"></div>
          </div>
          <div className="p-5 space-y-3">
            <div className="h-2 w-16 bg-slate-100 rounded"></div>
            <div className="h-4 w-40 bg-slate-100 rounded"></div>
            <div className="h-3 w-full bg-slate-50 rounded"></div>
            <div className="flex justify-between items-center pt-4">
              <div className="h-6 w-16 bg-emerald-50 rounded"></div>
              <div className="h-10 w-10 bg-slate-50 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
