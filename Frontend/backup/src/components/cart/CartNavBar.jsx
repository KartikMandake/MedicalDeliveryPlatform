import { Link } from 'react-router-dom';

export default function CartNavBar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center px-8 py-4 max-w-full mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-bold text-emerald-900 dark:text-emerald-100 font-headline tracking-tight">ClinicalCurator</Link>
          <div className="hidden md:flex gap-6">
            <Link className="text-slate-600 dark:text-slate-400 hover:text-emerald-700 font-['Manrope'] font-semibold tracking-tight transition-colors" to="/products">Categories</Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-emerald-700 font-['Manrope'] font-semibold tracking-tight transition-colors" to="/orders">Orders</Link>
            <Link className="text-slate-600 dark:text-slate-400 hover:text-emerald-700 font-['Manrope'] font-semibold tracking-tight transition-colors" to="/dashboard">Dashboard</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input className="pl-10 pr-4 py-2 bg-surface-container border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 w-64" placeholder="Search prescriptions..." type="text"/>
          </div>
          <button className="p-2 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-colors rounded-full relative">
            <span className="material-symbols-outlined text-emerald-800 dark:text-emerald-400" data-icon="notifications">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <Link to="/cart" className="p-2 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30 transition-colors rounded-full active:scale-95 duration-200">
            <span className="material-symbols-outlined text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-600 pb-1" data-icon="shopping_cart">shopping_cart</span>
          </Link>
          <img alt="Medical Provider Profile" className="w-10 h-10 rounded-full object-cover border-2 border-primary-fixed" data-alt="Professional medical provider headshot in clinical setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaBVQtMHK1YTZO9BMoaQy4RxV0k-Wwb14zIOEdVYQMF9emqPBZfaEqIjG3qXysou13QCHgQMB3ZOkB4Hs2XpZJDbWRW99GiZwJxk4_onQh4vemOTXK5NQY89uvZIg9t6BqAXKPkpGsHFgY01k_mKqq8C1WGjQ_8kf8nG63bgBjzCEDqXqLYwj1rI65-emR9RRzNMZ_etICeMVPJcaey3lIwWarC8oTQQFYGbjXMcvqOJm6pjYNeUzFUUDmEmwZ1xI1heRpwq9vGMlP"/>
        </div>
      </div>
    </nav>
  );
}
