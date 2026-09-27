import React, { useState, useEffect } from 'react';
import { Restaurant, UserProfile, StampHistoryItem } from './types';
import {
  INITIAL_USER,
  INITIAL_RESTAURANTS,
  DISCOVERABLE_RESTAURANTS,
  INITIAL_HISTORY,
} from './data/mockData';
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
import { PWAInstallBanner } from './components/PWAInstallBanner';
import confetti from 'canvas-confetti';

const STORAGE_KEY_AUTH = 'pointili_auth_user_v1';
const STORAGE_KEY_RESTAURANTS = 'pointili_restaurants_v1';
const STORAGE_KEY_HISTORY = 'pointili_history_v1';
const STORAGE_KEY_ADMIN = 'pointili_admin_logged_in_v1';

export default function App() {
  // Admin State (Secured in ephemeral sessionStorage)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY_ADMIN) === 'true';
    } catch {
      return false;
    }
  });
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);

  // Customer Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Active Loyalty Cards State
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RESTAURANTS);
      return saved ? JSON.parse(saved) : INITIAL_RESTAURANTS;
    } catch {
      return INITIAL_RESTAURANTS;
    }
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
  const [cardForRedemption, setCardForRedemption] = useState<Restaurant | null>(null);
  const [merchantQROpen, setMerchantQROpen] = useState<boolean>(false);
  const [discoverModalOpen, setDiscoverModalOpen] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

  // Sync to LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RESTAURANTS, JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (isAdminLoggedIn) {
      sessionStorage.setItem(STORAGE_KEY_ADMIN, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEY_ADMIN);
      localStorage.removeItem(STORAGE_KEY_ADMIN);
    }
  }, [isAdminLoggedIn]);

  // Auth Handlers
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setCurrentTab('cards');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCardForDetail(null);
    setCardForRedemption(null);
  };

  // Admin Handlers
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    setShowAdminLogin(false);
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
  };

  // Add Partner Restaurant (from Admin Panel)
  const handleAddRestaurant = (newRestaurant: Restaurant) => {
    setRestaurants((prev) => [newRestaurant, ...prev]);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#76FF03', '#FFFFFF', '#00E5FF'],
    });
  };

  // Add Stamp Action (Scan simulation or live QR scan)
  const handleAddStamp = (restaurantId: string) => {
    const target = restaurants.find((r) => r.id === restaurantId);
    if (!target) {
      return { success: false, newCount: 0, rewardUnlocked: false };
    }

    if (target.stampsCount >= 6) {
      // Already unlocked!
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

    // Update history
    const newHistoryItem: StampHistoryItem = {
      id: `hist_${Date.now()}`,
      type: isUnlockedNow ? 'reward_unlocked' : 'stamp_added',
      timestamp: 'Just now',
      restaurantId: target.id,
      restaurantName: target.name,
      details: isUnlockedNow
        ? '6 of 6 stamps completed! Free Reward Unlocked 🎉'
        : `Stamp #${nextCount} collected via QR scan`,
    };

    setHistory((prev) => [newHistoryItem, ...prev]);

    // Keep active modal in sync if open
    if (cardForDetail && cardForDetail.id === restaurantId) {
      setCardForDetail({ ...cardForDetail, stampsCount: nextCount });
    }

    const updatedTarget = updated.find((r) => r.id === restaurantId);
    return {
      success: true,
      restaurant: updatedTarget,
      newCount: nextCount,
      rewardUnlocked: isUnlockedNow,
    };
  };

  // Reward Redemption Handler
  const handleConfirmRedemption = (restaurantId: string) => {
    const target = restaurants.find((r) => r.id === restaurantId);
    if (!target) return;

    const updated = restaurants.map((r) => {
      if (r.id === restaurantId) {
        return {
          ...r,
          stampsCount: 0, // Reset to 0 for next loyalty cycle
          totalRewardsClaimed: (r.totalRewardsClaimed || 0) + 1,
        };
      }
      return r;
    });

    setRestaurants(updated);

    const newHistoryItem: StampHistoryItem = {
      id: `hist_${Date.now()}`,
      type: 'reward_redeemed',
      timestamp: 'Just now',
      restaurantId: target.id,
      restaurantName: target.name,
      details: `Redeemed ${target.rewardTitle}`,
    };

    setHistory((prev) => [newHistoryItem, ...prev]);
  };

  // Reset Mock Data
  const handleResetDemoData = () => {
    setRestaurants(INITIAL_RESTAURANTS);
    setHistory(INITIAL_HISTORY);
    localStorage.removeItem(STORAGE_KEY_RESTAURANTS);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  };

  // Add New Discoverable Place
  const handleAddPlace = (place: Restaurant) => {
    if (restaurants.some((r) => r.id === place.id)) return;
    setRestaurants((prev) => [place, ...prev]);
    setDiscoverModalOpen(false);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#76FF03', '#FFFFFF'],
    });
  };

  // Quick navigation shortcut from card to scanner
  const handleQuickScanFromCard = (restaurant: Restaurant) => {
    setCurrentTab('scanner');
  };

  // Count ready rewards for bottom badge
  const unlockedRewardsCount = restaurants.filter((r) => r.stampsCount >= 6).length;

  // 1. IF ADMIN LOGIN MODAL IS OPEN
  if (showAdminLogin) {
    return (
      <AdminLogin
        onSuccess={handleAdminLoginSuccess}
        onCancel={() => setShowAdminLogin(false)}
      />
    );
  }

  // 2. IF ADMIN IS LOGGED IN, RENDER DEDICATED ADMIN DASHBOARD
  if (isAdminLoggedIn) {
    return (
      <AdminDashboard
        restaurants={restaurants}
        onAddRestaurant={handleAddRestaurant}
        onBackToApp={() => setIsAdminLoggedIn(false)}
        onLogoutAdmin={handleAdminLogout}
        onSimulateScan={(id) => handleAddStamp(id)}
      />
    );
  }

  // 3. IF CUSTOMER NOT AUTHENTICATED, RENDER GOOGLE LOGIN SCREEN
  if (!currentUser) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        onOpenAdminLogin={() => setShowAdminLogin(true)}
      />
    );
  }

  // 4. RENDER CUSTOMER MOBILE-FIRST APP
  return (
    <div className="min-h-screen bg-black text-white flex justify-center selection:bg-[#76FF03] selection:text-black">
      {/* Outer wrapper keeping mobile-first layout centered on desktop with ambient glow */}
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
              onQuickScan={handleQuickScanFromCard}
              onOpenDiscover={() => setDiscoverModalOpen(true)}
              onOpenMerchantQR={() => setMerchantQROpen(true)}
              onOpenAdminLogin={() => setShowAdminLogin(true)}
              onOpenInstallModal={() => setShowInstallModal(true)}
            />
          )}

          {currentTab === 'scanner' && (
            <QRScannerTab
              restaurants={restaurants}
              onAddStamp={handleAddStamp}
              onNavigateToCards={() => setCurrentTab('cards')}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileTab
              user={currentUser}
              restaurants={restaurants}
              history={history}
              onLogout={handleLogout}
              onResetDemoData={handleResetDemoData}
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
          onChangeTab={(tab) => setCurrentTab(tab)}
          unlockedRewardsCount={unlockedRewardsCount}
        />

        {/* Card Detail & Inspection Modal */}
        <CardDetailModal
          restaurant={cardForDetail}
          onClose={() => setCardForDetail(null)}
          onScanStamp={(r) => {
            setCardForDetail(null);
            setCurrentTab('scanner');
          }}
          onRedeemReward={(r) => {
            setCardForDetail(null);
            setCardForRedemption(r);
          }}
          onDirectAddStamp={(id) => handleAddStamp(id)}
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
          onSimulateCustomerScan={(id) => {
            handleAddStamp(id);
            setCurrentTab('scanner');
          }}
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
