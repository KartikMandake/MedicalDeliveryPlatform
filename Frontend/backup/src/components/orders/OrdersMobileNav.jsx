import React from 'react';
import { Link } from 'react-router-dom';

const OrdersMobileNav = () => {
  return (
    <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-50 px-6 py-3 flex justify-between items-center">
      <Link className="flex flex-col items-center text-slate-400" to="#">
        <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
        <span className="text-[10px] mt-1">Dash</span>
      </Link>
      <Link className="flex flex-col items-center text-emerald-700" to="#">
        <span className="material-symbols-outlined" data-icon="local_shipping" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
        <span className="text-[10px] mt-1">Orders</span>
      </Link>
      <Link className="flex flex-col items-center text-slate-400" to="#">
        <span className="material-symbols-outlined" data-icon="medical_services">medical_services</span>
        <span className="text-[10px] mt-1">Rx</span>
      </Link>
      <Link className="flex flex-col items-center text-slate-400" to="#">
        <span className="material-symbols-outlined" data-icon="settings">settings</span>
        <span className="text-[10px] mt-1">Settings</span>
      </Link>
    </div>
  );
};

export default OrdersMobileNav;
