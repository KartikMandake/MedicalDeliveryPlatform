export default function ProductsSection() {
  return (
    <section className="max-w-7xl mx-auto px-8">
      <div className="flex items-center justify-between mb-12">
        <h2 className="font-headline font-bold text-3xl">Essential Medicines</h2>
        <div className="flex gap-2">
          <button className="p-2 border border-outline-variant rounded-full hover:bg-white transition-all"><span className="material-symbols-outlined">chevron_left</span></button>
          <button className="p-2 border border-outline-variant rounded-full hover:bg-white transition-all"><span className="material-symbols-outlined">chevron_right</span></button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white rounded-2xl p-4 tonal-lift border border-outline-variant/5">
          <div className="aspect-square rounded-xl bg-surface-container mb-4 overflow-hidden">
            <img alt="Medicine package" className="w-full h-full object-cover" data-alt="Blue and white medicine pill box package" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDM7r0k1wd_WTmNORlJbTD54_Siqgskbyu5Cxjk3Z4y1ieYGP_ksC-YMxuEtzGliGqVTHudgs08DMSLQiiu9RREMJO3b2r-NtolYV66OiqFvF68z3cTcOJ7nQuMB1DTCBJZUu-PbyfUjFsr2bVtIjU48aK_aiQuW8VlDkljsbnxWpGVFDeuyNHQQRIVjBWyKFRuODXRNZfQ9fphN679XPg8lWHmYETe7AJpKXGf6JTh1Xjn9rV6twcBr6QC9MzhjR_LZBkCgwCz7DbZ"/>
          </div>
          <div className="inline-block px-2 py-0.5 bg-tertiary-fixed-dim text-on-tertiary-fixed text-[10px] font-bold rounded uppercase mb-2">Pain Relief</div>
          <h4 className="font-bold text-lg mb-1">Advanced Ibuprofen</h4>
          <p className="text-sm text-on-surface-variant mb-4">400mg • 20 Capsules</p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-xl">$12.50</span>
            <button className="bg-primary-container text-on-primary-container p-2 rounded-lg hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-xl">add_shopping_cart</span>
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 tonal-lift border border-outline-variant/5">
          <div className="aspect-square rounded-xl bg-surface-container mb-4 overflow-hidden">
            <img alt="Vitamins" className="w-full h-full object-cover" data-alt="Glass bottle of yellow multivitamin supplements" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFooZ30voDkfXZBJj6xiJkuia22LJlzxmzVxLtAK0qBa3xmqnB6Z4dGfeeHmdY5svw-gUth6oIHIbi_3RZl41hNLvlLNARvXGB_DbcuCrTBuIklVVgZS4iVsqT5ZFtlijYj-YMP4bxE2yuUpXOdKwsrK_I3UUeJogJY3gQ_tpYtYkhTDLJ2pTUJSn7AsxVDG5UpGIA5FMS1OSTzH4k2Ds0vijkV4jdPbP9UgaKPSDwSWnpdazXOQUPla17j6GPSZx2acoOaq9met0Q"/>
          </div>
          <div className="inline-block px-2 py-0.5 bg-tertiary-fixed-dim text-on-tertiary-fixed text-[10px] font-bold rounded uppercase mb-2">Supplements</div>
          <h4 className="font-bold text-lg mb-1">Vitamin C Complex</h4>
          <p className="text-sm text-on-surface-variant mb-4">1000mg • 60 Tablets</p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-xl">$18.99</span>
            <button className="bg-primary-container text-on-primary-container p-2 rounded-lg hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-xl">add_shopping_cart</span>
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 tonal-lift border border-outline-variant/5">
          <div className="aspect-square rounded-xl bg-surface-container mb-4 overflow-hidden">
            <img alt="Ointment" className="w-full h-full object-cover" data-alt="Tube of medicinal skin care ointment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlcBJAG7dzUw6cKwm7EwOcMnUPr0VYbv47F4dKR2ghCHKt0tRyXwmhugBAU01NLwwmxjB3OfEqkRzwx96TvKPbcuylBq0uIwfecIp5IrVQCvU-y1ZGoCLLM6KbtgZhj03Gl1SVpsrSf8HvHEkZPrGn8NCbofNxL-KmeUPLKcKvZN0taKqTNfX75RKvmBtVjFCh-OXjvUXG-pa-Gws9210ldL4izyX6_4AXHS2DzyzaxWhrlQnZ684ofBQC2kZtZh0lAJ9CHhmrq0Z3"/>
          </div>
          <div className="inline-block px-2 py-0.5 bg-tertiary-fixed-dim text-on-tertiary-fixed text-[10px] font-bold rounded uppercase mb-2">Skin Care</div>
          <h4 className="font-bold text-lg mb-1">Healing Ointment</h4>
          <p className="text-sm text-on-surface-variant mb-4">50g Tube • Antiseptic</p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-xl">$9.25</span>
            <button className="bg-primary-container text-on-primary-container p-2 rounded-lg hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-xl">add_shopping_cart</span>
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 tonal-lift border border-outline-variant/5">
          <div className="aspect-square rounded-xl bg-surface-container mb-4 overflow-hidden">
            <img alt="Thermometer" className="w-full h-full object-cover" data-alt="Digital infrared medical thermometer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNBoBAf1imO1ROIhhg22itlpJEIi1L_KGPL958wQvoWyc9U32B6MIMBTwqEhPS-1qkI_C2hFMMANu2QYSsDHs52ZQX4kPeRu41h7AyOkyR8MFe4Tbs-fkPDgSRUEuVxmnzJnFFCfgFyxwkvwHl3m7pYzIMuPf2obZzNTHuJ4NyIX0h6VKJxQA1EqHsw4XsHXr_w8fjGNZa37_QI1N6OF8eGvSV1dDXuesGnJM9kaebOI_eUHq6oSafTAHfuE9Uf3bmjsuI-CENyVb-"/>
          </div>
          <div className="inline-block px-2 py-0.5 bg-tertiary-fixed-dim text-on-tertiary-fixed text-[10px] font-bold rounded uppercase mb-2">Devices</div>
          <h4 className="font-bold text-lg mb-1">Digital Thermometer</h4>
          <p className="text-sm text-on-surface-variant mb-4">Instant Read • Clinical</p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-xl">$24.99</span>
            <button className="bg-primary-container text-on-primary-container p-2 rounded-lg hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-xl">add_shopping_cart</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
