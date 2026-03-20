import React from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

const CartPrescriptionUpload = () => (
  <div className="bg-surface-container-lowest rounded-xl p-6 mb-6 border-2 border-dashed border-zinc-200 hover:border-primary/30 transition-colors cursor-pointer group">
    <div className="flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-surface-container-low rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
        <Upload className="w-6 h-6 text-zinc-400 group-hover:text-primary transition-colors" />
      </div>
      <h3 className="text-sm font-bold font-headline text-on-surface mb-1">Upload Clinical Prescription</h3>
      <p className="text-xs text-on-surface-variant mb-4">Required for prescription-grade items in your cart.</p>
      
      <div className="flex gap-4 w-full max-w-xs">
        <div className="flex-1 p-3 bg-surface-container-low rounded-lg flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-bold text-zinc-600">PDF / JPG</span>
        </div>
        <div className="flex-1 p-3 bg-surface-container-low rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-secondary" />
          <span className="text-[10px] font-bold text-zinc-600">Max 10MB</span>
        </div>
      </div>
    </div>
  </div>
);

export default CartPrescriptionUpload;
