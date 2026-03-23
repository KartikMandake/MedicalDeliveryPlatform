import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import RetailerSidebar from '../components/retailer/RetailerSidebar';
import RetailerTopNav from '../components/retailer/RetailerTopNav';
import RetailerFooter from '../components/retailer/RetailerFooter';
import { getRetailerProfile } from '../api/retailer';
import { updateProfile } from '../api/auth';

export default function RetailerProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    shopName: '',
    drugLicense: '',
    gstin: '',
    address: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'retailer') return;

    const fetchProfile = async () => {
      try {
        const res = await getRetailerProfile();
        const data = res.data || {};
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          phone: data.phone || user.phone || '',
          shopName: data.shopName || user.shopName || '',
          drugLicense: data.drugLicense || '',
          gstin: data.gstin || '',
          address: data.address || user.address || '',
        });
      } catch (err) {
        showToast('Failed to load profile details.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, showToast]);

  if (authLoading) return null;
  if (!user || user.role !== 'retailer') return <Navigate to="/login" replace />;

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

  return (
    <div className="bg-[#f8f9fa] font-body text-[#191c1d] antialiased min-h-screen">
      <RetailerTopNav />
      <RetailerSidebar />

      <main className="lg:ml-56 pt-24 pb-24 md:pb-12 px-5">
        <header className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2">Account Management</p>
          <h1 className="text-3xl md:text-[34px] font-extrabold font-headline text-[#191c1d] tracking-tight">Retailer Profile</h1>
        </header>

        <div className="max-w-4xl space-y-6">
          {/* Store Info Card */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006e2f]">store</span>
                Pharmacy Details
              </h2>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-[#006e2f] text-[#006e2f] text-xs font-bold rounded-lg hover:bg-[#006e2f]/5 transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Pharmacy Name</label>
                <input 
                  type="text" 
                  value={profileData.shopName}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({...profileData, shopName: e.target.value})}
                  className="w-full bg-[#f3f4f5] border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#22c55e] transition-all disabled:opacity-70"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Drug License Number</label>
                <input 
                  type="text" 
                  value={profileData.drugLicense}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({...profileData, drugLicense: e.target.value})}
                  className="w-full bg-[#f3f4f5] border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#22c55e] transition-all disabled:opacity-70"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">GSTIN</label>
                <input 
                  type="text" 
                  value={profileData.gstin}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({...profileData, gstin: e.target.value})}
                  className="w-full bg-[#f3f4f5] border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#22c55e] transition-all disabled:opacity-70"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Primary Location (Address)</label>
                <input 
                  type="text" 
                  value={profileData.address}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  className="w-full bg-[#f3f4f5] border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#22c55e] transition-all disabled:opacity-70"
                />
              </div>

              {/* Personal Info Header */}
              <div className="col-span-1 md:col-span-2 mt-4 pt-6 border-t border-zinc-50">
                 <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006e2f]">person</span>
                  Authorized Representative
                </h2>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={profileData.name}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="w-full bg-[#f3f4f5] border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#22c55e] transition-all disabled:opacity-70"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Contact Email</label>
                <input 
                  type="email" 
                  value={profileData.email}
                  disabled
                  className="w-full bg-[#f3f4f5] border-transparent rounded-xl px-4 py-3 text-sm opacity-60"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Phone Number</label>
                <input 
                  type="text" 
                  value={profileData.phone}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full bg-[#f3f4f5] border-transparent rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-[#22c55e] transition-all disabled:opacity-70"
                />
              </div>

              {isEditing && (
                <div className="col-span-1 md:col-span-2 flex gap-3 mt-4">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-[#006e2f] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 bg-zinc-100 text-zinc-600 text-sm font-bold rounded-xl hover:bg-zinc-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </section>

          {/* Account Security Card */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <h2 className="text-xl font-bold font-headline flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-[#006e2f]">security</span>
              Account Security
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#f3f4f5] rounded-xl">
                <div>
                  <h4 className="font-semibold text-sm">Update Password</h4>
                  <p className="text-xs text-zinc-500">Regularly changing your password improves store security.</p>
                </div>
                <button className="text-[#006e2f] text-xs font-bold hover:underline">Change →</button>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#f3f4f5] rounded-xl">
                <div>
                  <h4 className="font-semibold text-sm">Two-Factor Authentication</h4>
                  <p className="text-xs text-zinc-500">Add an extra layer of protection to your account.</p>
                </div>
                <div className="w-10 h-5 bg-zinc-300 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <RetailerFooter />
    </div>
  );
}
