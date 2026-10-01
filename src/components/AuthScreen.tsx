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

  // دالة فتح التطبيق مباشرة
  const startAppDirectly = () => {
    setActiveView('appContent');
  };

  // العودة لواجهة الخيارات
  const backToChoices = () => {
    setActiveView('welcomeChoice');
  };

  // دالة التثبيت اليدوي / PWA
  const installPWA = async () => {
    const promptEvent = deferredPrompt || (window as any).deferredPrompt;
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult && choiceResult.outcome === 'accepted') {
          console.log('تم التثبيت');
        }
        setDeferredPrompt(null);
        (window as any).deferredPrompt = null;
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    } else {
      startAppDirectly();
    }
  };

  const openDirectly = startAppDirectly;
  const installApp = installPWA;

  // Expose global helpers for inline HTML and prompts
  useEffect(() => {
    (window as any).startAppDirectly = startAppDirectly;
    (window as any).backToChoices = backToChoices;
    (window as any).installPWA = installPWA;
    (window as any).openDirectly = startAppDirectly;
    (window as any).installApp = installPWA;
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

          // إخفاء زر جوجل وإظهار رسالة الترحيب الشخصية بالاسم
          const loginDiv =
            document.getElementById('googleLoginDiv') || document.getElementById('loginWrapper');
          if (loginDiv) loginDiv.style.display = 'none';

          const welcomeDisplay =
            document.getElementById('userWelcomeDisplay') || document.getElementById('userGreeting');
          if (welcomeDisplay) {
            welcomeDisplay.style.display = 'block';
            welcomeDisplay.innerHTML = `أهلاً بك يا ${userInfo.name || 'مستخدم'} 👋<br><span style="font-size: 12px; color: #a1a1aa;">تم تسجيل الدخول بنجاح بحسابك الحقيقي</span>`;
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
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-2 flex-1 flex flex-col justify-center">
        {/* =========================================================================
            1. شاشة الترحيب والاختيار (فتح أو تحميل) - #choiceScreen
            ========================================================================= */}
        {activeView === 'welcomeChoice' ? (
          <div
            id="choiceScreen"
            className="flex flex-col items-center justify-center w-full max-w-[400px] mx-auto my-auto bg-[#18181b] border border-[#27272a] rounded-[20px] p-[30px] text-center shadow-[0_10px_25px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Logo Mark */}
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-2xl bg-zinc-950 border-2 border-[#22c55e] p-2 flex items-center justify-center shadow-lg shadow-[#22c55e]/20">
                <PointiliLogo variant="mark" size="md" theme="light" />
              </div>
            </div>

            <h2 className="text-[#22c55e] mb-2.5 font-bold text-[22px]">Pointili</h2>
            <p className="text-[#a1a1aa] text-[13px] mb-6 leading-relaxed">
              اختر طريقة تشغيل التطبيق للبدء فوراً في جمع الأختام:
            </p>

            {/* زر فتح التطبيق مباشرة */}
            <button
              type="button"
              onClick={startAppDirectly}
              className="choice-btn btn-open w-full p-[14px] rounded-full font-bold text-sm cursor-pointer border-none mb-3 transition-colors bg-[#22c55e] hover:bg-[#16a34a] text-black active:scale-[0.98] shadow-lg shadow-[#22c55e]/25 flex items-center justify-center gap-2"
            >
              <span>🌐 فتح التطبيق مباشرة</span>
            </button>

            {/* زر تحميل وتثبيت على الهاتف */}
            <button
              id="installAppBtn"
              type="button"
              onClick={installPWA}
              className="choice-btn btn-install w-full p-[14px] rounded-full font-bold text-sm cursor-pointer border-none mb-3 transition-colors bg-[#2563eb] hover:bg-[#1d4ed8] text-white active:scale-[0.98] shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
            >
              <span>📥 تحميل وتثبيت على الهاتف</span>
            </button>

            {/* حساب مسجل سابقاً على هذا الجهاز */}
            {savedUserEmail && (
              <div className="mt-4 pt-3.5 border-t border-[#27272a] text-right w-full">
                <div className="text-[11px] text-[#71717a] mb-2">حسابك المحفوظ:</div>
                <button
                  type="button"
                  onClick={handleQuickResume}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-[#22c55e]/40 flex items-center justify-between text-xs text-white hover:border-[#22c55e] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-[#22c55e] text-black font-black text-[10px] flex items-center justify-center shrink-0">
                      G
                    </div>
                    <span className="truncate max-w-[170px] font-mono text-[11px] text-zinc-300" dir="ltr">
                      {maskEmail(savedUserEmail)}
                    </span>
                  </div>
                  <span className="text-[#22c55e] font-bold text-[11px] flex items-center gap-1 shrink-0">
                    متابعة ←
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* =========================================================================
              2. واجهة التطبيق الرئيسية (تظهر بعد النقر على فتح) - #mainAppContainer
              ========================================================================= */
          <div
            id="mainAppContainer"
            className="flex flex-col items-center w-full max-w-[420px] mx-auto animate-in fade-in zoom-in-95 duration-200"
          >
            {/* الشريط العلوي */}
            <div className="top-bar flex justify-between w-full mb-5">
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="badge-btn bg-[#18181b] border border-[#27272a] text-[#22c55e] px-3.5 py-2 rounded-full text-xs font-bold cursor-pointer flex items-center gap-1.5 hover:border-[#22c55e]/60 transition-colors"
              >
                <span>🛡️ بوابة الإدارة</span>
              </button>

              <button
                type="button"
                onClick={backToChoices}
                className="badge-btn bg-[#18181b] border border-[#27272a] text-[#22c55e] px-3.5 py-2 rounded-full text-xs font-bold cursor-pointer flex items-center gap-1.5 hover:border-[#22c55e]/60 transition-colors"
              >
                <span>↩ العودة للخيار</span>
              </button>
            </div>

            {/* البطاقة الرئيسية لتسجيل الدخول */}
            <div className="main-card bg-[#18181b] border border-[#27272a] rounded-[24px] p-6 text-center w-full box-border shadow-[0_10px_30px_rgba(0,0,0,0.4)] mb-5">
              <h2 className="text-[#22c55e] text-xl font-black mb-2">تسجيل الدخول</h2>
              <p className="text-[#a1a1aa] text-[13px] leading-relaxed mb-5">
                سجل بحسابك الحقيقي لتبدأ في جمع الأختام بكل أمان وثقة.
              </p>

              {/* Quick Resume shortcut if returning account */}
              {savedUserEmail && (
                <div className="mb-4 p-3 rounded-2xl bg-zinc-950/80 border border-[#22c55e]/30 flex items-center justify-between text-right">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#22c55e] text-black font-black flex items-center justify-center text-xs shrink-0">
                      {savedUserName ? savedUserName.slice(0, 2).toUpperCase() : 'G'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {savedUserName || 'حسابك المحفوظ'}
                      </div>
                      <div className="text-[10px] font-mono text-[#22c55e] truncate" dir="ltr">
                        {maskEmail(savedUserEmail)}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickResume}
                    className="px-3 py-1.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-black text-[11px] shrink-0 flex items-center gap-1 shadow-md shadow-[#22c55e]/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>متابعة</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* زر تسجيل الدخول الحقيقي بـ Google */}
              <div
                className="google-auth-wrapper flex justify-center my-4 min-h-[44px]"
                id="googleLoginDiv"
              >
                <div
                  id="g_id_onload"
                  data-client_id={OFFICIAL_GOOGLE_CLIENT_ID}
                  data-callback="handleCredentialResponse"
                  data-auto_prompt="false"
                />
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

              <div
                id="userWelcomeDisplay"
                style={{
                  display: 'none',
                  color: '#22c55e',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  marginTop: '15px',
                  lineHeight: '1.6',
                }}
              />

              <div className="mt-4 text-[11px] text-[#71717a] border-t border-[#27272a] pt-3">
                🔒 خصوصية 100% • بريدك مخفي تماماً
              </div>
            </div>

            {/* المزايا الثلاث السفلية */}
            <div className="features-grid grid grid-cols-3 gap-2.5 w-full mb-5 text-center">
              <div className="feature-box bg-[#18181b] border border-[#27272a] rounded-[16px] p-3 text-xs text-white">
                مسح كود QR <span className="block text-[#22c55e] font-bold text-xs mt-1">في ثانية واحدة</span>
              </div>
              <div className="feature-box bg-[#18181b] border border-[#27272a] rounded-[16px] p-3 text-xs text-white">
                6 دوائر <span className="block text-[#22c55e] font-bold text-xs mt-1">هدية مجانية</span>
              </div>
              <div className="feature-box bg-[#18181b] border border-[#27272a] rounded-[16px] p-3 text-xs text-white">
                برج بوعريريج <span className="block text-[#22c55e] font-bold text-xs mt-1">مطاعم 34</span>
              </div>
            </div>

            <div className="footer-text text-[#71717a] text-xs text-center mt-2.5">
              Pointili • BBA © 2026
            </div>
          </div>
        )}
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
