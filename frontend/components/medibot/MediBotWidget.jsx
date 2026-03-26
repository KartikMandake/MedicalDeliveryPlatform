import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getMediBotMessages,
  sendMediBotMessage,
  getMedicationReminders,
  checkDueMedicationReminders,
  cancelMedicationReminder,
} from '../../api/ai';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'mr', label: 'Marathi' },
  { value: 'ta', label: 'Tamil' },
];

const HIDDEN_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/login-success'];
const REMINDER_TIME_ZONE = 'Asia/Kolkata';

function isHiddenPath(pathname) {
  return HIDDEN_PATHS.some((path) => pathname.startsWith(path));
}

function formatReminderTime(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: REMINDER_TIME_ZONE,
  });
}

function bubbleClasses(role) {
  if (role === 'user') {
    return 'ml-10 rounded-[1.35rem] rounded-br-md bg-zinc-900 text-white';
  }
  return 'mr-10 rounded-[1.35rem] rounded-bl-md border border-emerald-100 bg-white text-zinc-800 shadow-sm';
}

function formatExecutedActionMessage(action) {
  if (!action) return '';
  if (String(action.type || '').trim().toLowerCase() === 'create_reminder' && action.reminder?.remindAt) {
    return `Reminder scheduled for ${formatReminderTime(action.reminder.remindAt)}.`;
  }
  return String(action.message || '').trim();
}

export default function MediBotWidget() {
  const { user, loading } = useAuth();
  const { addItem, fetchCart, itemCount } = useCart();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const feedRef = useRef(null);
  const deliveredReminderKeysRef = useRef(new Set());

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState(() => localStorage.getItem('medibot-language') || 'en');
  const [bootstrapping, setBootstrapping] = useState(false);
  const [sending, setSending] = useState(false);
  const [enablingAlerts, setEnablingAlerts] = useState(false);
  const [cancellingReminderId, setCancellingReminderId] = useState(null);

  const hidden = isHiddenPath(location.pathname);
  const shouldRender = !loading && !hidden && user?.role === 'user';

  useEffect(() => {
    if (!shouldRender) {
      setIsOpen(false);
    }
  }, [shouldRender]);

  useEffect(() => {
    localStorage.setItem('medibot-language', language);
  }, [language]);

  useEffect(() => {
    if (!shouldRender) return undefined;

    let mounted = true;
    const load = async () => {
      try {
        setBootstrapping(true);
        const [messagesRes, remindersRes] = await Promise.all([
          getMediBotMessages(),
          getMedicationReminders(),
        ]);

        if (!mounted) return;
        setMessages(Array.isArray(messagesRes.data?.messages) ? messagesRes.data.messages : []);
        setReminders(Array.isArray(remindersRes.data?.reminders) ? remindersRes.data.reminders : []);
      } catch (err) {
        if (!mounted) return;
        showToast(err.response?.data?.message || 'Unable to load MediBot right now.', 'error');
      } finally {
        if (mounted) setBootstrapping(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [shouldRender, showToast]);

  useEffect(() => {
    if (!shouldRender) return undefined;

    const checkDue = async () => {
      try {
        const res = await checkDueMedicationReminders();
        const due = Array.isArray(res.data?.due) ? res.data.due : [];
        const nextReminders = Array.isArray(res.data?.reminders) ? res.data.reminders : [];
        setReminders(nextReminders);

        for (const reminder of due) {
          const reminderKey = `${reminder.id}:${reminder.remindAt || ''}`;
          if (deliveredReminderKeysRef.current.has(reminderKey)) continue;
          deliveredReminderKeysRef.current.add(reminderKey);

          const body = reminder.instructions || `It is time for ${reminder.medicationName || 'your medication'}.`;
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(reminder.title, { body });
          }
        }
      } catch {
        // silent background polling
      }
    };

    checkDue();
    const timer = window.setInterval(checkDue, 60000);
    return () => window.clearInterval(timer);
  }, [shouldRender, showToast]);

  useEffect(() => {
    if (!shouldRender) return undefined;

    const toggleWidget = () => setIsOpen((prev) => !prev);
    const openWidget = () => setIsOpen(true);

    window.addEventListener('medibot:toggle', toggleWidget);
    window.addEventListener('medibot:open', openWidget);

    return () => {
      window.removeEventListener('medibot:toggle', toggleWidget);
      window.removeEventListener('medibot:open', openWidget);
    };
  }, [shouldRender]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const frame = window.requestAnimationFrame(() => {
      if (feedRef.current) {
        feedRef.current.scrollTop = feedRef.current.scrollHeight;
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen, messages, reminders]);

  if (!shouldRender) return null;

  const requestNotificationAccess = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast('Browser notifications are not supported on this device.', 'warning');
      return;
    }

    try {
      setEnablingAlerts(true);
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showToast('Browser medication alerts enabled.', 'success');
      } else {
        showToast('Browser alerts were not enabled.', 'info');
      }
    } finally {
      setEnablingAlerts(false);
    }
  };

  const mergeReminderPayload = (nextReminders) => {
    if (!Array.isArray(nextReminders) || !nextReminders.length) return;
    setReminders((prev) => {
      const merged = [...prev];
      nextReminders.forEach((reminder) => {
        if (!merged.some((item) => item.id === reminder.id)) merged.unshift(reminder);
      });
      return merged.sort((left, right) => new Date(left.remindAt) - new Date(right.remindAt));
    });
  };

  const submitMessage = async (rawMessage) => {
    const text = String(rawMessage || '').trim();
    if (!text || sending) return;

    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      language,
      quickReplies: [],
      suggestedProducts: [],
      executedActions: [],
      reminders: [],
      safety: { level: 'low', warnings: [] },
      followUpQuestion: null,
      cartSnapshot: null,
      createdAt: new Date().toISOString(),
    };

    setIsOpen(true);
    setInput('');
    setSending(true);
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const res = await sendMediBotMessage({ message: text, language });
      setMessages((prev) => [
        ...prev.filter((message) => message.id !== optimisticMessage.id),
        res.data?.userMessage || optimisticMessage,
        res.data?.assistant,
      ].filter(Boolean));

      if (res.data?.cartSnapshot) {
        await fetchCart();
      }
      mergeReminderPayload(res.data?.reminders);
    } catch (err) {
      setMessages((prev) => prev.filter((message) => message.id !== optimisticMessage.id));
      showToast(err.response?.data?.message || 'MediBot could not respond right now.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleComposerSubmit = async (event) => {
    event.preventDefault();
    await submitMessage(input);
  };

  const handleSuggestionAdd = async (product) => {
    try {
      await addItem(product.catalogId, 1, product.isEcom);
      await fetchCart();
      showToast(`${product.name} added to cart.`, 'success');
      setMessages((prev) => [
        ...prev,
        {
          id: `local-assistant-${Date.now()}`,
          role: 'assistant',
          content: `${product.name} has been added to your cart and is ready for checkout.`,
          language,
          intent: 'cart_summary',
          quickReplies: ['What is in my cart?', 'Take me to cart'],
          suggestedProducts: [],
          executedActions: [
            {
              type: 'add_to_cart',
              status: 'success',
              message: `${product.name} added to cart.`,
            },
          ],
          reminders: [],
          safety: { level: 'low', warnings: [] },
          followUpQuestion: null,
          cartSnapshot: null,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      showToast(err.response?.data?.message || `Could not add ${product.name} to cart.`, 'error');
    }
  };

  const handleReminderDelete = async (reminderId) => {
    if (!reminderId || cancellingReminderId === reminderId) return;

    try {
      setCancellingReminderId(reminderId);
      await cancelMedicationReminder(reminderId);
      setReminders((prev) => prev.filter((reminder) => reminder.id !== reminderId));
      showToast('Reminder cancelled.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to cancel reminder.', 'error');
    } finally {
      setCancellingReminderId((current) => (current === reminderId ? null : current));
    }
  };

  const quickReplies = messages.length
    ? messages[messages.length - 1]?.quickReplies?.length
      ? messages[messages.length - 1].quickReplies
      : []
    : [
        'What is in my cart?',
        'Suggest OTC products for fever',
        'Explain side effects of paracetamol',
        'Set a reminder for tonight',
      ];

  return (
    <>
      <div className="fixed right-4 bottom-24 lg:bottom-5 z-[75]">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`group flex items-center gap-2.5 rounded-full border px-3 py-2.5 transition-all ${
            isOpen
              ? 'border-zinc-900 bg-zinc-900 text-white shadow-[0_14px_34px_-18px_rgba(15,23,42,0.75)]'
              : 'border-emerald-100 bg-white/96 text-zinc-800 shadow-[0_14px_34px_-20px_rgba(16,185,129,0.45)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-22px_rgba(16,185,129,0.5)]'
          }`}
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
            isOpen ? 'bg-white/10 text-white' : 'bg-emerald-50 text-emerald-700'
          }`}>
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
          </div>
          <div className="hidden text-left sm:block">
            <div className="flex items-center gap-2">
              <p className="text-sm font-black tracking-tight">{isOpen ? 'Hide MediBot' : 'MediBot'}</p>
              <span className={`h-2 w-2 rounded-full ${isOpen ? 'bg-emerald-300' : 'bg-emerald-500'}`} />
            </div>
            <p className={`text-[10px] font-bold ${isOpen ? 'text-zinc-300' : 'text-zinc-500'}`}>
              Cart-aware health assistant
            </p>
          </div>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-x-3 bottom-40 z-[74] flex justify-end sm:inset-x-auto sm:right-4 sm:bottom-20 lg:right-5 lg:bottom-[4.5rem]">
          <div className="flex h-[min(68vh,580px)] w-full max-w-[400px] min-w-0 flex-col overflow-hidden rounded-[1.75rem] border border-emerald-100 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_34%),linear-gradient(180deg,_#fbfefc_0%,_#f3fbf7_24%,_#f8fafc_100%)] shadow-[0_26px_70px_-30px_rgba(15,23,42,0.5)]">
            <div className="border-b border-emerald-100/80 bg-zinc-950/96 px-3 py-2 text-white backdrop-blur">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/14 text-emerald-300 ring-1 ring-emerald-400/20">
                  <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
                </div>

                <div className="ml-auto flex items-center gap-1">
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="h-7 rounded-full border border-white/10 bg-white/6 px-2 text-[10px] font-black text-white outline-none"
                  >
                    {LANGUAGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="text-zinc-900">
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => navigate('/cart')}
                    className="h-7 rounded-full border border-white/10 bg-white/6 px-2.5 text-[10px] font-black text-white transition-colors hover:bg-white/12"
                  >
                    Cart {itemCount}
                  </button>

                  {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
                    <button
                      type="button"
                      onClick={requestNotificationAccess}
                      disabled={enablingAlerts}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-500/10 text-emerald-200 transition-colors hover:bg-emerald-500/18 disabled:opacity-60"
                      title={enablingAlerts ? 'Enabling alerts...' : 'Enable alerts'}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {enablingAlerts ? 'progress_activity' : 'notifications_active'}
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/8 text-zinc-300 transition-colors hover:bg-white/14 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                </div>
              </div>
            </div>

            {reminders.length > 0 && (
              <div className="border-b border-emerald-100/70 bg-white/70 px-4 py-2.5">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">Upcoming Reminders</p>
                  <span className="text-[11px] font-bold text-zinc-500">{reminders.length} active</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {reminders.slice(0, 2).map((reminder) => (
                    <div key={reminder.id} className="rounded-2xl border border-emerald-100 bg-white px-3 py-2 shadow-sm">
                      <p className="truncate text-xs font-bold text-zinc-900">{reminder.title}</p>
                      <p className="mt-1 text-[11px] text-zinc-500">{formatReminderTime(reminder.remindAt)}</p>
                      <button
                        type="button"
                        onClick={() => handleReminderDelete(reminder.id)}
                        disabled={cancellingReminderId === reminder.id}
                        className={`mt-2 text-[11px] font-bold ${
                          cancellingReminderId === reminder.id ? 'cursor-not-allowed text-rose-300' : 'text-rose-500'
                        }`}
                      >
                        {cancellingReminderId === reminder.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div ref={feedRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-3 custom-scrollbar">
              {bootstrapping && (
                <div className="rounded-[1.4rem] border border-white/80 bg-white/80 px-4 py-3 text-sm text-zinc-500 shadow-sm">
                  Loading MediBot...
                </div>
              )}

              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[88%] px-3.5 py-3 ${bubbleClasses(message.role)}`}>
                      <p className="text-[13px] leading-relaxed">{message.content}</p>

                      {Array.isArray(message.safety?.warnings) && message.safety.warnings.length > 0 && (
                        <div className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                          {message.safety.warnings.map((warning) => (
                            <p key={warning}>{warning}</p>
                          ))}
                        </div>
                      )}

                      {Array.isArray(message.executedActions) && message.executedActions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.executedActions.map((action, index) => {
                            const actionMessage = formatExecutedActionMessage(action);
                            if (!actionMessage) return null;

                            return (
                              <div
                                key={`${message.id}-action-${index}`}
                                className={`rounded-2xl px-3 py-2 text-[11px] font-semibold ${
                                  action.status === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {actionMessage}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {Array.isArray(message.suggestedProducts) && message.suggestedProducts.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.suggestedProducts.map((product) => (
                            <div key={product.catalogId} className="rounded-[1.15rem] border border-emerald-100 bg-emerald-50/70 p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-black text-zinc-900">{product.name}</p>
                                  <p className="mt-1 text-[11px] text-zinc-500">
                                    {product.category || product.brand || 'Medicine'} | {product.requiresPrescription ? 'Rx required' : 'OTC / wellness'}
                                  </p>
                                  {product.reason && (
                                    <p className="mt-2 text-[11px] text-zinc-700">{product.reason}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-black text-emerald-700">Rs. {Number(product.price || 0).toFixed(0)}</p>
                                  <p className="text-[10px] text-zinc-500">Stock {product.stock}</p>
                                </div>
                              </div>
                              <div className="mt-3 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSuggestionAdd(product)}
                                  className="rounded-full bg-zinc-900 px-3 py-2 text-[11px] font-black text-white"
                                >
                                  Add to cart
                                </button>
                                <button
                                  type="button"
                                  onClick={() => navigate(`/products?search=${encodeURIComponent(product.name)}`)}
                                  className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-[11px] font-black text-zinc-700"
                                >
                                  View similar
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {sending && (
                  <div className="flex justify-start">
                    <div className="mr-10 rounded-[1.35rem] rounded-bl-md border border-emerald-100 bg-white px-3.5 py-3 shadow-sm">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                        <span className="text-[13px] font-semibold">MediBot is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-emerald-100/80 bg-white/85 px-3 py-3">
              {quickReplies.length > 0 && (
                <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => submitMessage(reply)}
                      className="whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-700"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleComposerSubmit} className="flex items-end gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about your cart, medicines, reminders, or symptoms..."
                  className="h-11 flex-1 rounded-[1.2rem] border border-emerald-100 bg-white px-4 text-sm outline-none ring-0 placeholder:text-zinc-400"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="flex h-11 w-11 items-center justify-center rounded-[1.2rem] bg-zinc-900 text-white disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}






