export default function UploadFooter() {
  return (
    <footer className="w-full py-12 border-t border-slate-200 bg-slate-50 mt-12">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-['Manrope'] font-bold text-emerald-800">Prescription Care</div>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="font-['Inter'] text-sm text-slate-500 hover:text-emerald-600 underline transition-all" href="#">Privacy Policy</a>
          <a className="font-['Inter'] text-sm text-slate-500 hover:text-emerald-600 underline transition-all" href="#">Terms of Service</a>
          <a className="font-['Inter'] text-sm text-slate-500 hover:text-emerald-600 underline transition-all" href="#">Medical Disclaimer</a>
          <a className="font-['Inter'] text-sm text-slate-500 hover:text-emerald-600 underline transition-all" href="#">Contact Us</a>
        </div>
        <div className="font-['Inter'] text-sm text-slate-500">
          © 2024 Prescription Care. Clinical Grade Delivery.
        </div>
      </div>
    </footer>
  );
}
