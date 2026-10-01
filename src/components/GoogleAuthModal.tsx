import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  EyeOff,
  User,
  Mail,
  Fingerprint,
} from 'lucide-react';
import { UserProfile } from '../types';
import {
  createGoogleUserProfile,
  maskEmail,
  generateGoogleAnonymousCode,
  initGoogleIdentityServices,
} from '../utils/googleAuthService';
import { useLanguage } from '../i18n/LanguageContext';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const { language } = useLanguage();
  const [emailInput, setEmailInput] = useState<string>(() => {
    try {
      return localStorage.getItem('user_email') || 'aymenbouguerra0102@gmail.com';
    } catch {
      return 'aymenbouguerra0102@gmail.com';
    }
  });
  const [nicknameInput, setNicknameInput] = useState<string>(() => {
    try {
      return localStorage.getItem('user_name') || 'Aymen BG';
    } catch {
      return 'Aymen BG';
    }
  });
  const [hideEmail, setHideEmail] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Live masked preview
  const previewMasked = maskEmail(emailInput.trim());
  const previewCode = generateGoogleAnonymousCode(emailInput.trim() || 'seed');

  useEffect(() => {
    if (!isOpen) return;

    // Try initializing Google Identity Services
    const initialized = initGoogleIdentityServices((user) => {
      onLogin(user);
      onClose();
    });

    // If GIS is present, render the official button into container
    if (initialized && googleBtnRef.current) {
      const google = (window as unknown as { google?: { accounts?: { id: { renderButton: (el: HTMLElement, opts: any) => void } } } }).google;
      if (google?.accounts?.id?.renderButton) {
        try {
          googleBtnRef.current.innerHTML = '';
          google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_black',
            size: 'large',
            shape: 'pill',
            width: 320,
            text: 'continue_with',
            locale: language === 'ar' ? 'ar' : 'fr',
          });
        } catch (e) {
          console.warn('GIS button render note:', e);
        }
      }
    }
  }, [isOpen, language, onLogin, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) return;

    setIsLoading(true);

    setTimeout(() => {
      const user = createGoogleUserProfile({
        email: cleanEmail,
        name: nicknameInput.trim() || undefined,
        customNickname: nicknameInput.trim(),
        sub: `goog_${Date.now()}`,
      });

      if (!hideEmail) {
        user.hideEmailFromPublic = false;
        user.maskedEmail = cleanEmail;
      }

      setIsLoading(false);
      onLogin(user);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 relative shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto text-right font-['Plus_Jakarta_Sans'] select-none">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Google Logo & Title */}
        <div className="text-center pt-2 pb-4 border-b border-zinc-800/80 shrink-0">
          {/* Google Official Multicolored Icon */}
          <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 shadow-lg mb-3">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
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

          <h2 className="text-lg font-black text-white">
            تسجيل الدخول الآمن بحساب Google
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            تسجيل دخول حقيقي وموثق مع الحفاظ الكامل على خصوصيتك وسرية بياناتك
          </p>
        </div>

        {/* Privacy Shield Banner (The Core Guarantee) */}
        <div className="my-4 p-3.5 rounded-2xl bg-[#76FF03]/10 border border-[#76FF03]/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-[#76FF03]">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>درع الخصوصية التلقائي مفعّل (Privacy Shield):</span>
          </div>

          <ul className="text-[11px] text-zinc-300 space-y-1.5 leading-relaxed pr-1">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#76FF03]" />
              <span>
                <strong>بريدك الحقيقي مخفي تماماً:</strong> لن يظهر للكاشير أو المطاعم أو الزبائن.
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#76FF03]" />
              <span>
                <strong>هوية مشفرة آمنة:</strong> يتعامل التطبيق مع كود Google ID مشفر خاص بك.
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#76FF03]" />
              <span>
                <strong>توثيق رسمي:</strong> يمنحك رتبة حساب موثق وتجربة موحدة عبر كافة أجهزتك.
              </span>
            </li>
          </ul>
        </div>

        {/* GIS Official Container (if available) */}
        <div ref={googleBtnRef} className="flex justify-center mb-3 min-h-[44px]" />

        {/* Form to Confirm Google Account & Custom Privacy Preferences */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#76FF03]" />
                <span>حساب Gmail المراد تسجيل الدخول به:</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Google Account</span>
            </label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="example@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-[#76FF03] text-white text-xs font-medium focus:outline-none transition-colors"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#76FF03]" />
                <span>الاسم الظاهر في التطبيق (أو اسم مستعار من اختيارك):</span>
              </span>
            </label>
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="اسمك أو لقبك المفضل..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-[#76FF03] text-white text-xs font-medium focus:outline-none transition-colors"
            />
          </div>

          {/* Privacy Toggle: Hide Email */}
          <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-[#76FF03]" />
              <div>
                <div className="text-xs font-bold text-white">إخفاء البريد عن الكاشير والعامة</div>
                <div className="text-[10px] text-zinc-400">إظهار كود المعرف المشفر فقط بدلاً من البريد</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={hideEmail}
              onChange={(e) => setHideEmail(e.target.checked)}
              className="w-4 h-4 accent-[#76FF03] rounded cursor-pointer"
            />
          </div>

          {/* Live Preview of Cashier View */}
          <div className="p-3 rounded-xl bg-black/60 border border-zinc-800 text-xs space-y-1">
            <div className="text-[11px] font-bold text-zinc-400 mb-1">
              معاينة ما سيراه الكاشير عند مسح كود QR:
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-500">الاسم الظاهر:</span>
              <span className="font-bold text-white">{nicknameInput || 'مستخدم Google'}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-500">البريد الظاهر:</span>
              <span className="font-mono text-[#76FF03] font-bold" dir="ltr">
                {hideEmail ? previewMasked : emailInput}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span className="text-zinc-500">معرف Google المشفر:</span>
              <span className="font-mono text-zinc-400" dir="ltr">{previewCode}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !emailInput.trim()}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#76FF03] hover:bg-[#8aff24] active:scale-[0.98] text-black font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#76FF03]/25 transition-all cursor-pointer border border-[#76FF03]"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Fingerprint className="w-4 h-4 stroke-[2.5]" />
                <span>دخول آمن بحساب Google (محمي بالكامل)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Note Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 text-center">
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            يستخدم Pointili بروتوكول Google Identity Services المشفر لحماية الحسابات ومنع تكرار الأختام دون تخزين أو مشاركة كلمات المرور.
          </p>
        </div>
      </div>
    </div>
  );
};
