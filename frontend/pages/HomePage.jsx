import TopNavBar from '../components/TopNavBar';
import HeroSection from '../components/HeroSection';
import CategoriesSection from '../components/CategoriesSection';
import FeaturesSection from '../components/FeaturesSection';
import PrescriptionSection from '../components/PrescriptionSection';
import ProductsSection from '../components/ProductsSection';
import FloatingActions from '../components/FloatingActions';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <TopNavBar />
      <main className="pt-24 space-y-24 pb-32">
        <HeroSection />
        <CategoriesSection />
        <FeaturesSection />
        <PrescriptionSection />
        <ProductsSection />
      </main>
      <FloatingActions />
      <Footer />
    </>
  );
}
