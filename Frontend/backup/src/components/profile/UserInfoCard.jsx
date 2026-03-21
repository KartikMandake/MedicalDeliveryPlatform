import React from 'react';

const UserInfoCard = () => {
  return (
    <section className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 shadow-[0_12px_32px_-4px_rgba(25,28,30,0.06)] border border-outline-variant/10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <span className="material-symbols-outlined text-9xl" data-icon="medical_information">medical_information</span>
      </div>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
        <div className="relative">
          <img alt="User Profile" className="w-24 h-24 rounded-full object-cover border-4 border-surface-container-low" data-alt="Close up professional portrait of a medical worker" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVhsRK8kv28_UXx_oJ12ZfrYp7q0n2AsoU7YDVj_jHspuAzStSn9b01qimu36qRaf12m7-RNWQlmf2JIfO_0QnzbMrKr2NReR58pounDDOZ31m6ZW6nVdlch9jEKnmqe45HfFAbq_d8igOZFmRFu7vG0wyKH6EaAQsm0PDrWChMF3mfqwOtjcX1En6e3UOLpTEqswgavIVgvChH-1ENe7B84d1vFmFYUvYA4AmqpntezOJkvhp8YiuVPICeXVVAGXTzZJGdRYEc40M" />
          <button className="absolute bottom-0 right-0 bg-primary text-on-primary p-1.5 rounded-full shadow-lg hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-sm" data-icon="edit">edit</span>
          </button>
        </div>
        <div className="flex-1">
          <h3 className="font-headline text-2xl font-bold text-on-surface">Dr. Elena Rodriguez</h3>
          <p className="text-on-surface-variant font-medium">Head of Clinical Research • St. Jude Medical</p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary" data-icon="mail">mail</span>
              e.rodriguez@hospital.org
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary" data-icon="call">call</span>
              +1 (555) 902-4412
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserInfoCard;