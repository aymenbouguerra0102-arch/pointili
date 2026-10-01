import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Bell,
  CheckCircle2,
  Download,
  Smartphone,
  RefreshCw,
  Volume2,
  ShieldCheck,
  Send,
} from 'lucide-react';
import {
  CURRENT_APP_VERSION,
  LAST_RELEASE_DATE,
  LATEST_APP_UPDATE,
  isAppInstalled,
  isPushNotificationEnabled,
  requestNotificationPermission,
  broadcastAppRenewalUpdate,
  playAppUpdateChime,
  markCurrentVersionAsSeen,
} from '../services/appUpdateService';
import { useLanguage } from '../i18n/LanguageContext';

interface AppUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInstallModal?: () => void;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  isOpen,
  onClose,
  onOpenInstallModal,
}) => {
  const { language } = useLanguage();
  const [installed, setInstalled] = useState<boolean>(isAppInstalled());
  const [pushEnabled, setPushEnabled] = useState<boolean>(isPushNotificationEnabled());
  const [testSent, setTestSent] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setInstalled(isAppInstalled());
      setPushEnabled(isPushNotificationEnabled());
      markCurrentVersionAsSeen();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEnablePush = async () => {
    const result = await requestNotificationPermission();
    if (result === 'granted') {
      setPushEnabled(true);
      playAppUpdateChime();
    }
  };

  const handleSimulateUpdateNotification = () => {
    broadcastAppRenewalUpdate({
      titleAr: '🔔 إشعار فوري: تم تجديد تطبيق Pointili!',
      bodyAr: 'تنبيه لجميع المحمّلين: تم تحديث بطاقات الولاء، ومسح QR طاولة الكاشير، ونظام الخصوصية بنجاح!',
      version: CURRENT_APP_VERSION,
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const handleReloadApp = () => {
    markCurrentVersionAsSeen();
    window.location.reload();
  };

  const highlights =
    language === 'fr'
      ? LATEST_APP_UPDATE.highlightsFr
      : language === 'en'
      ? LATEST_APP_UPDATE.highlightsEn
      : LATEST_APP_UPDATE.highlightsAr;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 relative shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-right font-['Plus_Jakarta_Sans']">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center pt-1 pb-4 border-b border-zinc-800 shrink-0">
          <div className="inline-flex p-3 rounded-2xl bg-[#76FF03]/10 border border-[#76FF03]/40 text-[#76FF03] mb-3 shadow-lg shadow-[#76FF03]/10 animate-bounce">
            <Bell className="w-8 h-8" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-xl font-black text-white">
              {language === 'ar' ? 'إشعارات تجديد وتحديث التطبيق' : 'App Renewal & Updates'}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#76FF03] text-black text-[11px] font-black font-mono">
              {CURRENT_APP_VERSION}
            </span>
          </div>

          <p className="text-xs text-zinc-400">
            {language === 'ar'
              ? 'يتم إرسال إشعار فوري وتلقائي لكل من قام بتحميل وتثبيت التطبيق عند أي تجديد جديد'
              : 'Automatic instant notifications are sent to everyone who downloaded the app upon any renewal'}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1">
          {/* Status of Download & Installation */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">حالة تثبيت التطبيق على جهازك:</span>
              {installed ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تطبيق مُحمّل ومثبت (PWA)</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenInstallModal) onOpenInstallModal();
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] text-black text-xs font-extrabold cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل وتثبيت التطبيق الآن</span>
                </button>
              )}
            </div>

            {/* Notification Permission Status */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Volume2 className="w-3.5 h-3.5 text-[#76FF03]" />
                <span>إشعارات الهاتف وتنبيهات التجديد:</span>
              </div>

              {pushEnabled ? (
                <span className="text-xs font-bold text-[#76FF03] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>مفعّلة ونشطة</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleEnablePush}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-[#76FF03] border border-[#76FF03]/40 cursor-pointer transition-colors"
                >
                  تفعيل الإشعارات
                </button>
              )}
            </div>
          </div>

          {/* Renewal Highlights */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-900/50 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#76FF03]" />
                <span>ما تم تجديده في هذا الإصدار ({CURRENT_APP_VERSION}):</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">{LAST_RELEASE_DATE}</span>
            </div>

            <ul className="space-y-2 text-xs text-zinc-300">
              {highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#76FF03] mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Test Live Renewal Notification Button */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-dashed border-[#76FF03]/40 text-center space-y-2">
            <div className="text-xs font-bold text-zinc-200">
              تجربة واستماع إشعار التجديد الفوري (صوت + تنبيه):
            </div>
            <button
              type="button"
              onClick={handleSimulateUpdateNotification}
              disabled={testSent}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                testSent
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-[#76FF03] border border-[#76FF03]/40 hover:border-[#76FF03]'
              }`}
            >
              {testSent ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم إرسال إشعار التجديد وسماع النغمة بنجاح! 🔔</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>إرسال إشعار تجديد تجريبي الآن لجميع النوافذ</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-zinc-500">
              يقوم هذا الزر بإرسال التنبيه فورياً وتشغيل نغمة الكريستال وهز الهاتف وتحديث شريط التنبيهات.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-zinc-800 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReloadApp}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#76FF03] hover:bg-[#8aff24] active:scale-98 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#76FF03]/20 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>تطبيق التجديد وإعادة تحميل التطبيق</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
