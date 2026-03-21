import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function CreateAccount() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: 'patient',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: formData.role,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (formData.role === 'patient') navigate('/dashboard-patient');
      else if (formData.role === 'pharmacy') navigate('/dashboard-retailer');
      else navigate('/dashboard-delivery');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full">

      {/* LEFT PANEL */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-on-surface">
        <div className="absolute inset-0">
          <img
            alt="Clinical"
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBK0JdZtDI310gtWg8eCr5pbRzhhGWqK3lW3kUTl_XDmTiN5obPci31m58eDe_x2sRioLZ9d4Dv__Khkc1-keodmLfUXPVc8_31Cqq93j6bYKITuDIixuuU2RItP8D2FRdmEXaBJVR7QB6KMjedUqAnqJm4oWs6ls39a9DP_QOofYEC-Zk12KRXfMRXOaLhzyFfqy-S91yhxPQTjEVWxtanFCO4AWcxZqdlepF-GPyT2ql8Xv2kHU9_X_w43wo1TGhF9lvD3ZZ-v6wv"
          />
        </div>

        <div className="relative z-10 w-full flex flex-col justify-between p-16 text-white">
          <h1 className="text-5xl font-bold">
            Join MediFlow
          </h1>
        </div>
      </section>

      {/* RIGHT PANEL */}
      <section className="w-full lg:w-1/2 bg-surface flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-lg">

          {/* HEADER */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-on-surface">Create Account</h2>
            <p className="text-on-surface-variant">Start your journey</p>
          </div>

          <form className="space-y-8" onSubmit={handleCreateAccount}>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold">
                {error}
              </div>
            )}

            {/* ROLE SELECTOR */}
            <div>
              <label className="text-xs font-bold uppercase text-on-surface-variant mb-4 block">
                Select Your Access Portal
              </label>

              <div className="grid grid-cols-3 gap-4">

                <label className="cursor-pointer">
                  <input type="radio" name="role" value="patient" checked={formData.role === 'patient'} onChange={handleChange} className="peer sr-only" />
                  <div className="p-4 rounded-xl bg-surface-container-low text-center 
                    peer-checked:bg-white peer-checked:shadow-xl peer-checked:ring-2 peer-checked:ring-primary/20">
                    <span className="material-symbols-outlined block mb-2">person</span>
                    <span className="text-xs font-semibold">Patient</span>
                  </div>
                </label>

                <label className="cursor-pointer">
                  <input type="radio" name="role" value="pharmacy" checked={formData.role === 'pharmacy'} onChange={handleChange} className="peer sr-only" />
                  <div className="p-4 rounded-xl bg-surface-container-low text-center 
                    peer-checked:bg-white peer-checked:shadow-xl peer-checked:ring-2 peer-checked:ring-primary/20">
                    <span className="material-symbols-outlined block mb-2">storefront</span>
                    <span className="text-xs font-semibold">Pharmacy</span>
                  </div>
                </label>

                <label className="cursor-pointer">
                  <input type="radio" name="role" value="delivery" checked={formData.role === 'delivery'} onChange={handleChange} className="peer sr-only" />
                  <div className="p-4 rounded-xl bg-surface-container-low text-center 
                    peer-checked:bg-white peer-checked:shadow-xl peer-checked:ring-2 peer-checked:ring-primary/20">
                    <span className="material-symbols-outlined block mb-2">local_shipping</span>
                    <span className="text-xs font-semibold">Delivery</span>
                  </div>
                </label>

              </div>
            </div>

            {/* FULL NAME */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined">person</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className="w-full pl-12 py-4 rounded-xl bg-surface-container-low focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* EMAIL */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined">mail</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="w-full pl-12 py-4 rounded-xl bg-surface-container-low focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* PHONE */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined">call</span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                required
                className="w-full pl-12 py-4 rounded-xl bg-surface-container-low focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* PASSWORDS */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="px-4 py-4 rounded-xl bg-surface-container-low focus:ring-2 focus:ring-primary outline-none"
              />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm"
                required
                className="px-4 py-4 rounded-xl bg-surface-container-low focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* BUTTON */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full btn-primary-gradient text-white font-bold disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create My Account →"}
            </button>

            {/* LINK */}
            <p className="text-center text-sm text-on-surface-variant">
              Already have an account?
              <Link to="/" className="text-primary ml-1 font-bold">
                Sign In
              </Link>
            </p>

          </form>
        </div>
      </section>

    </main>
  );
}

export default CreateAccount;