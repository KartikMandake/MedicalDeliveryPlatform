import ProductsNavBar from '../components/products/ProductsNavBar';
import ProductsSidebar from '../components/products/ProductsSidebar';
import ProductsGrid from '../components/products/ProductsGrid';
import ProductsPagination from '../components/products/ProductsPagination';
import ProductsFloatingActions from '../components/products/ProductsFloatingActions';
import ProductsFooter from '../components/products/ProductsFooter';

export default function ProductsPage() {
  return (
    <>
      <ProductsNavBar />
      <main className="pt-24 pb-20 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          <ProductsSidebar />
          <section className="flex-1">
            <ProductsGrid />
            <ProductsPagination />
          </section>
        </div>
      </main>
      <ProductsFloatingActions />
      <ProductsFooter />
    </>
  );
}
