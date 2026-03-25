import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getAgentPerformance, setAgentOnlineStatus } from '../api/agent';
import { updateProfile } from '../api/auth';
import { AgentShell } from './AgentDashboardPage';

function formatDuration(m) { const mins = Math.round(Number(m)); if (!Number.isFinite(mins) || mins < 0) return '--'; if (mins < 60) return `${mins}m`; return `${Math.floor(mins / 60)}h ${mins % 60}m`; }

export default function AgentProfilePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [perf, setPerf] = useState({ total: 0, delivered: 0, successRate: 0, avgDeliveryMinutes: 0 });
  const [profileData, setProfileData] = useState({ name: '', email: '', phone: '', vehicleNumber: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'agent') return;
    (async () => {
      try {
        const res = await getAgentPerformance();
        setPerf(res.data || {});
        setOnline(Boolean(res.data?.liveLocation?.isOnline));
        setProfileData({ name: user.name || '', email: user.email || '', phone: user.phone || '', vehicleNumber: user.vehicleNumber || '' });
      } catch { showToast('Failed to load profile.', 'error'); }
      finally { setLoading(false); }
    })();
  }, [user, showToast]);

  const handleOnlineToggle = async () => {
    const next = !online;
    try { await setAgentOnlineStatus(next); setOnline(next); } catch {}
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await updateProfile(profileData); showToast('Profile updated.', 'success'); setIsEditing(false); }
    catch (err) { showToast(err.response?.data?.message || 'Update failed.', 'error'); }
    finally { setSaving(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  if (authLoading) return null;
  if (!user || user.role !== 'agent') return <Navigate to="/login" replace />;

  return (
    <AgentShell user={user} online={online} onToggleOnline={handleOnlineToggle}>
      <main className="lg:ml-64 pt-20 pb-24 px-6 min-h-screen">
        <div className="max-w-4xl mx-auto">

          {/* Profile Hero */}
          <section className="mb-8 p-8 rounded-2xl bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center text-3xl font-black ring-4 ring-white/10 shadow-2xl">
                {user.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="text-center md:text-left flex-1">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                  <h2 className="text-2xl font-extrabold font-headline tracking-tight">{user.name || 'Agent'}</h2>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">Verified</span>
                </div>
                <p className="text-slate-400 text-sm font-medium">MediFlow Delivery Partner • Since {new Date(user.createdAt).getFullYear() || '2024'}</p>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-3 flex-wrap">
                  {user.email && <span className="text-xs text-slate-400 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">mail</span> {user.email}</span>}
                  {user.phone && <span className="text-xs text-slate-400 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">call</span> {user.phone}</span>}
                </div>
              </div>
              <button onClick={handleLogout}
                className="px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl text-sm font-bold hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300 transition-all cursor-pointer flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">logout</span> Logout
              </button>
            </div>
          </section>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Deliveries', value: perf.delivered || 0, icon: 'task_alt', color: 'text-emerald-500 bg-emerald-50' },
              { label: 'Success Rate', value: `${perf.successRate || 0}%`, icon: 'percent', color: 'text-sky-500 bg-sky-50' },
              { label: 'Avg Time', value: formatDuration(perf.avgDeliveryMinutes), icon: 'speed', color: 'text-amber-500 bg-amber-50' },
            ].map((s) => (
              <div key={s.label} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`material-symbols-outlined ${s.color} p-1.5 rounded-lg text-[16px]`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                </div>
                <p className="text-3xl font-black font-headline text-slate-900">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Identity & Vehicle */}
          <section className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-extrabold font-headline tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-500 text-[20px]">badge</span> Identity & Vehicle
              </h3>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 text-sm font-extrabold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-emerald-50">
                  <span className="material-symbols-outlined text-[18px]">edit</span> Edit
                </button>
              )}
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', editable: true },
                  { label: 'Vehicle License', key: 'vehicleNumber', type: 'text', editable: true },
                  { label: 'Email (Account ID)', key: 'email', type: 'email', editable: false },
                  { label: 'Phone Number', key: 'phone', type: 'text', editable: true },
                ].map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">{field.label}</label>
                    <input
                      type={field.type}
                      value={profileData[field.key]}
                      disabled={!isEditing || !field.editable}
                      onChange={(e) => setProfileData({ ...profileData, [field.key]: e.target.value })}
                      className="w-full bg-[#f8f9fa] border border-slate-200/60 rounded-xl px-5 py-3.5 text-sm font-medium focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all disabled:opacity-60 outline-none"
                    />
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={saving}
                    className="px-8 py-3 bg-slate-900 text-white text-sm font-extrabold rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-60 shadow-lg active:scale-95 cursor-pointer flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)}
                    className="px-8 py-3 bg-slate-100 text-slate-600 text-sm font-extrabold rounded-xl hover:bg-slate-200 transition-all cursor-pointer">
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </section>

          {/* Settings */}
          <section className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm">
            <h3 className="text-xl font-extrabold font-headline tracking-tight mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-500 text-[20px]">settings</span> Preferences
            </h3>
            <div className="space-y-3">
              {[
                { icon: 'notifications_active', title: 'Assignment Alerts', desc: 'Push notifications for new nearby orders.', toggle: true },
                { icon: 'location_on', title: 'Live Location', desc: 'Share real-time GPS with dispatch system.', toggle: true },
                { icon: 'vpn_key', title: 'Security Credentials', desc: 'Update your password and access tokens.', arrow: true },
                { icon: 'help', title: 'Support', desc: 'Contact the MediFlow operations team.', arrow: true },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between p-5 bg-[#f8f9fa] rounded-xl border border-slate-200/40 hover:border-emerald-200 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors shadow-sm border border-slate-200/60">
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                  {item.toggle && (
                    <div className="w-11 h-6 bg-emerald-500 rounded-full relative shrink-0">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  )}
                  {item.arrow && <span className="material-symbols-outlined text-slate-400 group-hover:text-emerald-600">chevron_right</span>}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </AgentShell>
  );
}
