import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Component, lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const TrackingPage = lazy(() => import('./pages/TrackingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AgentDashboardPage = lazy(() => import('./pages/AgentDashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace' }}>
          <h2 style={{ color: 'red' }}>Page Error:</h2>
          <pre style={{ background: '#fee', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap', fontSize: 13 }}>
            {this.state.error.toString()}
          </pre>
          <button onClick={() => this.setState({ error: null })} style={{ marginTop: 16, padding: '8px 16px', cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Loader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', color: '#0d631b' }}>
    Loading...
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
                <Route path="/login" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />
                <Route path="/products" element={<ErrorBoundary><ProductsPage /></ErrorBoundary>} />
                <Route path="/cart" element={<ErrorBoundary><CartPage /></ErrorBoundary>} />
                <Route path="/tracking" element={<ErrorBoundary><TrackingPage /></ErrorBoundary>} />
                <Route path="/dashboard" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
                <Route path="/agent" element={<ErrorBoundary><AgentDashboardPage /></ErrorBoundary>} />
                <Route path="/admin" element={<ErrorBoundary><AdminDashboardPage /></ErrorBoundary>} />
                <Route path="/payments" element={<ErrorBoundary><PaymentsPage /></ErrorBoundary>} />
                <Route path="/upload" element={<ErrorBoundary><UploadPage /></ErrorBoundary>} />
              </Routes>
            </Suspense>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
