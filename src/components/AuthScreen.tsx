import React, { useState } from 'react';
import { PointiliLogo } from './PointiliLogo';
import { Shield, Sparkles, QrCode, Gift, Smartphone, CheckCircle2, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthScreenProps {
  onLogin: (user: UserProfile) => void;
  onOpenAdminLogin: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onOpenAdminLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDemoUser, setSelectedDemoUser] = useState<'alex' | 'sophia' | 'marcus'>('alex');

  const demoUsers: Record<'alex' | 'sophia' | 'marcus', UserProfile> = {
    alex: {
      id: 'usr_pointili_882',
      name: 'Alex Rivera',
      email: 'alex.rivera@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      memberSince: 'March 2026',
      tier: 'Gold Loyalty Member',
    },
    sophia: {
      id: 'usr_pointili_519',
      name: 'Sophia Chen',
      email: 'sophia.chen@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      memberSince: 'January 2026',
      tier: 'Platinum Coffee Club',
    },
    marcus: {
      id: 'usr_pointili_301',
      name: 'Marcus Vance',
      email: 'marcus.vance@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      memberSince: 'February 2026',
      tier: 'VIP Foodie',
    },
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Smooth transition simulation for authentic Google OAuth feel
    setTimeout(() => {
      onLogin(demoUsers[selectedDemoUser]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Ambient Glows with Pointili Lime Green #76FF03 */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#76FF03]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-[#76FF03]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-[#76FF03]/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Top Bar Branding */}
      <header className="relative z-10 w-full max-w-md mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
        <PointiliLogo variant="full" size="md" theme="dark" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAdminLogin}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 hover:border-[#76FF03]/60 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-[#76FF03]" />
            <span className="font-semibold text-[11px]">Admin Portal</span>
          </button>
        </div>
      </header>

      {/* Main Hero & Visual Presentation */}
      <main className="relative z-10 w-full max-w-md mx-auto px-6 py-4 flex-1 flex flex-col justify-center">
        {/* Visual Hero Badge Showcase */}
        <div className="mb-6 relative flex flex-col items-center">
          <div className="relative mb-6">
            {/* Outer glowing pulsing ring */}
            <div className="absolute inset-0 rounded-3xl bg-[#76FF03]/30 blur-xl animate-pulse" />
            
            {/* Stylized Brand Icon Card */}
            <div className="relative w-28 h-28 rounded-3xl bg-zinc-950 border-2 border-[#76FF03] p-4 flex flex-col items-center justify-center shadow-2xl shadow-[#76FF03]/20">
              <PointiliLogo variant="mark" size="xl" theme="light" />
            </div>

            {/* Floating floating mini stamp bubble */}
            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-[#76FF03] text-black font-bold text-xs flex items-center gap-1 shadow-lg shadow-[#76FF03]/40">
              <Sparkles className="w-3 h-3 text-black" />
              <span>6 STAMPS</span>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-center text-white font-['Plus_Jakarta_Sans'] leading-tight">
            Your Digital Stamp Card,{' '}
            <span className="text-[#76FF03] block">Simplified.</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-400 text-center max-w-xs leading-relaxed">
            Scan QR at your favorite cafes & restaurants. Fill 6 dots, unlock free food & drinks instantly.
          </p>
        </div>

        {/* 6-Dot Stamp Preview Showcase */}
        <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4 mb-6 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
            <span className="font-medium text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#76FF03]" />
              Live Card Demo
            </span>
            <span className="font-mono text-[#76FF03] font-semibold">5 / 6 Stamps</span>
          </div>

          {/* 6 Circles Row */}
          <div className="grid grid-cols-6 gap-2 mb-3">
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
            <span>Scan 1 more to unlock</span>
            <span className="text-white font-semibold flex items-center gap-1 text-[#76FF03]">
              Free Meal or Drink <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/60 text-center">
            <QrCode className="w-5 h-5 mx-auto mb-1 text-[#76FF03]" />
            <div className="text-[11px] font-semibold text-zinc-200">Scan QR</div>
            <div className="text-[10px] text-zinc-500">1-second tap</div>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/60 text-center">
            <Gift className="w-5 h-5 mx-auto mb-1 text-[#76FF03]" />
            <div className="text-[11px] font-semibold text-zinc-200">6 Dots</div>
            <div className="text-[10px] text-zinc-500">Free reward</div>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/60 text-center">
            <Smartphone className="w-5 h-5 mx-auto mb-1 text-[#76FF03]" />
            <div className="text-[11px] font-semibold text-zinc-200">Zero Paper</div>
            <div className="text-[10px] text-zinc-500">Always with you</div>
          </div>
        </div>

        {/* Account Selector (Demo Profiles) */}
        <div className="mb-4">
          <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2 text-center">
            Choose Google Account Profile
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800">
            {(['alex', 'sophia', 'marcus'] as const).map((key) => {
              const u = demoUsers[key];
              const isSelected = selectedDemoUser === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDemoUser(key)}
                  className={`flex flex-col items-center p-2 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'bg-zinc-800 text-white border border-[#76FF03]/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <img
                    src={u.avatarUrl}
                    alt={u.name}
                    className="w-7 h-7 rounded-full object-cover mb-1 ring-1 ring-zinc-700"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[11px] font-semibold truncate w-full text-center">
                    {u.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Google Login CTA Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          type="button"
          className="w-full h-13 py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm flex items-center justify-center gap-3 shadow-xl shadow-white/5 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
              <span>Signing in with Google...</span>
            </div>
          ) : (
            <>
              {/* Google G Logo SVG */}
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
              <span>Continue with Google as {demoUsers[selectedDemoUser].name}</span>
            </>
          )}
        </button>

        {/* Privacy Note */}
        <p className="mt-3 text-[11px] text-zinc-500 text-center">
          By continuing, you agree to Pointili Loyalty terms. Secure, passwordless access.
        </p>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full max-w-md mx-auto px-6 py-4 border-t border-zinc-900/60 flex items-center justify-between text-xs text-zinc-600">
        <span>Pointili &copy; {new Date().getFullYear()}</span>
        <button
          type="button"
          onClick={onOpenAdminLogin}
          className="text-[11px] text-zinc-500 hover:text-[#76FF03] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Shield className="w-3 h-3 text-[#76FF03]" />
          <span>بوابة الإدارة / Admin Portal</span>
        </button>
      </footer>
    </div>
  );
};
