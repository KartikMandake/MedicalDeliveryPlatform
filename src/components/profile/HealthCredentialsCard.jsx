import React from 'react';

const HealthCredentialsCard = () => {
  return (
    <section className="md:col-span-6 bg-surface-container-low rounded-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-headline text-xl font-bold">Health Credentials</h4>
        <span className="material-symbols-outlined text-tertiary" data-icon="encrypted">encrypted</span>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg border-l-4 border-tertiary">
          <div>
            <span className="text-xs text-on-surface-variant block mb-1">Insurance Provider</span>
            <span className="font-semibold">BlueShield Global Precision</span>
          </div>
          <span className="material-symbols-outlined text-outline-variant" data-icon="chevron_right">chevron_right</span>
        </div>
        <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg">
          <div>
            <span className="text-xs text-on-surface-variant block mb-1">Blood Group</span>
            <span className="font-semibold text-error">O- (Universal Donor)</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HealthCredentialsCard;