import React from 'react';
import { Link } from 'react-router-dom';

const ProductBreadcrumb = () => {
  return (
    <nav className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-8">
      <Link className="hover:text-primary transition-colors" to="/">Home</Link>
      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
      <Link className="hover:text-primary transition-colors" to="/products">Antibiotics</Link>
      <span className="material-symbols-outlined text-[14px]">chevron_right</span>
      <span className="text-primary font-semibold">Amoxicillin 500mg</span>
    </nav>
  );
};

export default ProductBreadcrumb;
