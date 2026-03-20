import CartNavBar from '../components/cart/CartNavBar';
import UploadBreadcrumb from '../components/upload/UploadBreadcrumb';
import UploadDropzone from '../components/upload/UploadDropzone';
import UploadAIScanner from '../components/upload/UploadAIScanner';
import UploadResults from '../components/upload/UploadResults';
import UploadFooter from '../components/upload/UploadFooter';

export default function UploadPage() {
  return (
    <div className="bg-[#f7f9fc] font-['Inter'] text-[#191c1e] min-h-screen">
      <CartNavBar />
      <main className="pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <UploadBreadcrumb />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Upload Methods */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold font-['Manrope'] text-[#191c1e] tracking-tight">Precision Care Starts Here</h1>
              <p className="text-[#40493d] text-lg">Upload your prescription for high-grade clinical verification and rapid delivery.</p>
            </div>
            
            <UploadDropzone />
            <UploadAIScanner />
          </div>
          
          <UploadResults />
        </div>
      </main>
      <UploadFooter />
    </div>
  );
}
