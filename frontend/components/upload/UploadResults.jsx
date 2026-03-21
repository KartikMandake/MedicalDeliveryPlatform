export default function UploadResults() {
  return (
    <div className="lg:col-span-5">
      <div className="sticky top-28 space-y-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#f2f4f7] flex justify-between items-center">
            <h2 className="text-xl font-bold font-['Manrope'] text-[#191c1e]">Detected Medicines</h2>
            <span className="bg-[#0d631b]/10 text-[#0d631b] px-3 py-1 rounded-full text-xs font-bold">3 Items Found</span>
          </div>
          <div className="p-0">
            {/* Medicine List */}
            <div className="divide-y divide-[#f2f4f7]">
              {/* Item 1 */}
              <div className="p-6 flex justify-between items-start gap-4 hover:bg-[#f2f4f7]/20 transition-colors">
                <div className="space-y-1">
                  <h4 className="font-bold text-[#191c1e]">Amoxicillin 500mg</h4>
                  <p className="text-xs text-[#40493d]">Capsules • 15 Units</p>
                  <p className="text-[#0d631b] font-bold mt-2">$24.50</p>
                </div>
                <div className="flex items-center bg-[#f2f4f7] rounded-full px-2 py-1">
                  <button className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-colors">
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <span className="w-8 text-center font-bold text-sm">1</span>
                  <button className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-colors">
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              </div>
              {/* Item 2 */}
              <div className="p-6 flex justify-between items-start gap-4 hover:bg-[#f2f4f7]/20 transition-colors">
                <div className="space-y-1">
                  <h4 className="font-bold text-[#191c1e]">Lipitor 20mg</h4>
                  <p className="text-xs text-[#40493d]">Tablets • 30 Units</p>
                  <p className="text-[#0d631b] font-bold mt-2">$42.00</p>
                </div>
                <div className="flex items-center bg-[#f2f4f7] rounded-full px-2 py-1">
                  <button className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-colors">
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <span className="w-8 text-center font-bold text-sm">1</span>
                  <button className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-colors">
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              </div>
              {/* Item 3 */}
              <div className="p-6 flex justify-between items-start gap-4 hover:bg-[#f2f4f7]/20 transition-colors">
                <div className="space-y-1">
                  <h4 className="font-bold text-[#191c1e]">Vitamin D3 2000IU</h4>
                  <p className="text-xs text-[#40493d]">Softgels • 60 Units</p>
                  <p className="text-[#0d631b] font-bold mt-2">$18.25</p>
                </div>
                <div className="flex items-center bg-[#f2f4f7] rounded-full px-2 py-1">
                  <button className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-colors">
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <span className="w-8 text-center font-bold text-sm">2</span>
                  <button className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-colors">
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Summary & Checkout */}
          <div className="p-6 bg-[#f2f4f7]/50 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#40493d]">Subtotal</span>
              <span className="font-bold text-[#191c1e]">$103.00</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#40493d]">Clinic Verification Fee</span>
              <span className="text-[#0d631b] font-bold">FREE</span>
            </div>
            <div className="pt-4 border-t border-[#bfcaba]/20 flex justify-between items-center">
              <span className="font-['Manrope'] font-bold text-lg">Total Est.</span>
              <span className="font-['Manrope'] font-bold text-2xl text-[#0d631b]">$103.00</span>
            </div>
            <button className="w-full py-4 bg-gradient-to-br from-[#0d631b] to-[#2e7d32] text-white rounded-xl font-['Manrope'] font-bold text-lg shadow-lg hover:opacity-95 transition-all transform active:scale-[0.98]">
              Add to Cart &amp; Proceed
            </button>
          </div>
        </div>
        {/* Trust Banner */}
        <div className="flex items-center gap-4 px-6 py-4 bg-white/50 border border-[#bfcaba]/10 rounded-xl">
          <span className="material-symbols-outlined text-[#006153]">verified_user</span>
          <p className="text-xs text-[#40493d]">Our clinical team will verify every prescription item before fulfillment. Final price may vary based on insurance.</p>
        </div>
      </div>
    </div>
  );
}
