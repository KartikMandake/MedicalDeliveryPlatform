import { Link } from 'react-router-dom';

export default function CategoriesSection() {
  return (
    <section className="max-w-7xl mx-auto px-8">
      <div className="flex items-end justify-between mb-12">
        <div className="space-y-2">
          <h2 className="font-headline font-bold text-3xl">Shop by Category</h2>
          <p className="text-on-surface-variant">Find exactly what you need with precision categories</p>
        </div>
        <Link to="/products" className="text-primary font-bold flex items-center gap-1 hover:underline decoration-2 underline-offset-4">
          View All Categories <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Link to="/products?category=Fever" className="group bg-surface-container-lowest p-6 rounded-xl transition-all hover:-translate-y-2 hover:shadow-xl hover:bg-white cursor-pointer block">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
            <span className="material-symbols-outlined text-3xl">thermostat</span>
          </div>
          <p className="font-bold text-slate-800">Fever</p>
        </Link>
        <Link to="/products?category=Cold" className="group bg-surface-container-lowest p-6 rounded-xl transition-all hover:-translate-y-2 hover:shadow-xl hover:bg-white cursor-pointer block">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
            <span className="material-symbols-outlined text-3xl">coronavirus</span>
          </div>
          <p className="font-bold text-slate-800">Cold &amp; Cough</p>
        </Link>
        <Link to="/products?category=Pain" className="group bg-surface-container-lowest p-6 rounded-xl transition-all hover:-translate-y-2 hover:shadow-xl hover:bg-white cursor-pointer block">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
            <span className="material-symbols-outlined text-3xl">healing</span>
          </div>
          <p className="font-bold text-slate-800">Pain Relief</p>
        </Link>
        <Link to="/products?category=Diabetes" className="group bg-surface-container-lowest p-6 rounded-xl transition-all hover:-translate-y-2 hover:shadow-xl hover:bg-white cursor-pointer block">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
            <span className="material-symbols-outlined text-3xl">monitor_heart</span>
          </div>
          <p className="font-bold text-slate-800">Diabetes</p>
        </Link>
        <Link to="/products?category=Skin" className="group bg-surface-container-lowest p-6 rounded-xl transition-all hover:-translate-y-2 hover:shadow-xl hover:bg-white cursor-pointer block">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
            <span className="material-symbols-outlined text-3xl">face</span>
          </div>
          <p className="font-bold text-slate-800">Skin Care</p>
        </Link>
        <Link to="/products?category=Personal" className="group bg-surface-container-lowest p-6 rounded-xl transition-all hover:-translate-y-2 hover:shadow-xl hover:bg-white cursor-pointer block">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
            <span className="material-symbols-outlined text-3xl">clean_hands</span>
          </div>
          <p className="font-bold text-slate-800">Personal Care</p>
        </Link>
      </div>
    </section>
  );
}
