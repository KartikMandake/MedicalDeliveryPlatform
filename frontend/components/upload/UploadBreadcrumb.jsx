import { Link } from 'react-router-dom';

export default function UploadBreadcrumb() {
  return (
    <nav className="flex items-center gap-2 mb-8 text-sm text-[#40493d] font-['Inter']">
      <Link to="/" className="hover:text-[#0d631b] transition-colors">Home</Link>
      <span className="material-symbols-outlined text-xs">chevron_right</span>
      <span className="text-[#0d631b] font-semibold">Upload Prescription</span>
    </nav>
  );
}
