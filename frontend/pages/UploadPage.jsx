import { useState } from 'react';
import UploadNavBar from '../components/upload/UploadNavBar';
import UploadBreadcrumb from '../components/upload/UploadBreadcrumb';
import UploadDropzone from '../components/upload/UploadDropzone';
import UploadAIScanner from '../components/upload/UploadAIScanner';
import UploadResults from '../components/upload/UploadResults';
import UploadFooter from '../components/upload/UploadFooter';

export default function UploadPage() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { prescriptionUrl, results[] }
  const [error, setError] = useState('');

  const handleScanComplete = (data) => {
    setScanResult(data);
    setError('');
  };

  const handleError = (msg) => {
    setError(msg);
    setScanResult(null);
  };

  return (
    <div className="bg-[#f7f9fc] font-['Inter'] text-[#191c1e] min-h-screen">
      <UploadNavBar />
      <main className="pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <UploadBreadcrumb />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold font-['Manrope'] text-[#191c1e] tracking-tight">Precision Care Starts Here</h1>
              <p className="text-[#40493d] text-lg">Upload your prescription for AI-powered medicine detection and rapid delivery.</p>
            </div>
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                <span className="material-symbols-outlined text-sm">error</span>
                {error}
                <button onClick={() => setError('')} className="ml-auto"><span className="material-symbols-outlined text-sm">close</span></button>
              </div>
            )}
            <UploadDropzone
              scanning={scanning}
              setScanning={setScanning}
              onScanComplete={handleScanComplete}
              onError={handleError}
            />
            <UploadAIScanner scanning={scanning} resultCount={scanResult?.results?.length ?? null} />
          </div>
          <UploadResults scanning={scanning} scanResult={scanResult} />
        </div>
      </main>
      <UploadFooter />
    </div>
  );
}
