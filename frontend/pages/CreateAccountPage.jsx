import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('error') === 'google_not_found') {
      setError('Please create an account first before signing in with Google.');
    }
  }, [searchParams]);

  useEffect(() => {
    const requestedRole = String(searchParams.get('role') || '').trim();
    if (!ROLES.some((option) => option.value === requestedRole)) return;
    setForm((current) => ({ ...current, role: requestedRole }));
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !/^[a-zA-Z\s]+$/.test(form.name.trim())) {
      setError('Name can only contain alphabetic characters and spaces');
      return;
    }
    if (!form.phone || !/^\d{10}$/.test(form.phone.trim())) {
      setError('Mobile number must be exactly 10 digits');
      return;
    }
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
    <div className="bg-[#f8f9fa] font-['Inter'] text-[#191c1d] antialiased fixed inset-0 overflow-hidden flex flex-col">
      <main className="h-full flex flex-col md:flex-row">
        {/* LEFT — Branding */}
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

        {/* RIGHT — Form */}
        <section className="flex-1 flex flex-col items-center p-4 md:p-8 lg:p-12 h-full overflow-y-auto bg-[#f8f9fa]">
          <div className="w-full max-w-md m-auto py-8">
            {/* Mobile branding */}
            <div className="flex md:hidden items-center justify-center space-x-2 mb-6">
              <span className="material-symbols-outlined text-[#006e2f] text-3xl">clinical_notes</span>
              <span className="font-['Manrope'] font-extrabold text-xl tracking-tight text-[#191c1d]">MediFlow</span>
            </div>

            <div className="mb-6 text-center md:text-left">
              <h2 className="font-['Manrope'] text-2xl md:text-3xl font-bold text-[#191c1d] mb-1">Create Account</h2>
              <p className="text-[#3d4a3d] text-sm">Elevate your medical logistics management.</p>
            </div>

            {/* Portal Selection */}
            <div className="mb-6">
              <label className="block font-['Inter'] text-xs font-bold uppercase tracking-widest text-[#3d4a3d] mb-3 px-1">Select Your Access Portal</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, role: value })}
                    className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 transition-all duration-200 ${form.role === value
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#191c1d] px-1" htmlFor="reg-name">Full Name</label>
                  <input id="reg-name" type="text" value={form.name} onChange={set('name')} required placeholder="Dr. Julian Vane"
                    className="w-full px-4 py-3 text-sm rounded-xl border-none bg-[#f3f4f5] focus:ring-2 focus:ring-[#006e2f] focus:bg-white transition-all placeholder:text-[#3d4a3d]/50" />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#191c1d] px-1" htmlFor="reg-email">Email Address</label>
                  <input id="reg-email" type="email" value={form.email} onChange={set('email')} required placeholder="julian@mediflow.io"
                    className="w-full px-4 py-3 text-sm rounded-xl border-none bg-[#f3f4f5] focus:ring-2 focus:ring-[#006e2f] focus:bg-white transition-all placeholder:text-[#3d4a3d]/50" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#191c1d] px-1" htmlFor="reg-phone">Phone Number</label>
                <input id="reg-phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="9876543210"
                  className="w-full px-4 py-3 text-sm rounded-xl border-none bg-[#f3f4f5] focus:ring-2 focus:ring-[#006e2f] focus:bg-white transition-all placeholder:text-[#3d4a3d]/50" />
              </div>

              {/* Retailer-specific fields */}
              {form.role === 'retailer' && (
                <div className="space-y-3 p-4 rounded-xl bg-[#22c55e]/5 border border-[#22c55e]/20">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#006e2f]">Pharmacy Details</p>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#191c1d] px-1" htmlFor="reg-shop">Shop Name</label>
                    <input id="reg-shop" type="text" value={form.shopName} onChange={set('shopName')} placeholder="MedCare Pharmacy"
                      className="w-full px-4 py-2.5 text-sm rounded-xl border-none bg-white focus:ring-2 focus:ring-[#006e2f] transition-all placeholder:text-[#3d4a3d]/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#191c1d] px-1" htmlFor="reg-license">Drug License</label>
                      <input id="reg-license" type="text" value={form.drugLicense} onChange={set('drugLicense')} placeholder="DL-12345"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border-none bg-white focus:ring-2 focus:ring-[#006e2f] transition-all placeholder:text-[#3d4a3d]/50" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-[#191c1d] px-1" htmlFor="reg-gstin">GSTIN</label>
                      <input id="reg-gstin" type="text" value={form.gstin} onChange={set('gstin')} placeholder="22AAAAA0000A1Z5"
                        className="w-full px-4 py-2.5 text-sm rounded-xl border-none bg-white focus:ring-2 focus:ring-[#006e2f] transition-all placeholder:text-[#3d4a3d]/50" />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#191c1d] px-1" htmlFor="reg-pass">Password</label>
                  <input id="reg-pass" type="password" value={form.password} onChange={set('password')} required placeholder="••••••••"
                    className="w-full px-4 py-3 text-sm rounded-xl border-none bg-[#f3f4f5] focus:ring-2 focus:ring-[#006e2f] focus:bg-white transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#191c1d] px-1" htmlFor="reg-confirm">Confirm Password</label>
                  <input id="reg-confirm" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required placeholder="••••••••"
                    className="w-full px-4 py-3 text-sm rounded-xl border-none bg-[#f3f4f5] focus:ring-2 focus:ring-[#006e2f] focus:bg-white transition-all" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[#006e2f] to-[#22c55e] text-white font-bold text-base md:text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                <span>{loading ? 'Creating...' : 'Create My Account'}</span>
                {!loading && <span className="material-symbols-outlined text-xl">arrow_forward</span>}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#3d4a3d] font-medium text-sm">
                Already have an account?{' '}
                <Link to={`/login?role=${form.role}`} className="text-[#006e2f] font-bold hover:underline ml-1">Sign In</Link>
              </p>
            </div>


          </div>
        </section>
      </main>

      {/* Footer - Only visible on really large screens or fixed at bottom */}

    </div>
  );
}
