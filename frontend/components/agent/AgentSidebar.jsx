import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function AgentSidebar() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [toggling, setToggling] = useState(false);

  const toggleStatus = async () => {
    setToggling(true);
    try {
      await api.put('/agent/status', { isOnline: !isOnline, lat: 0, lng: 0 });
      setIsOnline(!isOnline);
    } catch (err) {
      console.error(err);
    } finally {
      setToggling(false);
    }
  };

  return (
    <nav className="hidden md:flex flex-col py-4 space-y-2 bg-slate-50 w-64 border-r border-slate-100 h-full fixed left-0">
      <div className="px-6 mb-8 pt-2">
        <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-[#0d631b]">
            <span className="material-symbols-outlined">medical_services</span>
          </div>
          <div>
            <p className="font-bold text-sm">{user?.name || 'Agent'}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-slate-400'}`} />
              {isOnline ? 'On-Duty' : 'Off-Duty'}
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-1">
        <Link to="/agent" className="bg-white text-green-700 shadow-sm rounded-lg mx-2 my-1 px-4 py-3 flex items-center gap-3 font-medium transition-all duration-200">
          <span className="material-symbols-outlined">map</span>
          <span>Live Map</span>
        </Link>
        <Link to="/tracking" className="text-slate-600 hover:text-green-600 hover:bg-slate-200/50 rounded-lg px-4 py-3 mx-2 flex items-center gap-3 font-medium transition-all duration-200">
          <span className="material-symbols-outlined">local_shipping</span>
          <span>My Deliveries</span>
        </Link>
      </div>
      <div className="px-4 pb-4 space-y-4">
        <div className="h-px bg-slate-200 mx-2" />
        <button
          onClick={toggleStatus}
          disabled={toggling}
          className={`w-full mt-4 py-3 px-4 font-bold rounded-xl active:scale-95 transition-all ${isOnline ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
        >
          {toggling ? 'Updating...' : isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>
    </nav>
  );
}
