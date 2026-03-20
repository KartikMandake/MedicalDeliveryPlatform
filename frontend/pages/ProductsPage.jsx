import { useState } from 'react';
import ProductsNavBar from '../components/products/ProductsNavBar';
import ProductsSidebar from '../components/products/ProductsSidebar';
import ProductsGrid from '../components/products/ProductsGrid';
import ProductsPagination from '../components/products/ProductsPagination';
import ProductsFloatingActions from '../components/products/ProductsFloatingActions';
import ProductsFooter from '../components/products/ProductsFooter';

export default function ProductsPage() {
  const [filters, setFilters] = useState({ categories: [], brands: [], maxPrice: 1000 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  return (
    <>
      <ProductsNavBar />
      <main className="pt-24 pb-20 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          <ProductsSidebar filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />
          <section className="flex-1">
            <ProductsGrid filters={filters} page={page} onTotalPages={setTotalPages} />
            <ProductsPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </section>
        </div>
      </main>
      <ProductsFloatingActions />
      <ProductsFooter />
    </>
  );
}
