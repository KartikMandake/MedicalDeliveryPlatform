import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as apiLogin, register as apiRegister } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = isRegister ? await apiRegister(form) : await apiLogin(form);
      login(res.data.token, res.data.user);
      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'agent') navigate('/agent');
      else if (role === 'retailer') navigate('/dashboard');
      else navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <span className="material-symbols-outlined text-[#0d631b] text-3xl">local_pharmacy</span>
          <span className="font-['Manrope'] font-extrabold text-xl text-slate-900">MedDeliver</span>
        </Link>

        <h1 className="text-2xl font-['Manrope'] font-extrabold text-slate-900 mb-2">
          {isRegister ? 'Create account' : 'Welcome back'}
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          {isRegister ? 'Sign up to order medicines' : 'Sign in to your account'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <input
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d631b]/30"
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d631b]/30"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d631b]/30"
          />
          {isRegister && (
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d631b]/30"
            >
              <option value="user">Customer</option>
              <option value="retailer">Retailer</option>
              <option value="agent">Delivery Agent</option>
            </select>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0d631b] text-white rounded-xl font-bold text-sm hover:opacity-95 transition-opacity disabled:opacity-60"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-[#0d631b] font-bold hover:underline"
          >
            {isRegister ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}
