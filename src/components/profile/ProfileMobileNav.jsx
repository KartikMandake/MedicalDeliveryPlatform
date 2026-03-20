import React from 'react';

const ProfileMobileNav = () => {
  return (
    <header className="md:hidden fixed top-0 w-full z-50 flex items-center justify-between px-6 py-3 bg-white/70 backdrop-blur-md shadow-sm">
      <span className="text-xl font-bold tracking-tighter text-emerald-900 font-manrope">MediFlow</span>
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-emerald-800" data-icon="notifications">notifications</span>
        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
          <span className="material-symbols-outlined text-sm" data-icon="person">person</span>
        </div>
      </div>
    </header>
  );
};

export default ProfileMobileNav;