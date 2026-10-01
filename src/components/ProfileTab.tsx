import React, { useState } from 'react';
import { UserProfile, StampHistoryItem, Restaurant } from '../types';
import {
  Award,
  Gift,
  Clock,
  LogOut,
  RotateCcw,
  Store,
  ChevronRight,
  Shield,
  Smartphone,
  ExternalLink,
  Plus,
  CheckCircle,
  Globe,
  Check,
  Bell,
  Sparkles,
} from 'lucide-react';
import { PointiliLogo } from './PointiliLogo';
import { useLanguage } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';
import { CURRENT_APP_VERSION } from '../services/appUpdateService';

interface ProfileTabProps {
  user: UserProfile;
  restaurants: Restaurant[];
  history: StampHistoryItem[];
  onLogout: () => void;
  onResetDemoData: () => void;
  onOpenMerchantQR: () => void;
  onAddMorePlaces: () => void;
  onOpenAdminLogin: () => void;
  onOpenInstallModal?: () => void;
  onOpenUpdateModal?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  restaurants,
  history,
  onLogout,
  onResetDemoData,
  onOpenMerchantQR,
  onAddMorePlaces,
  onOpenAdminLogin,
  onOpenInstallModal,
  onOpenUpdateModal,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const [copiedId, setCopiedId] = useState(false);

  // Computations
  const totalStampsCurrent = restaurants.reduce((sum, r) => sum + r.stampsCount, 0);
  const totalRewardsClaimed = restaurants.reduce((sum, r) => sum + (r.totalRewardsClaimed || 0), 0);
  const completedCardsCount = restaurants.filter((r) => r.stampsCount >= 6).length;

  const languagesList: { code: Language; label: string; flag: string; nativeName: string }[] = [
    { code: 'ar', label: 'العربية', nativeName: 'الجزائر (AR)', flag: '🇩🇿' },
    { code: 'fr', label: 'Français', nativeName: 'Algérie / France (FR)', flag: '🇫🇷' },
    { code: 'en', label: 'English', nativeName: 'International (EN)', flag: '🇬🇧' },
  ];

  return (
    <div className="min-h-full pb-28 pt-2 px-4 max-w-lg mx-auto flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Profile Header Card */}
      <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 mb-4 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#76FF03]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 relative">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#76FF03] shadow-md"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white truncate">
                {user.name}
              </h2>
              <span className="w-2 h-2 rounded-full bg-[#76FF03]" />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-[#76FF03] font-mono font-bold" dir="ltr">
                {user.anonymousCode || user.id.replace('usr_', '').toUpperCase()}
              </span>
              <span className="text-[10px] text-zinc-400 font-sans">
                (معرّف خاص ومشفر 🛡️)
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-zinc-900 bg-[#76FF03] px-2 py-0.5 rounded-md">
                {user.tier}
              </span>
              <span className="text-[11px] text-zinc-500">
                {t.memberSince} {user.memberSince}
              </span>
            </div>
          </div>
        </div>

        {/* Google Account & Privacy Status Banner */}
        {user.isGoogleAuth && (
          <div className="mt-3.5 p-3 rounded-2xl bg-black/60 border border-[#76FF03]/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-bold text-white text-[11px] truncate">
                  <span>حساب Google موثق</span>
                  <span className="text-[10px] text-[#76FF03]">· درع الخصوصية نشط 🔒</span>
                </div>
                <div className="text-[10px] text-zinc-400 truncate font-mono" dir="ltr">
                  البريد الظاهر للكاشير: {user.maskedEmail || user.email}
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800/40 shrink-0">
              محمي من العامة
            </span>
          </div>
        )}

        {/* Member ID Quick Copy */}
        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span className="font-mono text-[11px]" dir="ltr">CODE: {user.anonymousCode || user.id}</span>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(user.anonymousCode || user.id);
              setCopiedId(true);
              setTimeout(() => setCopiedId(false), 2000);
            }}
            className="text-[11px] text-[#76FF03] hover:underline cursor-pointer"
          >
            {copiedId ? 'تم النسخ!' : 'نسخ الكود الخاص'}
          </button>
        </div>
      </div>

      {/* METRICS STATS GRID */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center">
          <div className="text-xl font-extrabold text-[#76FF03] font-mono">
            {totalStampsCurrent}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">{t.stampsCollected}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center">
          <div className="text-xl font-extrabold text-white font-mono">
            {completedCardsCount}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">{t.filterReady}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center">
          <div className="text-xl font-extrabold text-white font-mono">
            {totalRewardsClaimed}
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">{t.rewardsClaimed}</div>
        </div>
      </div>

      {/* LANGUAGE SELECTOR SECTION (العربية، Français، English) */}
      <div className="p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800 mb-4 shadow-lg">
        <div className="flex items-center gap-2 mb-2 text-white font-bold text-xs">
          <Globe className="w-4 h-4 text-[#76FF03]" />
          <span>{t.languageSelect}</span>
        </div>
        <p className="text-[11px] text-zinc-400 mb-3">
          {t.languageSelectDesc}
        </p>

        <div className="grid grid-cols-3 gap-2">
          {languagesList.map((langItem) => {
            const isSelected = language === langItem.code;
            return (
              <button
                key={langItem.code}
                onClick={() => setLanguage(langItem.code)}
                type="button"
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-[#76FF03]/15 border-[#76FF03] text-white shadow-md shadow-[#76FF03]/20'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <span className="text-lg">{langItem.flag}</span>
                <span className="text-xs font-bold">{langItem.label}</span>
                {isSelected && (
                  <span className="text-[9px] text-[#76FF03] font-semibold flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> نشط
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SETTINGS & ACTIONS LIST */}
      <div className="bg-zinc-900/80 rounded-3xl border border-zinc-800 p-2 space-y-1 mb-5">
        {/* Merchant Poster Sheet Button */}
        <button
          onClick={onOpenMerchantQR}
          className="w-full p-3 flex items-center justify-between text-left hover:bg-zinc-850 rounded-xl transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-[#76FF03] transition-colors">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#76FF03] transition-colors">
                ملصقات QR لكاشير المطاعم
              </div>
              <div className="text-[11px] text-zinc-400">
                عرض وطباعة كود QR الخاص بالمحلات في برج بوعريريج
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </button>

        {/* Phone Desktop App Icon / Install */}
        {onOpenInstallModal && (
          <button
            onClick={onOpenInstallModal}
            className="w-full p-3 flex items-center justify-between text-left hover:bg-zinc-850 rounded-xl transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <img
                src="/icon.svg"
                alt="App Icon"
                className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#76FF03]"
              />
              <div>
                <div className="text-xs font-bold text-white group-hover:text-[#76FF03] transition-colors flex items-center gap-1.5">
                  <span>{t.showHomeScreenIcon}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#76FF03]" />
                </div>
                <div className="text-[11px] text-zinc-400">
                  {t.showHomeScreenDesc}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>
        )}

        {/* App Renewal & Push Updates Row */}
        {onOpenUpdateModal && (
          <button
            type="button"
            onClick={onOpenUpdateModal}
            className="w-full p-3 flex items-center justify-between text-left hover:bg-zinc-850 rounded-xl transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#76FF03]/15 border border-[#76FF03]/30 flex items-center justify-center text-[#76FF03] group-hover:scale-105 transition-transform">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-[#76FF03] transition-colors flex items-center gap-1.5">
                  <span>إشعارات تجديد وتحديث التطبيق</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-[#76FF03] text-black text-[9px] font-mono font-bold">
                    {CURRENT_APP_VERSION}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  إرسال تنبيه فوري تلقائياً لكل من قام بتحميل التطبيق عند كل تجديد
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>
        )}

        {/* Welcome Message Preview Row */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('pointili:open-welcome-modal'))}
          className="w-full p-3 flex items-center justify-between text-left hover:bg-zinc-850 rounded-xl transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-[#22c55e] transition-colors text-base">
              🎉
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#22c55e] transition-colors flex items-center gap-1.5">
                <span>رسالة الترحيب بـ Pointili</span>
                <span className="text-[10px] text-[#22c55e]">جديد</span>
              </div>
              <div className="text-[11px] text-zinc-400">
                عرض رسالة الترحيب بنظام ولاء مطاعم برج بوعريريج والمنصورة
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </button>

        {/* Secure Admin Portal Button */}
        <button
          onClick={onOpenAdminLogin}
          className="w-full p-3 flex items-center justify-between text-left hover:bg-zinc-850 rounded-xl transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-[#76FF03] transition-colors">
              <Shield className="w-4 h-4 text-[#76FF03]" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#76FF03] transition-colors">
                {t.adminPortal}
              </div>
              <div className="text-[11px] text-zinc-400">
                لوحة تحكم المشرف (AYMEN BG)
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </button>

        {/* Sign Out Button */}
        <button
          onClick={() => {
            if (window.confirm(t.logoutConfirm)) {
              onLogout();
            }
          }}
          className="w-full p-3 flex items-center justify-between text-left hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-950/40 text-red-400 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-red-400">
                {t.logoutButton}
              </div>
              <div className="text-[11px] text-zinc-500">
                تسجيل الخروج والعودة لشاشة Google
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </button>
      </div>
    </div>
  );
};
