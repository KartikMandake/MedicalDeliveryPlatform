import { Link, useLocation } from 'react-router-dom';

export default function RetailerFooter() {
  const location = useLocation();
  const isDashboard = location.pathname === '/retailer/dashboard';
  const isInventory = location.pathname === '/retailer/inventory';
  const isOrders = location.pathname === '/retailer/orders';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] h-16 flex items-center justify-around px-2 z-50">
      <Link to="/retailer/dashboard" className={`flex flex-col items-center gap-1 ${isDashboard ? 'text-green-600' : 'text-zinc-400'}`}>
        <span className="material-symbols-outlined" style={isDashboard ? { fontVariationSettings: "'FILL' 1" } : undefined}>dashboard</span>
        <span className={`text-[10px] ${isDashboard ? 'font-bold' : ''}`}>Home</span>
      </Link>

      <Link to="/retailer/inventory" className={`flex flex-col items-center gap-1 ${isInventory ? 'text-green-600' : 'text-zinc-400'}`}>
        <span className="material-symbols-outlined" style={isInventory ? { fontVariationSettings: "'FILL' 1" } : undefined}>inventory_2</span>
        <span className={`text-[10px] ${isInventory ? 'font-bold' : ''}`}>Stock</span>
      </Link>

      <div className="relative -top-6">
        <button
          type="button"
          className="w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center border-4 border-white"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>

      <Link to="/retailer/orders" className={`flex flex-col items-center gap-1 ${isOrders ? 'text-green-600' : 'text-zinc-400'}`}>
        <span className="material-symbols-outlined" style={isOrders ? { fontVariationSettings: "'FILL' 1" } : undefined}>local_shipping</span>
        <span className={`text-[10px] ${isOrders ? 'font-bold' : ''}`}>Track</span>
      </Link>

      <Link to="/login" className="flex flex-col items-center gap-1 text-zinc-400">
        <span className="material-symbols-outlined">person</span>
        <span className="text-[10px]">Profile</span>
      </Link>
    </nav>
  );
}
