import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as apiLogin } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'user', label: 'Patient', icon: 'person' },
  { value: 'retailer', label: 'Pharmacy Partner', icon: 'storefront' },
  { value: 'agent', label: 'Delivery Agent', icon: 'local_shipping' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim()) {
      setError('Email or Username is required');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await apiLogin(form);
      login(res.data.token, res.data.user);
      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'agent') navigate('/agent');
      else if (role === 'retailer') navigate('/retailer/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] font-['Inter'] text-[#191c1d] antialiased fixed inset-0 overflow-hidden flex flex-col">
      <main className="flex h-full w-full">
        {/* LEFT PANEL — Delivery Character Hero */}
        <section className="hidden md:flex md:w-1/2 relative h-full overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#101314] to-[#022c22] border-r border-[#191c1d]/5">

          {/* Background Image */}
          <img
            src="/image.png"
            alt="MediFlow Delivery Visualization"

            className="h-full object-cover absolute left-[55%] top-[55%] -translate-x-1/2 -translate-y-1/2 h-[730px] w-auto scale-125 object-contain"
          />

          {/* Soft Blend Overlay (removes harsh edges) */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#101314]/70 via-transparent to-transparent" />

          {/* Bottom Branding Card */}


        </section>


        {/* RIGHT PANEL — Login Form */}
        <section className="w-full lg:w-1/2 bg-[#f8f9fa] flex flex-col items-center p-6 md:p-12 lg:p-16 h-full overflow-y-auto">
          <div className="w-full max-w-lg m-auto py-8">
            {/* Mobile branding */}
            <div className="lg:hidden flex items-center gap-2 mb-12">
              <span className="material-symbols-outlined text-[#006e2f] text-3xl">medical_services</span>
              <span className="font-['Manrope'] text-2xl font-black text-[#191c1d] tracking-tighter">MediFlow</span>
            </div>

            <div className="mb-10">
              <h2 className="font-['Manrope'] text-3xl font-bold text-[#191c1d] mb-2">
                Welcome to <span className="text-[#006e2f]">MediFlow</span>
              </h2>
              <p className="text-[#3d4a3d]">Secure entry for the clinical intelligence network.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Role Selector */}
              <div>
                <label className="block text-xs font-['Inter'] font-bold tracking-widest text-[#3d4a3d] uppercase mb-4">
                  Select Your Access Portal
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {ROLES.map(({ value, label, icon }) => (
                    <label key={value} className="relative cursor-pointer group">
                      <input
                        type="radio"
                        name="role"
                        value={value}
                        checked={form.role === value}
                        onChange={() => setForm({ ...form, role: value })}
                        className="peer sr-only"
                      />
                      <div className="flex flex-col items-center p-4 rounded-xl border border-transparent bg-[#f3f4f5] peer-checked:bg-white peer-checked:shadow-xl peer-checked:shadow-[#191c1d]/5 transition-all duration-200 group-hover:bg-[#e7e8e9] peer-checked:ring-2 peer-checked:ring-[#006e2f]/20">
                        <span className="material-symbols-outlined text-[#3d4a3d] peer-checked:text-[#006e2f] mb-2 text-2xl">{icon}</span>
                        <span className="text-xs font-semibold text-[#191c1d] tracking-tight text-center">{label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-['Inter'] font-bold tracking-widest text-[#3d4a3d] uppercase" htmlFor="login-email">
                    Email or Username
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#3d4a3d] group-focus-within:text-[#006e2f] transition-colors">
                      <span className="material-symbols-outlined text-xl">mail</span>
                    </div>
                    <input
                      id="login-email"
                      type="text"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      className="block w-full pl-12 pr-4 py-4 bg-[#f3f4f5] border-none rounded-xl focus:ring-2 focus:ring-[#006e2f] focus:bg-white transition-all duration-200 placeholder:text-[#6d7b6c]/50"
                      placeholder="Enter your clinical ID"
                    />
                  </div>
                </div>
                {/* Password */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-['Inter'] font-bold tracking-widest text-[#3d4a3d] uppercase" htmlFor="login-password">
                      Password
                    </label>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#3d4a3d] group-focus-within:text-[#006e2f] transition-colors">
                      <span className="material-symbols-outlined text-xl">lock</span>
                    </div>
                    <input
                      id="login-password"
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      className="block w-full pl-12 pr-4 py-4 bg-[#f3f4f5] border-none rounded-xl focus:ring-2 focus:ring-[#006e2f] focus:bg-white transition-all duration-200 placeholder:text-[#6d7b6c]/50"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>
              )}

              {/* Actions */}
              <div className="space-y-6 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#006e2f] to-[#22c55e] text-white font-['Manrope'] font-bold text-lg shadow-lg shadow-[#006e2f]/20 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? 'Signing In...' : 'Sign In to My Portal'}
                  {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
                </button>
                <div className="text-center">
                  <p className="text-sm text-[#3d4a3d] mb-4">
                    New to MediFlow?{' '}
                    <Link to="/register" className="font-bold text-[#006e2f] hover:underline underline-offset-4 decoration-2 decoration-[#006e2f]/30 transition-all">
                      Create an account
                    </Link>
                  </p>

                  <div className="relative flex items-center justify-center my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative bg-[#f8f9fa] px-4 text-sm text-gray-500 font-medium">Or continue with</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = "http://localhost:5000/api/auth/google";
                    }}
                    className="w-full py-4 px-6 rounded-xl border border-gray-300 bg-white text-gray-700 font-['Manrope'] font-bold text-lg hover:bg-gray-50 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 shadow-sm"
                  >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                    Sign in with Google
                  </button>
                </div>
              </div>
            </form>



          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 right-0 w-full lg:w-1/2 p-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-transparent pointer-events-none">
        <div className="text-[10px] font-['Inter'] tracking-widest uppercase text-zinc-400 font-bold pointer-events-auto">

        </div>

      </footer>
    </div>
  );
}
