export default function FeaturesSection() {
  return (
    <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-primary text-on-primary p-8 rounded-2xl flex flex-col justify-between aspect-square md:aspect-auto">
        <span className="material-symbols-outlined text-5xl">airport_shuttle</span>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Fast Delivery</h3>
          <p className="text-primary-fixed/80">Average delivery time is under 45 minutes across all city zones.</p>
        </div>
      </div>
      <div className="bg-surface-container-high p-8 rounded-2xl flex flex-col justify-between">
        <span className="material-symbols-outlined text-5xl text-emerald-800">verified_user</span>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Verified Pharmacies</h3>
          <p className="text-on-surface-variant">Every partner is licensed and audited for medicinal quality standards.</p>
        </div>
      </div>
      <div className="bg-tertiary-container text-on-tertiary-container p-8 rounded-2xl flex flex-col justify-between">
        <span className="material-symbols-outlined text-5xl">support_agent</span>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">24/7 Care</h3>
          <p className="text-on-tertiary-container/80">Expert pharmacists available for consultation at any time of day.</p>
        </div>
      </div>
    </section>
  );
}
