import React from 'react';
import { Link } from 'react-router-dom';

const OrdersSidebar = () => {
  return (
    <aside className="hidden md:flex flex-col h-screen w-64 border-r border-slate-200 bg-slate-50 sticky top-0 z-40 p-4 gap-y-2">
      <div className="mb-8 px-4">
        <h1 className="font-headline font-bold text-emerald-900 text-xl tracking-tighter">Clinical Portal</h1>
        <p className="text-xs text-slate-500 font-medium">Precision Logistics</p>
      </div>
      <nav className="flex flex-col gap-y-1 flex-1">
        <Link className="text-slate-600 py-2 px-4 hover:bg-slate-100 hover:translate-x-1 transition-all flex items-center gap-3 rounded-lg" to="#">
          <span className="material-symbols-outlined text-emerald-700" data-icon="dashboard">dashboard</span>
          <span className="font-medium text-sm">Dashboard</span>
        </Link>
        <Link className="bg-white text-emerald-700 shadow-sm rounded-lg py-2 px-4 flex items-center gap-3 transition-all" to="#">
          <span className="material-symbols-outlined" data-icon="local_shipping">local_shipping</span>
          <span className="font-medium text-sm">Active Shipments</span>
        </Link>
        <Link className="text-slate-600 py-2 px-4 hover:bg-slate-100 hover:translate-x-1 transition-all flex items-center gap-3 rounded-lg" to="#">
          <span className="material-symbols-outlined text-emerald-700" data-icon="ac_unit">ac_unit</span>
          <span className="font-medium text-sm">Cold Chain</span>
        </Link>
        <Link className="text-slate-600 py-2 px-4 hover:bg-slate-100 hover:translate-x-1 transition-all flex items-center gap-3 rounded-lg" to="#">
          <span className="material-symbols-outlined text-emerald-700" data-icon="description">description</span>
          <span className="font-medium text-sm">Records</span>
        </Link>
        <Link className="text-slate-600 py-2 px-4 hover:bg-slate-100 hover:translate-x-1 transition-all flex items-center gap-3 rounded-lg" to="#">
          <span className="material-symbols-outlined text-emerald-700" data-icon="settings">settings</span>
          <span className="font-medium text-sm">Settings</span>
        </Link>
      </nav>
      <div className="mt-auto flex flex-col gap-y-1 pt-4 border-t border-slate-200">
        <Link className="text-slate-600 py-2 px-4 hover:bg-slate-100 hover:translate-x-1 transition-all flex items-center gap-3 rounded-lg" to="#">
          <span className="material-symbols-outlined" data-icon="help_outline">help_outline</span>
          <span className="font-medium text-sm">Help Center</span>
        </Link>
        <Link className="text-slate-600 py-2 px-4 hover:bg-slate-100 hover:translate-x-1 transition-all flex items-center gap-3 rounded-lg" to="#">
          <span className="material-symbols-outlined" data-icon="logout">logout</span>
          <span className="font-medium text-sm">Log Out</span>
        </Link>
      </div>
    </aside>
  );
};

export default OrdersSidebar;
