export default function Footer() {
  return (
    <footer className="bg-slate-100 border-t border-slate-200/50 py-12 px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div className="space-y-4">
          <div className="text-lg font-bold text-slate-900 font-headline uppercase tracking-tight">MediFlow</div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Connecting healthcare providers and patients with high-speed, temperature-controlled delivery logistics.
          </p>
        </div>
        <div>
          <h4 className="font-headline font-bold text-emerald-800 mb-4 text-xs uppercase tracking-widest">Company</h4>
          <ul className="space-y-2 text-xs uppercase tracking-widest font-['Inter']">
            <li><a className="text-slate-500 hover:text-emerald-700 underline decoration-2 underline-offset-4 transition-all" href="#">About</a></li>
            <li><a className="text-slate-500 hover:text-emerald-700 underline decoration-2 underline-offset-4 transition-all" href="#">Contact</a></li>
            <li><a className="text-slate-500 hover:text-emerald-700 underline decoration-2 underline-offset-4 transition-all" href="#">Careers</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-headline font-bold text-emerald-800 mb-4 text-xs uppercase tracking-widest">Legal</h4>
          <ul className="space-y-2 text-xs uppercase tracking-widest font-['Inter']">
            <li><a className="text-slate-500 hover:text-emerald-700 underline decoration-2 underline-offset-4 transition-all" href="#">Privacy</a></li>
            <li><a className="text-slate-500 hover:text-emerald-700 underline decoration-2 underline-offset-4 transition-all" href="#">Terms</a></li>
            <li><a className="text-slate-500 hover:text-emerald-700 underline decoration-2 underline-offset-4 transition-all" href="#">Pharmacy Policy</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-headline font-bold text-emerald-800 mb-4 text-xs uppercase tracking-widest">Connect</h4>
          <div className="flex gap-4">
            <button className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all"><span className="material-symbols-outlined text-sm">alternate_email</span></button>
            <button className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all"><span className="material-symbols-outlined text-sm">share</span></button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-['Inter'] text-xs uppercase tracking-widest text-slate-500">© 2024 MediFlow Delivery. Surgical Precision in Every Parcel.</p>
        <div className="flex gap-4">
          <img alt="Visa" className="h-6 grayscale hover:grayscale-0 transition-all" data-alt="Visa payment icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuATSKe1h0HpBUDbHpIYRf5V6yHbbMldML7ZWOYYgoB3Fm6FJEjlO92QodzQQ8opmTwZaN1ZFydoF0p2w41SmxCfoS2bR7Tn0Njj6-KlGW940xW-OyMZnVKWqLc9CX_HEuVSirQNblpXiGPsSgmgcv_3WJF8CpJWnp54RMbLt9UNa6-BeICHYI59OJ9B202tLRi8DHgKw6JMAtC15IuFUnEZ9J_2lIE4UENq__KNYrbTZGRru44CAnWSWk6mkNMJc9IB_zQP-r1XyJBG"/>
          <img alt="Mastercard" className="h-6 grayscale hover:grayscale-0 transition-all" data-alt="Mastercard payment icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTILB9OUrApruavpgAUP0KSckG48veY2QmipZes936srb2SCfkKG6MBlTQDT5yTwHnwzfKyd6PGWASPHKF28PWZtQeAuEpmUXBReszkhyf4zW11yDRZqarG_FE6RtDqAt_bzoes85wTCl-fkpWgmXxLXekzsqGUPElNMwBdfJ4QWyUnnSkjewESXnFBVYIdad0JBI6LqqXHdmi_UVO4cRncsLYtmBrpHtSxR91Q-4r0XVmrT6xfbkfNBBewaKXEOUEs0DrBjLZdU9J"/>
          <img alt="Apple Pay" className="h-6 grayscale hover:grayscale-0 transition-all" data-alt="Apple Pay icon" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7bv87f0mKE2ftThteGZQz2XSpeY5lo5Hx2PWC74My8mE0c1oX9lPZQdmkjEUGRWwmQ9YVGfX7oVqwyARUPkmdUu1tQkdAVvXlahRZqnLGhrHTmP8K0UIga078T8vjZHwC77wfJGVSjldG-K4uBRZI-AEMxwaXeF4mBPujpGtG2QtaOUPyTqsPDwoD67tloh-TU9reVSgvREWSH7TyQiEvtXIFNs6O7j5Ai-cWdeBW3CLiAV6MId3VvLbi0mxarvV3A4Wpz0raSq0Q"/>
        </div>
      </div>
    </footer>
  );
}
