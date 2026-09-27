import React, { useState } from 'react';
import { Restaurant, UserProfile } from '../types';
import { StampCard } from './StampCard';
import { Search, Sparkles, Plus, Gift, Filter, Store, Shield } from 'lucide-react';
import { PointiliLogo } from './PointiliLogo';

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
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'ready' | 'cafes' | 'food'>('all');

  // Completed rewards ready to claim
  const readyRewards = restaurants.filter((r) => r.stampsCount >= 6);

  // Filter logic
  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'ready') return r.stampsCount >= 6;
    if (activeFilter === 'cafes') {
      return (
        r.category.toLowerCase().includes('cafe') ||
        r.category.toLowerCase().includes('tea') ||
        r.category.toLowerCase().includes('coffee') ||
        r.category.toLowerCase().includes('bakery')
      );
    }
    if (activeFilter === 'food') {
      return (
        r.category.toLowerCase().includes('burger') ||
        r.category.toLowerCase().includes('pizza') ||
        r.category.toLowerCase().includes('ramen') ||
        r.category.toLowerCase().includes('taco') ||
        r.category.toLowerCase().includes('bowl')
      );
    }
    return true;
  });

  return (
    <div className="min-h-full pb-28 pt-2 px-4 max-w-lg mx-auto flex flex-col">
      {/* Top Bar with Pointili Brand & User Avatar */}
      <div className="flex items-center justify-between mb-4">
        <PointiliLogo variant="full" size="sm" theme="dark" />

        <div className="flex items-center gap-2">
          {/* Phone Desktop App Icon / Install */}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="p-1 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-[#76FF03]/80 transition-all cursor-pointer flex items-center justify-center shadow-sm"
              title="شعار وتثبيت التطبيق في مكتب الهاتف"
            >
              <img
                src="/icon.svg"
                alt="App Icon"
                className="w-6 h-6 rounded-lg object-cover ring-1 ring-[#76FF03]"
              />
            </button>
          )}

          {/* Quick Admin Portal Button */}
          {onOpenAdminLogin && (
            <button
              onClick={onOpenAdminLogin}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-[#76FF03]/50 transition-colors cursor-pointer"
              title="لوحة الإدارة المشفرة / Admin Portal"
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
          <div className="flex items-center gap-2 pl-1">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#76FF03]"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Hero Welcome / Summary Strip */}
      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 mb-4 backdrop-blur-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-400">Welcome back, {user.name.split(' ')[0]}</div>
            <h1 className="text-lg font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans'] mt-0.5">
              My Loyalty Stamp Cards
            </h1>
          </div>

          <button
            onClick={onOpenDiscover}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors border border-zinc-700/60 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#76FF03]" />
            <span>Add Place</span>
          </button>
        </div>

        {/* Quick Notification if rewards are unlocked */}
        {readyRewards.length > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#76FF03] animate-ping" />
              <span className="font-bold text-[#76FF03]">
                {readyRewards.length} Reward{readyRewards.length > 1 ? 's' : ''} Ready to Claim!
              </span>
            </div>
            <button
              onClick={() => setActiveFilter('ready')}
              className="text-[11px] font-semibold text-zinc-300 hover:text-white underline"
            >
              View Free Rewards
            </button>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search restaurants, cafes, bakeries..."
          className="w-full pl-9 pr-4 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#76FF03] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Functional Segmented Filter Tabs (Conforms to Frontend Design Constitution Section 1.A) */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800/80 mb-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-zinc-800 text-[#76FF03] shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          All Cards ({restaurants.length})
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
          <span>Reward Ready ({readyRewards.length})</span>
        </button>
        <button
          onClick={() => setActiveFilter('cafes')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeFilter === 'cafes'
              ? 'bg-zinc-800 text-[#76FF03] shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Coffee & Tea
        </button>
        <button
          onClick={() => setActiveFilter('food')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeFilter === 'food'
              ? 'bg-zinc-800 text-[#76FF03] shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Restaurants
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
          <h3 className="text-sm font-bold text-white">No loyalty cards found</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            Try adjusting your search or join new restaurants nearby.
          </p>
          <button
            onClick={onOpenDiscover}
            className="mt-4 px-4 py-2 rounded-xl bg-[#76FF03] text-black font-bold text-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Discover Places to Join</span>
          </button>
        </div>
      )}
    </div>
  );
};
