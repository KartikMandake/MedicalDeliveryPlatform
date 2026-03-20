import React from 'react';

const NotificationPreferencesCard = () => {
  return (
    <section className="md:col-span-12 bg-surface-container-low rounded-xl p-8">
      <h4 className="font-headline text-xl font-bold mb-6">Security & Notification Preferences</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="font-semibold text-on-surface">Temperature Alerts</div>
            <div className="text-xs text-on-surface-variant">Real-time alerts for cold-chain deviations</div>
          </div>
          <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="font-semibold text-on-surface">Delivery Confirmation</div>
            <div className="text-xs text-on-surface-variant">Signature required proof of delivery</div>
          </div>
          <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="font-semibold text-on-surface">HIPAA Access Logs</div>
            <div className="text-xs text-on-surface-variant">Monthly report of data access attempts</div>
          </div>
          <div className="w-12 h-6 bg-surface-variant rounded-full relative cursor-pointer">
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="font-semibold text-on-surface">SMS Notifications</div>
            <div className="text-xs text-on-surface-variant">Critical status updates via text</div>
          </div>
          <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotificationPreferencesCard;