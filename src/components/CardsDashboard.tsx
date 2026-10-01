import React, { useState, useEffect } from 'react';
import { Restaurant, UserProfile } from '../types';
import { StampCard } from './StampCard';
import { Search, Sparkles, Plus, Gift, Filter, Store, Shield, MapPin, Bell } from 'lucide-react';
import { PointiliLogo } from './PointiliLogo';
import { PromoCarousel } from './PromoCarousel';
import { useLanguage, LanguageSelector } from '../i18n/LanguageContext';
import {
  getStoredNotifications,
  checkForUnseenAppUpdate,
  setupUpdateSync,
} from '../services/appUpdateService';

interface CardsDashboardProps {
  user: UserProfile;
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onRedeemReward: (restaurant: Restaurant) => void;
  onQuickScan: (restaurant: Restaurant) => void;
  onOpenDiscover: () => void;
  onOpenMerchantQR: () => void;
  onOpenAdminLogin?: () => void;
  onOpenInstallModal?: () => void;
  onOpenNotifications?: () => void;
  onOpenUpdateModal?: () => void;
}

export const CardsDashboard: React.FC<CardsDashboardProps> = ({
  user,
  restaurants,
  onSelectRestaurant,
  onRedeemReward,
  onQuickScan,
  onOpenDiscover,
  onOpenMerchantQR,
  onOpenAdminLogin,
  onOpenInstallModal,
  onOpenNotifications,
  onOpenUpdateModal,
}) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'ready' | 'cafes' | 'food'>('all');
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(() => {
    const list = getStoredNotifications();
    return list.filter((n) => !n.read).length;
  });
  const [hasNewUpdate, setHasNewUpdate] = useState<boolean>(() => checkForUnseenAppUpdate());

  useEffect(() => {
    const updateCount = () => {
      const list = getStoredNotifications();
      setUnreadNotificationsCount(list.filter((n) => !n.read).length);
      setHasNewUpdate(checkForUnseenAppUpdate());
    };

    const unsubscribe = setupUpdateSync(() => {
      updateCount();
    });

    const handleCustomEvent = () => {
      updateCount();
    };

    window.addEventListener('pointili:notifications-updated', handleCustomEvent);
    window.addEventListener('pointili:app-updated', handleCustomEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('pointili:notifications-updated', handleCustomEvent);
      window.removeEventListener('pointili:app-updated', handleCustomEvent);
    };
  }, []);

  // Completed rewards ready to claim
  const readyRewards = restaurants.filter((r) => r.stampsCount >= 6);

  // Filter logic
  const filteredRestaurants = restaurants.filter((r) => {
    const nameToSearch = (
      (r.name || '') +
      ' ' +
      (r.nameAr || '') +
      ' ' +
      (r.nameFr || '') +
      ' ' +
      (r.category || '') +
      ' ' +
      (r.categoryAr || '') +
      ' ' +
      (r.neighborhood || '')
    ).toLowerCase();

    const matchesSearch = nameToSearch.includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'ready') return r.stampsCount >= 6;
    if (activeFilter === 'cafes') {
      return (
        r.category.toLowerCase().includes('cafe') ||
        r.category.toLowerCase().includes('coffee') ||
        r.category.toLowerCase().includes('glacier') ||
        r.category.toLowerCase().includes('tea') ||
        (r.categoryAr && (r.categoryAr.includes('مقهى') || r.categoryAr.includes('مثلجات') || r.categoryAr.includes('كافيه')))
      );
    }
    if (activeFilter === 'food') {
      return (
        r.category.toLowerCase().includes('burger') ||
        r.category.toLowerCase().includes('pizza') ||
        r.category.toLowerCase().includes('grill') ||
        r.category.toLowerCase().includes('tacos') ||
        r.category.toLowerCase().includes('rotisserie') ||
        (r.categoryAr && (r.categoryAr.includes('مطعم') || r.categoryAr.includes('بيتزا') || r.categoryAr.includes('شواء') || r.categoryAr.includes('برغر') || r.categoryAr.includes('شاورما')))
      );
    }
    return true;
  });

  return (
    <div className="min-h-full pb-28 pt-2 px-4 max-w-lg mx-auto flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Top Bar with Pointili Brand & Controls */}
      <div className="flex items-center justify-between mb-3.5">
        <PointiliLogo variant="full" size="sm" theme="dark" />

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Multi-language Selector (العربية, Français, English) */}
          <LanguageSelector compact={false} />

          {/* Notifications & App Updates Bell */}
          <button
            type="button"
            onClick={onOpenNotifications || onOpenUpdateModal}
            className="relative p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-[#76FF03]/80 text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-sm"
            title="إشعارات التجديد والتحديثات"
          >
            <Bell className="w-4 h-4 text-zinc-300" />
            {(unreadNotificationsCount > 0 || hasNewUpdate) && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#76FF03] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#76FF03] border-2 border-zinc-950"></span>
              </span>
            )}
          </button>

          {/* Phone Desktop App Icon / Install */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-[#76FF03]/80 transition-all cursor-pointer flex items-center justify-center shadow-sm"
              title={t.installedOnDesk}
            >
              <img
                src="/icon.svg"
                alt="App Icon"
                className="w-5 h-5 rounded-md object-cover ring-1 ring-[#76FF03]"
              />
            </button>
          )}

          {/* Quick Admin Portal Button */}
          {onOpenAdminLogin && (
            <button
              onClick={onOpenAdminLogin}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-[#76FF03]/50 transition-colors cursor-pointer"
              title={t.adminPortal}
            >
              <Shield className="w-4 h-4 text-[#76FF03]" />
            </button>
          )}

          {/* Quick Counter Stand Poster Button */}
          <button
            onClick={onOpenMerchantQR}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-[#76FF03]/50 transition-colors"
            title="Merchant Stand QR Poster"
          >
            <Store className="w-4 h-4 text-zinc-300" />
          </button>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-1 pl-1">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#76FF03]"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Animated Interactive Carousel / Slider for Announcements, Venues & Features */}
      <PromoCarousel
        restaurants={restaurants}
        readyRewardsCount={readyRewards.length}
        onOpenDiscover={onOpenDiscover}
        onSelectRestaurant={onSelectRestaurant}
        onFilterChange={(filter) => setActiveFilter(filter)}
      />

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-9 pr-4 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#76FF03] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800/80 mb-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-zinc-800 text-[#76FF03] shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {t.filterAll} ({restaurants.length})
        </button>
        <button
          onClick={() => setActiveFilter('ready')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
            activeFilter === 'ready'
              ? 'bg-[#76FF03] text-black shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span>{t.filterReady} ({readyRewards.length})</span>
        </button>
        <button
          onClick={() => setActiveFilter('cafes')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeFilter === 'cafes'
              ? 'bg-zinc-800 text-[#76FF03] shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {t.filterCafes}
        </button>
        <button
          onClick={() => setActiveFilter('food')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeFilter === 'food'
              ? 'bg-zinc-800 text-[#76FF03] shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {t.filterFood}
        </button>
      </div>

      {/* RESTAURANT CARDS GRID / LIST */}
      {filteredRestaurants.length > 0 ? (
        <div className="space-y-4">
          {filteredRestaurants.map((restaurant) => (
            <StampCard
              key={restaurant.id}
              restaurant={restaurant}
              onSelect={onSelectRestaurant}
              onRedeem={onRedeemReward}
              onQuickScan={onQuickScan}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-zinc-900/30 rounded-2xl border border-zinc-800/60 p-6">
          <Gift className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">{t.noRestaurantsFound}</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            {t.dashboardSubtitle}
          </p>
          <button
            onClick={onOpenDiscover}
            className="mt-4 px-4 py-2 rounded-xl bg-[#76FF03] text-black font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.discoverMore}</span>
          </button>
        </div>
      )}
    </div>
  );
};
