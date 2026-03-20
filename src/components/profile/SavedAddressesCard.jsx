import React from 'react';

const SavedAddressesCard = () => {
  return (
    <section className="md:col-span-12 bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h4 className="font-headline text-xl font-bold">Secure Delivery Locations</h4>
          <p className="text-sm text-on-surface-variant mt-1">Authorized addresses for medical logistics.</p>
        </div>
        <button className="bg-surface-container-high px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-surface-variant transition-colors">
          <span className="material-symbols-outlined text-sm" data-icon="add">add</span>
          Add New Location
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Home */}
        <div className="p-6 rounded-xl border border-outline-variant/20 hover:border-primary/40 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined" data-icon="home">home</span>
            </div>
            <span className="font-bold">Home</span>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            1224 Oakwood Heights<br />San Francisco, CA 94110
          </p>
        </div>
        {/* Work */}
        <div className="p-6 rounded-xl border border-outline-variant/20 hover:border-primary/40 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined" data-icon="apartment">apartment</span>
            </div>
            <span className="font-bold">St. Jude Medical Center</span>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Building B, Suite 405<br />200 Clinical Way, SF
          </p>
        </div>
        {/* Lab */}
        <div className="p-6 rounded-xl border border-outline-variant/20 hover:border-primary/40 transition-colors cursor-pointer group">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined" data-icon="biotech">biotech</span>
            </div>
            <span className="font-bold">Precision Lab</span>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            77 Research Plaza<br />Bio-District, CA 94080
          </p>
        </div>
      </div>
    </section>
  );
};

export default SavedAddressesCard;