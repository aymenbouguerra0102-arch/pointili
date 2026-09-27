import React, { useState } from 'react';
import { Restaurant, UserProfile, DailyActivityPoint, WinnerLogItem } from '../types';
import { PointiliLogo } from './PointiliLogo';
import {
  Users,
  Trophy,
  Activity,
  Store,
  Plus,
  QrCode,
  ArrowLeft,
  LogOut,
  Calendar,
  Sparkles,
  TrendingUp,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Printer,
  Gift,
} from 'lucide-react';
import { INITIAL_DAILY_ACTIVITY, INITIAL_WINNERS_LOG, INITIAL_REGISTERED_USERS } from '../data/adminMockData';
import { AddPartnerModal } from './AddPartnerModal';
import { MerchantQRSheet } from './MerchantQRSheet';

interface AdminDashboardProps {
  restaurants: Restaurant[];
  onAddRestaurant: (newRestaurant: Restaurant) => void;
  onBackToApp: () => void;
  onLogoutAdmin: () => void;
  onSimulateScan: (restaurantId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  restaurants,
  onAddRestaurant,
  onBackToApp,
  onLogoutAdmin,
  onSimulateScan,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'winners' | 'users'>('overview');
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [merchantStandOpen, setMerchantStandOpen] = useState(false);
  const [selectedRestForQR, setSelectedRestForQR] = useState<Restaurant | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [dailyData] = useState<DailyActivityPoint[]>(INITIAL_DAILY_ACTIVITY);
  const [winnersList] = useState<WinnerLogItem[]>(INITIAL_WINNERS_LOG);
  const [usersList] = useState<UserProfile[]>(INITIAL_REGISTERED_USERS);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(6); // Default Sunday/Today

  // Compute Total Metrics
  const totalRegisteredUsers = 1428 + usersList.length;
  const totalRewardsClaimed = 384 + restaurants.reduce((sum, r) => sum + (r.totalRewardsClaimed || 0), 0);
  const totalDailyScansToday = dailyData[selectedDayIndex]?.scans || 614;
  const dailyActiveUsersToday = dailyData[selectedDayIndex]?.activeUsers || 412;

  // Max value for chart scaling
  const maxScans = Math.max(...dailyData.map((d) => d.scans), 1000);

  const handleOpenStoreQR = (rest: Restaurant) => {
    setSelectedRestForQR(rest);
    setMerchantStandOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white font-['Plus_Jakarta_Sans'] select-none">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PointiliLogo variant="icon" size="sm" theme="light" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Pacifico',cursive] text-xl text-white">Pointili</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#76FF03] text-black font-extrabold uppercase">
                Admin Panel
              </span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Control Center · لوحة تحكم النظام
            </div>
          </div>
        </div>

        {/* Right Admin Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
            <ShieldCheck className="w-4 h-4 text-[#76FF03]" />
            <span className="font-bold text-white">Super Admin</span>
            <span className="text-zinc-500">· جلسة مشفرة</span>
          </div>

          <button
            onClick={onBackToApp}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#76FF03]" />
            <span className="hidden sm:inline">Back to Customer App</span>
            <span className="sm:hidden">App</span>
          </button>

          <button
            onClick={onLogoutAdmin}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-900/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Sign Out Admin"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800/80 mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-[#76FF03] text-black shadow-md shadow-[#76FF03]/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Dashboard Overview · النظرة العامة</span>
          </button>

          <button
            onClick={() => setActiveTab('restaurants')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'restaurants'
                ? 'bg-[#76FF03] text-black shadow-md shadow-[#76FF03]/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Partner Restaurants & QR Codes ({restaurants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('winners')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'winners'
                ? 'bg-[#76FF03] text-black shadow-md shadow-[#76FF03]/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Winners & Claims ({winnersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-[#76FF03] text-black shadow-md shadow-[#76FF03]/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Registered Users Directory</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: DASHBOARD OVERVIEW & METRICS
        ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top 4 KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1: Total Registered Users */}
              <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-white flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#76FF03]" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +14.2%
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
                  {totalRegisteredUsers.toLocaleString()}
                </div>
                <div className="text-xs font-bold text-zinc-300 mt-1">
                  Total Registered Users
                </div>
                <div className="text-[11px] text-zinc-500 font-sans mt-0.5">
                  عدد المستخدمين الإجمالي في النظام
                </div>
              </div>

              {/* Metric 2: Total Winners / Rewards Claimed */}
              <div className="p-5 rounded-3xl bg-zinc-900/90 border-2 border-[#76FF03] shadow-lg shadow-[#76FF03]/10 relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#76FF03]/20 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#76FF03] text-black flex items-center justify-center font-bold">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-black bg-[#76FF03] px-2 py-0.5 rounded-full uppercase">
                    Unlocked
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-[#76FF03] tracking-tight font-mono">
                  {totalRewardsClaimed.toLocaleString()}
                </div>
                <div className="text-xs font-bold text-white mt-1">
                  Total Winners & Rewards Claimed
                </div>
                <div className="text-[11px] text-zinc-400 font-sans mt-0.5">
                  عدد الرابحين وجوائز الوجبات والمشروبات
                </div>
              </div>

              {/* Metric 3: Daily Active Users & Scans */}
              <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-white flex items-center justify-center">
                    <Activity className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded-full border border-cyan-800/50">
                    Live Today
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
                  {totalDailyScansToday} <span className="text-lg text-zinc-500 font-normal">scans</span>
                </div>
                <div className="text-xs font-bold text-zinc-300 mt-1">
                  Daily Scans & Active Users
                </div>
                <div className="text-[11px] text-zinc-500 font-sans mt-0.5">
                  {dailyActiveUsersToday} مستخدم نشط اليوم · النشاط اليومي
                </div>
              </div>

              {/* Metric 4: Partner Restaurants */}
              <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-white flex items-center justify-center">
                    <Store className="w-5 h-5 text-amber-400" />
                  </div>
                  <button
                    onClick={() => setIsAddPartnerOpen(true)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
                    title="Add Partner"
                  >
                    <Plus className="w-4 h-4 text-[#76FF03]" />
                  </button>
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
                  {restaurants.length} <span className="text-lg text-zinc-500 font-normal">places</span>
                </div>
                <div className="text-xs font-bold text-zinc-300 mt-1">
                  Partner Restaurants & Cafes
                </div>
                <div className="text-[11px] text-zinc-500 font-sans mt-0.5">
                  المطاعم والمقاهي الشريكة الفعالة
                </div>
              </div>
            </div>

            {/* DAILY ACTIVE USERS & SCANS VISUAL CHART */}
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>Daily Active Users & Scans Chart</span>
                    <span className="text-xs font-normal text-zinc-400">
                      (مخطط عدد المستخدمين والنشاط اليومي)
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Live telemetry across all store QR touchpoints over the past 7 days
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#76FF03]" />
                  <span className="text-xs text-zinc-300 font-medium">Scans</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ml-2" />
                  <span className="text-xs text-zinc-300 font-medium">Active Users</span>
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pt-8 pb-2 px-2 border-b border-zinc-800">
                {dailyData.map((item, idx) => {
                  const scanHeightPercent = Math.round((item.scans / maxScans) * 100);
                  const userHeightPercent = Math.round((item.activeUsers / maxScans) * 100);
                  const isSelected = selectedDayIndex === idx;

                  return (
                    <div
                      key={item.day}
                      onClick={() => setSelectedDayIndex(idx)}
                      className={`flex flex-col items-center h-full justify-end group cursor-pointer p-1.5 rounded-2xl transition-all ${
                        isSelected ? 'bg-zinc-800/80 ring-1 ring-[#76FF03]' : 'hover:bg-zinc-850/50'
                      }`}
                    >
                      {/* Floating tooltip on hover / select */}
                      <div className="text-[10px] font-mono text-[#76FF03] font-bold mb-1">
                        {item.scans}
                      </div>

                      {/* Bar columns */}
                      <div className="w-full flex items-end justify-center gap-1 h-36">
                        {/* QR Scans Bar */}
                        <div
                          style={{ height: `${scanHeightPercent}%` }}
                          className={`w-3 sm:w-5 rounded-t-lg transition-all ${
                            isSelected
                              ? 'bg-[#76FF03] shadow-lg shadow-[#76FF03]/40'
                              : 'bg-[#76FF03]/80 group-hover:bg-[#76FF03]'
                          }`}
                        />
                        {/* Active Users Bar */}
                        <div
                          style={{ height: `${userHeightPercent}%` }}
                          className={`w-3 sm:w-5 rounded-t-lg transition-all ${
                            isSelected
                              ? 'bg-cyan-400'
                              : 'bg-cyan-500/70 group-hover:bg-cyan-400'
                          }`}
                        />
                      </div>

                      {/* Day Label */}
                      <div className="mt-2 text-center">
                        <span className={`text-xs font-bold block ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                          {item.day}
                        </span>
                        <span className="text-[10px] text-zinc-500 hidden sm:block">
                          {item.dayAr.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Day Deep Dive Breakdown */}
              <div className="mt-4 pt-2 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white">
                    Selected: {dailyData[selectedDayIndex]?.day} ({dailyData[selectedDayIndex]?.dayAr})
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-300 font-mono">
                    <strong className="text-[#76FF03]">{dailyData[selectedDayIndex]?.scans}</strong> QR Scans
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-300 font-mono">
                    <strong className="text-cyan-400">{dailyData[selectedDayIndex]?.activeUsers}</strong> Unique Users
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-300 font-mono">
                    <strong className="text-amber-400">{dailyData[selectedDayIndex]?.rewardsUnlocked}</strong> 6/6 Free Rewards
                  </span>
                </div>

                <div className="text-[11px] text-zinc-500">
                  Peak scan rush hour: 12:30 PM - 2:00 PM & 6:30 PM - 9:00 PM
                </div>
              </div>
            </div>

            {/* Quick Two-Column View: Partner Stores & Recent Winners */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Partner Quick Overview */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-white">
                      Partner Stores & Counter QR Stands
                    </h4>
                    <p className="text-xs text-zinc-400">
                      المطاعم وتوليد رموز QR الخاصة بها
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddPartnerOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#76FF03] text-black font-bold text-xs flex items-center gap-1.5 hover:bg-[#8aff24] transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Partner</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {restaurants.slice(0, 4).map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl">{r.imageEmoji}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">
                            {r.name}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {r.category} · {r.totalRewardsClaimed || 0} rewards unlocked
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenStoreQR(r)}
                          className="px-2.5 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-[#76FF03] text-xs font-semibold flex items-center gap-1 border border-zinc-700/60 transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR Stand</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setActiveTab('restaurants')}
                  className="w-full mt-3 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-1"
                >
                  <span>View All {restaurants.length} Partner Establishments</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Recent Winners Preview */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-white">
                      Recent Winners (Free Meals Claimed)
                    </h4>
                    <p className="text-xs text-zinc-400">
                      قائمة أحدث الرابحين وجوائزهم المجانية
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('winners')}
                    className="text-xs text-[#76FF03] font-semibold hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-2.5">
                  {winnersList.slice(0, 4).map((w) => (
                    <div
                      key={w.id}
                      className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={w.userAvatar}
                          alt={w.userName}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-[#76FF03]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate">
                            {w.userName} <span className="font-normal text-zinc-400">at {w.restaurantName}</span>
                          </div>
                          <div className="text-[11px] text-[#76FF03] truncate font-medium">
                            {w.rewardTitle}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-zinc-500 block">
                          {w.timestamp}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded">
                          {w.code}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: PARTNER RESTAURANTS & QR CODE GENERATION
        ======================================================== */}
        {activeTab === 'restaurants' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  Partner Restaurants & Store QR Generator
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  إدارة المطاعم الشريكة، توليد رموز QR للمحلات، وتخصيص جوائز الولاء (6 نقاط = وجبة/مشروب مجاني)
                </p>
              </div>

              <button
                onClick={() => setIsAddPartnerOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] active:scale-[0.98] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#76FF03]/25 transition-all cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Partner Restaurant</span>
              </button>
            </div>

            {/* Grid of All Partner Restaurants */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurants.map((rest) => (
                <div
                  key={rest.id}
                  className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 flex flex-col justify-between transition-all"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl shrink-0">
                          {rest.imageEmoji}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white truncate font-['Plus_Jakarta_Sans']">
                            {rest.name}
                          </h4>
                          <span className="text-[11px] text-zinc-400">{rest.category}</span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-mono text-[#76FF03]">
                        6 Stamps Max
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
                      {rest.description}
                    </p>

                    {/* Reward Perk Details */}
                    <div className="p-3 rounded-2xl bg-black/60 border border-zinc-800 mb-4">
                      <div className="text-[10px] text-[#76FF03] font-bold uppercase tracking-wider mb-0.5">
                        Free Reward at 6 Stamps:
                      </div>
                      <div className="text-xs text-white font-medium line-clamp-1">
                        {rest.rewardTitle}
                      </div>
                    </div>

                    {/* Store Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 mb-4 pt-2 border-t border-zinc-800/80">
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Current Active Stamps</span>
                        <span className="font-mono text-white font-bold">{rest.stampsCount} / 6</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block text-[10px]">Total Free Rewards</span>
                        <span className="font-mono text-[#76FF03] font-bold">{rest.totalRewardsClaimed || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Generate QR Stand & Test Scan */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800/80">
                    <button
                      onClick={() => handleOpenStoreQR(rest)}
                      className="py-2.5 px-3 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#76FF03]/20 transition-all cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Generate QR</span>
                    </button>

                    <button
                      onClick={() => onSimulateScan(rest.id)}
                      className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#76FF03]" />
                      <span>Test Scan</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: WINNERS & REWARDS CLAIMED (عدد الرابحين)
        ======================================================== */}
        {activeTab === 'winners' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  Total Winners & Rewards Claimed Log
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  سجل الفائزين بالجوائز المجانية عند إكمال 6 أختام (عدد الرابحين: {totalRewardsClaimed})
                </p>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#76FF03]/10 border border-[#76FF03] text-[#76FF03] text-xs font-bold">
                <Trophy className="w-4 h-4" />
                <span>{totalRewardsClaimed} Free Rewards Distributed</span>
              </div>
            </div>

            {/* Table of Winners */}
            <div className="bg-zinc-900/90 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-5">Winner (المستخدم)</th>
                      <th className="py-3.5 px-5">Restaurant (المحل)</th>
                      <th className="py-3.5 px-5">Reward Earned (الجائزة)</th>
                      <th className="py-3.5 px-5">Timestamp (التوقيت)</th>
                      <th className="py-3.5 px-5">Voucher Code</th>
                      <th className="py-3.5 px-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {winnersList.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-850/50 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.userAvatar}
                              alt={item.userName}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-700"
                              referrerPolicy="no-referrer"
                            />
                            <span className="font-bold text-white">{item.userName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-1.5 font-medium text-zinc-300">
                            <span>{item.restaurantEmoji}</span>
                            <span>{item.restaurantName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="text-white font-semibold">
                            {item.rewardTitle}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-zinc-400 font-mono text-[11px]">
                          {item.timestamp}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-[11px] text-[#76FF03]">
                          {item.code}
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              item.status === 'claimed'
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                                : 'bg-[#76FF03]/20 text-[#76FF03] border border-[#76FF03]'
                            }`}
                          >
                            {item.status === 'claimed' ? 'Claimed at Counter' : 'Ready to Claim'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: REGISTERED USERS DIRECTORY (عدد المستخدمين الإجمالي)
        ======================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  Registered Users Directory
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  قائمة المستخدمين المسجلين في التطبيق (الإجمالي: {totalRegisteredUsers})
                </p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter users by name or email..."
                  className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#76FF03] w-64"
                />
              </div>
            </div>

            <div className="bg-zinc-900/90 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-5">User</th>
                      <th className="py-3.5 px-5">Email Address</th>
                      <th className="py-3.5 px-5">Loyalty Tier</th>
                      <th className="py-3.5 px-5">Member Since</th>
                      <th className="py-3.5 px-5">Total Stamps</th>
                      <th className="py-3.5 px-5">Free Meals Won</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {usersList
                      .filter(
                        (u) =>
                          u.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchFilter.toLowerCase())
                      )
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-zinc-850/50 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={u.avatarUrl}
                                alt={u.name}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-700"
                                referrerPolicy="no-referrer"
                              />
                              <span className="font-bold text-white">{u.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-zinc-400 font-mono text-[11px]">
                            {u.email}
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-[#76FF03]">
                              {u.tier}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-zinc-400">
                            {u.memberSince}
                          </td>
                          <td className="py-3.5 px-5 font-mono text-[#76FF03] font-bold">
                            {u.stampsCount || 18} stamps
                          </td>
                          <td className="py-3.5 px-5 font-mono text-white font-bold">
                            {u.rewardsWon || 2} free rewards
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Partner Modal */}
      <AddPartnerModal
        isOpen={isAddPartnerOpen}
        onClose={() => setIsAddPartnerOpen(false)}
        onAddRestaurant={onAddRestaurant}
      />

      {/* Countertop QR Poster Stand Modal */}
      {selectedRestForQR && (
        <MerchantQRSheet
          restaurants={[selectedRestForQR]}
          isOpen={merchantStandOpen}
          onClose={() => {
            setMerchantStandOpen(false);
            setSelectedRestForQR(null);
          }}
          onSimulateCustomerScan={(id) => onSimulateScan(id)}
        />
      )}
    </div>
  );
};
