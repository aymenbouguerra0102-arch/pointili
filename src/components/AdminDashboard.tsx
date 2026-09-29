import React, { useState, useEffect, useMemo } from 'react';
import { Restaurant, UserProfile, DailyActivityPoint, WinnerLogItem, StampRequest } from '../types';
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
  Sparkles,
  TrendingUp,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  MapPin,
  RefreshCw,
  Trash2,
  Navigation,
  CheckCircle2,
  Clock,
  Printer,
  Utensils,
  Coffee,
  Filter,
  XCircle,
} from 'lucide-react';
import {
  getRegisteredUsers,
  getRealWinnersLog,
  getRealScanLogs,
  computeRealWeeklyActivity,
  getRealMetricsSummary,
  markWinnerStatus,
  seedRealBBAActivity,
  clearAllRealLogs,
  RealScanLogEvent,
} from '../data/adminMockData';
import { getStampRequests, updateStampRequestStatus } from '../data/stampRequestsManager';
import { AddPartnerModal } from './AddPartnerModal';
import { MerchantQRSheet } from './MerchantQRSheet';
import { LanguageSelector } from '../i18n/LanguageContext';

interface AdminDashboardProps {
  restaurants: Restaurant[];
  onAddRestaurant: (newRestaurant: Restaurant) => void;
  onBackToApp: () => void;
  onLogoutAdmin: () => void;
  onSimulateScan: (restaurantId: string) => {
    success: boolean;
    restaurant?: Restaurant;
    newCount: number;
    rewardUnlocked: boolean;
  };
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  restaurants,
  onAddRestaurant,
  onBackToApp,
  onLogoutAdmin,
  onSimulateScan,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'requests' | 'winners' | 'users'>('overview');
  const [requestsList, setRequestsList] = useState<StampRequest[]>(() => getStampRequests());
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [merchantStandOpen, setMerchantStandOpen] = useState(false);
  const [selectedRestForQR, setSelectedRestForQR] = useState<Restaurant | null>(null);

  // Filters
  const [restaurantCategoryFilter, setRestaurantCategoryFilter] = useState<'all' | 'fast_food' | 'cafes'>('all');
  const [restaurantSearchQuery, setRestaurantSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [winnersFilter, setWinnersFilter] = useState<'all' | 'unlocked' | 'claimed'>('all');

  // Trigger for live data refresh
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Toast alert state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected Day Index for weekly chart (default: index 6 = today)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(6);

  // Dynamic real data fetched directly from local telemetry
  const usersList: UserProfile[] = useMemo(() => getRegisteredUsers(), [refreshTrigger]);
  const winnersList: WinnerLogItem[] = useMemo(() => getRealWinnersLog(), [refreshTrigger]);
  const scanEvents: RealScanLogEvent[] = useMemo(() => getRealScanLogs(), [refreshTrigger]);
  const dailyData: DailyActivityPoint[] = useMemo(() => computeRealWeeklyActivity(), [refreshTrigger]);
  const metrics = useMemo(() => getRealMetricsSummary(restaurants), [restaurants, refreshTrigger]);

  // Scaled max value for dynamic bar chart (never artificial, at least 5 for empty state visual)
  const maxChartValue = useMemo(() => {
    const maxVals = dailyData.map((d) => Math.max(d.scans, d.activeUsers));
    const highest = Math.max(...maxVals, 0);
    return highest > 0 ? Math.ceil(highest * 1.25) : 10;
  }, [dailyData]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleOpenStoreQR = (rest: Restaurant) => {
    setSelectedRestForQR(rest);
    setMerchantStandOpen(true);
  };

  // Perform Live Test Scan from Admin Panel
  const handleTestScan = (rest: Restaurant) => {
    const result = onSimulateScan(rest.id);
    setRefreshTrigger((prev) => prev + 1);

    if (result && result.rewardUnlocked) {
      showToast(`🎉 مبروك! اكتملت 6/6 أختام في ${rest.nameAr || rest.name} وتم فتح المكافأة بنجاح!`);
    } else if (result) {
      showToast(`✓ تم تسجيل ختم حقيقي (#${result.newCount}/6) لـ ${rest.nameAr || rest.name}`);
    }
  };

  // Mark winner voucher status
  const handleToggleWinnerStatus = (winnerId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'claimed' ? 'unlocked' : 'claimed';
    markWinnerStatus(winnerId, nextStatus);
    setRefreshTrigger((prev) => prev + 1);
    showToast(nextStatus === 'claimed' ? '✓ تم تأكيد استلام الجائزة لدى الكاشير' : 'تمت إعادة تعيين الحالة إلى جاهز للاستلام');
  };

  // Seed sample real activity for demonstration
  const handleSeedActivity = () => {
    seedRealBBAActivity(restaurants, usersList);
    setRefreshTrigger((prev) => prev + 1);
    showToast('✓ تم بنجاح توليد حركة نشاط واقعية عبر محلات برج بوعريريج للتحليلات');
  };

  // Clear analytics
  const handleClearActivity = () => {
    if (window.confirm('هل تريد فعلاً تصفير سجلات المسح والجوائز التجريبية؟')) {
      clearAllRealLogs();
      setRefreshTrigger((prev) => prev + 1);
      showToast('تم تصفير سجلات النشاط بنجاح.');
    }
  };

  // Filter restaurants
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      // Category filter
      if (restaurantCategoryFilter === 'fast_food') {
        const isCafe = r.category.toLowerCase().includes('cafe') ||
          r.category.toLowerCase().includes('patisserie') ||
          r.category.toLowerCase().includes('gelato') ||
          r.category.toLowerCase().includes('dessert') ||
          r.category.toLowerCase().includes('biscuit') ||
          r.category.toLowerCase().includes('bakery');
        if (isCafe) return false;
      } else if (restaurantCategoryFilter === 'cafes') {
        const isCafe = r.category.toLowerCase().includes('cafe') ||
          r.category.toLowerCase().includes('patisserie') ||
          r.category.toLowerCase().includes('gelato') ||
          r.category.toLowerCase().includes('dessert') ||
          r.category.toLowerCase().includes('biscuit') ||
          r.category.toLowerCase().includes('bakery');
        if (!isCafe) return false;
      }

      // Search query
      if (restaurantSearchQuery.trim()) {
        const q = restaurantSearchQuery.toLowerCase();
        const matchesName = r.name.toLowerCase().includes(q) || (r.nameAr && r.nameAr.toLowerCase().includes(q));
        const matchesAddress = r.address.toLowerCase().includes(q) || (r.neighborhood && r.neighborhood.toLowerCase().includes(q));
        const matchesCategory = r.category.toLowerCase().includes(q) || (r.categoryAr && r.categoryAr.toLowerCase().includes(q));
        return matchesName || matchesAddress || matchesCategory;
      }

      return true;
    });
  }, [restaurants, restaurantCategoryFilter, restaurantSearchQuery]);

  // Filter winners
  const filteredWinners = useMemo(() => {
    return winnersList.filter((w) => {
      if (winnersFilter === 'all') return true;
      return w.status === winnersFilter;
    });
  }, [winnersList, winnersFilter]);

  return (
    <div className="min-h-screen bg-black text-white font-['Plus_Jakarta_Sans'] select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-zinc-900 border border-[#76FF03] text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#76FF03] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

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
              BBA Operations Control Center · ولاية برج بوعريريج
            </div>
          </div>
        </div>

        {/* Right Admin Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector compact={false} />

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
            <ShieldCheck className="w-4 h-4 text-[#76FF03]" />
            <span className="font-bold text-white">AYMEN BG</span>
            <span className="text-zinc-500">· Super Admin</span>
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
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 rounded-2xl border border-zinc-800/80 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === 'overview'
                  ? 'bg-[#76FF03] text-black shadow-md shadow-[#76FF03]/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Overview · النظرة العامة</span>
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
              <span>BBA Venues & QR ({restaurants.length})</span>
            </button>

            <button
              onClick={() => {
                setRequestsList(getStampRequests());
                setActiveTab('requests');
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === 'requests'
                  ? 'bg-[#76FF03] text-black shadow-md shadow-[#76FF03]/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Live Stamp Requests ({requestsList.filter(r => r.status === 'pending').length} Pending)</span>
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
              <span>Winners Log ({winnersList.length})</span>
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
              <span>Registered Accounts ({usersList.length})</span>
            </button>
          </div>

          {/* Quick Simulation & Utility Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedActivity}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-[#76FF03] border border-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Seed realistic store telemetry for BBA"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#76FF03]" />
              <span className="hidden sm:inline">Simulate BBA Traffic</span>
              <span className="sm:hidden">Traffic</span>
            </button>

            <button
              onClick={handleClearActivity}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 border border-zinc-800 text-xs transition-colors cursor-pointer"
              title="Clear All Test Scans & Winners"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ========================================================
            TAB 1: DASHBOARD OVERVIEW & REAL METRICS
        ======================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top 4 Real KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Metric 1: Total Registered Users */}
              <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-800 text-white flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#76FF03]" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-[#76FF03]" /> Real Gmail
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
                  {metrics.totalRegisteredUsers}
                </div>
                <div className="text-xs font-bold text-zinc-300 mt-1">
                  Total Registered Users
                </div>
                <div className="text-[11px] text-zinc-500 font-sans mt-0.5">
                  إجمالي الحسابات الحقيقية المسجلة
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
                    6/6 Rewards
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-[#76FF03] tracking-tight font-mono">
                  {metrics.totalRewardsClaimed}
                </div>
                <div className="text-xs font-bold text-white mt-1">
                  Total Winners & Rewards Won
                </div>
                <div className="text-[11px] text-zinc-400 font-sans mt-0.5">
                  الجوائز والوجبات الممنوحة عند إكمال 6 أختام
                </div>
              </div>

              {/* Metric 3: Real Daily Scans & Active Users Today */}
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
                  {metrics.todayScansCount} <span className="text-lg text-zinc-500 font-normal">scans</span>
                </div>
                <div className="text-xs font-bold text-zinc-300 mt-1">
                  Scans Today · {metrics.allTimeScansCount} All-Time
                </div>
                <div className="text-[11px] text-zinc-500 font-sans mt-0.5">
                  {metrics.dailyActiveUsersToday} مستخدم نشط اليوم
                </div>
              </div>

              {/* Metric 4: Partner Venues in BBA */}
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
                  {metrics.partnerStoresCount} <span className="text-lg text-zinc-500 font-normal">venues</span>
                </div>
                <div className="text-xs font-bold text-zinc-300 mt-1">
                  BBA Partner Restaurants & Cafes
                </div>
                <div className="text-[11px] text-zinc-500 font-sans mt-0.5">
                  محلات ولاية برج بوعريريج المعتمدة
                </div>
              </div>
            </div>

            {/* REAL 7-DAY ACTIVITY CHART */}
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>Weekly Scan Telemetry & Active Users</span>
                    <span className="text-xs font-normal text-zinc-400">
                      (إحصائيات المسح والمستخدمين على مدار 7 أيام)
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Real data calculated from actual QR scans across Bordj Bou Arreridj stores
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#76FF03]" />
                  <span className="text-zinc-300 font-medium">Scans (المسوحات)</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ml-2" />
                  <span className="text-zinc-300 font-medium">Active Users (المستخدمون)</span>
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-56 pt-8 pb-2 px-2 border-b border-zinc-800">
                {dailyData.map((item, idx) => {
                  const scanHeightPercent = Math.max(
                    item.scans > 0 ? Math.round((item.scans / maxChartValue) * 100) : 4,
                    item.scans > 0 ? 8 : 4
                  );
                  const userHeightPercent = Math.max(
                    item.activeUsers > 0 ? Math.round((item.activeUsers / maxChartValue) * 100) : 4,
                    item.activeUsers > 0 ? 8 : 4
                  );
                  const isSelected = selectedDayIndex === idx;

                  return (
                    <div
                      key={item.day}
                      onClick={() => setSelectedDayIndex(idx)}
                      className={`flex flex-col items-center h-full justify-end group cursor-pointer p-1.5 rounded-2xl transition-all ${
                        isSelected ? 'bg-zinc-800/80 ring-1 ring-[#76FF03]' : 'hover:bg-zinc-850/50'
                      }`}
                    >
                      {/* Number tag */}
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
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-white">
                    Selected Day: {dailyData[selectedDayIndex]?.day} ({dailyData[selectedDayIndex]?.dayAr})
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-300 font-mono">
                    <strong className="text-[#76FF03]">{dailyData[selectedDayIndex]?.scans || 0}</strong> QR Scans
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-300 font-mono">
                    <strong className="text-cyan-400">{dailyData[selectedDayIndex]?.activeUsers || 0}</strong> Active Users
                  </span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-zinc-300 font-mono">
                    <strong className="text-amber-400">{dailyData[selectedDayIndex]?.rewardsUnlocked || 0}</strong> Rewards Won
                  </span>
                </div>

                <div className="text-[11px] text-zinc-500">
                  ولاية برج بوعريريج · تحديثات حية ومباشرة
                </div>
              </div>
            </div>

            {/* Quick Two-Column View: Partner Venues & Recent Winners */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Partner Quick Overview */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-white">
                      Partner Stores & Counter QR Stands
                    </h4>
                    <p className="text-xs text-zinc-400">
                      محلات البرج الشريكة ومولد رموز الـ QR
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('restaurants')}
                    className="text-xs text-[#76FF03] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>View All ({restaurants.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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
                            {r.nameAr || r.name}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate">
                            {r.neighborhood || r.address}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleTestScan(r)}
                          className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1 border border-zinc-700 transition-colors"
                        >
                          <Sparkles className="w-3 h-3 text-[#76FF03]" />
                          <span>Test</span>
                        </button>
                        <button
                          onClick={() => handleOpenStoreQR(r)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#76FF03]/10 hover:bg-[#76FF03]/20 text-[#76FF03] text-xs font-semibold flex items-center gap-1 border border-[#76FF03]/30 transition-colors"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>QR Stand</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Winners Preview */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-white">
                      Recent Winners & Free Meals Claimed
                    </h4>
                    <p className="text-xs text-zinc-400">
                      قائمة الفائزين الذين أكملوا 6 أختام
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('winners')}
                    className="text-xs text-[#76FF03] font-semibold hover:underline"
                  >
                    View All ({winnersList.length})
                  </button>
                </div>

                {winnersList.length === 0 ? (
                  <div className="py-8 text-center bg-zinc-950/40 rounded-2xl border border-zinc-800/60">
                    <Trophy className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <div className="text-xs font-bold text-zinc-300">لا يوجد فائزون بعد</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      قم بمسح 6 أختام لأي محل أو اضغط "Test Scan" لإنشاء رابح جديد فوراً
                    </div>
                  </div>
                ) : (
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
                              {w.userName} <span className="font-normal text-zinc-400">({w.restaurantName})</span>
                            </div>
                            <div className="text-[11px] text-[#76FF03] truncate font-medium">
                              {w.rewardTitle}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-zinc-400 block font-mono">
                            {w.code}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              w.status === 'claimed'
                                ? 'bg-emerald-950/80 text-emerald-400'
                                : 'bg-[#76FF03]/20 text-[#76FF03]'
                            }`}
                          >
                            {w.status === 'claimed' ? 'Claimed' : 'Ready'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: PARTNER VENUES & STORE QR GENERATION
        ======================================================== */}
        {activeTab === 'restaurants' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  BBA Partner Restaurants & Counter QR Generator
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  جميع مطاعم ومقاهي ولاية برج بوعريريج مع مواقعها الدقيقة وروابط Google Maps وتوليد كود الـ QR
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

            {/* Filter and Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRestaurantCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    restaurantCategoryFilter === 'all'
                      ? 'bg-[#76FF03] text-black'
                      : 'bg-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  All ({restaurants.length})
                </button>
                <button
                  onClick={() => setRestaurantCategoryFilter('fast_food')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    restaurantCategoryFilter === 'fast_food'
                      ? 'bg-[#76FF03] text-black'
                      : 'bg-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Fast Food & Pizzas (20)</span>
                </button>
                <button
                  onClick={() => setRestaurantCategoryFilter('cafes')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    restaurantCategoryFilter === 'cafes'
                      ? 'bg-[#76FF03] text-black'
                      : 'bg-zinc-800 text-zinc-300 hover:text-white'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Cafés & Desserts (20)</span>
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={restaurantSearchQuery}
                  onChange={(e) => setRestaurantSearchQuery(e.target.value)}
                  placeholder="بحث عن محل أو حي بالبرج..."
                  className="pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#76FF03] w-full sm:w-64"
                />
              </div>
            </div>

            {/* Grid of Partner Restaurants */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRestaurants.map((rest) => (
                <div
                  key={rest.id}
                  className="rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 overflow-hidden flex flex-col justify-between transition-all group"
                >
                  {/* Photo Banner with Google Maps Overlay */}
                  <div className="relative w-full h-36 bg-zinc-950 overflow-hidden">
                    <img
                      src={rest.imageUrl}
                      alt={rest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-black/80 backdrop-blur-md border border-zinc-700 flex items-center justify-center text-lg">
                        {rest.imageEmoji}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-zinc-700 text-[10px] font-bold text-white">
                        {rest.category}
                      </span>
                    </div>

                    <a
                      href={rest.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-lg transition-transform hover:scale-105"
                      title="Open in Google Maps"
                    >
                      <Navigation className="w-3 h-3 fill-current" />
                      <span>Google Maps</span>
                    </a>

                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-zinc-300">
                      <div className="flex items-center gap-1 font-semibold text-white truncate drop-shadow-md">
                        <MapPin className="w-3.5 h-3.5 text-[#76FF03] shrink-0" />
                        <span className="truncate">{rest.neighborhood || rest.address}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 bg-black/60 px-2 py-0.5 rounded-full shrink-0">
                        {rest.distance}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="text-sm font-bold text-white truncate">
                          {rest.nameAr ? `${rest.nameAr} (${rest.name})` : rest.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-mono text-[#76FF03] shrink-0">
                          6 Stamps
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
                        {rest.descriptionAr || rest.description}
                      </p>

                      {/* Reward Perk Details */}
                      <div className="p-2.5 rounded-xl bg-black/60 border border-zinc-800 mb-3">
                        <div className="text-[10px] text-[#76FF03] font-bold uppercase tracking-wider mb-0.5">
                          الجائزة المجانية عند 6 أختام:
                        </div>
                        <div className="text-xs text-white font-medium line-clamp-1">
                          {rest.rewardTitleAr || rest.rewardTitle}
                        </div>
                      </div>

                      {/* Telemetry info */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 mb-3 pt-2 border-t border-zinc-800/80">
                        <div>
                          <span className="text-zinc-500 block text-[10px]">Stamps in memory</span>
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
                        className="py-2 px-3 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#76FF03]/20 transition-all cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>QR Stand</span>
                      </button>

                      <button
                        onClick={() => handleTestScan(rest)}
                        className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#76FF03]" />
                        <span>Test Scan</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: WINNERS & REWARDS CLAIMED (سجل الفائزين)
        ======================================================== */}
        {activeTab === 'winners' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  Real Winners & Free Rewards Claimed Log
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  سجل الفائزين الحقيقيين بالجوائز عند إكمال 6 أختام (عدد الرابحين: {winnersList.length})
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 text-xs">
                <button
                  onClick={() => setWinnersFilter('all')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    winnersFilter === 'all' ? 'bg-[#76FF03] text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All ({winnersList.length})
                </button>
                <button
                  onClick={() => setWinnersFilter('unlocked')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    winnersFilter === 'unlocked' ? 'bg-[#76FF03] text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Ready to Claim ({winnersList.filter((w) => w.status === 'unlocked').length})
                </button>
                <button
                  onClick={() => setWinnersFilter('claimed')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    winnersFilter === 'claimed' ? 'bg-[#76FF03] text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Claimed at Cashier ({winnersList.filter((w) => w.status === 'claimed').length})
                </button>
              </div>
            </div>

            {/* Table of Winners */}
            <div className="bg-zinc-900/90 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
              {filteredWinners.length === 0 ? (
                <div className="py-12 px-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center mb-3">
                    <Trophy className="w-6 h-6 text-[#76FF03]" />
                  </div>
                  <div className="text-sm font-bold text-white">لا توجد جوائز مسجلة بهذا الفلتر</div>
                  <div className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                    قم بإجراء تجربة مسح "Test Scan" أو قم بمسح الـ QR في تطبيق الزبون حتى 6/6 لتوليد رابح فوري هنا.
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-5">Winner (الزبون)</th>
                        <th className="py-3.5 px-5">Restaurant (المحل)</th>
                        <th className="py-3.5 px-5">Reward Earned (الجائزة المجانية)</th>
                        <th className="py-3.5 px-5">Timestamp (الوقت)</th>
                        <th className="py-3.5 px-5">Voucher Code</th>
                        <th className="py-3.5 px-5">Status & Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {filteredWinners.map((item) => (
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
                            <button
                              onClick={() => handleToggleWinnerStatus(item.id, item.status)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                                item.status === 'claimed'
                                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800 hover:bg-emerald-900/80'
                                  : 'bg-[#76FF03]/20 text-[#76FF03] border border-[#76FF03] hover:bg-[#76FF03] hover:text-black'
                              }`}
                              title="اضغط لتغيير الحالة"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{item.status === 'claimed' ? 'Claimed at Counter' : 'Mark Claimed'}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB: LIVE STAMP REQUESTS QUEUE (مراقبة طلبات الأختام الحية)
        ======================================================== */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>Live Stamp Requests Queue</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-black font-mono font-bold">
                    {requestsList.filter((r) => r.status === 'pending').length} Pending
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  مراقبة طلبات الأختام المرسلة من الزبائن لجميع محلات وكافيهات برج بوعريريج
                </p>
              </div>

              <button
                onClick={() => setRequestsList(getStampRequests())}
                className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 self-start cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#76FF03]" />
                <span>تحديث القائمة</span>
              </button>
            </div>

            <div className="bg-zinc-900/90 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
              {requestsList.length === 0 ? (
                <div className="py-12 px-6 text-center text-zinc-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#76FF03]" />
                  <div className="text-sm font-bold text-white">لا توجد طلبات أختام مسجلة حالياً</div>
                  <div className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                    عندما يمسح أي زبون رمز الـ QR لأي محل في برج بوعريريج، سيظهر طلبه هنا فوراً.
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-5">Venue</th>
                        <th className="py-3.5 px-5">Customer</th>
                        <th className="py-3.5 px-5">Gmail</th>
                        <th className="py-3.5 px-5">Time</th>
                        <th className="py-3.5 px-5">Status</th>
                        <th className="py-3.5 px-5 text-right">Admin Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {requestsList.map((req) => {
                        const isPending = req.status === 'pending';
                        const isAccepted = req.status === 'accepted';
                        const isRejected = req.status === 'rejected';

                        return (
                          <tr key={req.id} className="hover:bg-zinc-850/50 transition-colors">
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{req.restaurantEmoji}</span>
                                <span className="font-bold text-white">{req.restaurantName}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-5 font-bold text-zinc-200">
                              {req.userName}
                            </td>
                            <td className="py-3.5 px-5 font-mono text-[11px] text-zinc-400">
                              {req.userEmail}
                            </td>
                            <td className="py-3.5 px-5 text-zinc-400 font-mono text-[11px]">
                              {req.timestamp}
                            </td>
                            <td className="py-3.5 px-5">
                              {isPending && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40 text-[10px]">
                                  Pending 🕒
                                </span>
                              )}
                              {isAccepted && (
                                <span className="px-2 py-0.5 rounded-full bg-[#76FF03]/20 text-[#76FF03] font-bold border border-[#76FF03]/40 text-[10px]">
                                  Accepted ✓
                                </span>
                              )}
                              {isRejected && (
                                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/40 text-[10px]">
                                  Rejected ✕
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              {isPending ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      updateStampRequestStatus(req.id, 'accepted');
                                      setRequestsList(getStampRequests());
                                      showToast(`تم قبول الختم لـ ${req.userName}`);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-[#76FF03] hover:bg-[#8aff24] text-black font-extrabold text-[11px] cursor-pointer"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => {
                                      updateStampRequestStatus(req.id, 'rejected');
                                      setRequestsList(getStampRequests());
                                      showToast(`تم رفض الختم لـ ${req.userName}`);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 font-bold text-[11px] border border-red-800 cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[11px] text-zinc-500">
                                  {req.resolvedAt ? `Processed at ${req.resolvedAt}` : 'Resolved'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: REGISTERED USERS DIRECTORY (حسابات المستخدمين الحقيقية)
        ======================================================== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  Real Registered Accounts Directory
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  قائمة المستخدمين الحقيقيين المسجلين بحسابات Google / Gmail (الإجمالي: {usersList.length})
                </p>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="بحث بالاسم أو البريد الإلكتروني..."
                  className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#76FF03] w-64"
                />
              </div>
            </div>

            <div className="bg-zinc-900/90 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
              {usersList.length === 0 ? (
                <div className="py-12 px-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-[#76FF03]" />
                  </div>
                  <div className="text-sm font-bold text-white">لا يوجد مستخدمون مسجلون بعد</div>
                  <div className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                    سيظهر هنا المستخدمون الحقيقيون فور تسجيل دخولهم بحسابات Gmail الخاصة بهم عبر شاشة الدخول الرئيسية.
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-950/80 text-zinc-400 border-b border-zinc-800 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-5">User</th>
                        <th className="py-3.5 px-5">Gmail Address</th>
                        <th className="py-3.5 px-5">Loyalty Tier</th>
                        <th className="py-3.5 px-5">Member Since</th>
                        <th className="py-3.5 px-5">Activity Status</th>
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
                                  className="w-8 h-8 rounded-full object-cover ring-1 ring-[#76FF03]"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="font-bold text-white">{u.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-5 text-zinc-300 font-mono text-[11px]">
                              {u.email}
                            </td>
                            <td className="py-3.5 px-5">
                              <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-[#76FF03]">
                                {u.tier || 'Member (عضو)'}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-zinc-400">
                              {u.memberSince || 'سبتمبر 2026'}
                            </td>
                            <td className="py-3.5 px-5">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 text-[10px] font-bold border border-emerald-800/50">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#76FF03]" />
                                Active Account
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
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
          onSimulateCustomerScan={(id) => {
            const rest = restaurants.find((r) => r.id === id);
            if (rest) handleTestScan(rest);
          }}
        />
      )}
    </div>
  );
};
