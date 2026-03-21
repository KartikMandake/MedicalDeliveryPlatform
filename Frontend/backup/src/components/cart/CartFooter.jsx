export default function CartFooter() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 w-full py-12 px-8 mt-auto border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 font-headline mb-2">ClinicalCurator</p>
          <p className="font-['Inter'] text-sm text-slate-500 max-w-sm">Optimizing medical logistics with precision and care for healthcare providers and patients globally.</p>
          <p className="font-['Inter'] text-sm text-slate-500 mt-6">© 2024 Clinical Curator Medical Logistics. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap md:justify-end gap-x-8 gap-y-4">
          <a className="text-slate-500 hover:text-emerald-600 hover:underline transition-all text-sm" href="#">Privacy Policy</a>
          <a className="text-slate-500 hover:text-emerald-600 hover:underline transition-all text-sm" href="#">Terms of Service</a>
          <a className="text-slate-500 hover:text-emerald-600 hover:underline transition-all text-sm" href="#">Compliance</a>
          <a className="text-slate-500 hover:text-emerald-600 hover:underline transition-all text-sm" href="#">Support</a>
        </div>
      </div>
    </footer>
  );
}
