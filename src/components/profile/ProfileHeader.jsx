import React from 'react';

const ProfileHeader = () => {
  return (
    <div className="mb-12 space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-semibold tracking-wide font-label uppercase">
        <span className="material-symbols-outlined text-[14px]" data-icon="verified_user" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
        Elite Member
      </div>
      <h2 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight">Profile & Preferences</h2>
      <p className="text-on-surface-variant max-w-lg">Manage your clinical identity, delivery destinations, and secure healthcare credentials in one place.</p>
    </div>
  );
};

export default ProfileHeader;