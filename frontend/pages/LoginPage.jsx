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
    <div className="bg-[#f8f9fa] font-['Inter'] text-[#191c1d] antialiased min-h-screen">
      <main className="flex min-h-screen w-full">
        {/* LEFT PANEL — Branding */}
        <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#191c1d]">
          <div className="absolute inset-0 z-0">
            <img
              alt="Clinical Environment"
              className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBK0JdZtDI310gtWg8eCr5pbRzhhGWqK3lW3kUTl_XDmTiN5obPci31m58eDe_x2sRioLZ9d4Dv__Khkc1-keodmLfUXPVc8_31Cqq93j6bYKITuDIixuuU2RItP8D2FRdmEXaBJVR7QB6KMjedUqAnqJm4oWs6ls39a9DP_QOofYEC-Zk12KRXfMRXOaLhzyFfqy-S91yhxPQTjEVWxtanFCO4AWcxZqdlepF-GPyT2ql8Xv2kHU9_X_w43wo1TGhF9lvD3ZZ-v6wv"
            />
          </div>
          <div className="relative z-10 w-full flex flex-col justify-between p-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#22c55e] rounded-xl flex items-center justify-center shadow-lg shadow-[#006e2f]/20">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
              </div>
              <span className="font-['Manrope'] text-3xl font-extrabold tracking-tighter text-white">MediFlow</span>
            </div>
            <div className="max-w-md">
              <h1 className="font-['Manrope'] text-5xl font-bold text-white leading-tight mb-6">
                Precision Logistics. <br />
                <span className="text-[#4ae176]">Clinical Grade Reliability.</span>
              </h1>
              <div className="h-1 w-24 bg-[#22c55e] rounded-full mb-8" />
              <p className="text-[#e1e3e4] text-lg leading-relaxed opacity-90">
                Harnessing AI-driven intelligence to synchronize medical inventory across the global healthcare ecosystem.
              </p>
            </div>
            <div className="flex items-center gap-6 text-[#e1e3e4]/60 text-xs font-['Inter'] tracking-[0.2em] uppercase">
              <span>Clinical Intelligence Network</span>
              <span className="w-1 h-1 bg-[#e1e3e4]/40 rounded-full" />
              <span>v4.2.0−SafeGuard</span>
            </div>
          </div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#006e2f]/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-[#22c55e]/10 rounded-full blur-[100px]" />
        </section>

        {/* RIGHT PANEL — Login Form */}
        <section className="w-full lg:w-1/2 bg-[#f8f9fa] flex items-center justify-center p-8 md:p-16">
          <div className="w-full max-w-lg">
            {/* Mobile branding */}
            <div className="lg:hidden flex items-center gap-2 mb-12">
              <span className="material-symbols-outlined text-[#006e2f] text-3xl">medical_services</span>
              <span className="font-['Manrope'] text-2xl font-black text-[#191c1d] tracking-tighter">MediFlow</span>
            </div>

            <div className="mb-10">
              <h2 className="font-['Manrope'] text-3xl font-bold text-[#191c1d] mb-2">Welcome to MediFlow</h2>
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
                  <p className="text-sm text-[#3d4a3d]">
                    New to MediFlow?{' '}
                    <Link to="/register" className="font-bold text-[#006e2f] hover:underline underline-offset-4 decoration-2 decoration-[#006e2f]/30 transition-all">
                      Create an account
                    </Link>
                  </p>
                </div>
              </div>
            </form>

            {/* Insight Glow */}
            <div className="mt-16 p-6 rounded-xl border border-[#bccbb9]/10" style={{ background: 'linear-gradient(135deg, #ffffff 0%, rgba(74, 225, 118, 0.05) 100%)', borderTop: '1px solid rgba(0, 110, 47, 0.2)' }}>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-[#22c55e]/10 rounded-lg">
                  <span className="material-symbols-outlined text-[#006e2f]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#191c1d] mb-1">Intelligence Protocol Active</p>
                  <p className="text-xs text-[#3d4a3d] leading-relaxed">System monitoring real-time logistics. HIPAA compliant secure connection established from your current endpoint.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 right-0 w-full lg:w-1/2 p-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-transparent pointer-events-none">
        <div className="text-[10px] font-['Inter'] tracking-widest uppercase text-zinc-400 font-bold pointer-events-auto">
          © 2024 MediFlow Intelligence. Clinical Grade Reliability.
        </div>
        <div className="flex gap-4 pointer-events-auto">
          <a className="text-[10px] font-['Inter'] tracking-widest uppercase text-zinc-400 hover:text-[#006e2f] transition-colors" href="#">HIPAA Compliance</a>
          <a className="text-[10px] font-['Inter'] tracking-widest uppercase text-zinc-400 hover:text-[#006e2f] transition-colors" href="#">Security Audit</a>
        </div>
      </footer>
    </div>
  );
}
