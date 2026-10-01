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
  KeyRound,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { UserProfile } from '../types';
import { useLanguage, LanguageSelector } from '../i18n/LanguageContext';

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
  const [activeMode, setActiveMode] = useState<'instant' | 'custom'>('instant');
  const [customName, setCustomName] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [suggestedCode, setSuggestedCode] = useState(generateRandomCustomerCode());
  const [isLoading, setIsLoading] = useState(false);

  const handleRefreshSuggestedCode = () => {
    setSuggestedCode(generateRandomCustomerCode());
  };

  // 1. Instant Private Access (Random Anonymous Identifier)
  const handleInstantLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const code = suggestedCode;
      const serialNum = code.replace('PT-BBA-', '');
      const initials = `P${serialNum.slice(0, 2)}`;
      
      const avatarColors = ['10b981', '06b6d4', '8b5cf6', 'f59e0b', 'ec4899'];
      const color = avatarColors[parseInt(serialNum, 10) % avatarColors.length];
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        `PT ${serialNum}`
      )}&background=${color}&color=ffffff&bold=true&rounded=true&size=200`;

      const privateUser: UserProfile = {
        id: `usr_${code.toLowerCase().replace(/-/g, '_')}`,
        name: language === 'ar' ? `زبون Pointili #${serialNum}` : `Pointili Guest #${serialNum}`,
        email: `${code.toLowerCase()}@pointili.app`,
        avatarUrl,
        memberSince: new Date().toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-DZ', {
          month: 'long',
          year: 'numeric',
        }),
        tier: language === 'ar' ? 'زبون VIP خاص (معرّف مشفر)' : 'Private VIP Pass',
        stampsCount: 0,
        rewardsWon: 0,
        anonymousCode: code,
      };

      setIsLoading(false);
      onLogin(privateUser);
    }, 350);
  };

  // 2. Custom Nickname or Existing ID Access
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
              onClick={() => setActiveMode('instant')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeMode === 'instant'
                  ? 'bg-[#76FF03] text-black shadow-md shadow-[#76FF03]/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>دخول فوري مجهول</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('custom')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeMode === 'custom'
                  ? 'bg-[#76FF03] text-black shadow-md shadow-[#76FF03]/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>اسم مستعار / كودك</span>
            </button>
          </div>

          {/* TAB 1: INSTANT PRIVATE ACCESS (No password, no email, just a private code) */}
          {activeMode === 'instant' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-black/70 border border-zinc-800 text-center">
                <div className="text-[11px] text-zinc-400 font-medium mb-1">
                  كود الزبون الخاص والمشفر المقترح لك:
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-lg font-black tracking-widest text-[#76FF03] bg-[#76FF03]/10 px-3 py-1 rounded-xl border border-[#76FF03]/30" dir="ltr">
                    {suggestedCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleRefreshSuggestedCode}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="توليد كود آخر"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1.5">
                  هذا الكود هو هويتك الرقمية الخاصة لجمع الأختام واستبدال الهدايا بسرية تامة.
                </p>
              </div>

              <button
                type="button"
                onClick={handleInstantLogin}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#76FF03] hover:bg-[#8aff24] active:scale-[0.98] text-black font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#76FF03]/25 transition-all cursor-pointer border border-[#76FF03]"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                    <span>دخول فوري خاص وآمن (بدون كشف الهوية)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: CHOOSE NICKNAME OR ENTER CUSTOM CODE */}
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
    </div>
  );
};
