import { useState, useRef } from 'react';
import api from '../../api/axios';

export default function UploadDropzone({ scanning, setScanning, onScanComplete, onError }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(f.type)) { onError('Only JPG, PNG or PDF files are allowed'); return; }
    if (f.size > 5 * 1024 * 1024) { onError('File size must be under 5MB'); return; }
    setFile(f);
    setPreview(f.type.startsWith('image/') ? URL.createObjectURL(f) : null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    try {
      const formData = new FormData();
      formData.append('prescription', file);
      const res = await api.post('/upload/scan-prescription', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onScanComplete(res.data);
    } catch (err) {
      onError(err.response?.data?.message || 'Scan failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current.click()}
        className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer
          ${dragOver ? 'border-[#0d631b] bg-[#0d631b]/5' : file ? 'border-[#0d631b] bg-[#f0fdf4]' : 'border-[#bfcaba] bg-[#f2f4f7]/30 hover:border-[#2e7d32] hover:bg-[#0d631b]/5'}`}
      >
        {file ? (
          <>
            {preview ? (
              <img src={preview} alt="prescription preview" className="max-h-48 rounded-lg object-contain shadow" />
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-5xl text-[#0d631b]">picture_as_pdf</span>
                <span className="text-sm font-medium text-[#0d631b]">{file.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-[#0d631b] font-semibold">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {file.name} ({(file.size / 1024).toFixed(0)} KB)
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors"
            >
              Remove file
            </button>
          </>
        ) : (
          <>
            <div className={`w-16 h-16 rounded-full bg-[#2e7d32]/10 flex items-center justify-center text-[#2e7d32] transition-transform ${dragOver ? 'scale-110' : ''}`}>
              <span className="material-symbols-outlined text-4xl">cloud_upload</span>
            </div>
            <div className="text-center">
              <h3 className="font-['Manrope'] font-bold text-lg text-[#191c1e]">Drag &amp; Drop Prescription</h3>
              <p className="text-[#40493d] text-sm mt-1">PNG, JPG or PDF (Max 5MB)</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); inputRef.current.click(); }}
              className="mt-2 px-6 py-2.5 bg-[#2e7d32] text-[#cbffc2] rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Browse Files
            </button>
          </>
        )}
        <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      </div>

      {/* Scan Button */}
      {file && (
        <button
          onClick={handleScan}
          disabled={scanning}
          className="mt-6 w-full py-4 bg-[#0d631b] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:opacity-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {scanning ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Scanning Prescription...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">document_scanner</span>
              Scan Prescription
            </>
          )}
        </button>
      )}

      {/* Alternate Actions */}
      {!file && (
        <>
          <div className="relative my-8 flex items-center">
            <div className="flex-grow border-t border-[#bfcaba]/30" />
            <span className="mx-4 text-sm font-medium text-[#40493d] bg-white px-2 uppercase tracking-widest">or connect via</span>
            <div className="flex-grow border-t border-[#bfcaba]/30" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-[#bfcaba]/50 hover:bg-[#88d982]/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#88d982]/20 flex items-center justify-center text-[#0d631b]">
                <span className="material-symbols-outlined">chat</span>
              </div>
              <div className="text-left">
                <span className="block font-bold text-[#191c1e]">Upload via WhatsApp</span>
                <span className="text-xs text-[#40493d]">Instant response</span>
              </div>
            </button>
            <button className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-[#bfcaba]/50 hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                <span className="material-symbols-outlined">call</span>
              </div>
              <div className="text-left">
                <span className="block font-bold text-[#191c1e]">Call to Order</span>
                <span className="text-xs text-[#40493d]">24/7 Helpline</span>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
