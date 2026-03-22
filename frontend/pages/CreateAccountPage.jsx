import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as apiRegister } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value: 'user', label: 'Patient', icon: 'person' },
  { value: 'retailer', label: 'Pharmacy', icon: 'local_pharmacy' },
  { value: 'agent', label: 'Delivery', icon: 'local_shipping' },
];

export default function CreateAccountPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '',
    role: 'user', shopName: '', drugLicense: '', gstin: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name, email: form.email, password: form.password,
        phone: form.phone, role: form.role,
      };
      if (form.role === 'retailer') {
        payload.shopName = form.shopName;
        payload.drugLicense = form.drugLicense;
        payload.gstin = form.gstin;
      }
      const res = await apiRegister(payload);
      login(res.data.token, res.data.user);
      const role = res.data.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'agent') navigate('/agent');
      else if (role === 'retailer') navigate('/retailer/dashboard');
      else navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="bg-[#f8f9fa] font-['Inter'] text-[#191c1d] antialiased min-h-screen">
      <main className="min-h-screen flex flex-col md:flex-row">
        {/* LEFT — Branding */}
        <section className="relative hidden md:flex md:w-5/12 lg:w-1/2 flex-col justify-center p-16 overflow-hidden bg-[#006e2f]">
          <div className="absolute inset-0 z-0">
            <img
              alt="Modern clean laboratory interior"
              className="w-full h-full object-cover opacity-30 mix-blend-overlay"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBElrfTFnrX1j0lPqpnrUlrgS8ENoPEpYcFTL5Zbd5wTG-M80Ed6my7DMOKGq42JFqexpoAv4J0PRcxYk3AlswOHSBJc2Bs35bezyYPHTIQ9xkru9co0sFDFQwD0MgH2nvy5_c0k9p2ma-AEWsLn4giHueQr3QoPxtFL1bp870gDQpmhPAoVq3a709zJj86KdxP3vxpdMmQlxmPZQQRJOMMfaRhfVDKEDGjz4RKra74QSv7cZjwiq1Ve9ugHXQZOlNyLxvlNjzx8E6G"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#006e2f] via-[#006e2f]/80 to-transparent" />
          </div>
          <div className="relative z-10 max-w-lg">
            <div className="mb-12 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#4ae176] flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-[#002109]">clinical_notes</span>
              </div>
              <span className="font-['Manrope'] font-extrabold text-2xl tracking-tight text-white">MediFlow</span>
            </div>
            <h1 className="font-['Manrope'] text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-8" style={{ letterSpacing: '-0.02em' }}>
              Join the Clinical <span className="text-[#6bff8f]">Intelligence</span> Network.
            </h1>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#6bff8f]" />
                <p className="text-white/90 text-lg font-medium">Secure. Scalable. Precise.</p>
              </div>
            </div>
            {/* Insight Glow */}
            <div className="mt-20 p-8 rounded-xl border border-white/10 backdrop-blur-md" style={{ background: 'linear-gradient(to bottom right, #ffffff, rgba(74, 225, 118, 0.05))', borderTop: '1px solid rgba(0, 110, 47, 0.2)' }}>
              <div className="flex items-center space-x-3 mb-3">
                <span className="material-symbols-outlined text-[#6bff8f]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <span className="font-['Inter'] text-xs uppercase tracking-widest text-[#6bff8f] font-bold">Real-time Intelligence</span>
              </div>
              <p className="text-white/80 leading-relaxed italic">
                "Empowering medical logistics through invisible AI layers that ensure data integrity at every touchpoint."
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT — Form */}
        <section className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 bg-[#f8f9fa]">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="flex md:hidden items-center justify-center space-x-2 mb-8">
              <span className="material-symbols-outlined text-[#006e2f] text-3xl">clinical_notes</span>
              <span className="font-['Manrope'] font-extrabold text-xl tracking-tight text-[#191c1d]">MediFlow</span>
            </div>

            <div className="mb-10 text-center md:text-left">
              <h2 className="font-['Manrope'] text-3xl font-bold text-[#191c1d] mb-2">Create Account</h2>
              <p className="text-[#3d4a3d]">Elevate your medical logistics management.</p>
            </div>

            {/* Portal Selection */}
            <div className="mb-10">
              <label className="block font-['Inter'] text-xs font-bold uppercase tracking-widest text-[#3d4a3d] mb-4 px-1">Select Your Access Portal</label>
              <div className="grid grid-cols-3 gap-3">
                {ROLES.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, role: value })}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                      form.role === value
                        ? 'border-[#006e2f] bg-white shadow-lg'
                        : 'border-transparent bg-[#f3f4f5] hover:bg-[#e7e8e9] text-[#3d4a3d]'
                    }`}
                  >
                    <span className={`material-symbols-outlined mb-2 ${form.role === value ? 'text-[#006e2f]' : ''}`}>{icon}</span>
                    <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-tighter">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#191c1d] px-1" htmlFor="reg-name">Full Name</label>
                <input id="reg-name" type="text" value={form.name} onChange={set('name')} required placeholder="Dr. Julian Vane"
                  className="w-full px-5 py-4 rounded-xl border-none bg-[#f3f4f5] focus:ring-2 focus:ring-[#006e2f] focus:bg-white transition-all placeholder:text-[#3d4a3d]/50" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#191c1d] px-1" htmlFor="reg-email">Email Address</label>
                <input id="reg-email" type="email" value={form.email} onChange={set('email')} required placeholder="julian@mediflow.io"
                  className="w-full px-5 py-4 rounded-xl border-none bg-[#f3f4f5] focus:ring-2 focus:ring-[#006e2f] focus:bg-white transition-all placeholder:text-[#3d4a3d]/50" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#191c1d] px-1" htmlFor="reg-phone">Phone Number</label>
                <input id="reg-phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="9876543210"
                  className="w-full px-5 py-4 rounded-xl border-none bg-[#f3f4f5] focus:ring-2 focus:ring-[#006e2f] focus:bg-white transition-all placeholder:text-[#3d4a3d]/50" />
              </div>

              {/* Retailer-specific fields */}
              {form.role === 'retailer' && (
                <div className="space-y-4 p-5 rounded-xl bg-[#22c55e]/5 border border-[#22c55e]/20">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#006e2f]">Pharmacy Details</p>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#191c1d] px-1" htmlFor="reg-shop">Shop Name</label>
                    <input id="reg-shop" type="text" value={form.shopName} onChange={set('shopName')} placeholder="MedCare Pharmacy"
                      className="w-full px-5 py-4 rounded-xl border-none bg-white focus:ring-2 focus:ring-[#006e2f] transition-all placeholder:text-[#3d4a3d]/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[#191c1d] px-1" htmlFor="reg-license">Drug License</label>
                      <input id="reg-license" type="text" value={form.drugLicense} onChange={set('drugLicense')} placeholder="DL-12345"
                        className="w-full px-5 py-4 rounded-xl border-none bg-white focus:ring-2 focus:ring-[#006e2f] transition-all placeholder:text-[#3d4a3d]/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[#191c1d] px-1" htmlFor="reg-gstin">GSTIN</label>
                      <input id="reg-gstin" type="text" value={form.gstin} onChange={set('gstin')} placeholder="22AAAAA0000A1Z5"
                        className="w-full px-5 py-4 rounded-xl border-none bg-white focus:ring-2 focus:ring-[#006e2f] transition-all placeholder:text-[#3d4a3d]/50" />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#191c1d] px-1" htmlFor="reg-pass">Password</label>
                  <input id="reg-pass" type="password" value={form.password} onChange={set('password')} required placeholder="••••••••"
                    className="w-full px-5 py-4 rounded-xl border-none bg-[#f3f4f5] focus:ring-2 focus:ring-[#006e2f] focus:bg-white transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#191c1d] px-1" htmlFor="reg-confirm">Confirm Password</label>
                  <input id="reg-confirm" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required placeholder="••••••••"
                    className="w-full px-5 py-4 rounded-xl border-none bg-[#f3f4f5] focus:ring-2 focus:ring-[#006e2f] focus:bg-white transition-all" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#006e2f] to-[#22c55e] text-white font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                <span>{loading ? 'Creating...' : 'Create My Account'}</span>
                {!loading && <span className="material-symbols-outlined text-xl">arrow_forward</span>}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[#3d4a3d] font-medium">
                Already have an account?{' '}
                <Link to="/login" className="text-[#006e2f] font-bold hover:underline ml-1">Sign In</Link>
              </p>
            </div>

            {/* Info Box */}
            <div className="mt-12 p-6 rounded-xl bg-[#f3f4f5] border border-[#bccbb9]/15">
              <div className="flex items-start space-x-3">
                <span className="material-symbols-outlined text-[#006e2f] text-xl">verified_user</span>
                <p className="text-xs text-[#3d4a3d] leading-relaxed">
                  By signing up, you agree to our <a className="text-[#006e2f] hover:underline" href="#">Terms</a> and <a className="text-[#006e2f] hover:underline" href="#">HIPAA Compliance</a> standards. Your data is encrypted and managed under strict clinical privacy protocols.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-zinc-200/50 bg-zinc-50">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 space-y-4 md:space-y-0 max-w-7xl mx-auto">
          <div className="text-sm font-black text-zinc-900 font-['Manrope'] uppercase tracking-tighter">MediFlow</div>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="font-['Inter'] text-xs tracking-wider uppercase text-zinc-400 hover:text-[#006e2f] transition-colors duration-300" href="#">Privacy Policy</a>
            <a className="font-['Inter'] text-xs tracking-wider uppercase text-zinc-400 hover:text-[#006e2f] transition-colors duration-300" href="#">HIPAA Compliance</a>
            <a className="font-['Inter'] text-xs tracking-wider uppercase text-zinc-400 hover:text-[#006e2f] transition-colors duration-300" href="#">Terms of Service</a>
            <a className="font-['Inter'] text-xs tracking-wider uppercase text-zinc-400 hover:text-[#006e2f] transition-colors duration-300" href="#">Security</a>
          </div>
          <div className="font-['Inter'] text-xs tracking-wider text-zinc-400 uppercase">© 2024 MediFlow Intelligence. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
