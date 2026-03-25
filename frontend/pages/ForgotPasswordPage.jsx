import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';
import { useToast } from '../context/ToastContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return showToast('Please enter your email', 'error');

    setLoading(true);
    try {
      await forgotPassword({ email });
      setSuccess(true);
      showToast('Password reset email sent (check console for link)', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error sending reset email', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center font-body relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md mx-auto p-6 relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block text-3xl font-extrabold tracking-tighter text-emerald-900 font-headline mb-4">
            MediFlow
          </Link>
          <h1 className="text-2xl font-black text-slate-900 font-headline">Reset Password</h1>
          <p className="text-sm text-slate-500 mt-2">Enter your email and we'll send you a recovery link.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px]">mark_email_read</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Check your email</h2>
              <p className="text-sm text-slate-500 mb-6">We've sent a password recovery link to your email address.</p>
              <button 
                onClick={() => setSuccess(false)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                Try different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm font-medium"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-extrabold rounded-xl py-3.5 text-sm hover:bg-emerald-600 transition-colors disabled:opacity-70 disabled:hover:bg-slate-900 shadow-md shadow-slate-900/10"
              >
                {loading ? 'Sending...' : 'Send Recovery Link'}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center text-sm font-medium text-slate-500">
          Remember your password?{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
