import React from 'react';
import { HeartPulse, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartFooter = () => (
  <footer className="bg-zinc-50 border-t border-zinc-100 mt-20 pb-24 lg:pb-0">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto py-16 px-8">
      <div className="space-y-4">
        <span className="font-headline font-bold text-zinc-900 text-lg">MedPrecision AI</span>
        <p className="text-zinc-500 text-xs leading-relaxed font-body">
          Advanced medical inventory systems powered by clinical intelligence and fluid design patterns.
        </p>
      </div>
      <div>
        <h4 className="font-bold text-xs uppercase tracking-widest text-zinc-900 mb-6">Legal</h4>
        <ul className="space-y-3">
          <li><Link className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors" to="/upload">Privacy Policy</Link></li>
          <li><Link className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors" to="/upload">Terms of Service</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-xs uppercase tracking-widest text-zinc-900 mb-6">Support</h4>
        <ul className="space-y-3">
          <li><Link className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors" to="/upload">Contact Medical Hub</Link></li>
          <li><Link className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors" to="/dashboard">API Documentation</Link></li>
        </ul>
      </div>
      <div className="flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-xs uppercase tracking-widest text-zinc-900 mb-6">Certification</h4>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-200 flex items-center justify-center">
              <HeartPulse className="w-4 h-4 text-zinc-600" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-zinc-200 flex items-center justify-center">
              <Shield className="w-4 h-4 text-zinc-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-8 py-6 border-t border-zinc-100">
      <p className="font-body text-xs text-zinc-500">© 2024 MedPrecision AI. Clinical Excellence & Fluid Intelligence.</p>
    </div>
  </footer>
);

export default CartFooter;
