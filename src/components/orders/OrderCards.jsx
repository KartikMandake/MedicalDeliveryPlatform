import React from 'react';

export const ActiveOrderCard = () => (
  <div className="bg-surface-container-lowest rounded-xl shadow-[0_12px_32px_-4px_rgba(25,28,30,0.06)] overflow-hidden border border-outline-variant/10">
    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-surface-container-low">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">ORDER #MP-82910</span>
          <span className="bg-primary-fixed text-on-primary-fixed-variant px-2 py-0.5 rounded text-[10px] font-bold">ACTIVE</span>
        </div>
        <h3 className="font-headline text-xl font-bold text-emerald-900">Delivery in progress</h3>
        <p className="text-sm text-on-surface-variant">Placed on Oct 24, 2023 • 14:30 EST</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-slate-400 font-medium">Total Amount</p>
        <p className="font-headline text-2xl font-bold text-emerald-900">$1,240.50</p>
      </div>
    </div>
    <div className="p-6 md:p-8 bg-surface-container-low/30">
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-lg border border-outline-variant/10">
          <img alt="Insulin Vials" className="w-12 h-12 rounded bg-surface object-cover" data-alt="Close up of medical insulin vials" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3fXOAZqZ97wUcDw2OvZ8myTG_g5Z7YK-wpbywZQRZwdRL6ygISMD_yCyxRvHpGN2Y0s6mjwzRqxg6bA2TxGTCFedTdZDupDDW6fsHdG5yMmulCSKPRmyhIwR3FgDR8M4N9rfmC2B8v0qdatMFnyLFDWRWrBMnRj2jTwCdPQlfwBBtQjbvgrpugknkt77hKJthISSfFtkslIgeHfyvRfuXBXdbszzNPl_m_TmCVPXFdm23ljkcBFyXA3Lsk4mYSL8UY75hImH4jfDM" />
          <div>
            <p className="text-sm font-semibold">Humalog Insulin 10ml</p>
            <p className="text-xs text-on-surface-variant">Qty: 12 Units</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-lg border border-outline-variant/10">
          <img alt="Syringes" className="w-12 h-12 rounded bg-surface object-cover" data-alt="Standard medical disposable syringes" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCb0nh4r36X6jzFmcPBSBQn_cgFmX3xFwV_CD-e8TkwrL1WqY2w64JzhMZkbvEwNyJk2UIZB1z1kusBoc4j1BQbTsd7cxLb51xqJc8irEPp7B92tvmVki1bQi6qy9AkacbHxNPAihgmmdXWvc99JWxX_FPqQ5lrjJOn2EFUonqrIjczIVelAIwXY5kHCs7g3AR2p-6W4OT1EknDq3bFRJGuy_RMWJzWt8OZ58Sb9jxsgFbFxXVrzogYGiaRwqlN2Dxd8iHvmLwQ1k5h" />
          <div>
            <p className="text-sm font-semibold">Sterile Syringes 3ml</p>
            <p className="text-xs text-on-surface-variant">Qty: 50 Pack</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="primary-gradient text-white px-8 py-3 rounded-full font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all">Track Order</button>
        <button className="bg-surface-container-highest text-on-surface px-8 py-3 rounded-full font-bold text-sm hover:bg-surface-variant transition-colors">View Details</button>
      </div>
    </div>
  </div>
);

export const DeliveredOrderCard = () => (
  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10">
    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex gap-6 items-start">
        <div className="hidden sm:block w-24 h-24 rounded-lg bg-surface-container-low flex-shrink-0 relative overflow-hidden">
          <img alt="Surgical Masks" className="w-full h-full object-cover" data-alt="Blue surgical masks stacked" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGOiVBmrtt_YulttCDZWQK25-pfXvVlD0ZBoVo4BzRBX6Rk4g2l82qTP-3T35YLTBjdCel7EbwbnnJ3H8MOUJplfKXfK3b_g7fdy1Y4S_-WudPat_Q0rDwXsDWO1mFGGLn8ZT-Vo1rKGNUzq-exqzBAxtagrVRcMx9hkXPPaIkfYrarPU25EIngeIK69K07W4hq5WIHNQPVX0o0BO6YWepXIT91wP2T1W1xGpYt-cg4XM92PS9c_9k-dOECQlB9SRk08EsGeFrpTx_" />
          <div className="absolute inset-0 bg-black/5"></div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">ORDER #MP-77219</span>
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">DELIVERED</span>
          </div>
          <h3 className="font-headline text-lg font-bold text-on-surface">Precision Surgical Kit + 3 items</h3>
          <p className="text-sm text-on-surface-variant">Oct 12, 2023 • $892.00</p>
          <div className="pt-4">
            <button className="text-tertiary text-sm font-bold flex items-center gap-1 hover:underline underline-offset-4 decoration-2">
              <span className="material-symbols-outlined text-sm" data-icon="refresh">refresh</span>
              Reorder All
            </button>
          </div>
        </div>
      </div>
      <button className="bg-surface-container-high text-on-surface px-6 py-2 rounded-full font-bold text-sm hover:bg-surface-variant transition-colors">View Details</button>
    </div>
  </div>
);

export const ProcessingOrderCard = () => (
  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10">
    <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex gap-6 items-start">
        <div className="hidden sm:block w-24 h-24 rounded-lg bg-surface-container-low flex-shrink-0 relative overflow-hidden">
          <img alt="Lab Reagents" className="w-full h-full object-cover" data-alt="Vials of medical laboratory reagents" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBylKzJDy_Sj1Xj-IAwvpCSu5Ag718sh8wdtvsGVzuEXRHAGNgoI7wjr4WmLeJPD-ufZa7eNjo1AGvgQWlV-SewkvcsFigay_98t0SrYb0ZsweLGRD52NzdqqThEzr_VoW2BsDQR3yH_p0Yn2qz-YhyTnZv_ns84lrbjtV1msWY7Hu5ErP0_0WPH_r_jt0e102AYg5boaHWBepfbZ0K8Fk2Unw5YL_Q55FecgJ8deB8eQi3-50mI8gfTmwGyoyyJvoPCvN_wCRA55O9" />
          <div className="absolute inset-0 bg-black/5"></div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">ORDER #MP-81204</span>
            <span className="bg-tertiary-fixed-dim text-on-tertiary-fixed px-2 py-0.5 rounded text-[10px] font-bold">PROCESSING</span>
          </div>
          <h3 className="font-headline text-lg font-bold text-on-surface">Lab Reagent Pack A4</h3>
          <p className="text-sm text-on-surface-variant">Oct 22, 2023 • $315.75</p>
        </div>
      </div>
      <button className="bg-surface-container-high text-on-surface px-6 py-2 rounded-full font-bold text-sm hover:bg-surface-variant transition-colors">View Details</button>
    </div>
  </div>
);
