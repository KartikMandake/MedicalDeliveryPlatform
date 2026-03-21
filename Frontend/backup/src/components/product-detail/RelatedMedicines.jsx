import React from 'react';

const RelatedMedicines = () => {
  return (
    <section className="mt-24">
      <h2 className="text-3xl font-extrabold text-emerald-900 font-headline mb-8">Related Medicines</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {/* Small Card 1 */}
        <div className="group">
          <div className="aspect-square bg-surface-container rounded-xl mb-3 overflow-hidden">
            <img className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Paracetamol 500mg medicine strip" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_aC22FFlBt_GKeFuwRujSx9c5tgtRFcg0ZWG9CjpyUtz5cuYrTBa-09zEn1fTwpbfYTViXKX0J9CiOyp1EeEewyzFkT632NvTG2lcze7Pb0NYxpJU69brZs36bRZUWFldVr-Oce4CpJf4W8bOxo1757WMJsKSzhQ0VDHxu3ZcHqy7x_705pfzmdVw54dOw0oNnejioe6b0gIHsMGZRgsFZi_96mv5hwOWMIKWOpfa-gzhRlayEpXp9VY1W5pfxOqfCnaNyJDwZ-lR" />
          </div>
          <h5 className="font-bold text-sm">Paracetamol 500mg</h5>
          <p className="text-xs text-on-surface-variant mb-2">Pain Relief</p>
          <p className="text-emerald-700 font-bold">$4.50</p>
        </div>
        
        {/* Small Card 2 */}
        <div className="group">
          <div className="aspect-square bg-surface-container rounded-xl mb-3 overflow-hidden">
            <img className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Vitamin C 1000mg chewable tablets bottle" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWa8QnF49Oz95cZng-iWbjazoQkKYMDAdM579rX8rls7em6rqXUFgK4-STGCLxq1ORaRooeDlbgepY67Vy4oBw-Fm7Y0mR08ff_rjmEsyiOLaJ7kulyI6c-S8fmHgLLCcg8HAxaBYaIn3kpSjkfKov1HDBoiWvIiK-bovGyGmrWlZje-FxXhCZAD-zQdqZBVUK1pOT6wxTyG39G1Qec2Ps0gc9E7x_VMFVkOm1D1o7Kmmf8B0VCMi1YaGdDzE9_whODw6nuWIy1YTC" />
          </div>
          <h5 className="font-bold text-sm">Vitamin C 1000mg</h5>
          <p className="text-xs text-on-surface-variant mb-2">Supplements</p>
          <p className="text-emerald-700 font-bold">$12.00</p>
        </div>
        
        {/* Small Card 3 */}
        <div className="group">
          <div className="aspect-square bg-surface-container rounded-xl mb-3 overflow-hidden">
            <img className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Ibuprofen 200mg capsules" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2-gPAsuCzG9cEHFbh2IxM0mrGhMoyxqMpyHpTW0u5F9fG87dEOaoFfUeFfgflGCZg6g4UK0ZaeKpxWYebp1x14SNZdT7kFNmtyMwIgDla7FQfEnQVBtYpBLJ5XystOOtgTJd7YiF7YovLu2SBc0BS-kSSREyydpiSZ5uxSYtaFzwep-E9SyBzW_N3oOtVLp1Of_uUYNyjFj3vKZifHDlsRBL2ZgGajbUHH7mya0EV7d6KTsYycnhcuE9-pKJoePQQ-OW8Al_quz7e" />
          </div>
          <h5 className="font-bold text-sm">Ibuprofen 200mg</h5>
          <p className="text-xs text-on-surface-variant mb-2">NSAID</p>
          <p className="text-emerald-700 font-bold">$6.25</p>
        </div>
        
        {/* Small Card 4 */}
        <div className="group">
          <div className="aspect-square bg-surface-container rounded-xl mb-3 overflow-hidden">
            <img className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Cough Syrup expectorant bottle" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6LrSPvlZ_jqFKmU3UdZ4TfRieCcDAme8Ri0QnLXh0VY_dYhMEcNuUIhueKYfSGtXU3KT14CysWYYY7ZrHVQ2SO3Eb6OU7QHDQSPLPf_SOSu7Gaka2czJ87kuLKcTmSjFNX1Z3o7oXWhiGl2Oa9AQWZpsACH90eDR9zpw-J9S5gnmXwpZ15UuI0eh2gySCGPnRuuEV1mWfIwPPxliJ278_gYHmpAxrXmBq-ScOztp1BxhYWP3IPPoXVbwTNjE-V5NYt2Rs0HAXdauS" />
          </div>
          <h5 className="font-bold text-sm">Chest-Eze Syrup</h5>
          <p className="text-xs text-on-surface-variant mb-2">Cough Care</p>
          <p className="text-emerald-700 font-bold">$8.90</p>
        </div>
        
        {/* Small Card 5 */}
        <div className="group">
          <div className="aspect-square bg-surface-container rounded-xl mb-3 overflow-hidden">
            <img className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Azithromycin 250mg tablets" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBviDBNSIr7Nt1HA6b0lJtCkpjJ4CRujDaNJXxETZJHpBZGBd50x33fx37zoKpiH7kPTVuzRtCd-Pr5CfhcTlh1VKlM8bJoXYmwYQwcfyqP9Wg4RNhIaDOr9S89ku065nE5rUPKJu9rmcA2YPXpQ0d_hacmtrBqbiy4KtX9xOjMXJ1nfXGzUGA-EF62znRZN_pQhdRO8lVpkU3mcM0fnuKtYPQLWqNOIHQ-n6f9Ddhnpc-660kCliAs-Ukqa-ieBGQGPyw0oalai9sB" />
          </div>
          <h5 className="font-bold text-sm">Azithromycin 250mg</h5>
          <p className="text-xs text-on-surface-variant mb-2">Antibiotics</p>
          <p className="text-emerald-700 font-bold">$22.00</p>
        </div>
      </div>
    </section>
  );
};

export default RelatedMedicines;
