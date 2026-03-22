import { useState, useRef } from 'react';
import api from '../../api/axios';

export default function CartPrescriptionUpload() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('prescription', file);
      const res = await api.post('/upload/prescription', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPrescriptions((prev) => [...prev, { url: res.data.url, filename: res.data.filename, uploadedAt: new Date().toLocaleDateString() }]);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      inputRef.current.value = '';
    }
  };

  const handleRemove = (idx) => setPrescriptions((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="mt-12 bg-surface-container-low rounded-xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-headline text-xl font-bold">Prescription Documents</h2>
        <button
          className="text-primary font-bold text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
          onClick={() => inputRef.current.click()}
          disabled={uploading}
        >
          <span className="material-symbols-outlined">upload_file</span>
          {uploading ? 'Uploading...' : 'Upload New'}
        </button>
        <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleUpload} />
      </div>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {prescriptions.map((p, idx) => (
          <div key={idx} className="bg-surface-container-lowest p-4 rounded-lg flex items-center gap-4 border border-outline-variant/20">
            <div className="w-16 h-20 bg-surface-container rounded overflow-hidden shadow-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-outline">description</span>
            </div>
            <div className="flex-grow overflow-hidden">
              <p className="font-bold text-sm truncate">{p.filename}</p>
              <p className="text-xs text-outline">Uploaded {p.uploadedAt}</p>
              <div className="mt-2 flex gap-3">
                <a href={`http://localhost:5000${p.url}`} target="_blank" rel="noreferrer" className="text-xs text-primary font-bold">View</a>
                <button className="text-xs text-error font-bold" onClick={() => handleRemove(idx)}>Remove</button>
              </div>
            </div>
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
        ))}
        <div
          className="border-2 border-dashed border-outline-variant rounded-lg p-4 flex items-center justify-center text-outline gap-3 hover:bg-white/50 cursor-pointer transition-colors"
          onClick={() => inputRef.current.click()}
        >
          <span className="material-symbols-outlined">add_circle</span>
          <span className="text-sm font-medium">Add prescription</span>
        </div>
      </div>
    </div>
  );
}
