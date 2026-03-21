export default function UploadAIScanner({ scanning, resultCount }) {
  return (
    <div className="bg-[#f2f4f7] rounded-xl p-8 relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="relative w-full md:w-48 h-48 bg-white rounded-lg shadow-inner overflow-hidden flex-shrink-0 border border-[#bfcaba]/20 flex items-center justify-center">
          {scanning ? (
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-10 w-10 text-[#0d631b]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-xs font-semibold text-[#0d631b]">Analyzing...</span>
            </div>
          ) : resultCount !== null ? (
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-5xl text-[#0d631b]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="text-sm font-bold text-[#0d631b]">{resultCount} medicines found</span>
            </div>
          ) : (
            <span className="material-symbols-outlined text-5xl text-slate-300">document_scanner</span>
          )}
        </div>
        <div className="space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#44ddc1]/20 text-[#00201a] font-semibold text-xs uppercase tracking-wider">
            {scanning ? 'Processing' : resultCount !== null ? 'Scan Complete' : 'Smart Analysis'}
          </div>
          <h2 className="text-2xl font-bold font-['Manrope'] text-[#191c1e]">Precision AI Scanning</h2>
          <p className="text-[#40493d] text-sm leading-relaxed">
            {scanning
              ? 'Gemini Vision is reading your prescription and matching medicines from our catalog...'
              : resultCount !== null
              ? `Successfully detected ${resultCount} medicine(s). Review and add them to your cart.`
              : 'Our clinical-grade AI identifies handwritten medications, dosages, and quantities instantly.'}
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0d631b]">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Gemini Vision
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0d631b]">
              <span className="material-symbols-outlined text-sm">security</span>
              Encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
