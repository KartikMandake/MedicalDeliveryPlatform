import React from 'react';

const MembershipStatusCard = () => {
  return (
    <section className="md:col-span-4 bg-primary text-on-primary rounded-xl p-8 flex flex-col justify-between shadow-lg">
      <div>
        <span className="material-symbols-outlined text-3xl mb-4" data-icon="award_star" style={{ fontVariationSettings: "'FILL' 1" }}>award_star</span>
        <h4 className="font-headline text-lg font-bold">MediFlow Pro</h4>
        <p className="text-on-primary/80 text-sm mt-1">Priority cold-chain handling active.</p>
      </div>
      <div className="mt-6">
        <div className="text-xs uppercase tracking-widest opacity-70 mb-1">Membership ID</div>
        <div className="font-mono text-lg font-bold">MF-2024-8891</div>
      </div>
    </section>
  );
};

export default MembershipStatusCard;