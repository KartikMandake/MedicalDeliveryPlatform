import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../hooks/useSocket';
import { getNotifications, markAsRead, markAllAsRead } from '../../api/notifications';
import { useToast } from '../../context/ToastContext';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationDropdown() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const socketRef = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    
    getNotifications()
      .then(res => setNotifications(res.data))
      .catch(err => console.error('Failed to load notifications:', err));
      
    // Handle clicking outside to close
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user]);

  useEffect(() => {
    if (!socketRef.current || !user) return;

    const handleNewNotification = (notif) => {
      setNotifications(prev => [notif, ...prev]);
      showToast(notif.title, 'info'); // Pop toast globally
    };

    socketRef.current.on('new_notification', handleNewNotification);
    return () => socketRef.current?.off('new_notification', handleNewNotification);
  }, [socketRef, user, showToast]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) { }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) { }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden z-50 font-body">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-extrabold font-headline text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No notifications yet.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifications.map(notif => (
                  <li 
                    key={notif.id} 
                    className={`p-4 transition-colors hover:bg-slate-50 cursor-pointer ${notif.isRead ? 'opacity-70' : 'bg-emerald-50/30'}`}
                    onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${notif.isRead ? 'bg-transparent' : 'bg-emerald-500'}`} />
                      <div className="flex-1">
                        <p className={`text-sm ${notif.isRead ? 'font-medium text-slate-700' : 'font-extrabold text-slate-900'}`}>{notif.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                        <span className="text-[10px] font-bold text-slate-400 mt-2 block tracking-wide uppercase">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
