import CartNavBar from '../components/cart/CartNavBar';
import { Link } from 'react-router-dom';
import CartFooter from '../components/cart/CartFooter';
import CartFloatingActions from '../components/cart/CartFloatingActions';
import { DEMO_PRODUCTS } from '../lib/constants';

export default function HomePage() {
  const featured = DEMO_PRODUCTS.slice(0, 3);

  return (
    <div className="bg-background font-body text-on-background min-h-screen">
      <CartNavBar />
      <main className="pt-24 pb-24 px-6 max-w-screen-2xl mx-auto space-y-14">
        <header className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold font-headline tracking-tight text-zinc-900">Good Evening</h1>
          <p className="text-zinc-500 text-sm md:text-base">Your AI-monitored health hub is up to date.</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-7 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold tracking-widest uppercase font-label">
              <span className="material-symbols-outlined text-sm">bolt</span>
              Ultra Fast Clinical Delivery
            </span>
            <div className="space-y-3">
              <h2 className="text-4xl lg:text-5xl font-black font-headline leading-[1.08] text-zinc-900">
                24/7 Medicine Delivery in
                <span className="text-primary italic"> Minutes</span>
              </h2>
              <p className="text-zinc-500 max-w-xl leading-relaxed">
                Access prescriptions and wellness essentials with predictive stock visibility and reliable doorstep delivery.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                to="/upload"
              >
                Upload Prescription
              </Link>
              <Link
                className="px-6 py-3 bg-surface-container-high text-on-surface rounded-full font-bold hover:bg-surface-container-highest transition-all"
                to="/products"
              >
                Browse Medicines
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-primary/5 rounded-[2rem] blur-3xl" />
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl">
              <img
                alt="Medical workflow"
                className="w-full h-[300px] md:h-[360px] object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrKwKcXq93bEhIE1eA87-dxEiPHMrri6j_Pfv9ZBnfQKzNrRbyIQ_k3BTUdauiHgnSDCXDb1wN82YJJjjiIyzfT0yxgUiTpGcooG5mgj33b5TYIo8JeBRkcG_0Sv7b9O-_mxImrLeldFiLcprWl8OVx93MHbMJNMSL79mzNzyI-6BRP65FV-oFa-hXbcMcOE5ghVSeZc3u73jcqGg_UOZwDia_uMX-qQntMNNLY5bCpMZOuns8aNRrq9u4JlHxu-eHgKTX77MfNK0h"
              />
              <div className="absolute top-5 right-5 px-3 py-2 bg-white/90 backdrop-blur rounded-xl shadow-lg flex items-center gap-2 border border-white">
                <span className="material-symbols-outlined text-primary text-lg">verified</span>
                <span className="text-xs font-bold text-zinc-900">Verified Medicines</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: 'prescriptions', title: 'Upload Prescription', subtitle: 'AI verification' },
            { icon: 'e911_emergency', title: 'Emergency Order', subtitle: 'Priority dispatch' },
            { icon: 'history', title: 'Reorder Medicines', subtitle: 'From order history' },
            { icon: 'near_me', title: 'Nearby Pharmacies', subtitle: 'Live stock view' },
          ].map((item) => (
            <div key={item.title} className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group">
              <div className="w-11 h-11 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <h3 className="font-bold text-zinc-900 font-headline text-sm md:text-base">{item.title}</h3>
              <p className="text-[11px] text-zinc-400 mt-1">{item.subtitle}</p>
            </div>
          ))}
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black font-headline text-zinc-900">Health Alerts in Your Area</h2>
            <Link className="text-primary text-sm font-bold hover:underline" to="/tracking">View Local Map</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: 'Dengue Alert', detail: 'High risk in Sector 42', tone: 'border-error', icon: 'warning' },
              { title: 'Flu Season', detail: 'Moderate activity detected', tone: 'border-amber-400', icon: 'thermometer' },
              { title: 'Allergy Warning', detail: 'High pollen count today', tone: 'border-primary', icon: 'eco' },
            ].map((alert) => (
              <article key={alert.title} className={`p-5 rounded-2xl border-l-4 ${alert.tone} bg-gradient-to-br from-white to-primary/5 shadow-sm`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-zinc-900 font-headline">{alert.title}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{alert.detail}</p>
                  </div>
                  <span className="material-symbols-outlined text-zinc-500">{alert.icon}</span>
                </div>
                <button className="w-full mt-4 py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-primary transition-colors">
                  Add Essentials to Cart
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black font-headline text-zinc-900">Recommended Medicines</h2>
            <Link className="text-primary text-sm font-bold hover:underline" to="/products">See All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {featured.map((item) => (
              <article key={item.id} className="group bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
                <div className="relative h-44 rounded-xl overflow-hidden mb-4">
                  <img alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={item.image} />
                  {item.requiresRx && <span className="absolute top-3 right-3 px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-[10px] font-bold uppercase">RX Required</span>}
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-label">{item.manufacturer}</span>
                <h3 className="text-lg font-bold text-zinc-900 font-headline mb-1 group-hover:text-primary transition-colors">{item.name}</h3>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100">
                  <span className="text-lg font-black text-zinc-900">${Number(item.price).toFixed(2)}</span>
                  <Link className="w-10 h-10 bg-zinc-900 text-white rounded-full flex items-center justify-center hover:bg-primary transition-colors" to="/products">
                    <span className="material-symbols-outlined">add</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <CartFooter />
      <CartFloatingActions />
    </div>
  );
}
