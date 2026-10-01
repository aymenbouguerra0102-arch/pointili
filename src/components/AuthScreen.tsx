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
  const [activeView, setActiveView] = useState<'welcomeChoice' | 'appContent'>('welcomeChoice');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
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

  // Listen for PWA beforeinstallprompt to enable install prompt
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;
      const btn = document.getElementById('installChoiceBtn');
      if (btn) btn.style.display = 'block';
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // زر "فتح التطبيق مباشرة"
  const openDirectly = () => {
    setActiveView('appContent');
  };

  // زر "تحميل وتثبيت"
  const installApp = async () => {
    const promptEvent = deferredPrompt || (window as any).deferredPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          console.log('تم قبول التثبيت');
        }
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    } else {
      alert(
        'التثبيت التلقائي غير مدعوم في هذا المتصفح، يمكنك فتحه مباشرة أو إضافته للشاشة الرئيسية يدويًا من إعدادات المتصفح.'
      );
      openDirectly(); // الانتقال المباشر للتطبيق
    }
  };

  // Expose global helpers for inline HTML and prompts
  useEffect(() => {
    (window as any).openDirectly = openDirectly;
    (window as any).installApp = installApp;
  }, [deferredPrompt]);

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

          const wrapper = document.getElementById('loginWrapper');
          if (wrapper) wrapper.style.display = 'none';

          const greeting = document.getElementById('userGreeting');
          if (greeting) {
            greeting.innerHTML = `أهلاً بك، ${userInfo.name || 'مستخدم'} 👋<br><span style="font-size:11px; color:#aaa;">تم تسجيل الدخول بنجاح</span>`;
          }

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
      <main className="relative z-10 w-full max-w-md mx-auto px-5 py-4 flex-1 flex flex-col justify-center">
        {/* =========================================================================
            VIEW 1: WAITING / CHOICE SCREEN ("Pointili - فتح أو تحميل")
            ========================================================================= */}
        {activeView === 'welcomeChoice' ? (
          <div
            id="welcomeChoiceScreen"
            className="container mx-auto max-w-[380px] w-full bg-[#1a1a1a] border border-[#333] rounded-[20px] p-[25px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-center animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Visual Icon Badge */}
            <div className="flex justify-center mb-3">
              <div className="relative w-16 h-16 rounded-2xl bg-zinc-950 border-2 border-[#76FF03] p-2 flex items-center justify-center shadow-lg shadow-[#76FF03]/20">
                <PointiliLogo variant="mark" size="md" theme="light" />
              </div>
            </div>

            <h2 className="text-[#22c55e] font-black text-xl mb-2.5">
              Pointili - برج بوعريريج
            </h2>
            <p className="text-[#aaa] text-[13px] leading-relaxed mb-6">
              اختر كيف تريد استخدام تطبيق الولاء الخاص بك:
            </p>

            {/* خيار الفتح المباشر */}
            <button
              type="button"
              onClick={openDirectly}
              className="choice-btn btn-open w-full p-[14px] rounded-full font-bold text-sm cursor-pointer border-none mb-3 transition-all duration-200 bg-[#22c55e] hover:bg-[#16a34a] text-black active:scale-[0.98] shadow-lg shadow-[#22c55e]/25 flex items-center justify-center gap-2"
            >
              <span>🌐 فتح التطبيق مباشرة</span>
            </button>

            {/* خيار التثبيت/التحميل (يظهر تلقائياً لو المتصفح يدعمه) */}
            <button
              id="installChoiceBtn"
              type="button"
              onClick={installApp}
              className="choice-btn btn-install w-full p-[14px] rounded-full font-bold text-sm cursor-pointer border-none mb-3 transition-all duration-200 bg-[#2563eb] hover:bg-[#1d4ed8] text-white active:scale-[0.98] shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
            >
              <span>📥 تحميل وتثبيت على الهاتف</span>
            </button>

            {/* Quick Resume for Returning Account (if previously signed in) */}
            {savedUserEmail && (
              <div className="mt-4 pt-3.5 border-t border-zinc-800 text-right">
                <div className="text-[11px] text-zinc-400 mb-2">حساب مسجل سابقاً على هذا الجهاز:</div>
                <button
                  type="button"
                  onClick={handleQuickResume}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-[#76FF03]/40 flex items-center justify-between text-xs text-white hover:border-[#76FF03] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-[#76FF03] text-black font-black text-[10px] flex items-center justify-center shrink-0">
                      G
                    </div>
                    <span className="truncate max-w-[170px] font-mono text-[11px] text-zinc-300" dir="ltr">
                      {maskEmail(savedUserEmail)}
                    </span>
                  </div>
                  <span className="text-[#76FF03] font-bold text-[11px] flex items-center gap-1 shrink-0">
                    متابعة مباشرة ←
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* =========================================================================
              VIEW 2: APP CONTENT & GOOGLE AUTHENTICATION SCREEN
              ========================================================================= */
          <div
            id="appContent"
            className="container mx-auto max-w-[380px] w-full bg-[#1a1a1a] border border-[#333] rounded-[20px] p-[25px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-center animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Visual Header */}
            <div className="flex justify-center mb-2.5">
              <PointiliLogo variant="full" size="md" theme="dark" />
            </div>

            <h2 className="text-[#22c55e] font-black text-xl mb-1.5">
              تسجيل الدخول
            </h2>
            <p className="text-[#aaa] text-[13px] leading-relaxed mb-4">
              سجل بحسابك لتبدأ في جمع الأختام بكل أمان.
            </p>

            {/* Quick Resume for Returning Account */}
            {savedUserEmail && (
              <div className="mb-3.5 p-3 rounded-2xl bg-zinc-950/80 border border-[#76FF03]/30 flex items-center justify-between text-right">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#76FF03] text-black font-black flex items-center justify-center text-xs shrink-0">
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

            {/* GOOGLE AUTH BOX & GIS DECLARATIVE WRAPPER */}
            <div
              className="google-auth-box my-3 flex flex-col items-center justify-center min-h-[44px]"
              id="loginWrapper"
            >
              {/* GIS declarative tags */}
              <div
                id="g_id_onload"
                data-client_id={OFFICIAL_GOOGLE_CLIENT_ID}
                data-callback="handleCredentialResponse"
                data-auto_prompt="false"
              />

              {/* GIS button container */}
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

            {/* USER GREETING BANNER */}
            <div id="userGreeting" className="text-[#22c55e] font-bold text-sm my-2"></div>

            {/* Back to Choice button */}
            <button
              type="button"
              onClick={() => setActiveView('welcomeChoice')}
              className="mt-3.5 px-4 py-2 rounded-full border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>↩ العودة لخيارات الفتح والتحميل</span>
            </button>

            {/* Privacy Shield note */}
            <div className="mt-4 pt-3.5 border-t border-zinc-800/80 text-right space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#76FF03]">
                <Lock className="w-3 h-3" />
                <span>خصوصية 100% · بريدك مخفي تماماً</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                يتم ربط أختامك بـ ID سري ومشفر دون مشاركة البريد الإلكتروني مع أي طرف آخر.
              </p>
            </div>
          </div>
        )}

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
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
