import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-8 grid grid-cols-12 gap-8 items-center">
      <div className="col-span-12 lg:col-span-6 space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-fixed rounded-full text-on-primary-fixed-variant text-xs font-bold uppercase tracking-wider">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          Fastest Delivery in Town
        </div>
        <h1 className="font-headline font-extrabold text-5xl lg:text-7xl text-on-surface leading-[1.1] tracking-tight">
          24/7 Medicine <br/><span className="text-primary">Delivery</span> in Minutes
        </h1>
        <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed">
          Surgical precision in every parcel. Upload your prescription or browse our extensive pharmacy catalog for instant fulfillment.
        </p>
        <div className="flex flex-wrap gap-4 pt-4">
          <Link to="/upload" className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined">upload_file</span>
            Upload Prescription
          </Link>
          <Link to="/products" className="bg-surface-container-highest text-on-surface px-8 py-4 rounded-xl font-bold transition-transform active:scale-95 flex items-center justify-center">
            Order Medicines
          </Link>
        </div>
      </div>
      <div className="col-span-12 lg:col-span-6 relative">
        <div className="aspect-square rounded-[2rem] overflow-hidden bg-surface-container shadow-2xl relative">
          <img alt="Medical professional with delivery package" className="w-full h-full object-cover" data-alt="Professional pharmacist holding a medical delivery box" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-Jh7Bc6Y3QWQiPBBMlTIEC085xSOKguVhfRh-GW2DWmc7D19fHjbQxQ9ZnViupjCd8CIBvYSAKTIndbp9sB9S-1fjrl07Vc6wkegJVnhAJoLYlP2XXmwnUMEUFfGOrjqw-L9PCwit9w5SVuvGJJdMhcxO3n1Tt-kh5QvK9VSHoJgK4i3BxRaydi1hxvIYvZkR3ODWS5cFJwIK2Fa6mjMibQcteTRarr1HuU2-G3MF4_I6uBT2OJxlwncdxrwvAwVxIxmj_6P42a5Q"/>
          <div className="absolute bottom-6 left-6 right-6 glass-header p-6 rounded-2xl border border-white/20 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <div>
                <p className="font-bold text-on-surface">Verified Pharmacies</p>
                <p className="text-sm text-on-surface-variant">100% genuine medical supplies only</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
