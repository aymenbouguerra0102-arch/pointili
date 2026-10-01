import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Check,
  CheckCheck,
  Sparkles,
  RefreshCw,
  Clock,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import { AppNotification } from '../types';
import {
  getStoredNotifications,
  saveNotifications,
  broadcastAppRenewalUpdate,
  setupUpdateSync,
  playAppUpdateChime,
  CURRENT_APP_VERSION,
} from '../services/appUpdateService';
import { useLanguage } from '../i18n/LanguageContext';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpdateDetails: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onOpenUpdateDetails,
}) => {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    getStoredNotifications()
  );

  useEffect(() => {
    if (isOpen) {
      setNotifications(getStoredNotifications());
    }

    const unsubscribe = setupUpdateSync(() => {
      setNotifications(getStoredNotifications());
    });

    const handleCustom = () => {
      setNotifications(getStoredNotifications());
    };

    window.addEventListener('pointili:notifications-updated', handleCustom);

    return () => {
      unsubscribe();
      window.removeEventListener('pointili:notifications-updated', handleCustom);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
    window.dispatchEvent(new CustomEvent('pointili:notifications-updated'));
  };

  const handleClearNotifications = () => {
    // Keep at least current version notification
    const latestOnly = notifications.slice(0, 1).map((n) => ({ ...n, read: true }));
    setNotifications(latestOnly);
    saveNotifications(latestOnly);
    window.dispatchEvent(new CustomEvent('pointili:notifications-updated'));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 relative shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-right font-['Plus_Jakarta_Sans']">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0 pr-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#76FF03]/20 border border-[#76FF03] flex items-center justify-center text-[#76FF03]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">إشعارات التجديد والتحديثات</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#76FF03] text-black font-extrabold text-[10px]">
                    {unreadCount} جديد
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">سجل الإشعارات المرسلة لجميع محمّلي التطبيق</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex items-center justify-between py-2.5 px-1 text-xs shrink-0">
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1 text-zinc-400 hover:text-[#76FF03] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>تحديد الكل كمقروء</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenUpdateDetails();
            }}
            className="text-[#76FF03] font-bold hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
          >
            <Sparkles className="w-3 h-3" />
            <span>تفاصيل الإصدار {CURRENT_APP_VERSION}</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto py-2 space-y-2.5 pr-1 flex-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs">لا توجد إشعارات سابقة</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const formattedTime = new Date(notif.timestamp).toLocaleDateString('ar-DZ', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    !notif.read
                      ? 'bg-zinc-900/90 border-[#76FF03]/40 shadow-md shadow-[#76FF03]/5'
                      : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="w-2 h-2 rounded-full bg-[#76FF03]" />
                      <h4
                        className={`text-xs font-black ${
                          !notif.read ? 'text-white' : 'text-zinc-300'
                        }`}
                      >
                        {notif.titleAr || notif.title}
                      </h4>
                      {notif.version && (
                        <span className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-[9px] font-mono text-[#76FF03]">
                          {notif.version}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{formattedTime}</span>
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed pr-3.5">
                    {notif.bodyAr || notif.body}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400 pr-3.5">
                    <span className="flex items-center gap-1 text-[10px] text-zinc-400">
                      <ShieldCheck className="w-3 h-3 text-[#76FF03]" />
                      <span>{notif.senderName || 'Pointili Official Network'}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenUpdateDetails();
                      }}
                      className="text-[#76FF03] font-bold hover:underline cursor-pointer"
                    >
                      عرض الميزات الجديدة ←
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 shrink-0 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClearNotifications}
            className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
          >
            مسح السجل القديم
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
