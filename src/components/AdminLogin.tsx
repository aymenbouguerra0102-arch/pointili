import React, { useState, useEffect } from 'react';
import { PointiliLogo } from './PointiliLogo';
import { ShieldCheck, Lock, User, AlertCircle, ArrowLeft, ArrowRight, KeyRound, Eye, EyeOff, ShieldAlert, Clock } from 'lucide-react';
import { verifyAdminCredentials } from '../data/adminMockData';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Security brute-force defense
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setError(null);
    setIsLoading(true);

    try {
      const isValid = await verifyAdminCredentials(username, password);

      if (isValid) {
        setIsLoading(false);
        setFailedAttempts(0);
        onSuccess();
      } else {
        setIsLoading(false);
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);

        if (newAttempts >= 5) {
          setLockoutSeconds(30);
          setError('تم تجاوز الحد الأقصى للمحاولات. تم تفعيل القفل الأمني لمدة 30 ثانية لدواعي الحماية.');
        } else {
          setError(`بيانات تسجيل الدخول غير صحيحة. تم رفض الوصول. (المحاولات المتبقية: ${5 - newAttempts})`);
        }
      }
    } catch {
      setIsLoading(false);
      setError('حدث خطأ أثناء معالجة التشفير. يرجى المحاولة لاحقاً.');
    }
  };

  const isLocked = lockoutSeconds > 0;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#76FF03]/15 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#76FF03]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Back button */}
      <button
        onClick={onCancel}
        className="absolute top-6 left-6 px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-[#76FF03]" />
        <span>العودة للتطبيق / Back</span>
      </button>

      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border-2 border-[#76FF03] flex items-center justify-center mb-3 shadow-lg shadow-[#76FF03]/20">
            <Lock className="w-7 h-7 text-[#76FF03]" />
          </div>

          <div className="flex items-center gap-2">
            <PointiliLogo variant="icon" size="sm" theme="light" />
            <span className="font-['Pacifico',cursive] text-2xl text-white">Pointili</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#76FF03] text-black font-extrabold uppercase">
              Secure
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-white mt-2 font-['Plus_Jakarta_Sans']">
            لوحة الإدارة الآمنة
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            بوابة تسجيل الدخول المشفرة والمحمية للمشرفين
          </p>
        </div>

        {/* Lockout Warning */}
        {isLocked && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-950/60 border border-amber-600/80 text-xs text-amber-200 flex items-center gap-2.5 animate-pulse">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold">القفل الأمني مفعل / Lockout Active</div>
              <div className="text-[11px] text-amber-300/80 font-mono mt-0.5">
                الرجاء الانتظار {lockoutSeconds} ثانية لإعادة المحاولة...
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && !isLocked && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-xs text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              اسم المستخدم / Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                disabled={isLocked || isLoading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                placeholder="أدخل اسم المستخدم"
                className="w-full pl-10 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#76FF03] font-medium disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              كلمة المرور / Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLocked || isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#76FF03] font-medium disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isLocked}
            className="w-full py-3 px-4 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] active:scale-[0.98] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl shadow-[#76FF03]/25 transition-all cursor-pointer mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>دخول آمن / Authenticate</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security verification specs */}
        <div className="mt-5 pt-4 border-t border-zinc-900 text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-[#76FF03]" />
          <span>تشفير عالي الأمان (SHA-256 Hashing · 100% Protected)</span>
        </div>
      </div>
    </div>
  );
};
