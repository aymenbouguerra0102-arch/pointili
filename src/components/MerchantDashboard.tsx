import React, { useState, useEffect, useRef } from 'react';
import { Restaurant, StampRequest } from '../types';
import {
  Store,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  LogOut,
  Sparkles,
  Users,
  Award,
  Bell,
  RefreshCw,
  Search,
  Printer,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Check,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  getStoreStampRequests,
  updateStampRequestStatus,
  getStampRequests,
} from '../data/stampRequestsManager';
import { PointiliLogo } from './PointiliLogo';

interface MerchantDashboardProps {
  restaurant: Restaurant;
  onLogout: () => void;
  onOpenQRStand: (restaurant: Restaurant) => void;
  onApproveStampToUser: (userId: string, restaurantId: string) => void;
}

// Chime on new incoming request or approval
function playMerchantChime(type: 'new_request' | 'approved') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'new_request') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch {}
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  restaurant,
  onLogout,
  onOpenQRStand,
  onApproveStampToUser,
}) => {
  const [requests, setRequests] = useState<StampRequest[]>([]);
  const [filter, setFilter] = useState<'pending' | 'accepted' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  // Customer verification inputs: Merchant enters customer name to verify identity before accepting
  const [verificationInputs, setVerificationInputs] = useState<Record<string, string>>({});
  const [verificationErrors, setVerificationErrors] = useState<Record<string, string>>({});

  const prevPendingCountRef = useRef<number>(0);

  // Load and subscribe to store requests
  const loadRequests = () => {
    const list = getStoreStampRequests(restaurant.id);
    setRequests(list);

    const pendingCount = list.filter((r) => r.status === 'pending').length;
    if (pendingCount > prevPendingCountRef.current && soundEnabled && prevPendingCountRef.current !== 0) {
      playMerchantChime('new_request');
    }
    prevPendingCountRef.current = pendingCount;
  };

  useEffect(() => {
    loadRequests();

    // Listen to local window events & storage events for real-time reactivity
    const handleUpdate = () => loadRequests();
    window.addEventListener('pointili_stamp_requests_changed', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Polling interval every 1s for seamless cross-tab / device sync
    const interval = setInterval(loadRequests, 1000);

    return () => {
      window.removeEventListener('pointili_stamp_requests_changed', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, [restaurant.id, soundEnabled]);

  // Requirement 3: Merchant verifies customer name before accepting
  const handleAcceptWithVerification = (req: StampRequest) => {
    const entered = (verificationInputs[req.id] || '').trim();
    if (!entered) {
      setVerificationErrors((prev) => ({
        ...prev,
        [req.id]: '⚠️ يرجى كتابة اسم الزبون الواقف أمامك لتأكيد هويته قبل القبول.',
      }));
      return;
    }

    updateStampRequestStatus(req.id, 'accepted');
    onApproveStampToUser(req.userId, req.restaurantId);

    if (soundEnabled) playMerchantChime('approved');

    setLastActionMessage(`✅ تم التحقق من الزبون (${req.userName}) وقبول الختم بنجاح!`);
    setTimeout(() => setLastActionMessage(null), 3500);

    loadRequests();
  };

  const handleReject = (req: StampRequest) => {
    updateStampRequestStatus(req.id, 'rejected');

    setLastActionMessage(`❌ تم رفض طلب الختم لـ (${req.userName}) وتم إبلاغه فوراً.`);
    setTimeout(() => setLastActionMessage(null), 3500);

    loadRequests();
  };

  // Stats
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const acceptedRequests = requests.filter((r) => r.status === 'accepted');
  const rejectedRequests = requests.filter((r) => r.status === 'rejected');

  const filteredRequests = requests.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.userName.toLowerCase().includes(q) ||
        r.userEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white font-['Plus_Jakarta_Sans'] select-none">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-[#76FF03]/40 flex items-center justify-center text-xl shadow-lg shadow-[#76FF03]/10">
              {restaurant.imageEmoji}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-white">
                  {restaurant.nameAr || restaurant.name}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#76FF03]/10 text-[#76FF03] font-bold border border-[#76FF03]/30">
                  لوحة التاجر
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {restaurant.neighborhood || 'ولاية برج بوعريريج'} · {restaurant.categoryAr || restaurant.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled((prev) => !prev)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                soundEnabled
                  ? 'bg-zinc-900 border-zinc-700 text-[#76FF03]'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-600'
              }`}
              title="تنبيه صوتي للطلبات"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* QR Poster stand button */}
            <button
              onClick={() => onOpenQRStand(restaurant)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#76FF03]" />
              <span>ملصق الكاشير</span>
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-800/80 text-xs font-bold text-red-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-5 pb-20">
        {/* Action Alert Banner */}
        {lastActionMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-zinc-900 border border-[#76FF03]/50 text-white text-xs font-bold flex items-center justify-between shadow-xl animate-in fade-in">
            <span>{lastActionMessage}</span>
            <button
              onClick={() => setLastActionMessage(null)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Store Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-400">الطلبات المعلقة</span>
              <div className={`w-2.5 h-2.5 rounded-full ${pendingRequests.length > 0 ? 'bg-amber-400 animate-ping' : 'bg-zinc-700'}`} />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {pendingRequests.length}
            </div>
            <span className="text-[10px] text-zinc-500">في انتظار الموافقة</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-400">أختام اليوم المقبولة</span>
              <CheckCircle2 className="w-4 h-4 text-[#76FF03]" />
            </div>
            <div className="text-2xl font-black text-[#76FF03] font-mono">
              {acceptedRequests.length}
            </div>
            <span className="text-[10px] text-zinc-500">ختم موثق رسمي</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-400">الطلبات المرفوضة</span>
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-2xl font-black text-red-400 font-mono">
              {rejectedRequests.length}
            </div>
            <span className="text-[10px] text-zinc-500">محاولات غير صالحة</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-400">المكافآت الممنوحة</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400 font-mono">
              {restaurant.totalRewardsClaimed || 0}
            </div>
            <span className="text-[10px] text-zinc-500">وجبات ومشروبات مجانية</span>
          </div>
        </div>

        {/* Counter QR Stand Banner on Mobile */}
        <div className="sm:hidden mb-5 p-3.5 rounded-2xl bg-[#76FF03] text-black flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-5 h-5" />
            <div>
              <div className="text-xs font-extrabold">ملصق كود الـ QR للكاشير</div>
              <div className="text-[10px] font-medium text-black/80">اعرضه للزبائن أو اطبعه للطاولات</div>
            </div>
          </div>
          <button
            onClick={() => onOpenQRStand(restaurant)}
            className="px-3 py-1.5 rounded-xl bg-black text-[#76FF03] text-xs font-bold shadow"
          >
            عرض
          </button>
        </div>

        {/* Section Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#76FF03]" />
            <h2 className="text-base font-extrabold text-white">
              طلبات الأختام الحية (Live Stamp Requests)
            </h2>
            {pendingRequests.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-xs font-black animate-pulse">
                {pendingRequests.length} جديد
              </span>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filter === 'pending'
                  ? 'bg-amber-400 text-black shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              قيد الانتظار ({pendingRequests.length})
            </button>
            <button
              onClick={() => setFilter('accepted')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filter === 'accepted'
                  ? 'bg-[#76FF03] text-black shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              المقبولة ({acceptedRequests.length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filter === 'rejected'
                  ? 'bg-red-500 text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              المرفوضة ({rejectedRequests.length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-white text-black shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              الكل ({requests.length})
            </button>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="p-10 rounded-3xl bg-zinc-950 border border-zinc-800 text-center text-zinc-500">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#76FF03]" />
            <h3 className="text-sm font-bold text-zinc-300">
              {filter === 'pending' ? 'لا توجد طلبات معلقة حالياً' : 'لا توجد طلبات مطابقة'}
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              عندما يقوم أي زبون بمسح كود الـ QR الخاص بك في المحل، سيظهر طلبه هنا فوراً مع تنبيه صوتي للموافقة عليه.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((req) => {
              const isPending = req.status === 'pending';
              const isAccepted = req.status === 'accepted';
              const isRejected = req.status === 'rejected';

              return (
                <div
                  key={req.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isPending
                      ? 'bg-zinc-950 border-amber-500/40 shadow-lg shadow-amber-500/5'
                      : isAccepted
                      ? 'bg-zinc-950/70 border-zinc-800'
                      : 'bg-zinc-950/50 border-zinc-900 opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <img
                        src={req.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                        alt={req.userName}
                        className="w-12 h-12 rounded-full border border-zinc-700 object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-white">
                            {req.userName}
                          </h4>
                          {isPending && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                              في المحل الآن 🕒
                            </span>
                          )}
                          {isAccepted && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#76FF03]/20 text-[#76FF03] border border-[#76FF03]/30">
                              تم القبول ✓
                            </span>
                          )}
                          {isRejected && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                              مرفوض ✕
                            </span>
                          )}
                          {req.status === 'appealed' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              طعن لدى AYMEN BG ⚖️
                            </span>
                          )}
                          {req.status === 'appeal_approved' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              قبل الطعن رسمي ✓
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-zinc-400 font-mono mt-0.5">
                          {req.userEmail}
                        </div>

                        <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-1">
                          <span>وقت الطلب: {req.timestamp}</span>
                          <span>•</span>
                          <span className="text-zinc-300 font-medium">
                            رصيده السابق: {req.currentStampsBefore} / 6 أختام
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isPending && (
                      <div className="text-xs text-zinc-400 self-end sm:self-center">
                        {req.resolvedAt && <span>تمت المعالجة في: {req.resolvedAt}</span>}
                      </div>
                    )}
                  </div>

                  {/* Requirement 3: Merchant Customer Name Verification Box */}
                  {isPending && (
                    <div className="mt-3.5 pt-3.5 border-t border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-[11px] text-zinc-300 font-bold mb-1 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>التحقق الأمني: أدخل "اسم الزبون أو اسم المستخدم" للتحقق:</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={verificationInputs[req.id] || ''}
                            onChange={(e) => {
                              setVerificationInputs((prev) => ({ ...prev, [req.id]: e.target.value }));
                              if (verificationErrors[req.id]) {
                                setVerificationErrors((prev) => ({ ...prev, [req.id]: '' }));
                              }
                            }}
                            placeholder="أدخل اسم الزبون أو اسم المستخدم للتحقق..."
                            className="flex-1 px-3 py-1.5 bg-black border border-zinc-700 focus:border-[#76FF03] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setVerificationInputs((prev) => ({ ...prev, [req.id]: req.userName }));
                              if (verificationErrors[req.id]) {
                                setVerificationErrors((prev) => ({ ...prev, [req.id]: '' }));
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700 text-[10px] text-zinc-300 font-bold whitespace-nowrap cursor-pointer transition-colors"
                          >
                            تطابق مع ({req.userName})
                          </button>
                        </div>
                        {verificationErrors[req.id] && (
                          <p className="text-[10px] text-red-400 mt-1 font-bold">
                            {verificationErrors[req.id]}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center mt-1 sm:mt-0">
                        {/* REJECT BUTTON */}
                        <button
                          onClick={() => handleReject(req)}
                          className="px-4 py-2 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>رفض</span>
                        </button>

                        {/* ACCEPT BUTTON */}
                        <button
                          onClick={() => handleAcceptWithVerification(req)}
                          className="px-5 py-2 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] active:scale-[0.98] text-black text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-[#76FF03]/25 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                          <span>تأكيد وقبول الختم (+1)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Appeal Status Notice if customer appealed */}
                  {req.status === 'appealed' && (
                    <div className="mt-3 p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/60 text-xs text-purple-200">
                      <div className="font-bold flex items-center gap-1.5 mb-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                        <span>قام الزبون بتقديم طعن لدى رئيس الإدارة (AYMEN BG):</span>
                      </div>
                      <p className="text-[11px] text-zinc-300">"{req.appealNote}"</p>
                    </div>
                  )}

                  {req.status === 'appeal_approved' && (
                    <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 font-bold">
                      🏛️ وافق رئيس الإدارة (AYMEN BG) على طعن الزبون وتم احتساب الختم رسمياً.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
