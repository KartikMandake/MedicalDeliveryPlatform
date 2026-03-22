import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getAgentPerformance } from '../api/agent';
import { updateProfile } from '../api/auth';

export default function AgentProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [perf, setPerf] = useState({
    total: 0,
    delivered: 0,
    successRate: 0,
    avgDeliveryMinutes: 0,
  });
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleNumber: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'agent') return;

    const fetchData = async () => {
      try {
        const perfRes = await getAgentPerformance();
        setPerf(perfRes.data || {});
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          vehicleNumber: user.vehicleNumber || '',
        });
      } catch (err) {
        showToast('Failed to load profile details.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, showToast]);

  if (authLoading) return null;
  if (!user || user.role !== 'agent') return <Navigate to="/login" replace />;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(profileData);
      showToast('Profile updated successfully.', 'success');
      setIsEditing(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] min-h-screen font-body antialiased">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl flex justify-between items-center px-6 h-16 shadow-sm border-b border-zinc-200/50">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/agent')} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="text-xl font-bold tracking-tight text-zinc-900 font-headline">My Profile</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <span className="material-symbols-outlined text-[19px]">logout</span>
            Logout
          </button>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
        {/* Header/Banner Section */}
        <section className="mb-8 p-8 rounded-3xl bg-zinc-900 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#22c55e] to-[#006e2f] flex items-center justify-center text-3xl font-bold ring-4 ring-white/10 shadow-2xl">
              {user.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h2 className="text-2xl font-extrabold font-headline tracking-tight">{user.name || 'Agent'}</h2>
                <span className="bg-[#22c55e] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">Verified Agent</span>
              </div>
              <p className="text-zinc-400 text-sm font-medium">MediFlow Delivery Partner Since {new Date(user.createdAt).getFullYear() || '2024'}</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#22c55e]/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/4" />
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-sm flex flex-col justify-between h-32 hover:border-[#22c55e]/30 transition-colors">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Deliveries</p>
            <p className="text-3xl font-extrabold font-headline text-zinc-900">{perf.delivered || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-sm flex flex-col justify-between h-32 hover:border-[#22c55e]/30 transition-colors">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Success Rate</p>
            <p className="text-3xl font-extrabold font-headline text-zinc-900">{perf.successRate || 0}%</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-sm flex flex-col justify-between h-32 hover:border-[#22c55e]/30 transition-colors">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Efficiency</p>
            <p className="text-3xl font-extrabold font-headline text-zinc-900">{perf.avgDeliveryMinutes || 0}m</p>
          </div>
        </div>

        {/* Profile Form */}
        <section className="bg-white p-8 rounded-3xl border border-zinc-200/60 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-extrabold font-headline tracking-tight">Identity & Vehicle</h3>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 text-[#006e2f] hover:bg-[#22c55e]/10 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">edit</span>
              </button>
            )}
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Full Legal Name</label>
                <input 
                  type="text" 
                  value={profileData.name}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full bg-[#f3f4f5] border-transparent rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-[#22c55e] transition-all disabled:opacity-70 font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Vehicle License Number</label>
                <input 
                  type="text" 
                  value={profileData.vehicleNumber}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({...profileData, vehicleNumber: e.target.value})}
                  className="w-full bg-[#f3f4f5] border-transparent rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-[#22c55e] transition-all disabled:opacity-70 font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Email (Account ID)</label>
                <input 
                  type="email" 
                  value={profileData.email}
                  disabled
                  className="w-full bg-[#f3f4f5] border-transparent rounded-2xl px-5 py-3.5 text-sm opacity-60 font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Phone Number</label>
                <input 
                  type="text" 
                  value={profileData.phone}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full bg-[#f3f4f5] border-transparent rounded-2xl px-5 py-3.5 text-sm focus:bg-white focus:border-[#22c55e] transition-all disabled:opacity-70 font-medium"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-[#006e2f] text-white text-sm font-bold rounded-2xl hover:opacity-90 transition-all disabled:opacity-60 shadow-lg shadow-[#006e2f]/20"
                >
                  {saving ? 'Syncing...' : 'Update Records'}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-8 py-3 bg-zinc-100 text-zinc-600 text-sm font-bold rounded-2xl hover:bg-zinc-200 transition-all"
                >
                  Discard
                </button>
              </div>
            )}
          </form>
        </section>

        {/* Operational Settings */}
        <section className="bg-white p-8 rounded-3xl border border-zinc-200/60 shadow-sm mb-12">
           <h3 className="text-xl font-extrabold font-headline tracking-tight mb-8">Operational Settings</h3>
           <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-[#f3f4f5] rounded-2xl border border-transparent hover:border-zinc-200 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-zinc-400 group-hover:text-[#22c55e] transition-colors">
                  <span className="material-symbols-outlined">notifications_active</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 tracking-tight">Assignment Alerts</h4>
                  <p className="text-xs text-zinc-500">Push notifications for new nearby orders.</p>
                </div>
              </div>
              <div className="w-10 h-5 bg-[#22c55e] rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-[#f3f4f5] rounded-2xl border border-transparent hover:border-zinc-200 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-zinc-400 group-hover:text-[#22c55e] transition-colors">
                  <span className="material-symbols-outlined">vpn_key</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 tracking-tight">Security Credentials</h4>
                  <p className="text-xs text-zinc-500">Update your access tokens and password.</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-zinc-400">chevron_right</span>
            </div>
           </div>
        </section>
      </main>
    </div>
  );
}
