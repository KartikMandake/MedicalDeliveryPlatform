export default function UploadDropzone() {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border-0">
      {/* Drag & Drop Area */}
      <div className="group relative border-2 border-dashed border-[#bfcaba] rounded-xl p-12 flex flex-col items-center justify-center gap-4 hover:border-[#2e7d32] transition-all cursor-pointer bg-[#f2f4f7]/30 hover:bg-[#0d631b]/5">
        <div className="w-16 h-16 rounded-full bg-[#2e7d32]/10 flex items-center justify-center text-[#2e7d32] group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-4xl">cloud_upload</span>
        </div>
        <div className="text-center">
          <h3 className="font-['Manrope'] font-bold text-lg text-[#191c1e]">Drag &amp; Drop Prescription</h3>
          <p className="text-[#40493d] text-sm mt-1">PNG, JPG or PDF (Max 10MB)</p>
        </div>
        <button className="mt-4 px-6 py-2.5 bg-[#2e7d32] text-[#cbffc2] rounded-full font-semibold hover:opacity-90 transition-opacity">
          Browse Files
        </button>
      </div>

      <div className="relative my-10 flex items-center">
        <div className="flex-grow border-t border-[#bfcaba]/30"></div>
        <span className="mx-4 text-sm font-medium text-[#40493d] bg-white px-2 uppercase tracking-widest">or connect via</span>
        <div className="flex-grow border-t border-[#bfcaba]/30"></div>
      </div>

      {/* Alternate Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-[#bfcaba]/50 hover:bg-[#88d982]/10 transition-colors group">
          <div className="w-10 h-10 rounded-full bg-[#88d982]/20 flex items-center justify-center text-[#0d631b]">
            <span className="material-symbols-outlined">chat</span>
          </div>
          <div className="text-left">
            <span className="block font-bold text-[#191c1e]">Upload via WhatsApp</span>
            <span className="text-xs text-[#40493d]">Instant response</span>
          </div>
        </button>

        <button className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-[#bfcaba]/50 hover:bg-slate-50 transition-colors group">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
            <span className="material-symbols-outlined">call</span>
          </div>
          <div className="text-left">
            <span className="block font-bold text-[#191c1e]">Call to Order</span>
            <span className="text-xs text-[#40493d]">24/7 Helpline</span>
          </div>
        </button>
      </div>
    </div>
  );
}
