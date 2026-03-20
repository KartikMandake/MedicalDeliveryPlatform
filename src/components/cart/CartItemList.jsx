import React from 'react';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'motion/react';
import { DEMO_PRODUCTS } from '../../lib/constants';

const PRODUCT_IMAGE_BY_ID = DEMO_PRODUCTS.reduce((acc, product) => {
  acc[product.id] = product.image;
  return acc;
}, {});

const getCartImageSrc = (item) => {
  const rawImage = item.images?.[0];
  if (rawImage && /^https?:\/\//i.test(rawImage)) {
    return rawImage;
  }

  return PRODUCT_IMAGE_BY_ID[item.medicine_id] || 'https://via.placeholder.com/160x160?text=Medicine';
};

const CartItemCard = ({ item, onQuantityChange }) => (
  <Motion.div 
    layout
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="bg-surface-container-lowest rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center group transition-all duration-200 hover:translate-x-1 shadow-[0_8px_24px_rgba(25,28,29,0.04)]"
  >
    <div className="w-32 h-32 bg-surface-container-low rounded-lg overflow-hidden flex-shrink-0">
      <img 
        alt={item.name} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        src={getCartImageSrc(item)}
        referrerPolicy="no-referrer"
      />
    </div>
    <div className="flex-grow w-full space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest font-headline block mb-1 text-slate-500">
            {item.manufacturer || 'Medicine'}
          </span>
          <h3 className="text-lg font-bold font-headline text-on-surface leading-tight">{item.name}</h3>
          <p className="text-sm text-on-surface-variant font-medium">
            {item.requires_rx ? 'Prescription Required' : 'OTC Item'}
          </p>
        </div>
        <span className="text-xl font-bold font-headline text-on-surface">${Number(item.unit_price || 0).toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center bg-surface-container-low rounded-full px-2 py-1 gap-4">
          <button 
            onClick={() => onQuantityChange(item.medicine_id, -1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-colors text-on-surface-variant active:scale-90"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm w-4 text-center">{item.quantity.toString().padStart(2, '0')}</span>
          <button 
            onClick={() => onQuantityChange(item.medicine_id, 1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-colors text-on-surface-variant active:scale-90"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <button 
          onClick={() => onQuantityChange(item.medicine_id, -Number(item.quantity || 0))}
          className="flex items-center gap-2 text-error text-xs font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-all active:scale-95"
        >
          <Trash2 className="w-4 h-4" />
          Remove
        </button>
      </div>
    </div>
  </Motion.div>
);

const CartItemList = ({ items, onQuantityChange }) => (
  <div className="space-y-6">
    <AnimatePresence mode="popLayout">
      {items.length > 0 ? (
        items.map((item) => (
          <CartItemCard 
            key={item.id} 
            item={item} 
            onQuantityChange={onQuantityChange}
          />
        ))
      ) : (
        <Motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-surface-container-lowest rounded-xl p-12 text-center shadow-sm"
        >
          <ShoppingCart className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <p className="text-on-surface-variant font-medium">Your cart is empty.</p>
          <button className="mt-4 text-primary font-bold hover:underline">Browse Inventory</button>
        </Motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default CartItemList;
