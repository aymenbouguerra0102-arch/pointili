import React, { useState, useEffect } from 'react';
import { Sparkles, X, RefreshCw, ArrowLeft, Bell } from 'lucide-react';
import {
  CURRENT_APP_VERSION,
  checkForUnseenAppUpdate,
  markCurrentVersionAsSeen,
  setupUpdateSync,
  playAppUpdateChime,
} from '../services/appUpdateService';
import { useLanguage } from '../i18n/LanguageContext';

interface AppUpdateBannerProps {
  onOpenDetails: () => void;
}

export const AppUpdateBanner: React.FC<AppUpdateBannerProps> = ({ onOpenDetails }) => {
  const { language } = useLanguage();
  const [hasNewUpdate, setHasNewUpdate] = useState<boolean>(() => checkForUnseenAppUpdate());
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [updateTitle, setUpdateTitle] = useState<string>(
    language === 'ar'
      ? `تم تجديد تطبيق Pointili (${CURRENT_APP_VERSION})!`
      : `Pointili has been renewed (${CURRENT_APP_VERSION})!`
  );

  useEffect(() => {
    // Check initially
    if (checkForUnseenAppUpdate()) {
      setHasNewUpdate(true);
    }

    // Listen for live update events
    const unsubscribe = setupUpdateSync((notif) => {
      setHasNewUpdate(true);
      setDismissed(false);
      setUpdateTitle(notif.titleAr || notif.title);
      playAppUpdateChime();
    });

    const handleAppUpdated = (e: Event) => {
      const custom = e as CustomEvent;
      setHasNewUpdate(true);
      setDismissed(false);
      if (custom.detail?.notification?.titleAr) {
        setUpdateTitle(custom.detail.notification.titleAr);
      }
      playAppUpdateChime();
    };

    window.addEventListener('pointili:app-updated', handleAppUpdated);

    return () => {
      unsubscribe();
      window.removeEventListener('pointili:app-updated', handleAppUpdated);
    };
  }, [language]);

  if (!hasNewUpdate || dismissed) {
    return null;
  }

  const handleApplyUpdate = () => {
    markCurrentVersionAsSeen();
    setHasNewUpdate(false);
    window.location.reload();
  };

  const handleView = () => {
    markCurrentVersionAsSeen();
    onOpenDetails();
  };

  return (
    <div className="mx-4 mb-3 p-3 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-[#76FF03]/50 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-3 duration-300 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#76FF03]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#76FF03]/20 border border-[#76FF03] flex items-center justify-center shrink-0 shadow-sm animate-pulse">
            <Bell className="w-4 h-4 text-[#76FF03]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-white truncate font-['Plus_Jakarta_Sans']">
                {updateTitle}
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#76FF03] text-black text-[9px] font-black uppercase tracking-wider">
                تجديد جديد
              </span>
            </div>
            <p className="text-[11px] text-zinc-300 truncate">
              تم إرسال إشعار التجديد لجميع من قام بتحميل التطبيق
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleView}
            className="px-2.5 py-1.5 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] active:scale-95 text-black font-extrabold text-[11px] flex items-center gap-1 shadow-md shadow-[#76FF03]/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>عرض الجديد</span>
          </button>

          <button
            type="button"
            onClick={handleApplyUpdate}
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="تحديث وإعادة تحميل الصفحة"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              markCurrentVersionAsSeen();
            }}
            className="p-1.5 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            title="إغلاق التنبيه"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
