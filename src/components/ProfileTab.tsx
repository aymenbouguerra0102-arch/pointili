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
