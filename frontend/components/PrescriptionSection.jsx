import { Link } from 'react-router-dom';

export default function PrescriptionSection() {
  return (
    <section className="max-w-7xl mx-auto px-8">
      <div className="bg-surface-container-low rounded-[2rem] overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        <div className="p-12 lg:p-20 space-y-8">
          <h2 className="font-headline font-bold text-4xl leading-tight">Quick Prescription <br/>Upload</h2>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            Don't waste time searching. Upload your doctor's note and we'll handle the rest. Our pharmacists will verify and pack your order immediately.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
              <span className="material-symbols-outlined text-primary">photo_camera</span>
              <span className="font-semibold">Snap Photo</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
              <span className="material-symbols-outlined text-[#25D366]">chat</span>
              <span className="font-semibold">WhatsApp Us</span>
            </div>
          </div>
          <Link to="/upload" className="w-full sm:w-auto inline-block text-center bg-primary text-white font-bold py-4 px-12 rounded-xl transition-all hover:bg-primary-container shadow-lg shadow-primary/10">
            Get Started
          </Link>
        </div>
        <div className="relative min-h-[400px]">
          <img alt="Pharmacist reviewing prescription" className="absolute inset-0 w-full h-full object-cover" data-alt="Pharmacist checking prescription details on a tablet" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCETD81JWfMptEtQWjeViLpF2MKdMpx8lywM9-mQGg3ZRGqE_48-QK8XftzkxzfQAO1U8z3_Q_6XJbkKbI_jEzomdWp2fu3ra6dR5eTmf6u4hebPqvWKYzqEyeND1Hhfm2cv2MNYSun7AjarNIzTk82Nck1YEu88Catb_zHnc5tv-TSihKpkpeBmoaHMvd5W85_6ESG9W9NLB6R_CgM3KWHMlwTJpjAXjTv8WfjISTvPpuQ01iDEXOAxFilbYXCMmH5zdgd0rZQkRkT"/>
          <div className="absolute inset-0 bg-primary/10"></div>
        </div>
      </div>
    </section>
  );
}
