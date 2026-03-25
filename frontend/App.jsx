import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Component, lazy, Suspense, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const CreateAccountPage = lazy(() => import('./pages/CreateAccountPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const LoginSuccessPage = lazy(() => import('./pages/LoginSuccess'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const TrackingPage = lazy(() => import('./pages/TrackingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AgentDashboardPage = lazy(() => import('./pages/AgentDashboardPage'));
const AgentPerformancePage = lazy(() => import('./pages/AgentPerformancePage'));
const AgentHistoryPage = lazy(() => import('./pages/AgentHistoryPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const RetailerDashboardPage = lazy(() => import('./pages/RetailerDashboardPage'));
const RetailerOrdersPage = lazy(() => import('./pages/RetailerOrdersPage'));
const RetailerInventoryPage = lazy(() => import('./pages/RetailerInventoryPage'));
const RetailerProfilePage = lazy(() => import('./pages/RetailerProfilePage'));
const PatientProfilePage = lazy(() => import('./pages/PatientProfilePage'));
const AgentProfilePage = lazy(() => import('./pages/AgentProfilePage'));

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 bg-[#f8f9fa] flex items-center justify-center p-6 font-body">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
            <div className="bg-slate-900 px-8 py-6 text-white">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-rose-400 text-2xl">error</span>
                <div>
                  <h2 className="text-lg font-extrabold font-headline">Something went wrong</h2>
                  <p className="text-xs text-slate-400 mt-0.5">An unexpected error occurred on this page.</p>
                </div>
              </div>
            </div>
            <div className="p-8">
              <pre className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-4 rounded-xl overflow-auto max-h-40 whitespace-pre-wrap font-mono">
                {this.state.error.toString()}
              </pre>
              <button onClick={() => this.setState({ error: null })}
                className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-extrabold hover:bg-emerald-600 transition-colors cursor-pointer">
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Loader = () => (
  <div className="fixed inset-0 bg-[#f8f9fa] flex flex-col items-center justify-center gap-4">
    <div className="relative">
      <div className="w-12 h-12 border-[3px] border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
    </div>
    <div className="text-center">
      <p className="text-sm font-extrabold text-slate-900 font-headline">MediFlow</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Loading</p>
    </div>
  </div>
);

function RouteTitleManager() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    const titleMap = {
      '/home': 'Home',
      '/login': 'Login',
      '/register': 'Create Account',
      '/products': 'Products',
      '/cart': 'Cart',
      '/checkout': 'Checkout',
      '/orders': 'Orders',
      '/help': 'Help',
      '/tracking': 'Tracking',
      '/dashboard': 'Dashboard',
      '/agent': 'Agent Dashboard',
      '/agent/performance': 'Agent Performance',
      '/agent/history': 'Agent History',
      '/admin': 'Admin Dashboard',
      '/payments': 'Payments',
      '/upload': 'Upload Prescription',
      '/retailer/dashboard': 'Retailer Dashboard',
      '/retailer/orders': 'Retailer Orders',
      '/retailer/inventory': 'Retailer Inventory',
      '/retailer/profile': 'Store Profile',
      '/agent/profile': 'Agent Profile',
      '/profile': 'My Profile',
    };

    let pageTitle = titleMap[pathname];
    if (!pageTitle && pathname.startsWith('/products/')) {
      pageTitle = 'Product Details';
    }
    if (!pageTitle && pathname === '/') {
      pageTitle = 'Dashboard';
    }

    document.title = `MediFlow | ${pageTitle || 'Clinical Platform'}`;
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <RouteTitleManager />
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/home" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
                <Route path="/login" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />
                <Route path="/register" element={<ErrorBoundary><CreateAccountPage /></ErrorBoundary>} />
                <Route path="/forgot-password" element={<ErrorBoundary><ForgotPasswordPage /></ErrorBoundary>} />
                <Route path="/reset-password/:token" element={<ErrorBoundary><ResetPasswordPage /></ErrorBoundary>} />
                <Route path="/login-success" element={<ErrorBoundary><LoginSuccessPage /></ErrorBoundary>} />
                <Route path="/products" element={<ErrorBoundary><ProductsPage /></ErrorBoundary>} />
                <Route path="/products/:id" element={<ErrorBoundary><ProductDetailsPage /></ErrorBoundary>} />
                <Route path="/cart" element={<ErrorBoundary><CartPage /></ErrorBoundary>} />
                <Route path="/checkout" element={<ErrorBoundary><CheckoutPage /></ErrorBoundary>} />
                <Route path="/orders" element={<ErrorBoundary><OrdersPage /></ErrorBoundary>} />
                  <Route path="/help" element={<ErrorBoundary><HelpPage /></ErrorBoundary>} />
                  <Route path="/tracking" element={<ErrorBoundary><TrackingPage /></ErrorBoundary>} />
                  <Route path="/dashboard" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
                  <Route path="/agent" element={<ErrorBoundary><AgentDashboardPage /></ErrorBoundary>} />
                  <Route path="/agent/performance" element={<ErrorBoundary><AgentPerformancePage /></ErrorBoundary>} />
                  <Route path="/agent/history" element={<ErrorBoundary><AgentHistoryPage /></ErrorBoundary>} />
                  <Route path="/admin" element={<ErrorBoundary><AdminDashboardPage /></ErrorBoundary>} />
                  <Route path="/payments" element={<ErrorBoundary><PaymentsPage /></ErrorBoundary>} />
                  <Route path="/upload" element={<ErrorBoundary><UploadPage /></ErrorBoundary>} />
                  {/* Retailer routes */}
                  <Route path="/retailer/dashboard" element={<ErrorBoundary><RetailerDashboardPage /></ErrorBoundary>} />
                  <Route path="/retailer/orders" element={<ErrorBoundary><RetailerOrdersPage /></ErrorBoundary>} />
                  <Route path="/retailer/inventory" element={<ErrorBoundary><RetailerInventoryPage /></ErrorBoundary>} />
                  <Route path="/retailer/profile" element={<ErrorBoundary><RetailerProfilePage /></ErrorBoundary>} />
                  {/* Agent routes improvements */}
                  <Route path="/agent/profile" element={<ErrorBoundary><AgentProfilePage /></ErrorBoundary>} />
                  {/* Patient profile */}
                  <Route path="/profile" element={<ErrorBoundary><PatientProfilePage /></ErrorBoundary>} />
                </Routes>
              </Suspense>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
