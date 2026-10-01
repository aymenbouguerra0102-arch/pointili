import React, { useState, useEffect, useRef } from 'react';
import { PointiliLogo } from './PointiliLogo';
import {
  Shield,
  Sparkles,
  QrCode,
  Gift,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { UserProfile } from '../types';
import { useLanguage, LanguageSelector } from '../i18n/LanguageContext';
import {
  OFFICIAL_GOOGLE_CLIENT_ID,
  parseJwt,
  createGoogleUserProfile,
  maskEmail,
} from '../utils/googleAuthService';
import confetti from 'canvas-confetti';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
  onOpenAdminLogin: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onOpenAdminLogin }) => {
  const { t, language } = useLanguage();
  const [savedUserEmail, setSavedUserEmail] = useState<string | null>(null);
  const [savedUserName, setSavedUserName] = useState<string | null>(null);
  const [showThankYou, setShowThankYou] = useState<boolean>(false);
  const [thankYouUserName, setThankYouUserName] = useState<string>('');
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  // Check if returning Google user exists in localStorage
  useEffect(() => {
    try {
      const email = localStorage.getItem('user_email');
      const name = localStorage.getItem('user_name');
      if (email) {
        setSavedUserEmail(email);
        setSavedUserName(name || null);
      }
    } catch {}
  }, []);

  const closeThankYouModal = () => {
    setShowThankYou(false);
    if (pendingProfile) {
      onLogin(pendingProfile);
    }
  };

  // Expose global function for external or inline triggers
  useEffect(() => {
    (window as any).closeThankYouModal = closeThankYouModal;
  }, [pendingProfile]);

  // Initialize official Google Identity Services & attach global callback
  useEffect(() => {
    // 1. Setup the global handleCredentialResponse function specified in user's prompt
    (window as unknown as {
      handleCredentialResponse?: (response: { credential: string }) => void;
    }).handleCredentialResponse = (response: { credential: string }) => {
      if (response && response.credential) {
        const userInfo = parseJwt(response.credential);
        if (userInfo && userInfo.email) {
          // حفظ بيانات المستخدم محلياً بأمان تام دون إظهارها للعامة
          try {
            localStorage.setItem('user_email', userInfo.email);
            if (userInfo.name) {
              localStorage.setItem('user_name', userInfo.name);
            }
          } catch {}

          const profile = createGoogleUserProfile({
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            sub: userInfo.sub,
          });

          // عرض نافذة الشكر والترحيب المخصصة
          setPendingProfile(profile);
          setThankYouUserName(userInfo.name || 'مستخدم');
          setShowThankYou(true);

          confetti({
            particleCount: 50,
            spread: 65,
            origin: { y: 0.5 },
            colors: ['#22c55e', '#76FF03', '#ffffff'],
          });
        }
      }
    };

    // 2. Programmatically initialize and render the button into the container
    const initGIS = () => {
      const google = (window as unknown as {
        google?: {
          accounts?: {
            id: {
              initialize: (opts: any) => void;
              renderButton: (el: HTMLElement, opts: any) => void;
            };
          };
        };
      }).google;

      if (google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          google.accounts.id.initialize({
            client_id: OFFICIAL_GOOGLE_CLIENT_ID,
            callback: (window as any).handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          googleBtnContainerRef.current.innerHTML = '';
          google.accounts.id.renderButton(googleBtnContainerRef.current, {
            type: 'standard',
            shape: 'pill',
            theme: 'filled_black',
            text: 'signin_with',
            size: 'large',
            locale: language === 'ar' ? 'ar' : 'fr',
            width: 290,
          });
        } catch (e) {
          console.warn('Google Identity button initialization note:', e);
        }
      }
    };

    // Attempt immediately and with slight delay to ensure GSI script has executed
    initGIS();
    const timer = setTimeout(initGIS, 600);
    return () => clearTimeout(timer);
  }, [language, onLogin]);

  // One-click resume for returning user
  const handleQuickResume = () => {
    if (!savedUserEmail) return;
    const profile = createGoogleUserProfile({
      email: savedUserEmail,
      name: savedUserName || undefined,
    });
    setPendingProfile(profile);
    setThankYouUserName(savedUserName || 'مستخدم');
    setShowThankYou(true);
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#22c55e', '#76FF03', '#ffffff'],
    });
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
            تسجيل الدخول الآمن بحساب Google
          </h1>
          <p className="mt-1 text-xs text-zinc-400 max-w-xs leading-relaxed">
            كافيهات ومطاعم برج بوعريريج · اجمع 6 أختام واحصل على وجبتك مجاناً مع حماية تامة لخصوصيتك وبريدك.
          </p>
        </div>

        {/* SECURE & PRIVATE GOOGLE LOGIN CONTAINER */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 mb-4 shadow-2xl backdrop-blur-md relative overflow-hidden">
          {/* Top Verification Header */}
          <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              {/* Google G Multi-color Icon */}
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 p-1.5 flex items-center justify-center shadow-sm">
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
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>Google Sign-In الرسمي</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#76FF03] animate-ping" />
                </div>
                <div className="text-[10px] text-zinc-400">توثيق موحد لكافة أجهزتك ومطاعمك</div>
              </div>
            </div>

            <div className="px-2.5 py-1 rounded-full bg-[#76FF03]/15 border border-[#76FF03]/40 text-[#76FF03] text-[10px] font-black flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>خصوصية 100%</span>
            </div>
          </div>

          {/* Quick Resume for Returning Account (if previously signed in) */}
          {savedUserEmail && (
            <div className="mb-3.5 p-3 rounded-2xl bg-zinc-950/80 border border-[#76FF03]/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#76FF03] text-black font-black flex items-center justify-center text-xs shrink-0">
                  {savedUserName ? savedUserName.slice(0, 2).toUpperCase() : 'G'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {savedUserName || 'حسابك المحفوظ'}
                  </div>
                  <div className="text-[10px] font-mono text-[#76FF03] truncate" dir="ltr">
                    {maskEmail(savedUserEmail)}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleQuickResume}
                className="px-3 py-1.5 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] text-black font-black text-[11px] shrink-0 flex items-center gap-1 shadow-md shadow-[#76FF03]/20 active:scale-95 transition-all cursor-pointer"
              >
                <span>متابعة</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* OFFICIAL GOOGLE SIGN-IN CONTAINER (Requested HTML Format) */}
          <div className="google-auth-container rounded-2xl p-4 bg-[#121212] border border-zinc-800 flex flex-col items-center justify-center my-2 text-center transition-all">
            {/* GIS declarative tags */}
            <div
              id="g_id_onload"
              data-client_id={OFFICIAL_GOOGLE_CLIENT_ID}
              data-callback="handleCredentialResponse"
              data-auto_prompt="false"
            />

            {/* GIS container rendered via JS or declarative */}
            <div ref={googleBtnContainerRef} className="flex justify-center min-h-[44px] w-full">
              <div
                className="g_id_signin"
                data-type="standard"
                data-shape="pill"
                data-theme="filled_black"
                data-text="signin_with"
                data-size="large"
                data-locale="ar"
              />
            </div>
          </div>

          {/* PRIVACY SHIELD GUARANTEE BOX */}
          <div className="mt-3.5 p-3 rounded-2xl bg-black/60 border border-zinc-800/80 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-xs text-[#76FF03]">
              <Lock className="w-3.5 h-3.5" />
              <span>كيف يحمي نظام Pointili خصوصيتك؟</span>
            </div>
            <ul className="text-[11px] text-zinc-400 space-y-1 pr-1 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-[#76FF03] font-bold">✓</span>
                <span>
                  <strong>بريدك الشخصي مخفي تماماً:</strong> يرى الكاشير كود معرّف الزبون فقط (GID-BBA) دون كشف Gmail.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#76FF03] font-bold">✓</span>
                <span>
                  <strong>أختامك الـ 6 محفوظة دائماً:</strong> عند تغيير هاتفك، يكفي تسجيل الدخول بـ Google لاسترجاع بطاقاتك فوراً.
                </span>
              </li>
            </ul>
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

      {/* نافذة رسالة الشكر والترحيب بعد تسجيل الدخول */}
      {showThankYou && (
        <div
          id="thankYouModal"
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-[5px] animate-in fade-in duration-200 select-none font-['Plus_Jakarta_Sans']"
          onClick={closeThankYouModal}
        >
          <div
            className="modal-card relative bg-[#1a1a1a] border border-[#333] rounded-[20px] p-[30px_20px] text-center max-w-[330px] w-[90%] shadow-[0_10px_30px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-250"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient light glow */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-28 h-28 bg-[#22c55e]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="modal-icon text-[50px] mb-[15px] select-none animate-bounce">
              🙏
            </div>

            <h2 className="text-[#22c55e] text-[20px] font-black mb-[10px] tracking-tight">
              شكراً لك على انضمامك!
            </h2>

            <p id="thankYouText" className="text-[#aaa] text-[13px] leading-[1.6] mb-[20px] font-medium">
              أهلاً بك يا <strong className="text-white font-extrabold">{thankYouUserName}</strong>!<br />
              شكراً لك على تسجيل الدخول بحسابك. سعدنا بانضمامك إلى عائلة Pointili في برج بوعريريج والمنصورة.
            </p>

            <button
              type="button"
              className="modal-btn w-full py-[12px] rounded-[25px] bg-[#22c55e] hover:bg-[#16a34a] text-black font-black text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg shadow-[#22c55e]/25 border border-[#22c55e]"
              onClick={closeThankYouModal}
            >
              <span>متابعة إلى التطبيق</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
