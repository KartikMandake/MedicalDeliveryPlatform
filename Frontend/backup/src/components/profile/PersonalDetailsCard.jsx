import React from 'react';

const PersonalDetailsCard = () => {
  return (
    <section className="md:col-span-6 bg-surface-container-low rounded-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-headline text-xl font-bold">Personal Details</h4>
        <button className="text-primary font-semibold text-sm hover:underline">Edit</button>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-surface-container-lowest rounded-lg">
            <span className="text-xs text-on-surface-variant block mb-1">Date of Birth</span>
            <span className="font-semibold">March 12, 1985</span>
          </div>
          <div className="p-4 bg-surface-container-lowest rounded-lg">
            <span className="text-xs text-on-surface-variant block mb-1">Gender</span>
            <span className="font-semibold">Female</span>
          </div>
        </div>
        <div className="p-4 bg-surface-container-lowest rounded-lg">
          <span className="text-xs text-on-surface-variant block mb-1">Preferred Language</span>
          <span className="font-semibold">English (US)</span>
        </div>
      </div>
    </section>
  );
};

export default PersonalDetailsCard;