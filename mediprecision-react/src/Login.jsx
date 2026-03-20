import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    const selectedRole = document.querySelector('input[name="role"]:checked')?.value;
    if (selectedRole === 'patient') {
      navigate('/dashboard-patient');
    } else if (selectedRole === 'pharmacy') {
      navigate('/dashboard-retailer');
    } else if (selectedRole === 'delivery') {
      navigate('/dashboard-delivery');
    } else {
      alert(`Login for ${selectedRole} is not yet implemented. Try "Patient", "Retailer Partner" or "Delivery Agent" role.`);
    }
  };

  return (
    <main className="flex min-h-screen w-full">

      {/* LEFT PANEL */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-on-surface">

        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Clinical Environment"
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBK0JdZtDI310gtWg8eCr5pbRzhhGWqK3lW3kUTl_XDmTiN5obPci31m58eDe_x2sRioLZ9d4Dv__Khkc1-keodmLfUXPVc8_31Cqq93j6bYKITuDIixuuU2RItP8D2FRdmEXaBJVR7QB6KMjedUqAnqJm4oWs6ls39a9DP_QOofYEC-Zk12KRXfMRXOaLhzyFfqy-S91yhxPQTjEVWxtanFCO4AWcxZqdlepF-GPyT2ql8Xv2kHU9_X_w43wo1TGhF9lvD3ZZ-v6wv"
          />
        </div>

        {/* Branding */}
        <div className="relative z-10 w-full flex flex-col justify-between p-16">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-3xl">
                medical_services
              </span>
            </div>
            <span className="font-headline text-3xl font-extrabold text-white">
              MediFlow
            </span>
          </div>

          <div className="max-w-md">
            <h1 className="font-headline text-5xl font-bold text-white leading-tight mb-6">
              Precision Logistics. <br />
              <span className="text-primary-fixed-dim">
                Clinical Grade Reliability.
              </span>
            </h1>

            <div className="h-1 w-24 bg-primary-container rounded-full mb-8"></div>

            <p className="text-surface-variant text-lg opacity-90">
              Harnessing AI-driven intelligence to synchronize medical inventory across the global healthcare ecosystem.
            </p>
          </div>

          <div className="flex items-center gap-6 text-surface-variant/60 text-xs uppercase tracking-widest">
            <span>Clinical Intelligence Network</span>
            <span className="w-1 h-1 bg-surface-variant/40 rounded-full"></span>
            <span>v4.2.0-SafeGuard</span>
          </div>
        </div>

        {/* Glow */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-primary-container/10 rounded-full blur-[100px]"></div>
      </section>

      {/* RIGHT PANEL */}
      <section className="w-full lg:w-1/2 bg-surface flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-lg">

          {/* MOBILE LOGO */}
          <div className="lg:hidden flex items-center gap-2 mb-12">
            <span className="material-symbols-outlined text-primary text-3xl">
              medical_services
            </span>
            <span className="text-2xl font-black text-on-surface">
              MediFlow
            </span>
          </div>

          {/* HEADER */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-on-surface mb-2">
              Welcome to MediFlow
            </h2>
            <p className="text-on-surface-variant">
              Secure entry for the clinical intelligence network.
            </p>
          </div>

          {/* FORM */}
          <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>

            {/* ROLE SELECTOR */}
            <div>
              <label className="block text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-4">
                Select Your Access Portal
              </label>

              <div className="grid grid-cols-3 gap-4">

                {/* Patient */}
                <label className="cursor-pointer group">
                  <input defaultChecked className="peer sr-only" name="role" type="radio" value="patient" />
                  <div className="flex flex-col items-center p-4 rounded-xl bg-surface-container-low 
                    peer-checked:bg-white peer-checked:shadow-xl peer-checked:ring-2 peer-checked:ring-primary/20">
                    <span className="material-symbols-outlined text-on-surface-variant peer-checked:text-primary mb-2">
                      person
                    </span>
                    <span className="text-xs font-semibold">Patient</span>
                  </div>
                </label>

                {/* Pharmacy */}
                <label className="cursor-pointer group">
                  <input className="peer sr-only" name="role" type="radio" value="pharmacy" />
                  <div className="flex flex-col items-center p-4 rounded-xl bg-surface-container-low 
                    peer-checked:bg-white peer-checked:shadow-xl peer-checked:ring-2 peer-checked:ring-primary/20">
                    <span className="material-symbols-outlined text-on-surface-variant peer-checked:text-primary mb-2">
                      storefront
                    </span>
                    <span className="text-xs font-semibold text-center">
                      Retailer Partner
                    </span>
                  </div>
                </label>

                {/* Delivery */}
                <label className="cursor-pointer group">
                  <input className="peer sr-only" name="role" type="radio" value="delivery" />
                  <div className="flex flex-col items-center p-4 rounded-xl bg-surface-container-low 
                    peer-checked:bg-white peer-checked:shadow-xl peer-checked:ring-2 peer-checked:ring-primary/20">
                    <span className="material-symbols-outlined text-on-surface-variant peer-checked:text-primary mb-2">
                      local_shipping
                    </span>
                    <span className="text-xs font-semibold">Delivery Agent</span>
                  </div>
                </label>

              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">
                Email or Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">
                  mail
                </span>
                <input
                  type="text"
                  placeholder="Enter your clinical ID"
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low rounded-xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-bold uppercase text-on-surface-variant">
                  Password
                </label>
                <a href="#" className="text-xs text-primary">Forgot?</a>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">
                  lock
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-low rounded-xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            {/* BUTTON */}
            <button 
              onClick={handleSignIn}
              className="w-full py-4 rounded-full btn-primary-gradient text-white font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition flex items-center justify-center gap-2"
            >
              Sign In to My Portal
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>

            {/* SIGNUP LINK */}
            <p className="text-center text-sm text-on-surface-variant">
              New to MediFlow?
              <Link to="/signup" className="text-primary font-bold ml-1">
                Create an account
              </Link>
            </p>

          </form>

        </div>
      </section>

    </main>
  );
}

export default Login;