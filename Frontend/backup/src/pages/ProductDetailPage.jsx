import React, { useEffect } from 'react';
import ProductDetailNavBar from '../components/product-detail/ProductDetailNavBar';
import ProductBreadcrumb from '../components/product-detail/ProductBreadcrumb';
import ProductVisualization from '../components/product-detail/ProductVisualization';
import ProductControls from '../components/product-detail/ProductControls';
import ProductTabs from '../components/product-detail/ProductTabs';
import GenericAlternatives from '../components/product-detail/GenericAlternatives';
import RelatedMedicines from '../components/product-detail/RelatedMedicines';
import TrackingFloatingBar from '../components/product-detail/TrackingFloatingBar';
import ProductFooter from '../components/product-detail/ProductFooter';

const ProductDetailPage = () => {
  useEffect(() => {
    document.title = 'Product Details - MediFlow';
    document.body.className = "bg-surface font-body text-on-surface";
  }, []);

  return (
    <>
      <ProductDetailNavBar />
      
      <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto">
        <ProductBreadcrumb />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <ProductVisualization />
          <ProductControls />
        </div>
        
        <ProductTabs />
        <GenericAlternatives />
        <RelatedMedicines />
      </main>

      <TrackingFloatingBar />
      <ProductFooter />
    </>
  );
};

export default ProductDetailPage;
