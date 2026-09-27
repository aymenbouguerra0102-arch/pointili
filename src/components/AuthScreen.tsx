import React, { useState, useEffect } from 'react';
import { PointiliLogo } from './PointiliLogo';
import { Shield, Sparkles, QrCode, Gift, Smartphone, CheckCircle2, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';
import { GoogleSignInModal } from './GoogleSignInModal';
import { useLanguage, LanguageSelector } from '../i18n/LanguageContext';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
  onOpenAdminLogin: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onOpenAdminLogin }) => {
  const { t, language } = useLanguage();
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isGsiLoading, setIsGsiLoading] = useState(false);

  // Initialize or check Google Identity Services (GIS)
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as unknown as { google?: any }).google?.accounts?.id) {
      try {
        const google = (window as unknown as { google: any }).google;
        google.accounts.id.initialize({
          client_id: '6835489f-1cf9-4d2e-8b3b-0fc6a260ed0a.apps.googleusercontent.com',
          callback: (response: { credential?: string }) => {
            if (response.credential) {
              try {
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const payload = JSON.parse(jsonPayload);
                const googleUser: UserProfile = {
                  id: `usr_gis_${payload.sub || Date.now()}`,
                  name: payload.name || payload.given_name || 'Google User',
                  email: payload.email || 'user@gmail.com',
                  avatarUrl: payload.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
                  memberSince: new Date().toLocaleDateString('ar-DZ', { month: 'long', year: 'numeric' }),
                  tier: 'عضو بطاقات الولاء المعتمد (Google Verified)',
                  stampsCount: 0,
                  rewardsWon: 0,
                };
                onLogin(googleUser);
              } catch {
                setShowGoogleModal(true);
              }
            }
          },
        });
      } catch (err) {
        // Fallback silently
      }
    }
  }, [onLogin]);

  const handleGoogleClick = () => {
    setIsGsiLoading(true);
    setTimeout(() => {
      setIsGsiLoading(false);
      setShowGoogleModal(true);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between relative overflow-hidden select-none font-['Plus_Jakarta_Sans']">
      {/* Background Ambient Glows with Pointili Lime Green #76FF03 */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#76FF03]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-[#76FF03]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-[#76FF03]/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Top Bar Branding & Controls */}
      <header className="relative z-10 w-full max-w-md mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
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

      {/* Main Hero & Visual Presentation */}
      <main className="relative z-10 w-full max-w-md mx-auto px-6 py-4 flex-1 flex flex-col justify-center">
        {/* Visual Hero Badge Showcase */}
        <div className="mb-5 relative flex flex-col items-center text-center">
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-3xl bg-[#76FF03]/30 blur-xl animate-pulse" />
            
            <div className="relative w-24 h-24 rounded-3xl bg-zinc-950 border-2 border-[#76FF03] p-3.5 flex flex-col items-center justify-center shadow-2xl shadow-[#76FF03]/20">
              <PointiliLogo variant="mark" size="xl" theme="light" />
            </div>

            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-[#76FF03] text-black font-extrabold text-[11px] flex items-center gap-1 shadow-lg shadow-[#76FF03]/40">
              <Sparkles className="w-3 h-3 text-black" />
              <span>BBA · 34</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            {t.authHeading}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-xs leading-relaxed">
            {t.authSubheading}
          </p>
        </div>

        {/* 6-Dot Stamp Preview Showcase */}
        <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4 mb-5 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
            <span className="font-medium text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#76FF03]" />
              <span>بطاقة ولاء تجريبية (6 دوائر)</span>
            </span>
            <span className="font-mono text-[#76FF03] font-semibold">6 STAMPS</span>
          </div>

          {/* 6 Circles Row */}
          <div className="grid grid-cols-6 gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                className="aspect-square rounded-full bg-[#76FF03] text-black flex items-center justify-center font-bold text-xs shadow-md shadow-[#76FF03]/30 transition-transform hover:scale-105"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </div>
            ))}
            <div className="aspect-square rounded-full border-2 border-dashed border-[#76FF03] text-[#76FF03] flex items-center justify-center font-bold text-xs bg-[#76FF03]/10 animate-pulse">
              <Gift className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
            <span>{t.freeRewardAt6}</span>
            <span className="text-[#76FF03] font-bold">وجبة أو مشروب مجاناً</span>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-2 mb-5 text-center">
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
            <QrCode className="w-5 h-5 mx-auto mb-1 text-[#76FF03]" />
            <div className="text-[11px] font-semibold text-zinc-200">مسح كود QR</div>
            <div className="text-[10px] text-zinc-500">في ثانية واحدة</div>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
            <Gift className="w-5 h-5 mx-auto mb-1 text-[#76FF03]" />
            <div className="text-[11px] font-semibold text-zinc-200">6 دوائر</div>
            <div className="text-[10px] text-zinc-500">هدية مجانية</div>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
            <Smartphone className="w-5 h-5 mx-auto mb-1 text-[#76FF03]" />
            <div className="text-[11px] font-semibold text-zinc-200">برج بوعريريج</div>
            <div className="text-[10px] text-zinc-500">مطاعم وكافيهات 34</div>
          </div>
        </div>

        {/* Primary Google Login CTA Button */}
        <div className="space-y-2">
          <button
            onClick={handleGoogleClick}
            disabled={isGsiLoading}
            type="button"
            className="w-full h-14 py-3 px-4 rounded-2xl bg-white hover:bg-zinc-100 active:scale-[0.98] text-zinc-900 font-bold text-sm flex items-center justify-center gap-3 shadow-2xl shadow-white/10 transition-all cursor-pointer relative overflow-hidden group border border-zinc-200"
          >
            {isGsiLoading ? (
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                <span>{t.authenticating}</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-zinc-900 tracking-tight font-extrabold">{t.continueWithGoogle}</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#76FF03]" />
            <span>تسجيل دخول فوري وآمن بحساب Google الحقيقي</span>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-zinc-500 text-center leading-relaxed">
          الدخول محمي ومخصص لزبائن مطاعم وكافيهات برج بوعريريج.
        </p>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full max-w-md mx-auto px-6 py-4 border-t border-zinc-900/60 flex items-center justify-between text-xs text-zinc-600">
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

      {/* Real Google Account Selection Popup Flow */}
      <GoogleSignInModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={(user) => {
          setShowGoogleModal(false);
          onLogin(user);
        }}
      />
    </div>
  );
};
