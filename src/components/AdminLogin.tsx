import React, { useState, useEffect } from 'react';
import { Restaurant, MerchantSession } from '../types';
import { PointiliLogo } from './PointiliLogo';
import {
  ShieldCheck,
  Lock,
  User,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Eye,
  EyeOff,
  Store,
  Clock,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { authenticateMerchantOrAdmin } from '../data/adminMockData';

interface AdminLoginProps {
  restaurants: Restaurant[];
  onSuccess: (session: MerchantSession) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  restaurants,
  onSuccess,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<'merchant' | 'admin'>('merchant');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Suggested popular BBA partner venues for quick fill
  const popularVenues = [
    'Le Mirage',
    'El Bey',
    'Burger HOUSE 34',
    '217 Fast Food',
    'Pizzeria Antakya',
    'Express Mansoura',
  ];

  const handleTabChange = (tab: 'merchant' | 'admin') => {
    setActiveTab(tab);
    setError(null);
    if (tab === 'admin') {
      setUsername('AYMEN BG');
      setPassword('');
    } else {
      setUsername('');
      setPassword('1234');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = authenticateMerchantOrAdmin(username, password, restaurants);

    if (result.success && result.role) {
      setIsLoading(false);
      onSuccess({
        role: result.role,
        restaurant: result.restaurant,
        restaurantId: result.restaurant?.id,
        restaurantName: result.restaurant?.nameAr || result.restaurant?.name,
        username: username.trim(),
        loginTime: new Date().toLocaleTimeString('ar-DZ'),
      });
    } else {
      setIsLoading(false);
      setError(result.error || 'بيانات الدخول غير صحيحة.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 relative overflow-hidden select-none font-['Plus_Jakarta_Sans']">
      {/* Ambient background glow */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#76FF03]/15 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#76FF03]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Back button */}
      <button
        onClick={onCancel}
        className="absolute top-6 left-6 px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer z-20"
      >
        <ArrowLeft className="w-3.5 h-3.5 text-[#76FF03]" />
        <span>العودة للتطبيق / Back</span>
      </button>

      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border-2 border-[#76FF03] flex items-center justify-center mb-3 shadow-lg shadow-[#76FF03]/20">
            {activeTab === 'merchant' ? (
              <Store className="w-7 h-7 text-[#76FF03]" />
            ) : (
              <Lock className="w-7 h-7 text-[#76FF03]" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <PointiliLogo variant="icon" size="sm" theme="light" />
            <span className="font-['Pacifico',cursive] text-2xl text-white">Pointili</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#76FF03] text-black font-extrabold uppercase">
              BBA 34
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-white mt-1.5">
            {activeTab === 'merchant' ? 'بوابة أصحاب المحلات والكافيهات' : 'لوحة المشرف العام'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {activeTab === 'merchant'
              ? 'سجل دخول متجرك لقبول أو رفض طلبات الأختام'
              : 'تسجيل الدخول الإداري للمشرف العام AYMEN BG'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-900 rounded-2xl border border-zinc-800 mb-5">
          <button
            type="button"
            onClick={() => handleTabChange('merchant')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'merchant'
                ? 'bg-[#76FF03] text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>صاحب محل</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>المشرف العام</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-800 text-xs text-red-200 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              {activeTab === 'merchant'
                ? 'اسم المحل / Store Name'
                : 'اسم المشرف / Admin Username'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                disabled={isLoading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  activeTab === 'merchant'
                    ? 'مثال: Le Mirage أو El Bey'
                    : 'AYMEN BG'
                }
                className="w-full pl-10 pr-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#76FF03] font-medium"
              />
            </div>
          </div>

          {/* Quick Store Chips if in Merchant tab */}
          {activeTab === 'merchant' && (
            <div>
              <div className="text-[11px] text-zinc-500 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#76FF03]" />
                <span>اختر اسم المحل بسرعة:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {popularVenues.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setUsername(v);
                      setPassword('1234');
                    }}
                    className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                كلمة المرور / Password
              </label>
              {activeTab === 'merchant' && (
                <span className="text-[10px] text-[#76FF03] font-mono font-bold">
                  (الموحدة: 1234)
                </span>
              )}
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={activeTab === 'merchant' ? '1234' : '••••••••'}
                className="w-full pl-10 pr-10 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#76FF03] font-mono tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] active:scale-[0.98] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#76FF03]/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>جارِ التحقق من الحساب...</span>
            ) : (
              <>
                <span>
                  {activeTab === 'merchant'
                    ? 'دخول لوحة تحكم المتجر'
                    : 'دخول المشرف العام'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Credentials guide note */}
        <div className="mt-5 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
          <div className="font-bold text-zinc-300 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-[#76FF03]" />
            <span>بيانات الدخول المعتمدة:</span>
          </div>
          <div>• أصحاب المحلات: اسم المحل + كلمة المرور: <strong className="text-[#76FF03] font-mono">1234</strong></div>
          <div>• المشرف العام: اسم المستخدم: <strong className="text-white font-mono">AYMEN BG</strong> + كلمة المرور: <strong className="text-[#76FF03] font-mono">14072003</strong></div>
        </div>
      </div>
    </div>
  );
};
