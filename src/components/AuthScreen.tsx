import React, { useState } from 'react';
import { PointiliLogo } from './PointiliLogo';
import {
  Shield,
  Sparkles,
  QrCode,
  Gift,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Lock,
  ShieldCheck,
  Fingerprint,
} from 'lucide-react';
import { UserProfile } from '../types';
import { useLanguage, LanguageSelector } from '../i18n/LanguageContext';
import { GoogleAuthModal } from './GoogleAuthModal';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
  onOpenAdminLogin: () => void;
}

// Generate random 4-digit code for customer ID
function generateRandomCustomerCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `PT-BBA-${num}`;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onOpenAdminLogin }) => {
  const { t, language } = useLanguage();
  const [activeMode, setActiveMode] = useState<'google' | 'custom'>('google');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Custom Nickname Access
  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = customName.trim();
    if (!trimmedName) return;

    setIsLoading(true);
    setTimeout(() => {
      const assignedCode = customCode.trim() || generateRandomCustomerCode();
      const serialNum = assignedCode.replace('PT-BBA-', '');
      
      const avatarColors = ['76FF03', '3b82f6', 'a855f7', 'eab308'];
      const color = avatarColors[trimmedName.length % avatarColors.length];
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        trimmedName
      )}&background=${color === '76FF03' ? '000000' : color}&color=${color === '76FF03' ? '76FF03' : 'ffffff'}&bold=true&rounded=true&size=200`;

      const customUser: UserProfile = {
        id: `usr_${assignedCode.toLowerCase().replace(/-/g, '_')}`,
        name: trimmedName,
        email: `${assignedCode.toLowerCase()}@pointili.app`,
        avatarUrl,
        memberSince: new Date().toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-DZ', {
          month: 'long',
          year: 'numeric',
        }),
        tier: language === 'ar' ? 'زبون معتمد (اسم مستعار)' : 'Verified Customer Pass',
        stampsCount: 0,
        rewardsWon: 0,
        anonymousCode: assignedCode,
      };

      setIsLoading(false);
      onLogin(customUser);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between relative overflow-hidden select-none font-['Plus_Jakarta_Sans']">
      {/* Background Ambient Glows with Pointili Lime Green #76FF03 */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#76FF03]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-[#76FF03]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-[#76FF03]/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Top Bar Branding & Controls */}
      <header className="relative z-10 w-full max-w-md mx-auto px-6 pt-7 pb-3 flex items-center justify-between">
        <PointiliLogo variant="full" size="md" theme="dark" />

        <div className="flex items-center gap-2">
          {/* Multi-language Selector */}
          <LanguageSelector compact={false} />

          {/* Admin Portal Button */}
          <button
            type="button"
            onClick={onOpenAdminLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-[#76FF03]/60 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-[#76FF03]" />
            <span className="font-semibold text-[11px]">{t.adminPortal}</span>
          </button>
        </div>
      </header>

      {/* Main Hero & Authentication Card */}
      <main className="relative z-10 w-full max-w-md mx-auto px-6 py-2 flex-1 flex flex-col justify-center">
        {/* Visual Hero Badge Showcase */}
        <div className="mb-4 relative flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="absolute inset-0 rounded-3xl bg-[#76FF03]/30 blur-xl animate-pulse" />

            <div className="relative w-20 h-20 rounded-3xl bg-zinc-950 border-2 border-[#76FF03] p-3 flex flex-col items-center justify-center shadow-2xl shadow-[#76FF03]/20">
              <PointiliLogo variant="mark" size="lg" theme="light" />
            </div>

            <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-[#76FF03] text-black font-extrabold text-[10px] flex items-center gap-1 shadow-lg shadow-[#76FF03]/40">
              <Sparkles className="w-3 h-3 text-black" />
              <span>BBA · 34</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
            بطاقة ولاء رقمية خاصة وآمنة 100%
          </h1>
          <p className="mt-1 text-xs text-zinc-400 max-w-xs leading-relaxed">
            كافيهات ومطاعم برج بوعريريج · اجمع 6 أختام واحصل على وجبتك مجاناً دون كشف هويتك أو بريدك.
          </p>
        </div>

        {/* SECURE & PRIVATE LOGIN CONTAINER */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 mb-4 shadow-2xl backdrop-blur-md relative overflow-hidden">
          {/* Header Mode Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/60 rounded-2xl border border-zinc-800 mb-4">
            <button
              type="button"
              onClick={() => setActiveMode('google')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
                activeMode === 'google'
                  ? 'bg-white text-black shadow-md shadow-white/10'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>حساب Google (آمن وخاص)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('custom')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 truncate ${
                activeMode === 'custom'
                  ? 'bg-[#76FF03] text-black shadow-md shadow-[#76FF03]/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span>اسم مستعار (Nickname)</span>
            </button>
          </div>

          {/* TAB 1: REAL GOOGLE SIGN-IN WITH PRIVACY PROTECTION */}
          {activeMode === 'google' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-black/70 border border-zinc-800 text-center relative overflow-hidden">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 p-1 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-black text-white">تسجيل الدخول بـ Google ID</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#76FF03] text-black text-[10px] font-black">
                    خصوصية 100%
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed mb-3.5">
                  تسجيل دخول حقيقي موثق يتعرف على هويتك بأمان دون كشف بريدك الشخصي للكاشير أو المطاعم.
                </p>

                {/* Primary Google Login Button */}
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-zinc-100 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-white/10 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>المتابعة بحساب Google (محمي وخاص)</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </button>
              </div>

              {/* Privacy Shield Info Card */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#76FF03]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>حماية الخصوصية نشطة تلقائياً</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed pr-5">
                  يتم تشفير بريدك وإظهار كود معرّف Google فريد فقط أمام الكاشير، مع حفظ أختامك ونقاطك بأمان تام.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: CHOOSE NICKNAME */}
          {activeMode === 'custom' && (
            <form onSubmit={handleCustomLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  الاسم المستعار المفضل لديك (Nickname)
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="مثال: كريم BBA، فارس، زائر 34..."
                  className="w-full px-3.5 py-2.5 bg-black/70 border border-zinc-800 focus:border-[#76FF03] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>كود الزبون (اختياري / أو اترك فارغاً للتوليد)</span>
                  <span className="text-[10px] text-zinc-500 font-mono">PT-BBA-XXXX</span>
                </label>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="مثال: PT-BBA-7290 (لاسترجاع بطاقتك)"
                  className="w-full px-3.5 py-2.5 bg-black/70 border border-zinc-800 focus:border-[#76FF03] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors font-mono"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !customName.trim()}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#76FF03] hover:bg-[#8aff24] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-black font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#76FF03]/25 transition-all cursor-pointer border border-[#76FF03]"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 stroke-[2.5]" />
                    <span>المتابعة بالاسم المستعار</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Privacy Guarantee Pill */}
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#76FF03]" />
            <span>خصوصية 100% · لا نطلب أي كلمة مرور أو بريد حقيقي</span>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-2 mb-2 text-center">
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
            <QrCode className="w-4 h-4 mx-auto mb-1 text-[#76FF03]" />
            <div className="text-[11px] font-semibold text-zinc-200">مسح كود QR</div>
            <div className="text-[10px] text-zinc-500">في ثانية واحدة</div>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
            <Gift className="w-4 h-4 mx-auto mb-1 text-[#76FF03]" />
            <div className="text-[11px] font-semibold text-zinc-200">6 دوائر</div>
            <div className="text-[10px] text-zinc-500">هدية مجانية</div>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
            <Smartphone className="w-4 h-4 mx-auto mb-1 text-[#76FF03]" />
            <div className="text-[11px] font-semibold text-zinc-200">برج بوعريريج</div>
            <div className="text-[10px] text-zinc-500">مطاعم 34</div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full max-w-md mx-auto px-6 py-3 border-t border-zinc-900/60 flex items-center justify-between text-xs text-zinc-600">
        <span>Pointili · BBA &copy; {new Date().getFullYear()}</span>
        <button
          type="button"
          onClick={onOpenAdminLogin}
          className="text-[11px] text-zinc-500 hover:text-[#76FF03] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Shield className="w-3 h-3 text-[#76FF03]" />
          <span>{t.adminPortal}</span>
        </button>
      </footer>

      {/* Google Sign-In with Privacy Shield Modal */}
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onLogin={onLogin}
      />
    </div>
  );
};
