import React from 'react';

const OrdersEmptyState = () => {
  return (
    <div className="hidden flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-6 text-slate-400">
        <span className="material-symbols-outlined text-4xl" data-icon="inbox">inbox</span>
      </div>
      <h3 className="font-headline text-2xl font-bold text-emerald-900 mb-2">No orders found</h3>
      <p className="text-on-surface-variant max-w-sm mb-8">You haven't placed any medical requests yet. Explore our inventory to start your first shipment.</p>
      <button className="primary-gradient text-white px-8 py-3 rounded-full font-bold text-sm">Explore Inventory</button>
    </div>
  );
};

export default OrdersEmptyState;
