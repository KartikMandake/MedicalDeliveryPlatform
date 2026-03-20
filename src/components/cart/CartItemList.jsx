export default function CartItemList() {
  return (
    <>
      <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center border border-transparent transition-all hover:shadow-md">
        <div className="w-24 h-24 bg-surface-container rounded-lg flex-shrink-0 overflow-hidden">
          <img alt="Amoxicillin 500mg" className="w-full h-full object-cover" data-alt="Box of amoxicillin antibiotic medicine capsules" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYRUFD3T4YDsRC3Cy7KHqklkTvqXrjFhwcZPAdtCqDoLQpec5BoF3o3EMsZt1j7vrqq3K0TXCmIng-8EkWTxzk0vMLIgV7xtr7xm7SXh09_H56EVQb2llfANrHJMgg39qxrLgS_up5yz2JX1c3ynFyiwR8IxAlpj64SlOHMlMr7DIG6CMmLx_No5LNiaDynRwcl0h8SJZRYz4DGHlQ7F_TxOFyBxWz0qQp3rgE1FNKF2ElaLsTg2sbsuDSYkaQxKIiX7XQC98n_9xQ"/>
        </div>
        <div className="flex-grow space-y-2 w-full">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-headline font-bold text-lg">Amoxicillin 500mg</h3>
              <p className="text-sm text-outline">Antibiotic • 30 Capsules</p>
            </div>
            <span className="font-headline font-bold text-xl">$24.50</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant text-xs font-bold rounded-full uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              Prescription Required
            </span>
            <div className="flex items-center bg-surface-container rounded-full px-1 py-1">
              <button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors"><span className="material-symbols-outlined text-sm">remove</span></button>
              <span className="w-8 text-center font-bold text-sm">01</span>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors"><span className="material-symbols-outlined text-sm">add</span></button>
            </div>
            <button className="text-error text-sm font-medium flex items-center gap-1 hover:underline ml-auto">
              <span className="material-symbols-outlined text-sm">delete</span>
              Remove
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col sm:flex-row gap-6 items-center border border-transparent transition-all hover:shadow-md">
        <div className="w-24 h-24 bg-surface-container rounded-lg flex-shrink-0 overflow-hidden">
          <img alt="Vitamin D3 Supplement" className="w-full h-full object-cover" data-alt="Bottle of professional grade vitamin D3 supplements" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMy-hbHooKPpDAYLIxTs47cD4W6quTPU-LYOx9JVM4oZEKOBhNcAM3g9_6aYISVxQAEFT3gKhiOytFaI3oh8Ar912-M97D8Y5DDAhHAi6vqYvWQOEehWlrZT7y4Z9zttveRB2UL7h9yzryQAIcvBSgTBGdt7fCXd9UXJurWmq-eT0hRn5qaqRs3hhhKHq3QZ8ew357gpjq15ytDZj5YUIG68TS2fvFC3Iv6Ni3hisD6Q4dXonMqyGriCUrpDGdxN4SiKOOnMG5t7LJ"/>
        </div>
        <div className="flex-grow space-y-2 w-full">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-headline font-bold text-lg">Vitamin D3 5000 IU</h3>
              <p className="text-sm text-outline">Dietary Supplement • 60 Softgels</p>
            </div>
            <span className="font-headline font-bold text-xl">$18.25</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center bg-surface-container rounded-full px-1 py-1">
              <button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors"><span className="material-symbols-outlined text-sm">remove</span></button>
              <span className="w-8 text-center font-bold text-sm">02</span>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded-full transition-colors"><span className="material-symbols-outlined text-sm">add</span></button>
            </div>
            <button className="text-error text-sm font-medium flex items-center gap-1 hover:underline ml-auto">
              <span className="material-symbols-outlined text-sm">delete</span>
              Remove
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
