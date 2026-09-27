import React, { useState } from 'react';
import { UserProfile, StampHistoryItem, Restaurant } from '../types';
import {
  Award,
  Gift,
  Clock,
  LogOut,
  RotateCcw,
  Store,
  ChevronRight,
  Shield,
  Smartphone,
  ExternalLink,
  Plus,
  CheckCircle,
} from 'lucide-react';
import { PointiliLogo } from './PointiliLogo';

interface ProfileTabProps {
  user: UserProfile;
  restaurants: Restaurant[];
  history: StampHistoryItem[];
  onLogout: () => void;
  onResetDemoData: () => void;
  onOpenMerchantQR: () => void;
  onAddMorePlaces: () => void;
  onOpenAdminLogin: () => void;
  onOpenInstallModal?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  restaurants,
  history,
  onLogout,
  onResetDemoData,
  onOpenMerchantQR,
  onAddMorePlaces,
  onOpenAdminLogin,
  onOpenInstallModal,
}) => {
  const [copiedId, setCopiedId] = useState(false);

  // Computations
  const totalStampsCurrent = restaurants.reduce((sum, r) => sum + r.stampsCount, 0);
  const totalRewardsClaimed = restaurants.reduce((sum, r) => sum + (r.totalRewardsClaimed || 0), 0);
  const estimatedSavings = (totalRewardsClaimed * 14.5 + totalStampsCurrent * 1.2).toFixed(2);
  const completedCardsCount = restaurants.filter((r) => r.stampsCount >= 6).length;

  return (
    <div className="min-h-full pb-28 pt-2 px-4 max-w-lg mx-auto flex flex-col">
      {/* Profile Header Card */}
      <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 mb-4 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#76FF03]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 relative">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#76FF03] shadow-md"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white truncate font-['Plus_Jakarta_Sans']">
                {user.name}
              </h2>
              <span className="w-2 h-2 rounded-full bg-[#76FF03]" />
            </div>
            <p className="text-xs text-zinc-400 truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[11px] font-bold text-zinc-900 bg-[#76FF03] px-2 py-0.5 rounded-md">
                {user.tier}
              </span>
              <span className="text-[11px] text-zinc-500">
                Since {user.memberSince}
              </span>
            </div>
          </div>
        </div>

        {/* Member ID Quick Copy */}
        <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span className="font-mono text-[11px]">ID: {user.id}</span>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(user.id);
              setCopiedId(true);
              setTimeout(() => setCopiedId(false), 2000);
            }}
            className="text-[11px] text-[#76FF03] hover:underline"
          >
            {copiedId ? 'Copied!' : 'Copy ID'}
          </button>
        </div>
      </div>

      {/* METRICS STATS GRID */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center">
          <div className="text-2xl font-black text-[#76FF03] font-['Plus_Jakarta_Sans']">
            {totalStampsCurrent}
          </div>
          <div className="text-[11px] font-semibold text-zinc-300 mt-0.5">Active Stamps</div>
          <div className="text-[10px] text-zinc-500">{restaurants.length} cards active</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center">
          <div className="text-2xl font-black text-white font-['Plus_Jakarta_Sans']">
            {totalRewardsClaimed}
          </div>
          <div className="text-[11px] font-semibold text-zinc-300 mt-0.5">Rewards Claimed</div>
          <div className="text-[10px] text-zinc-500">Free meals & drinks</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center">
          <div className="text-2xl font-black text-emerald-400 font-['Plus_Jakarta_Sans']">
            ${estimatedSavings}
          </div>
          <div className="text-[11px] font-semibold text-zinc-300 mt-0.5">Total Saved</div>
          <div className="text-[10px] text-zinc-500">Value earned</div>
        </div>
      </div>

      {/* Unlocked rewards alert if any */}
      {completedCardsCount > 0 && (
        <div className="p-4 rounded-2xl bg-[#76FF03]/15 border border-[#76FF03] mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Gift className="w-5 h-5 text-[#76FF03]" />
            <div>
              <div className="text-xs font-bold text-[#76FF03] uppercase">
                {completedCardsCount} Reward{completedCardsCount > 1 ? 's' : ''} Ready!
              </div>
              <div className="text-xs text-white">
                Check My Cards tab to redeem free food & drinks
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK UTILITY ACTIONS */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-2 mb-5 divide-y divide-zinc-800/60">
        {/* Merchant Stand Generator */}
        <button
          onClick={onOpenMerchantQR}
          className="w-full p-3 flex items-center justify-between text-left hover:bg-zinc-850 rounded-xl transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 text-[#76FF03] flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#76FF03] transition-colors">
                Merchant Counter QR Stand
              </div>
              <div className="text-[11px] text-zinc-400">
                View & test countertop QR code posters
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </button>

        {/* Add more restaurants */}
        <button
          onClick={onAddMorePlaces}
          className="w-full p-3 flex items-center justify-between text-left hover:bg-zinc-850 rounded-xl transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 text-white flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#76FF03] transition-colors">
                Discover Participating Places
              </div>
              <div className="text-[11px] text-zinc-400">
                Join new loyalty stamp cards near you
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </button>

        {/* Phone Desktop App Icon / Install */}
        {onOpenInstallModal && (
          <button
            onClick={onOpenInstallModal}
            className="w-full p-3 flex items-center justify-between text-left hover:bg-zinc-850 rounded-xl transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <img
                src="/icon.svg"
                alt="App Icon"
                className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#76FF03]"
              />
              <div>
                <div className="text-xs font-bold text-white group-hover:text-[#76FF03] transition-colors flex items-center gap-1.5">
                  <span>شعار التطبيق في مكتب الهاتف</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#76FF03]" />
                </div>
                <div className="text-[11px] text-zinc-400">
                  عرض الأيقونة والتثبيت في الشاشة الرئيسية (Home Screen)
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </button>
        )}

        {/* Secure Admin Portal Button */}
        <button
          onClick={onOpenAdminLogin}
          className="w-full p-3 flex items-center justify-between text-left hover:bg-zinc-850 rounded-xl transition-colors cursor-pointer group bg-[#76FF03]/5"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#76FF03]/20 text-[#76FF03] flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#76FF03] transition-colors flex items-center gap-1.5">
                <span>لوحة التحكم الإدارية / Admin Control</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-[#76FF03] border border-zinc-700">
                  Protected
                </span>
              </div>
              <div className="text-[11px] text-zinc-400">
                تسجيل الدخول المشفر لإدارة المحلات والإحصائيات
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#76FF03]" />
        </button>
      </div>

      {/* RECENT STAMP & REWARD ACTIVITY */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Recent Activity
          </h3>
          <span className="text-[11px] text-zinc-500">Live Stamp Log</span>
        </div>

        <div className="space-y-2">
          {history.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex items-start gap-3 text-xs"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  item.type === 'reward_unlocked'
                    ? 'bg-[#76FF03] text-black'
                    : item.type === 'reward_redeemed'
                    ? 'bg-amber-400 text-black'
                    : 'bg-zinc-800 text-[#76FF03]'
                }`}
              >
                {item.type === 'reward_unlocked' ? (
                  <Gift className="w-3.5 h-3.5" />
                ) : item.type === 'reward_redeemed' ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <Award className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white truncate">
                    {item.restaurantName}
                  </span>
                  <span className="text-[10px] text-zinc-500 shrink-0">
                    {item.timestamp}
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px] mt-0.5">
                  {item.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DEMO DATA CONTROLS & LOGOUT */}
      <div className="space-y-2 pt-2 border-t border-zinc-800/80">
        <button
          onClick={onResetDemoData}
          className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium flex items-center justify-center gap-2 border border-zinc-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Stamp Data</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full py-2.5 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-400 hover:text-red-300 text-xs font-semibold flex items-center justify-center gap-2 border border-red-900/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out of Google Account</span>
        </button>
      </div>
    </div>
  );
};
