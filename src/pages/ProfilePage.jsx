import React from 'react';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import ProfileMobileNav from '../components/profile/ProfileMobileNav';
import ProfileHeader from '../components/profile/ProfileHeader';
import UserInfoCard from '../components/profile/UserInfoCard';
import MembershipStatusCard from '../components/profile/MembershipStatusCard';
import PersonalDetailsCard from '../components/profile/PersonalDetailsCard';
import HealthCredentialsCard from '../components/profile/HealthCredentialsCard';
import SavedAddressesCard from '../components/profile/SavedAddressesCard';
import NotificationPreferencesCard from '../components/profile/NotificationPreferencesCard';
import ProfileFooter from '../components/profile/ProfileFooter';

const ProfilePage = () => {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      <div className="flex min-h-screen">
        <ProfileSidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <ProfileMobileNav />
          
          <div className="max-w-5xl mx-auto px-6 py-12 md:py-16 mt-14 md:mt-0">
            <ProfileHeader />
            
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-4">
              <UserInfoCard />
              <MembershipStatusCard />
              <PersonalDetailsCard />
              <HealthCredentialsCard />
              <SavedAddressesCard />
              <NotificationPreferencesCard />
            </div>
            
            {/* Action Footer */}
            <div className="md:col-span-12 flex flex-col md:flex-row items-center justify-between gap-4 mt-8 mb-12 pt-8 border-t border-outline-variant/10">
              <p className="text-xs text-on-surface-variant">Your medical information is encrypted using 256-bit SSL protocols.</p>
              <div className="flex items-center gap-4">
                <button className="px-6 py-3 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors">Discard Changes</button>
                <button className="bg-primary text-on-primary px-10 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Save Profile</button>
              </div>
            </div>
          </div>
          
          <ProfileFooter />
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
