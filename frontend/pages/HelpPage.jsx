import { Link } from 'react-router-dom';
import ProductsNavBar from '../components/products/ProductsNavBar';
import ProductsFooter from '../components/products/ProductsFooter';

const FAQ_ITEMS = [
  { q: 'How do I track my delivery?', a: 'Go to the Orders page, find your active order, and click "Track". You\'ll see real-time GPS location and ETA.', icon: 'local_shipping' },
  { q: 'Can I cancel an order after placing it?', a: 'You can cancel before it is picked up by the delivery agent. Once it\'s in transit, cancellation is not possible.', icon: 'cancel' },
  { q: 'How does prescription upload work?', a: 'Upload a photo or scanned PDF of your prescription. Our AI will extract medicine names and match them to available inventory.', icon: 'description' },
  { q: 'What payment methods are supported?', a: 'We currently support Cash on Delivery (COD). Online payment options are coming soon.', icon: 'payments' },
  { q: 'How do I reorder a previous order?', a: 'Visit Order History, find the completed order, and click "Reorder". All items will be added to your cart.', icon: 'replay' },
  { q: 'My order is delayed. What should I do?', a: 'Check the tracking page for live updates. If significantly delayed, contact the delivery agent directly through the tracking screen.', icon: 'schedule' },
];

export default function HelpPage() {
  return (
    <div className="bg-[#f8f9fa] fixed inset-0 overflow-y-auto overflow-x-hidden text-slate-900 font-body">
      <ProductsNavBar />

      <main className="pt-24 pb-28 px-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <header className="mb-12 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-3 block">Support Center</span>
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-slate-900 mb-3">How can we help?</h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Browse quick links, frequently asked questions, and contact options below.
          </p>
        </header>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {[
            { title: 'Track your order', desc: 'See real-time delivery status, GPS location, and estimated arrival.', icon: 'location_on', link: '/orders', linkLabel: 'Go to Orders', color: 'text-emerald-600 bg-emerald-50' },
            { title: 'Upload prescription', desc: 'Upload a photo or PDF — our AI extracts medicines automatically.', icon: 'clinical_notes', link: '/upload', linkLabel: 'Open Upload', color: 'text-sky-600 bg-sky-50' },
            { title: 'Browse products', desc: 'Explore medicines, health essentials, and e-commerce products.', icon: 'grid_view', link: '/products', linkLabel: 'Browse Catalog', color: 'text-indigo-600 bg-indigo-50' },
          ].map((card) => (
            <article key={card.title} className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md hover:border-emerald-200/50 transition-all group">
              <span className={`material-symbols-outlined ${card.color} p-2.5 rounded-xl text-[22px] mb-4 inline-block`} style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
              <h2 className="text-base font-extrabold font-headline text-slate-900 mb-1">{card.title}</h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{card.desc}</p>
              <Link to={card.link} className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
                {card.linkLabel} <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </Link>
            </article>
          ))}
        </div>

        {/* FAQ Section */}
        <section className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-slate-500 text-[20px]">help</span>
            <h2 className="text-xl font-extrabold font-headline text-slate-900">Frequently Asked Questions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQ_ITEMS.map((faq) => (
              <details key={faq.q} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm group open:shadow-md open:border-emerald-200/50 transition-all">
                <summary className="p-5 cursor-pointer flex items-center gap-3 list-none select-none [&::-webkit-details-marker]:hidden">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px] shrink-0">{faq.icon}</span>
                  <span className="text-sm font-bold text-slate-800 flex-1">{faq.q}</span>
                  <span className="material-symbols-outlined text-slate-400 text-[18px] transition-transform group-open:rotate-180 shrink-0">expand_more</span>
                </summary>
                <div className="px-5 pb-5 pt-0">
                  <p className="text-xs text-slate-600 leading-relaxed pl-[30px]">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 blur-[50px] rounded-full pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">Need More Help?</p>
              <h3 className="text-xl font-extrabold font-headline">Contact MediFlow Support</h3>
              <p className="text-sm text-slate-400 mt-1">Our support team is available Mon-Sat, 9 AM to 8 PM IST.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <a href="mailto:support@mediflow.in" className="px-5 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-extrabold flex items-center gap-2 hover:bg-emerald-50 transition-colors">
                <span className="material-symbols-outlined text-[16px]">mail</span> Email Us
              </a>
              <a href="tel:+911234567890" className="px-5 py-2.5 bg-emerald-500 text-slate-900 rounded-xl text-xs font-extrabold flex items-center gap-2 hover:bg-emerald-400 transition-colors">
                <span className="material-symbols-outlined text-[16px]">call</span> Call Support
              </a>
            </div>
          </div>
        </section>
      </main>

      <ProductsFooter />
    </div>
  );
}
