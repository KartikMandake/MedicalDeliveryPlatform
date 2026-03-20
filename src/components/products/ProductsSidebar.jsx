export default function ProductsSidebar() {
  return (
    <aside className="hidden lg:block w-72 h-[calc(100vh-120px)] sticky top-24 overflow-y-auto custom-scrollbar pr-4 flex-shrink-0">
      <div className="space-y-8">
        <div>
          <h2 className="font-headline font-extrabold text-green-700 text-lg mb-2">Clinical Portal</h2>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">AI-Powered Inventory</p>
        </div>

        <section>
          <h3 className="font-headline font-bold text-sm text-on-surface mb-4">Categories</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 group cursor-pointer">
              <input className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4" type="checkbox" />
              <span className="text-sm text-zinc-600 group-hover:text-primary transition-colors">Pain Relief</span>
            </label>
            <label className="flex items-center gap-3 group cursor-pointer">
              <input checked className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4" type="checkbox" />
              <span className="text-sm text-zinc-600 group-hover:text-primary transition-colors">Diabetes</span>
            </label>
            <label className="flex items-center gap-3 group cursor-pointer">
              <input className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4" type="checkbox" />
              <span className="text-sm text-zinc-600 group-hover:text-primary transition-colors">Vitamins</span>
            </label>
            <label className="flex items-center gap-3 group cursor-pointer">
              <input className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4" type="checkbox" />
              <span className="text-sm text-zinc-600 group-hover:text-primary transition-colors">Heart Care</span>
            </label>
          </div>
        </section>

        <section>
          <h3 className="font-headline font-bold text-sm text-on-surface mb-4">Price Range</h3>
          <input className="w-full h-1.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary" type="range" />
          <div className="flex justify-between mt-2 text-xs font-medium text-zinc-400">
            <span>$0</span>
            <span>$500+</span>
          </div>
        </section>

        <section>
          <h3 className="font-headline font-bold text-sm text-on-surface mb-4">Brand Filter</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 group cursor-pointer">
              <input className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4" type="checkbox" />
              <span className="text-sm text-zinc-600 group-hover:text-primary transition-colors">Cipla</span>
            </label>
            <label className="flex items-center gap-3 group cursor-pointer">
              <input className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4" type="checkbox" />
              <span className="text-sm text-zinc-600 group-hover:text-primary transition-colors">Sun Pharma</span>
            </label>
            <label className="flex items-center gap-3 group cursor-pointer">
              <input className="rounded border-outline-variant text-primary focus:ring-primary w-5 h-5" type="checkbox" />
              <span className="text-sm text-zinc-600 group-hover:text-primary transition-colors">Dr. Reddy's</span>
            </label>
          </div>
        </section>

        <section className="p-4 rounded-xl bg-surface-container-low">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-on-surface">In Stock only</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input checked className="sr-only peer" type="checkbox" value="" />
              <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>
        </section>

        <button className="w-full py-3.5 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-headline font-semibold text-sm shadow-lg shadow-primary/15 hover:scale-[1.01] active:scale-95 transition-all">
          Upload Prescription
        </button>
      </div>
    </aside>
  );
}
