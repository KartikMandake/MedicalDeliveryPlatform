import React from 'react';
import { Home, LayoutGrid, ReceiptText, CircleHelp } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const mobileLinkClass = ({ isActive }) =>
  `flex flex-col items-center justify-center ${isActive ? 'text-green-600 scale-110' : 'text-zinc-400'}`;

const CartFloatingActions = () => (
  <nav className="lg:hidden fixed bottom-0 w-full z-50 glass-nav rounded-t-3xl shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)] border-t border-zinc-200">
    <div className="flex justify-around items-center px-4 pt-3 pb-8 w-full">
      <NavLink className={mobileLinkClass} to="/">
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-widest font-headline mt-1">Home</span>
      </NavLink>
      <NavLink className={mobileLinkClass} to="/products">
        <LayoutGrid className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-widest font-headline mt-1">Categories</span>
      </NavLink>
      <NavLink className={mobileLinkClass} to="/tracking">
        <ReceiptText className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-widest font-headline mt-1">Orders</span>
      </NavLink>
      <NavLink className={mobileLinkClass} to="/upload">
        <CircleHelp className="w-6 h-6" />
        <span className="text-[10px] font-bold uppercase tracking-widest font-headline mt-1">Help</span>
      </NavLink>
    </div>
  </nav>
);

export default CartFloatingActions;
