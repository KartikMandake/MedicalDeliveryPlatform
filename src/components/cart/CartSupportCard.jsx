import React from 'react';
import { ShieldCheck } from 'lucide-react';

const CartSupportCard = () => (
  <div className="mt-8 flex items-center gap-3 p-4 bg-primary-container/10 rounded-xl border border-primary/10">
    <ShieldCheck className="w-5 h-5 text-primary fill-primary/20" />
    <p className="text-[11px] font-medium leading-relaxed text-on-primary-fixed-variant">
      Clinical-grade encryption protects your medical and payment data during checkout.
    </p>
  </div>
);

export default CartSupportCard;
