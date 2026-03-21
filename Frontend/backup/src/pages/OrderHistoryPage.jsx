import React from 'react';
import OrdersSidebar from '../components/orders/OrdersSidebar';
import OrdersHeader from '../components/orders/OrdersHeader';
import OrdersFilters from '../components/orders/OrdersFilters';
import { ActiveOrderCard, DeliveredOrderCard, ProcessingOrderCard } from '../components/orders/OrderCards';
import OrdersEmptyState from '../components/orders/OrdersEmptyState';
import OrdersFooter from '../components/orders/OrdersFooter';
import OrdersMobileNav from '../components/orders/OrdersMobileNav';

const OrderHistoryPage = () => {
  // Demo condition to show cards instead of empty state
  const hasOrders = true;

  return (
    <div className="bg-surface font-body text-on-surface">
      <div className="flex min-h-screen">
        <OrdersSidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-surface">
          <OrdersHeader />
          
          {/* Scrollable Content */}
          <div className="pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto">
            {/* Hero Section: Editorial Asymmetry */}
            <div className="grid grid-cols-12 gap-8 mb-12">
              <div className="col-span-12 lg:col-start-3 lg:col-span-8">
                <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-emerald-900 tracking-tight mb-4">My Orders</h1>
                <p className="text-on-surface-variant max-w-xl text-lg">Manage your critical medical supply chain. View live logistics, historical records, and reorder essential clinical inventory.</p>
              </div>
            </div>
            
            {hasOrders ? (
              <>
                <OrdersFilters />
                
                {/* Order List: Bento-inspired Tonal Cards */}
                <div className="space-y-8">
                  <ActiveOrderCard />
                  <DeliveredOrderCard />
                  <ProcessingOrderCard />
                </div>
              </>
            ) : (
              <OrdersEmptyState />
            )}
          </div>
          
          <OrdersFooter />
        </main>
      </div>
      
      <OrdersMobileNav />
    </div>
  );
};

export default OrderHistoryPage;
