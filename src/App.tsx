import React, { useState, useEffect } from 'react';
import { Restaurant, UserProfile, StampHistoryItem, MerchantSession } from './types';
import {
  INITIAL_RESTAURANTS,
  DISCOVERABLE_RESTAURANTS,
  INITIAL_HISTORY,
} from './data/mockData';
import {
  saveRegisteredUser,
  recordRealScanLog,
  recordRealWinnerEvent,
} from './data/adminMockData';
import { AuthScreen } from './components/AuthScreen';
import { CardsDashboard } from './components/CardsDashboard';
import { QRScannerTab } from './components/QRScannerTab';
import { ProfileTab } from './components/ProfileTab';
import { BottomNav, NavTab } from './components/BottomNav';
import { RewardModal } from './components/RewardModal';
import { CardDetailModal } from './components/CardDetailModal';
import { MerchantQRSheet } from './components/MerchantQRSheet';
import { DiscoverModal } from './components/DiscoverModal';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { MerchantDashboard } from './components/MerchantDashboard';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import confetti from 'canvas-confetti';

const STORAGE_KEY_AUTH = 'pointili_auth_user_v1';
const STORAGE_KEY_BBA_RESTAURANTS = 'pointili_bba_restaurants_v5';
const STORAGE_KEY_HISTORY = 'pointili_history_v2';
const STORAGE_KEY_MERCHANT_SESSION = 'pointili_merchant_session_v2';

// Helper to store/load user-specific stamps so new users start strictly with 0 stamps
function getUserStampsMap(userId: string): Record<string, number> {
  try {
    const raw = localStorage.getItem(`pointili_stamps_user_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) return parsed;
    }
  } catch {}
  return {};
}

function saveUserStampsMap(userId: string, map: Record<string, number>) {
  try {
    localStorage.setItem(`pointili_stamps_user_${userId}`, JSON.stringify(map));
  } catch {}
}

export default function App() {
  // Merchant / Super Admin Session (Secured in ephemeral sessionStorage)
  const [merchantSession, setMerchantSession] = useState<MerchantSession | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_MERCHANT_SESSION);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);

  // Customer Auth State - Strictly locked until genuine Gmail login
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          parsed.email &&
          !parsed.email.includes('alex.rivera') &&
          parsed.id !== 'usr_pointili_882'
        ) {
          return parsed;
        }
      }
      localStorage.removeItem(STORAGE_KEY_AUTH);
      return null;
    } catch {
      return null;
    }
  });

  // Active Loyalty Cards State (Always BBA Venues, initialized with user's specific stamps or 0)
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const baseRestaurants = INITIAL_RESTAURANTS;
    // If user is already stored, load their specific stamps
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY_AUTH);
      if (savedUser) {
        const userObj = JSON.parse(savedUser);
        if (userObj && userObj.id) {
          const userStamps = getUserStampsMap(userObj.id);
          return baseRestaurants.map((r) => ({
            ...r,
            stampsCount: typeof userStamps[r.id] === 'number' ? userStamps[r.id] : 0,
          }));
        }
      }
    } catch {}
    // Default: strictly 0 stamps for all cards!
    return baseRestaurants.map((r) => ({ ...r, stampsCount: 0 }));
  });

  // Stamp History State
  const [history, setHistory] = useState<StampHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : INITIAL_HISTORY;
    } catch {
      return INITIAL_HISTORY;
    }
  });

  // Navigation & Modals State
  const [currentTab, setCurrentTab] = useState<NavTab>('cards');
  const [cardForDetail, setCardForDetail] = useState<Restaurant | null>(null);
  const [scannedTargetRestaurant, setScannedTargetRestaurant] = useState<Restaurant | null>(null);
  const [cardForRedemption, setCardForRedemption] = useState<Restaurant | null>(null);
  const [merchantQROpen, setMerchantQROpen] = useState<boolean>(false);
  const [discoverModalOpen, setDiscoverModalOpen] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  // Sync to LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(currentUser));
      // Load user-specific stamps for this authenticated account
      const userStamps = getUserStampsMap(currentUser.id);
      setRestaurants((prev) =>
        prev.map((r) => ({
          ...r,
          stampsCount: typeof userStamps[r.id] === 'number' ? userStamps[r.id] : 0,
        }))
      );
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (merchantSession) {
      sessionStorage.setItem(STORAGE_KEY_MERCHANT_SESSION, JSON.stringify(merchantSession));
    } else {
      sessionStorage.removeItem(STORAGE_KEY_MERCHANT_SESSION);
    }
  }, [merchantSession]);

  // Auth Handlers
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    saveRegisteredUser(user);
    // Reset or load stamps for this specific user
    const userStamps = getUserStampsMap(user.id);
    setRestaurants(
      INITIAL_RESTAURANTS.map((r) => ({
        ...r,
        stampsCount: typeof userStamps[r.id] === 'number' ? userStamps[r.id] : 0,
      }))
    );
    setCurrentTab('cards');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCardForDetail(null);
    setCardForRedemption(null);
    // Reset cards in memory to 0
    setRestaurants(INITIAL_RESTAURANTS.map((r) => ({ ...r, stampsCount: 0 })));
  };

  // Merchant / Admin Login Handlers
  const handleMerchantLoginSuccess = (session: MerchantSession) => {
    setMerchantSession(session);
    setShowAdminLogin(false);
  };

  const handleMerchantLogout = () => {
    setMerchantSession(null);
  };

  // Live approval handler when merchant clicks Accept on their dashboard
  const handleApproveStampToUser = (userId: string, restaurantId: string) => {
    const userStamps = getUserStampsMap(userId);
    const current = typeof userStamps[restaurantId] === 'number' ? userStamps[restaurantId] : 0;
    const next = Math.min(6, current + 1);
    userStamps[restaurantId] = next;
    saveUserStampsMap(userId, userStamps);

    // If active customer in this window is target user, increment their card
    if (currentUser && currentUser.id === userId) {
      setRestaurants((prev) =>
        prev.map((r) => (r.id === restaurantId ? { ...r, stampsCount: next } : r))
      );
    }

    const target = restaurants.find((r) => r.id === restaurantId);
    if (target) {
      recordRealScanLog({
        restaurantId: target.id,
        restaurantName: target.nameAr || target.name,
        userId,
        userName: 'زبون معتمد',
      });
    }
  };

  // Add Partner Restaurant (from Admin Panel)
  const handleAddRestaurant = (newRestaurant: Restaurant) => {
    setRestaurants((prev) => [{ ...newRestaurant, stampsCount: 0 }, ...prev]);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#76FF03', '#FFFFFF', '#00E5FF'],
    });
  };

  // Add Stamp Action (Scan simulation or live QR scan)
  // ONLY ADDS STAMP UPON QR SCAN!
  const handleAddStamp = (restaurantId: string) => {
    const target = restaurants.find((r) => r.id === restaurantId);
    if (!target) {
      return { success: false, newCount: 0, rewardUnlocked: false };
    }

    if (target.stampsCount >= 6) {
      return {
        success: true,
        restaurant: target,
        newCount: 6,
        rewardUnlocked: true,
      };
    }

    const nextCount = target.stampsCount + 1;
    const isUnlockedNow = nextCount === 6;

    const updated = restaurants.map((r) => {
      if (r.id === restaurantId) {
        return {
          ...r,
          stampsCount: nextCount,
        };
      }
      return r;
    });

    setRestaurants(updated);

    // Save stamps strictly to this user's account map
    if (currentUser) {
      const currentMap = getUserStampsMap(currentUser.id);
      currentMap[restaurantId] = nextCount;
      saveUserStampsMap(currentUser.id, currentMap);
    }

    // Update history
    const newHistoryItem: StampHistoryItem = {
      id: `hist_${Date.now()}`,
      type: isUnlockedNow ? 'reward_unlocked' : 'stamp_added',
      timestamp: 'الآن (Just now)',
      restaurantId: target.id,
      restaurantName: target.nameAr || target.name,
      details: isUnlockedNow
        ? 'اكتملت 6/6 أختام! مبروك فتح المكافأة المجانية 🎉'
        : `تم ختم الدائرة #${nextCount} عبر مسح كود QR`,
    };

    setHistory((prev) => [newHistoryItem, ...prev]);

    // Record real persistent scan event for Admin telemetry
    recordRealScanLog({
      restaurantId: target.id,
      restaurantName: target.nameAr || target.name,
      userId: currentUser?.id,
      userName: currentUser?.name,
    });

    // If unlocked 6/6, record persistent winner item in Admin Winners Log
    if (isUnlockedNow) {
      recordRealWinnerEvent({
        userName: currentUser?.name || 'مستخدم Pointili',
        userAvatar:
          currentUser?.avatarUrl ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        restaurantName: target.nameAr || target.name,
        restaurantEmoji: target.imageEmoji || '🎁',
        rewardTitle: target.rewardTitleAr || target.rewardTitle,
        code: `BBA-WIN-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'unlocked',
      });
    }

    // Keep active modal in sync if open
    if (cardForDetail && cardForDetail.id === restaurantId) {
      setCardForDetail({ ...cardForDetail, stampsCount: nextCount });
    }

    return {
      success: true,
      restaurant: { ...target, stampsCount: nextCount },
      newCount: nextCount,
      rewardUnlocked: isUnlockedNow,
    };
  };

  // Redeem Reward Action (After 6 stamps, reset card for repeated use)
  const handleConfirmRedemption = (restaurantId: string) => {
    const target = restaurants.find((r) => r.id === restaurantId);
    if (!target) return;

    const updated = restaurants.map((r) => {
      if (r.id === restaurantId) {
        return {
          ...r,
          stampsCount: 0, // Reset to 0 after claim!
          totalRewardsClaimed: (r.totalRewardsClaimed || 0) + 1,
        };
      }
      return r;
    });

    setRestaurants(updated);

    // Update user's stamp map in storage
    if (currentUser) {
      const currentMap = getUserStampsMap(currentUser.id);
      currentMap[restaurantId] = 0;
      saveUserStampsMap(currentUser.id, currentMap);
    }

    // Add Redemption to history
    const redemptionHistory: StampHistoryItem = {
      id: `hist_${Date.now()}`,
      type: 'reward_redeemed',
      timestamp: 'الآن (Just now)',
      restaurantId: target.id,
      restaurantName: target.nameAr || target.name,
      details: `تم استلام ${target.rewardTitleAr || target.rewardTitle} بنجاح لدى الكاشير.`,
    };

    setHistory((prev) => [redemptionHistory, ...prev]);
    setCardForRedemption(null);
  };

  // Join new discoverable venue
  const handleAddPlace = (newPlace: Restaurant) => {
    setRestaurants((prev) => [...prev, { ...newPlace, stampsCount: 0 }]);
    setDiscoverModalOpen(false);
    confetti({
      particleCount: 40,
      spread: 60,
    });
  };

  // Reset user data helper
  const handleResetUserDemo = () => {
    if (currentUser) {
      localStorage.removeItem(`pointili_stamps_user_${currentUser.id}`);
    }
    setRestaurants(INITIAL_RESTAURANTS.map((r) => ({ ...r, stampsCount: 0 })));
    setHistory([]);
  };

  // 1. IF MERCHANT STORE OWNER LOGGED IN
  if (merchantSession && merchantSession.role === 'merchant' && merchantSession.restaurant) {
    return (
      <MerchantDashboard
        restaurant={merchantSession.restaurant}
        onLogout={handleMerchantLogout}
        onOpenQRStand={(r) => {
          setCardForDetail(r);
          setMerchantQROpen(true);
        }}
        onApproveStampToUser={handleApproveStampToUser}
      />
    );
  }

  // 2. IF SUPER ADMIN LOGGED IN ("AYMEN BG")
  if (merchantSession && merchantSession.role === 'super_admin') {
    return (
      <AdminDashboard
        restaurants={restaurants}
        onAddRestaurant={handleAddRestaurant}
        onBackToApp={() => setMerchantSession(null)}
        onLogoutAdmin={handleMerchantLogout}
        onSimulateScan={(id) => handleAddStamp(id)}
        onApproveStampToUser={handleApproveStampToUser}
      />
    );
  }

  // 3. IF MERCHANT / ADMIN LOGIN MODAL IS REQUESTED
  if (showAdminLogin) {
    return (
      <AdminLogin
        restaurants={restaurants}
        onSuccess={handleMerchantLoginSuccess}
        onCancel={() => setShowAdminLogin(false)}
      />
    );
  }

  // 4. IF CUSTOMER NOT AUTHENTICATED, RENDER GOOGLE LOGIN SCREEN
  if (!currentUser) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        onOpenAdminLogin={() => setShowAdminLogin(true)}
      />
    );
  }

  // Unlocked rewards count for bottom badge
  const unlockedRewardsCount = restaurants.filter((r) => r.stampsCount >= 6).length;

  // 5. MAIN CUSTOMER PORTAL
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-between select-none">
      <div className="w-full max-w-md min-h-screen bg-zinc-950 flex flex-col relative shadow-2xl shadow-black border-x border-zinc-900/60">
        {/* Main View Router */}
        <main className="flex-1 w-full overflow-y-auto">
          {/* Subtle In-App Home Screen Prompt */}
          <PWAInstallBanner
            forceOpenModal={showInstallModal}
            onCloseModal={() => setShowInstallModal(false)}
          />

          {currentTab === 'cards' && (
            <CardsDashboard
              user={currentUser}
              restaurants={restaurants}
              onSelectRestaurant={(r) => setCardForDetail(r)}
              onRedeemReward={(r) => setCardForRedemption(r)}
              onQuickScan={(r) => {
                setScannedTargetRestaurant(r);
                setCardForDetail(null);
                setCurrentTab('scanner');
              }}
              onOpenDiscover={() => setDiscoverModalOpen(true)}
              onOpenMerchantQR={() => setMerchantQROpen(true)}
              onOpenAdminLogin={() => setShowAdminLogin(true)}
              onOpenInstallModal={() => setShowInstallModal(true)}
            />
          )}

          {currentTab === 'scanner' && (
            <QRScannerTab
              restaurants={restaurants}
              currentUser={currentUser}
              onAddStamp={(id) => handleAddStamp(id)}
              onNavigateToCards={() => setCurrentTab('cards')}
              preSelectedRestaurant={scannedTargetRestaurant || cardForDetail}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileTab
              user={currentUser}
              restaurants={restaurants}
              history={history}
              onLogout={handleLogout}
              onResetDemoData={handleResetUserDemo}
              onOpenMerchantQR={() => setMerchantQROpen(true)}
              onAddMorePlaces={() => setDiscoverModalOpen(true)}
              onOpenAdminLogin={() => setShowAdminLogin(true)}
              onOpenInstallModal={() => setShowInstallModal(true)}
            />
          )}
        </main>

        {/* Modern Mobile Bottom Navigation Bar */}
        <BottomNav
          currentTab={currentTab}
          onChangeTab={(tab) => {
            setCurrentTab(tab);
          }}
          unlockedRewardsCount={unlockedRewardsCount}
        />

        {/* Card Detail & Inspection Modal */}
        <CardDetailModal
          restaurant={cardForDetail}
          onClose={() => setCardForDetail(null)}
          onScanStamp={(r) => {
            setScannedTargetRestaurant(r);
            setCardForDetail(null);
            setCurrentTab('scanner');
          }}
          onRedeemReward={(r) => {
            setCardForDetail(null);
            setCardForRedemption(r);
          }}
        />

        {/* Cashier Reward Redemption Modal */}
        <RewardModal
          restaurant={cardForRedemption}
          onClose={() => setCardForRedemption(null)}
          onConfirmRedemption={handleConfirmRedemption}
        />

        {/* Counter QR Stand Poster (Merchant Mode) */}
        <MerchantQRSheet
          restaurants={restaurants}
          isOpen={merchantQROpen}
          onClose={() => setMerchantQROpen(false)}
          initialRestaurantId={cardForDetail?.id}
        />

        {/* Discover & Join New Places Modal */}
        <DiscoverModal
          isOpen={discoverModalOpen}
          onClose={() => setDiscoverModalOpen(false)}
          availablePlaces={DISCOVERABLE_RESTAURANTS}
          existingIds={restaurants.map((r) => r.id)}
          onAddPlace={handleAddPlace}
        />
      </div>
    </div>
  );
}
