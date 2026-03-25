import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import { useToast } from '../context/ToastContext';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return showToast('Please enter a new password', 'error');
    if (password.length < 6) return showToast('Password must be at least 6 characters', 'error');
    if (password !== confirmPassword) return showToast('Passwords do not match', 'error');

    setLoading(true);
    try {
      await resetPassword(token, { password });
      showToast('Password updated successfully! You can now log in.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid or expired token', 'error');
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
          <h1 className="text-2xl font-black text-slate-900 font-headline">Set New Password</h1>
          <p className="text-sm text-slate-500 mt-2">Enter your new secure password below.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm font-medium"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm font-medium"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white font-extrabold rounded-xl py-3.5 text-sm hover:bg-emerald-600 transition-colors disabled:opacity-70 disabled:hover:bg-slate-900 shadow-md shadow-slate-900/10"
            >
              {loading ? 'Updating...' : 'Save New Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
