import { Link } from 'react-router-dom';
import ProductsNavBar from '../components/products/ProductsNavBar';
import ProductsFooter from '../components/products/ProductsFooter';

export default function HelpPage() {
  return (
    <div className="bg-background fixed inset-0 overflow-y-auto overflow-x-hidden text-on-surface font-body">
      <ProductsNavBar />

      <main className="pt-24 pb-28 px-6 max-w-6xl mx-auto w-full">
        <header className="mb-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Support Desk</span>
          <h1 className="mt-2 text-3xl md:text-4xl font-headline font-extrabold tracking-tight">Help Center</h1>
          <p className="mt-2 text-sm text-on-surface-variant max-w-2xl">
            Get assistance for orders, prescriptions, payments, and account access.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-headline font-bold">Order Tracking Support</h2>
            <p className="mt-2 text-sm text-zinc-600">Need an update on delivery progress or assigned rider status?</p>
            <Link to="/orders" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              Open Order History
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </article>

          <article className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-headline font-bold">Prescription Assistance</h2>
            <p className="mt-2 text-sm text-zinc-600">Need help with upload, extraction, or medicine matching?</p>
            <Link to="/upload" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              Open Upload Portal
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </article>
        </div>
      </main>

      <ProductsFooter />
    </div>
  );
}
