import { Link } from 'react-router-dom';

export default function TrackingFooter() {
  return (
    <footer className="lg:ml-64 w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 mt-12">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 py-8 w-full">
        <p className="text-slate-500 dark:text-slate-400 font-['Inter'] text-xs tracking-wide">© 2024 Clinical Curator. Medical Precision &amp; Editorial Care.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link className="text-slate-500 hover:text-emerald-500 font-['Inter'] text-xs tracking-wide underline underline-offset-4 opacity-80 hover:opacity-100 transition-all" to="/admin">HIPAA Compliance</Link>
          <Link className="text-slate-500 hover:text-emerald-500 font-['Inter'] text-xs tracking-wide underline underline-offset-4 opacity-80 hover:opacity-100 transition-all" to="/upload">Terms of Service</Link>
          <Link className="text-slate-500 hover:text-emerald-500 font-['Inter'] text-xs tracking-wide underline underline-offset-4 opacity-80 hover:opacity-100 transition-all" to="/upload">Privacy Policy</Link>
          <Link className="text-slate-500 hover:text-emerald-500 font-['Inter'] text-xs tracking-wide underline underline-offset-4 opacity-80 hover:opacity-100 transition-all" to="/dashboard">Data Encryption</Link>
        </div>
      </div>
    </footer>
  );
}
