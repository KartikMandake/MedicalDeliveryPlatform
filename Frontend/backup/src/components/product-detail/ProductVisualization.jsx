import React from 'react';

const ProductVisualization = () => {
  return (
    <div className="lg:col-span-7 space-y-8">
      <div className="bg-surface-container-lowest rounded-[2rem] overflow-hidden p-8 flex items-center justify-center relative group shadow-sm min-h-[500px]">
        <div className="absolute top-6 left-6 z-10">
          <span className="bg-error/10 text-error px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>prescriptions</span>
            RX Required
          </span>
        </div>
        <img alt="Medicine Main" className="w-full h-auto max-h-[500px] object-contain transform group-hover:scale-105 transition-transform duration-500" data-alt="High quality professional photograph of premium white medicine capsules" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMK0WUpM1gROEiqRq4A9atAtWOJfNyFDTaR-_o1nrrUXCUBPoT3SeHW3feE-xemj-Q6WvqbveCxfCyBsI0BlUdVFTzu2khQIZuUoP_82D6qqpxMpBj0_vXQcvn0V2xL8MViw3357j8I5_w3IXJXxdpIKaPTpzrizE6bCwfCRplyxXrTa6x-gJy12AZseK_D2NUOfegPGva9sN7wOIfAkFa6M2UB64MLfe_wtGpqCgUn5UWQzPi-BpTh75cFdh0WoWplH1jembWVIQ6"/>
      </div>
      {/* Thumbnails */}
      <div className="flex gap-4 justify-center">
        <button className="w-20 h-20 rounded-xl border-2 border-primary overflow-hidden bg-white p-2">
          <img alt="Thumb 1" className="w-full h-full object-cover" data-alt="Thumbnail of white medicine capsules" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAp_wPf0KAnBK6LDHgxY9SuICRPiIcNHEX2yMbOcP8kTYY-Vls4W967Ra_esNDajDKPhnS1rCeuSDqvuRjRfNGZKPRCWBrkM6mkWZD8j6PYQpMzn3kgqxtGsaWuAEWyEDOKtD1ck6y_FYPTWb15VDGdAXDUV0APuAwEXxOcEeQinW1wSEtwm5WYYAFLm9tvGyusD7co1taJv2JK2dFp548Ug7gmWMfTHPvDvUfaVbqHTEpjwqPP_MOhU-Omf8ctPamosgTimBxFr4LY"/>
        </button>
        <button className="w-20 h-20 rounded-xl border border-outline-variant/30 overflow-hidden bg-white p-2 hover:border-primary/50 transition-colors">
          <img alt="Thumb 2" className="w-full h-full object-cover" data-alt="Close up of medical packaging boxes" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6yLRXV4XEm0IeZK72XXfljTWE4Hjw6sQbcjf8uhBxJSil6gg183wWDigf62WBi-Enfp_D5B5watmdHZZFCnr1PF493dw9R5c_aoC0bLn-jPo3v9NY51C9ctEEBGx0isqh-W5FcfxSi_ZDf1_vqpYgKHk2TZSrLl-EZSAFx_DDhBqClxPuzy1Ts_kiFUKFgj8qgtm7FzoVcUuiH5Sq5isbRWPNV60gQbBiAL6kqonl_hWHJqZP8B2nQ3-6a94TsTpmkxXRUKxWd74U"/>
        </button>
        <button className="w-20 h-20 rounded-xl border border-outline-variant/30 overflow-hidden bg-white p-2 hover:border-primary/50 transition-colors">
          <img alt="Thumb 3" className="w-full h-full object-cover" data-alt="Clinical medicine bottle on white background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAigRfauCIHf8SwTuc5qYWlragZY7al28Imf5vWstMartQnqUMCeq6yiBDxIAFgMDxh6ZnFnOdn1dWiypkXAREp8lEmEX_-pAcYyheP18hY4XP6eUgEtzehVNUAooxpH38yUCZQpH2jag6bcsYhfi4aXymSv2Ri0-dLzWHd599JhoQkRU7QjIgiePh1uoQP-XFSJ7lSZJ6AocQumaXUO_GefjBk__i444qSFtnV_5e-SzI5I59aj7MsERmmqVUOubDFSfKQwImBOsZs"/>
        </button>
      </div>
      {/* Quality & Expiry Badges */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-surface-container-low rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-primary" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Quality</span>
            <span className="text-sm font-extrabold text-on-surface">Verified Pharmacy</span>
          </div>
        </div>
        <div className="bg-surface-container-low rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-primary">event_available</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Expiry</span>
            <span className="text-sm font-extrabold text-on-surface">Exp: Dec 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductVisualization;
