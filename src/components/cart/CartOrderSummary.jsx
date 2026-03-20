import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion as Motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import CartSupportCard from './CartSupportCard';

const CartOrderSummary = ({ summary, totalItems, subtotal, deliveryFee, tax, total }) => {
  const navigate = useNavigate();
  const resolvedSubtotal = Number(summary?.subtotal ?? subtotal ?? 0);
  const resolvedDeliveryFee = Number(summary?.deliveryFee ?? deliveryFee ?? 0);
  const resolvedTotal = Number(summary?.totalAmount ?? total ?? resolvedSubtotal + resolvedDeliveryFee);
  const resolvedItems = Number(summary?.totalItems ?? totalItems ?? 0);
  const resolvedTax = Number(tax ?? 0);

  return (
  <Motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_16px_32px_rgba(0,110,47,0.08)] insight-glow"
  >
    <h2 className="text-xl font-bold font-headline text-on-surface mb-6">Order Intelligence</h2>
    
    <div className="space-y-4 mb-8">
      <div className="flex justify-between text-sm">
        <span className="text-on-surface-variant font-medium">Total Items</span>
        <span className="font-bold">{resolvedItems.toString().padStart(2, '0')}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-on-surface-variant font-medium">Subtotal</span>
        <span className="font-bold">${resolvedSubtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-on-surface-variant font-medium">Clinical Delivery Fee</span>
        <span className="font-bold text-primary">{resolvedDeliveryFee === 0 ? 'FREE' : `$${resolvedDeliveryFee.toFixed(2)}`}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-on-surface-variant font-medium">Estimated Tax</span>
        <span className="font-bold">${resolvedTax.toFixed(2)}</span>
      </div>
    </div>

    <div className="bg-surface-container-low h-[1px] mb-6" />

    <div className="flex justify-between items-baseline mb-8">
      <span className="text-lg font-bold font-headline">Total Price</span>
      <div className="text-right">
        <span className="text-3xl font-extrabold font-headline text-primary tracking-tight">
          ${resolvedTotal.toFixed(2)}
        </span>
        <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest mt-1">
          USD • Inc. All Taxes
        </p>
      </div>
    </div>

    <button
      className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#0d631b] to-[#2e7d32] text-white font-bold font-headline flex items-center justify-center gap-3 transition-all hover:scale-[1.02] hover:brightness-105 active:scale-95 shadow-lg shadow-[#0d631b]/25 border border-[#0d631b]/20 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={resolvedItems <= 0}
      onClick={() => navigate('/checkout')}
      type="button"
    >
      Proceed to Checkout
      <ArrowRight className="w-5 h-5" />
    </button>

    <CartSupportCard />
  </Motion.div>
  );
};

export default CartOrderSummary;
