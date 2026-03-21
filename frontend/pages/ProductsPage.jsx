import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductsNavBar from '../components/products/ProductsNavBar';
import ProductsSidebar from '../components/products/ProductsSidebar';
import ProductsGrid from '../components/products/ProductsGrid';
import ProductsPagination from '../components/products/ProductsPagination';
import ProductsFooter from '../components/products/ProductsFooter';

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const urlSearch = (searchParams.get('search') || '').trim();
  const [filters, setFilters] = useState({ categories: [], brands: [], maxPrice: 1000, inStockOnly: false, search: urlSearch });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: urlSearch }));
    setPage(1);
  }, [urlSearch]);

  return (
    <>
      <ProductsNavBar />
      <main className="pt-20 pb-16 px-4 lg:px-5 max-w-screen-2xl mx-auto flex gap-6">
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          <ProductsSidebar filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />
          <section className="flex-1">
            <ProductsGrid
              filters={filters}
              page={page}
              onTotalPages={setTotalPages}
              onFiltersChange={(f) => { setFilters(f); setPage(1); }}
            />
            <ProductsPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </section>
        </div>
      </main>
      <ProductsFooter />
    </>
  );
}
