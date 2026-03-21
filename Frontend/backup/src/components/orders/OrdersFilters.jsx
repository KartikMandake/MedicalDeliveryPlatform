import React from 'react';

const OrdersFilters = () => {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
      <button className="bg-primary-container text-on-primary-container px-5 py-2 rounded-full text-sm font-semibold">All Orders</button>
      <button className="bg-surface-container-high text-on-surface-variant px-5 py-2 rounded-full text-sm font-semibold hover:bg-surface-variant transition-colors">Active</button>
      <button className="bg-surface-container-high text-on-surface-variant px-5 py-2 rounded-full text-sm font-semibold hover:bg-surface-variant transition-colors">Delivered</button>
      <button className="bg-surface-container-high text-on-surface-variant px-5 py-2 rounded-full text-sm font-semibold hover:bg-surface-variant transition-colors">Cancelled</button>
      <button className="bg-surface-container-high text-on-surface-variant px-5 py-2 rounded-full text-sm font-semibold hover:bg-surface-variant transition-colors">Processing</button>
    </div>
  );
};

export default OrdersFilters;
