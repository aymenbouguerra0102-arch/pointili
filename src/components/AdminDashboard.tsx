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
  Bell,
  Send,
  Volume2,
  Smartphone,
  ShieldAlert,
  Lock,
  FileCode,
  Bug,
} from 'lucide-react';
import {
  getHttpsSecurityStatus,
  getInsecureConnectionLogs,
  validateAndEnforceSecureUrl,
  HttpsSecurityStatus,
  InsecureConnectionLog,
} from '../services/httpsSecurityService';
import {
  getCspPolicyDetails,
  getXssAttackLogs,
  detectXssAttack,
  recordXssAttackAttempt,
  CspPolicyDetails,
  XssAttackLog,
} from '../services/xssSecurityService';
import {
  CURRENT_APP_VERSION,
  LAST_RELEASE_DATE,
  broadcastAppRenewalUpdate,
  getStoredNotifications,
  playAppUpdateChime,
} from '../services/appUpdateService';
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
import {
  getStampRequests,
  updateStampRequestStatus,
  resolveStampRequestAppeal,
} from '../data/stampRequestsManager';
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
  onApproveStampToUser?: (userId: string, restaurantId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  restaurants,
  onAddRestaurant,
  onBackToApp,
  onLogoutAdmin,
  onSimulateScan,
  onApproveStampToUser,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'requests' | 'winners' | 'users' | 'updates' | 'scans'>('overview');
  const [requestsList, setRequestsList] = useState<StampRequest[]>(() => getStampRequests());
  const [requestsFilter, setRequestsFilter] = useState<'all' | 'pending' | 'appealed' | 'accepted' | 'rejected'>('all');
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [merchantStandOpen, setMerchantStandOpen] = useState(false);
  const [selectedRestForQR, setSelectedRestForQR] = useState<Restaurant | null>(null);

  // Anti-Fraud Scans Filter State
  const [scansFilter, setScansFilter] = useState<'all' | 'accepted' | 'rate_limited'>('all');
  const [scansSearchQuery, setScansSearchQuery] = useState('');

  // HTTPS Strict Protocol Enforcement State
  const [httpsSecurity, setHttpsSecurity] = useState<HttpsSecurityStatus>(() => getHttpsSecurityStatus());
  const [securityLogs, setSecurityLogs] = useState<InsecureConnectionLog[]>(() => getInsecureConnectionLogs());
  const [testUrlInput, setTestUrlInput] = useState('');
  const [testResult, setTestResult] = useState<{
    isAllowed: boolean;
    secureUrl: string;
    wasUpgraded: boolean;
    errorMessage?: string;
  } | null>(null);

  useEffect(() => {
    const handleSecUpdate = () => {
      setHttpsSecurity(getHttpsSecurityStatus());
      setSecurityLogs(getInsecureConnectionLogs());
    };
    window.addEventListener('pointili_security_log_updated', handleSecUpdate);
    return () => window.removeEventListener('pointili_security_log_updated', handleSecUpdate);
  }, []);

  // Content Security Policy (CSP) & XSS Protection State
  const [cspDetails, setCspDetails] = useState<CspPolicyDetails>(() => getCspPolicyDetails());
  const [xssLogs, setXssLogs] = useState<XssAttackLog[]>(() => getXssAttackLogs());
  const [testXssInput, setTestXssInput] = useState('');
  const [testXssResult, setTestXssResult] = useState<{
    isMalicious: boolean;
    detectedPattern?: string;
    reason?: string;
  } | null>(null);

  useEffect(() => {
    const handleXssUpdate = () => {
      setCspDetails(getCspPolicyDetails());
      setXssLogs(getXssAttackLogs());
    };
    window.addEventListener('pointili_xss_blocked', handleXssUpdate);
    return () => window.removeEventListener('pointili_xss_blocked', handleXssUpdate);
  }, []);

  // App Renewal Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState('🎉 تم تجديد تطبيق Pointili بإصدار جديد!');
  const [broadcastBody, setBroadcastBody] = useState('تم تجديد التطبيق بالكامل بميزات أمان متقدمة، شريط إعلانات تفاعلي، ومسح مباشر لأكواد طاولات الكاشير.');
  const [broadcastVersion, setBroadcastVersion] = useState(CURRENT_APP_VERSION);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

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

  // Live real-time scan event listener
  useEffect(() => {
    const handleScanLogged = () => {
      setRefreshTrigger((prev) => prev + 1);
    };
    window.addEventListener('pointili_scan_logged', handleScanLogged);
    return () => window.removeEventListener('pointili_scan_logged', handleScanLogged);
  }, []);

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

            <button
              onClick={() => setActiveTab('updates')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === 'updates'
                  ? 'bg-[#76FF03] text-black shadow-md shadow-[#76FF03]/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4 text-[#76FF03]" />
              <span>إشعار التجديد (Broadcast)</span>
            </button>

            <button
              onClick={() => setActiveTab('scans')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === 'scans'
                  ? 'bg-[#76FF03] text-black shadow-md shadow-[#76FF03]/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Anti-Fraud & سجل المسح ({scanEvents.length})</span>
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

            {/* Quick App Renewal Broadcast Banner */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-[#76FF03]/40 shadow-xl flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#76FF03]/15 border border-[#76FF03]/40 flex items-center justify-center text-[#76FF03] shrink-0">
                  <Bell className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-extrabold text-white">
                      إرسال إشعار تجديد التطبيق لجميع من قام بالتحميل (Broadcast Renewal)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#76FF03] text-black text-[10px] font-black font-mono">
                      {CURRENT_APP_VERSION}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    إرسال تنبيه فوري ونغمة كريستالية لجميع من قام بتحميل وتثبيت التطبيق لإعلامهم بالتجديد الجديد
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    broadcastAppRenewalUpdate({
                      titleAr: '🎉 تم تجديد تطبيق Pointili بإصدار جديد!',
                      bodyAr: 'تم تحديث ميزات الأمان والخصوصية وشريط الإعلانات التفاعلي لجميع المحمّلين.',
                      version: CURRENT_APP_VERSION,
                    });
                    showToast('✓ تم إرسال إشعار التجديد لجميع من قام بتحميل التطبيق بنجاح! 🔔');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] active:scale-98 text-black text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-[#76FF03]/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال إشعار التجديد الفوري للجميع 📢</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('updates')}
                  className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-zinc-200 hover:text-white transition-colors cursor-pointer"
                >
                  لوحة التحكم بالإشعارات ←
                </button>
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
                  {requestsList.some((r) => r.status === 'appealed') && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500 text-white font-mono font-bold animate-pulse">
                      {requestsList.filter((r) => r.status === 'appealed').length} طعون مستعجلة ⚖️
                    </span>
                  )}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  مراقبة طلبات الأختام المرسلة من الزبائن والفصل النهائي في طعون الرفض (إشراف AYMEN BG)
                </p>
              </div>

              <div className="flex items-center gap-2 self-start">
                <button
                  onClick={() => setRequestsList(getStampRequests())}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#76FF03]" />
                  <span>تحديث القائمة</span>
                </button>
              </div>
            </div>

            {/* Filter Pills for Requests */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setRequestsFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  requestsFilter === 'all'
                    ? 'bg-white text-black shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                الكل ({requestsList.length})
              </button>
              <button
                onClick={() => setRequestsFilter('appealed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  requestsFilter === 'appealed'
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-zinc-900 text-purple-300 hover:bg-zinc-800'
                }`}
              >
                طعون الزبائن المستعجلة ⚖️ ({requestsList.filter((r) => r.status === 'appealed').length})
              </button>
              <button
                onClick={() => setRequestsFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  requestsFilter === 'pending'
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                قيد الانتظار ({requestsList.filter((r) => r.status === 'pending').length})
              </button>
              <button
                onClick={() => setRequestsFilter('accepted')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  requestsFilter === 'accepted'
                    ? 'bg-[#76FF03] text-black shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                المقبولة ({requestsList.filter((r) => r.status === 'accepted' || r.status === 'appeal_approved').length})
              </button>
              <button
                onClick={() => setRequestsFilter('rejected')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  requestsFilter === 'rejected'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                المرفوضة ({requestsList.filter((r) => r.status === 'rejected' || r.status === 'appeal_rejected').length})
              </button>
            </div>

            <div className="bg-zinc-900/90 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
              {requestsList.filter((r) => requestsFilter === 'all' || (requestsFilter === 'accepted' ? (r.status === 'accepted' || r.status === 'appeal_approved') : requestsFilter === 'rejected' ? (r.status === 'rejected' || r.status === 'appeal_rejected') : r.status === requestsFilter)).length === 0 ? (
                <div className="py-12 px-6 text-center text-zinc-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#76FF03]" />
                  <div className="text-sm font-bold text-white">لا توجد طلبات أختام مطابقة لهذا الفلتر</div>
                  <div className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                    عندما يمسح أي زبون رمز الـ QR أو يقدم طعناً لرئيس الإدارة، سيظهر طلبه هنا فوراً.
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
                        <th className="py-3.5 px-5 text-right">Admin Action (AYMEN BG)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {requestsList
                        .filter((r) => requestsFilter === 'all' || (requestsFilter === 'accepted' ? (r.status === 'accepted' || r.status === 'appeal_approved') : requestsFilter === 'rejected' ? (r.status === 'rejected' || r.status === 'appeal_rejected') : r.status === requestsFilter))
                        .map((req) => {
                        const isPending = req.status === 'pending';
                        const isAppealed = req.status === 'appealed';
                        const isAccepted = req.status === 'accepted';
                        const isAppealApproved = req.status === 'appeal_approved';
                        const isRejected = req.status === 'rejected';
                        const isAppealRejected = req.status === 'appeal_rejected';

                        return (
                          <tr key={req.id} className={`hover:bg-zinc-850/50 transition-colors ${isAppealed ? 'bg-purple-950/20' : ''}`}>
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{req.restaurantEmoji}</span>
                                <span className="font-bold text-white">{req.restaurantName}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="font-bold text-zinc-200">{req.userName}</div>
                              {isAppealed && req.appealNote && (
                                <div className="text-[10px] text-purple-300 mt-0.5 italic max-w-xs truncate" title={req.appealNote}>
                                  طعن: "{req.appealNote}"
                                </div>
                              )}
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
                              {isAppealed && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 font-bold border border-purple-500/60 text-[10px] animate-pulse">
                                  طعن لدى AYMEN BG ⚖️
                                </span>
                              )}
                              {isAccepted && (
                                <span className="px-2 py-0.5 rounded-full bg-[#76FF03]/20 text-[#76FF03] font-bold border border-[#76FF03]/40 text-[10px]">
                                  Accepted ✓
                                </span>
                              )}
                              {isAppealApproved && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 text-[10px]">
                                  قبل الطعن (AYMEN BG) ✓
                                </span>
                              )}
                              {isRejected && (
                                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/40 text-[10px]">
                                  Rejected ✕
                                </span>
                              )}
                              {isAppealRejected && (
                                <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-300 font-bold border border-red-800 text-[10px]">
                                  رفض نهائي ✕
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              {isAppealed ? (
                                <div className="flex flex-col items-end gap-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        resolveStampRequestAppeal(req.id, 'approved', 'تم قبول الطعن من قِبل رئيس الإدارة AYMEN BG.');
                                        if (onApproveStampToUser) {
                                          onApproveStampToUser(req.userId, req.restaurantId);
                                        } else {
                                          onSimulateScan(req.restaurantId);
                                        }
                                        setRequestsList(getStampRequests());
                                        showToast(`🏛️ وافق AYMEN BG على طعن ${req.userName} واحتسب الختم`);
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-[#76FF03] hover:bg-[#8aff24] text-black font-black text-[11px] cursor-pointer shadow-sm"
                                    >
                                      قبول الطعن (+1)
                                    </button>
                                    <button
                                      onClick={() => {
                                        resolveStampRequestAppeal(req.id, 'rejected', 'تم تثبيت قرار الرفض بعد المراجعة.');
                                        setRequestsList(getStampRequests());
                                        showToast(`تم تثبيت الرفض النهائي لطعن ${req.userName}`);
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 font-bold text-[11px] border border-red-800 cursor-pointer"
                                    >
                                      تثبيت الرفض
                                    </button>
                                  </div>
                                </div>
                              ) : isPending ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      updateStampRequestStatus(req.id, 'accepted');
                                      if (onApproveStampToUser) {
                                        onApproveStampToUser(req.userId, req.restaurantId);
                                      } else {
                                        onSimulateScan(req.restaurantId);
                                      }
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

        {/* App Renewal & Push Notifications Broadcast Tab */}
        {activeTab === 'updates' && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#76FF03]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-[#76FF03]/15 border border-[#76FF03] flex items-center justify-center text-[#76FF03] shadow-lg shadow-[#76FF03]/10">
                    <Bell className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-white">
                        مركز إرسال إشعارات التجديد لجميع المحمّلين
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#76FF03] text-black text-xs font-black font-mono">
                        BROADCAST PUSH
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      إرسال إشعار فوري صوتي ونظامي مع نغمة كريستالية واهتزاز لجميع من قام بتحميل وتثبيت التطبيق على هواتفهم
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-[11px] text-zinc-500 font-mono">حالة الخدمة</div>
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>متصل بالشبكة (100% Active)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-xs text-zinc-400">إجمالي مستخدمي ومحمّلي التطبيق</div>
                <div className="text-2xl font-black text-white font-mono mt-1">
                  {usersList.length} <span className="text-sm text-[#76FF03]">محمّل نشط</span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  يتلقون الإشعار فورياً في شريط التنبيهات
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-xs text-zinc-400">الإصدار الجاري بثه</div>
                <div className="text-2xl font-black text-[#76FF03] font-mono mt-1">
                  {broadcastVersion}
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  تاريخ الإطلاق: {LAST_RELEASE_DATE}
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-xs text-zinc-400">وسائل التنبيه المدعومة</div>
                <div className="text-sm font-bold text-white mt-2 flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-[11px] text-zinc-300">نغمة صوتية Web Audio</span>
                  <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-[11px] text-zinc-300">Push Notification</span>
                  <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-[11px] text-zinc-300">اهتزاز الهاتف</span>
                </div>
              </div>
            </div>

            {/* Broadcast Form Card */}
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-5">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-[#76FF03]" />
                <span>صياغة وبث إشعار التجديد لكافة المستخدمين:</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    رقم الإصدار (Version):
                  </label>
                  <input
                    type="text"
                    value={broadcastVersion}
                    onChange={(e) => setBroadcastVersion(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-xs focus:border-[#76FF03] outline-none"
                    placeholder="v2.5.0"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    عنوان إشعار التجديد:
                  </label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-bold focus:border-[#76FF03] outline-none"
                    placeholder="عنوان الإشعار..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  نص رسالة التجديد (يظهر على شاشة القفل وشريط التنبيهات):
                </label>
                <textarea
                  rows={3}
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs leading-relaxed focus:border-[#76FF03] outline-none resize-none"
                  placeholder="نص رسالة التجديد..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    broadcastAppRenewalUpdate({
                      titleAr: broadcastTitle,
                      bodyAr: broadcastBody,
                      version: broadcastVersion,
                    });
                    setBroadcastSuccess(true);
                    showToast('✓ تم بنجاح إرسال إشعار التجديد لجميع من قام بتحميل التطبيق!');
                    setTimeout(() => setBroadcastSuccess(false), 4000);
                  }}
                  className="px-6 py-3 rounded-2xl bg-[#76FF03] hover:bg-[#8aff24] active:scale-98 text-black text-xs font-black flex items-center gap-2 shadow-lg shadow-[#76FF03]/25 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال إشعار التجديد لجميع المحمّلين الآن 📢</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playAppUpdateChime();
                    showToast('🔔 تم تشغيل نغمة الكريستال وهز الجهاز للتجربة!');
                  }}
                  className="px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-[#76FF03]" />
                  <span>تجربة نغمة الإشعار على جهازي</span>
                </button>

                {broadcastSuccess && (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم البث بنجاح إلى جميع النوافذ والأجهزة!</span>
                  </span>
                )}
              </div>
            </div>

            {/* Broadcast History Log */}
            <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#76FF03]" />
                  <span>سجل الإشعارات المرسلة مؤخراً للمحمّلين:</span>
                </h3>
                <span className="text-xs text-zinc-500 font-mono">
                  {getStoredNotifications().length} إشعارات مسجلة
                </span>
              </div>

              <div className="space-y-3">
                {getStoredNotifications().slice(0, 5).map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white">{notif.titleAr || notif.title}</span>
                        {notif.version && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-[#76FF03] font-mono">
                            {notif.version}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 text-[10px] font-bold border border-emerald-800/40">
                          تم التسليم للمحمّلين
                        </span>
                      </div>
                      <p className="text-zinc-400 text-[11px] mt-1 pr-1">
                        {notif.bodyAr || notif.body}
                      </p>
                    </div>

                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                      {new Date(notif.timestamp).toLocaleTimeString('ar-DZ', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Anti-Fraud & Scan Logs Tab */}
        {activeTab === 'scans' && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl backdrop-blur-md relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#76FF03]/10 border border-[#76FF03]/30 flex items-center justify-center text-[#76FF03] shadow-md">
                    <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <span>سجل عمليات المسح ونظام الحماية من التكرار (Anti-Fraud)</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#76FF03] text-black font-black">
                        نشط ومفعّل 🛡️
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                      توثيق دقيق لكل عملية مسح مع توقيتها ومعرف الجهاز (Device ID) وحساب الجيميل، مع تفعيل مهلة الساعة الكاملة (60 دقيقة) لحماية نقاط الزبائن ومنع الاحتيال والتكرار لكل مطعم على حدة.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setRefreshTrigger((prev) => prev + 1)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-xs font-bold text-zinc-200 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#76FF03]" />
                    <span>تحديث السجل</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics 4-Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center justify-between text-zinc-400 mb-1">
                  <span className="text-xs font-medium">إجمالي عمليات المسح</span>
                  <QrCode className="w-4 h-4 text-[#76FF03]" />
                </div>
                <div className="text-2xl font-black text-white font-mono">{scanEvents.length}</div>
                <div className="text-[10px] text-zinc-500 mt-1">المسجلة في قاعدة البيانات</div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center justify-between text-zinc-400 mb-1">
                  <span className="text-xs font-medium">المسح المعتمد الناجح</span>
                  <CheckCircle2 className="w-4 h-4 text-[#76FF03]" />
                </div>
                <div className="text-2xl font-black text-[#76FF03] font-mono">
                  {scanEvents.filter((s) => s.status !== 'rate_limited').length}
                </div>
                <div className="text-[10px] text-zinc-500 mt-1">أختام مضافة للبطاقات</div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center justify-between text-zinc-400 mb-1">
                  <span className="text-xs font-medium">محاولات تم صدها (&lt; ساعة واحدة)</span>
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  {scanEvents.filter((s) => s.status === 'rate_limited').length}
                </div>
                <div className="text-[10px] text-zinc-500 mt-1">حماية التكرار قبل مرور 60 دقيقة</div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center justify-between text-zinc-400 mb-1">
                  <span className="text-xs font-medium">الأجهزة الفريدة (Device IDs)</span>
                  <Smartphone className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-blue-400 font-mono">
                  {new Set(scanEvents.map((s) => s.deviceId).filter(Boolean)).size}
                </div>
                <div className="text-[10px] text-zinc-500 mt-1">أجهزة هواتف مسجلة</div>
              </div>
            </div>

            {/* HTTPS Strict Protocol Enforcement & SSL Shield */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
                    <Lock className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-white">
                        درع الحماية المشفر · فرض بروتوكول HTTPS حصراً
                      </h4>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>مفروض إجبارياً 🔒</span>
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      يتم منع أي اتصال غير مشفر (HTTP) تلقائياً، وفرض التشفير التام (TLS 1.3 / SSL 256-bit) لحماية بيانات المشتركين والمطاعم.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-zinc-800/90 border border-zinc-700 text-emerald-300 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>HSTS: Active (31536000s)</span>
                  </span>
                </div>
              </div>

              {/* Security Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
                <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
                  <div className="text-[11px] text-zinc-400 mb-1">بروتوكول الاتصال المفروض</div>
                  <div className="text-sm font-black text-emerald-400 font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>HTTPS حصراً (مشفّر)</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">تشفير كامل TLS 1.3 / SSL</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
                  <div className="text-[11px] text-zinc-400 mb-1">سياسة منع الاتصال غير المعتمد (HTTP)</div>
                  <div className="text-sm font-black text-[#76FF03] font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>100% حظر / ترقية تلقائية</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">رفض أي اتصال غير آمن</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
                  <div className="text-[11px] text-zinc-400 mb-1">محاولات HTTP التي تم رصدها</div>
                  <div className="text-sm font-black text-white font-mono flex items-center gap-1.5">
                    <span>{securityLogs.length} محاولات</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">مسجلة في سجل الأمان</div>
                </div>
              </div>

              {/* Interactive Security Testing Sandbox */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                <div className="text-xs font-bold text-zinc-200 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#76FF03]" />
                  <span>فحص مباشر لفاعلية جدار الحماية (HTTPS Enforcer Test)</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={testUrlInput}
                    onChange={(e) => setTestUrlInput(e.target.value)}
                    placeholder="جرّب رابطاً (مثال: http://rogue-link.com أو http://pointili.app/scan)"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#76FF03]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = testUrlInput.trim() || 'http://unsecure-external-server.com/api/test';
                      const res = validateAndEnforceSecureUrl(input, 'admin_live_test');
                      setTestResult(res);
                      setHttpsSecurity(getHttpsSecurityStatus());
                      setSecurityLogs(getInsecureConnectionLogs());
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all cursor-pointer whitespace-nowrap shadow-md shadow-emerald-500/20"
                  >
                    فحص وفرض الأمان
                  </button>
                </div>

                {testResult && (
                  <div className="mt-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs">
                    {testResult.isAllowed ? (
                      <div className="text-emerald-400 font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>
                          {testResult.wasUpgraded
                            ? `🛡️ تم ترقية الاتصال تلقائياً إلى HTTPS الآمن: ${testResult.secureUrl}`
                            : `✅ الاتصال آمن ومتوافق مع بروتوكول HTTPS.`}
                        </span>
                      </div>
                    ) : (
                      <div className="text-red-400 font-bold flex items-center gap-2">
                        <XCircle className="w-4 h-4 shrink-0" />
                        <span>⛔ {testResult.errorMessage}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Content Security Policy (CSP) & XSS Defense Shield */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-amber-500/30 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
                    <FileCode className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-white">
                        سياسة أمان المحتوى (CSP) وحظر حقن السكريبتات (Anti-XSS)
                      </h4>
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>محصن بـ CSP Level 3 🛡️</span>
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      تمنع سياسة أمان المحتوى تشغيل أي كود غريب أو سكريبت خبيث (Cross-Site Scripting)، مع حظر المكونات الخارجية، وتقييد النطاقات المصرح بها.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-zinc-800/90 border border-zinc-700 text-amber-300 font-semibold flex items-center gap-1.5">
                    <Bug className="w-3.5 h-3.5 text-amber-400" />
                    <span>X-XSS-Protection: 1; mode=block</span>
                  </span>
                </div>
              </div>

              {/* CSP Directives Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
                <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
                  <div className="text-[11px] text-zinc-400 mb-1">حظر المكونات الإضافية (object-src)</div>
                  <div className="text-sm font-black text-emerald-400 font-mono flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>object-src 'none'</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">حظر Flash وJava وActiveX تماماً</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
                  <div className="text-[11px] text-zinc-400 mb-1">تقييد مصادر السكريبت (script-src)</div>
                  <div className="text-sm font-black text-[#76FF03] font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>النطاق المحلي + Google GIS</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">منع تحميل سكربتات من نطاقات خارجية</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
                  <div className="text-[11px] text-zinc-400 mb-1">محاولات حقن XSS التي تم إحباطها</div>
                  <div className="text-2xl font-black text-amber-400 font-mono flex items-center gap-1.5">
                    <span>{xssLogs.length} محاولات</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">تم رصدها وحجرها بنجاح</div>
                </div>
              </div>

              {/* Interactive Live XSS Testing Sandbox */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800">
                <div className="text-xs font-bold text-zinc-200 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>محاكي فحص حقن الأكواد الخبيثة (XSS Injection Sandbox Tester)</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={testXssInput}
                    onChange={(e) => setTestXssInput(e.target.value)}
                    placeholder="جرب كوداً خبيثاً (مثال: <script>alert(1)</script> أو javascript:stealData())"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = testXssInput.trim() || "<script>alert('XSS Exploit Simulation')</script>";
                      const check = detectXssAttack(input);
                      if (check.isMalicious) {
                        recordXssAttackAttempt({
                          payload: input,
                          source: 'admin_test_sandbox',
                          detectedPattern: check.detectedPattern || 'Injected Script Pattern',
                        });
                      }
                      setTestXssResult(check);
                      setCspDetails(getCspPolicyDetails());
                      setXssLogs(getXssAttackLogs());
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all cursor-pointer whitespace-nowrap shadow-md shadow-amber-500/20"
                  >
                    فحص واختبار حماية XSS
                  </button>
                </div>

                {testXssResult && (
                  <div className="mt-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs">
                    {testXssResult.isMalicious ? (
                      <div className="text-amber-400 font-bold flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                        <div>
                          <span>⛔ تم كشف وحظر محاولة الحقن بنجاح! ({testXssResult.detectedPattern})</span>
                          <span className="block text-[10px] text-zinc-400 font-normal mt-0.5">
                            {testXssResult.reason} - سياسة أمان المحتوى (CSP) تمنع تنفيذ هذا الكود تماماً.
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-emerald-400 font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>✅ النص آمن ونظيف ولا يحتوي على أي أكواد حقن أو سكريبتات مشبوهة.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setScansFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    scansFilter === 'all'
                      ? 'bg-white text-black shadow-md'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  الكل ({scanEvents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setScansFilter('accepted')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    scansFilter === 'accepted'
                      ? 'bg-[#76FF03] text-black shadow-md'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  معتمد ✅ ({scanEvents.filter((s) => s.status !== 'rate_limited').length})
                </button>
                <button
                  type="button"
                  onClick={() => setScansFilter('rate_limited')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    scansFilter === 'rate_limited'
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  تم صد تكرارها 🛡️ ({scanEvents.filter((s) => s.status === 'rate_limited').length})
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={scansSearchQuery}
                  onChange={(e) => setScansSearchQuery(e.target.value)}
                  placeholder="بحث بالمحل، الجيميل أو معرف الجهاز..."
                  className="w-full pl-8 pr-3 py-1.5 bg-black/60 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#76FF03]"
                />
              </div>
            </div>

            {/* Scans Telemetry List / Table */}
            <div className="p-4 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-2.5">
              {scanEvents
                .filter((scan) => {
                  if (scansFilter === 'accepted' && scan.status === 'rate_limited') return false;
                  if (scansFilter === 'rate_limited' && scan.status !== 'rate_limited') return false;
                  if (scansSearchQuery.trim()) {
                    const q = scansSearchQuery.toLowerCase();
                    const text = `${scan.restaurantName} ${scan.userEmail || ''} ${scan.userName || ''} ${scan.deviceId || ''}`.toLowerCase();
                    return text.includes(q);
                  }
                  return true;
                })
                .slice(0, 50)
                .map((scan) => (
                  <div
                    key={scan.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                      scan.status === 'rate_limited'
                        ? 'bg-amber-950/20 border-amber-800/40 hover:border-amber-500/60'
                        : 'bg-zinc-950/70 border-zinc-800/90 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start md:items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm shrink-0 font-bold ${
                          scan.status === 'rate_limited'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-[#76FF03]/15 text-[#76FF03] border border-[#76FF03]/30'
                        }`}
                      >
                        {scan.status === 'rate_limited' ? (
                          <ShieldAlert className="w-5 h-5" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-white text-sm">
                            {scan.restaurantName}
                          </span>
                          {scan.status === 'rate_limited' ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                              <span>تم صد تكرار (&lt; ساعة واحدة)</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 text-[10px] font-bold border border-emerald-800/40">
                              مسح معتمد وموثق ✅
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-zinc-400 text-[11px] mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <span className="text-zinc-500">حساب Gmail:</span>
                            <span className="font-mono text-zinc-200" dir="ltr">
                              {scan.userEmail || scan.userName || 'غير محدد'}
                            </span>
                          </span>

                          <span className="flex items-center gap-1">
                            <span className="text-zinc-500">معرف الجهاز (Device):</span>
                            <span className="font-mono text-[#76FF03]" dir="ltr">
                              {scan.deviceId || 'DEV-BBA-CLIENT'}
                            </span>
                            {scan.devicePlatform && (
                              <span className="text-[10px] text-zinc-500">({scan.devicePlatform})</span>
                            )}
                          </span>
                        </div>

                        {scan.blockReason && (
                          <div className="text-[10px] text-amber-300/90 mt-1 font-sans">
                            سبب الصد: {scan.blockReason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-left md:text-right shrink-0 pr-1 md:pr-0">
                      <div className="text-xs font-mono font-bold text-white" dir="ltr">
                        {scan.timeStr}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {scan.dateStr}
                      </div>
                    </div>
                  </div>
                ))}

              {scanEvents.length === 0 && (
                <div className="text-center py-10 text-zinc-500 text-xs">
                  لا توجد عمليات مسح مسجلة حتى الآن.
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
        />
      )}
    </div>
  );
};
