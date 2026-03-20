export default function UploadAIScanner() {
  return (
    <div className="bg-[#f2f4f7] rounded-xl p-8 relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="relative w-full md:w-48 h-64 bg-white rounded-lg shadow-inner overflow-hidden flex-shrink-0 border border-[#bfcaba]/20">
          <img alt="Sample Prescription document" className="w-full h-full object-cover opacity-60 grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQ5i7_yEkxR6sgA5_fnIXAvgvrXz91lc-Inr5c_Wj8DRGUDQndLpMQp4VZLtrwHbPl-EdTPrDvyqphPglf5MP349wiPMNNDM66S0ZPxLWbnB-i7QhV3XzYY7z2jmZQrNvvYfo-2GrDJ9e9tjQvgqDVf9BnuhdSTP6OGMD-_T0EqUO3VpdKn5ZXhCM3A_qPl8R61sipS_sV2FLbyTV5gWXm0BlQ3jKB-RJ2EeWuJTatE5QYUW8JbG_RtrDOod9FuIrmCMWpMULZjoF3"/>
          <div className="scan-line"></div>
        </div>
        <div className="space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#44ddc1]/20 text-[#00201a] font-semibold text-xs uppercase tracking-wider">
            Smart Analysis
          </div>
          <h2 className="text-2xl font-bold font-['Manrope'] text-[#191c1e]">Precision AI Scanning</h2>
          <p className="text-[#40493d] text-sm leading-relaxed">Our clinical-grade AI identifies handwritten medications, dosages, and patient instructions instantly to ensure maximum accuracy before pharmacist review.</p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0d631b]">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Verified
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
