export default function CartOrderSummary() {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-transparent">
      <h2 className="font-headline text-xl font-bold mb-6">Order Summary</h2>
      <div className="space-y-4 text-sm mb-8">
        <div className="flex justify-between text-on-surface-variant">
          <span>Subtotal (3 items)</span>
          <span className="font-bold text-on-surface">$61.00</span>
        </div>
        <div className="flex justify-between text-on-surface-variant">
          <span>Delivery Fee</span>
          <span className="font-bold text-on-surface text-secondary">FREE</span>
        </div>
        <div className="flex justify-between text-on-surface-variant">
          <span>Est. Taxes &amp; Fees</span>
          <span className="font-bold text-on-surface">$4.85</span>
        </div>
        <div className="h-px bg-surface-container-high my-2"></div>
        <div className="flex justify-between text-lg font-headline font-extrabold text-on-surface pt-2">
          <span>Total</span>
          <span>$65.85</span>
        </div>
      </div>
      <button className="w-full bg-primary-container text-on-primary-container py-4 rounded-xl font-headline font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] hover:shadow-lg hover:shadow-primary-container/20 group">
        Proceed to Checkout
        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </button>
      <div className="mt-6 flex items-center gap-3 p-4 bg-primary-fixed/20 rounded-lg">
        <span className="material-symbols-outlined text-primary">local_shipping</span>
        <p className="text-xs font-medium text-on-primary-fixed-variant">Complimentary climate-controlled delivery active for medical orders.</p>
      </div>
      <div className="mt-8">
        <p className="text-[10px] uppercase font-bold tracking-widest text-outline mb-4">ACCEPTED PAYMENTS</p>
        <div className="flex gap-3 opacity-60">
          <span className="material-symbols-outlined">credit_card</span>
          <span className="material-symbols-outlined">account_balance</span>
          <span className="material-symbols-outlined">contactless</span>
        </div>
      </div>
    </div>
  );
}
