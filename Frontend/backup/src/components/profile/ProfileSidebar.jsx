import React from 'react';

const ProfileSidebar = () => {
  return (
    <aside className="h-screen w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col p-4 gap-y-2 sticky top-0 hidden md:flex">
      <div className="mb-8 px-4">
        <h1 className="font-manrope font-bold text-emerald-900 dark:text-emerald-100 text-xl tracking-tighter">MediFlow</h1>
        <p className="text-xs font-inter font-medium text-slate-500 uppercase tracking-widest mt-1">Precision Logistics</p>
      </div>
      <nav className="flex-1 space-y-1">
        <div className="cursor-pointer transition-all hover:translate-x-1 duration-200 text-slate-600 dark:text-slate-400 py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 font-inter text-sm font-medium">
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          Dashboard
        </div>
        <div className="cursor-pointer transition-all hover:translate-x-1 duration-200 text-slate-600 dark:text-slate-400 py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 font-inter text-sm font-medium">
          <span className="material-symbols-outlined" data-icon="local_shipping">local_shipping</span>
          Active Shipments
        </div>
        <div className="cursor-pointer transition-all hover:translate-x-1 duration-200 text-slate-600 dark:text-slate-400 py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 font-inter text-sm font-medium">
          <span className="material-symbols-outlined" data-icon="ac_unit">ac_unit</span>
          Cold Chain
        </div>
        <div className="cursor-pointer transition-all hover:translate-x-1 duration-200 text-slate-600 dark:text-slate-400 py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 font-inter text-sm font-medium">
          <span className="material-symbols-outlined" data-icon="description">description</span>
          Records
        </div>
        <div className="cursor-pointer transition-all bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm rounded-lg py-2 px-4 flex items-center gap-3 font-inter text-sm font-medium">
          <span className="material-symbols-outlined" data-icon="settings">settings</span>
          Settings
        </div>
      </nav>
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <div className="cursor-pointer transition-all hover:translate-x-1 duration-200 text-slate-600 dark:text-slate-400 py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 font-inter text-sm font-medium">
          <span className="material-symbols-outlined" data-icon="help_outline">help_outline</span>
          Help Center
        </div>
        <div className="cursor-pointer transition-all hover:translate-x-1 duration-200 text-slate-600 dark:text-slate-400 py-2 px-4 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 font-inter text-sm font-medium">
          <span className="material-symbols-outlined" data-icon="logout">logout</span>
          Log Out
        </div>
      </div>
    </aside>
  );
};

export default ProfileSidebar;