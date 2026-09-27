import React from 'react';
import { Restaurant } from '../types';
import { X, MapPin, Clock, Gift, Sparkles, Check, QrCode, Plus, Share2 } from 'lucide-react';

interface CardDetailModalProps {
  restaurant: Restaurant | null;
  onClose: () => void;
  onScanStamp: (restaurant: Restaurant) => void;
  onRedeemReward: (restaurant: Restaurant) => void;
  onDirectAddStamp: (restaurantId: string) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  restaurant,
  onClose,
  onScanStamp,
  onRedeemReward,
  onDirectAddStamp,
}) => {
  if (!restaurant) return null;

  const isRewardUnlocked = restaurant.stampsCount >= 6;
  const stampsRemaining = Math.max(0, 6 - restaurant.stampsCount);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-950 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#76FF03]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Controls */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Loyalty Pass Details
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Restaurant Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-3xl shrink-0 shadow-inner">
            {restaurant.imageEmoji}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white tracking-tight truncate font-['Plus_Jakarta_Sans']">
              {restaurant.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
              <span>{restaurant.category}</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-300">{restaurant.distance}</span>
            </div>
          </div>
        </div>

        {/* 6 STAMPS DETAILED DISPLAY */}
        <div className="p-4 rounded-2xl bg-black border border-zinc-800 mb-4">
          <div className="flex items-center justify-between text-xs mb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Stamp Progress</span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-mono text-[#76FF03]">
                {restaurant.stampsCount}/6
              </span>
            </div>
            <span className="text-xs text-zinc-400">
              {isRewardUnlocked ? (
                <span className="text-[#76FF03] font-bold">Reward Ready!</span>
              ) : (
                `${stampsRemaining} more to go`
              )}
            </span>
          </div>

          <div className="grid grid-cols-6 gap-2 sm:gap-3 py-2">
            {[1, 2, 3, 4, 5, 6].map((idx) => {
              const isFilled = idx <= restaurant.stampsCount;
              const isReward = idx === 6;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-full aspect-square rounded-full flex items-center justify-center transition-all ${
                      isFilled
                        ? 'bg-[#76FF03] text-black font-bold shadow-md shadow-[#76FF03]/40'
                        : isReward
                        ? 'border-2 border-dashed border-[#76FF03] bg-[#76FF03]/10 text-[#76FF03]'
                        : 'border border-dashed border-zinc-700 bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    {isFilled ? (
                      isReward ? (
                        <Gift className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Check className="w-4 h-4 stroke-[3]" />
                      )
                    ) : (
                      <span className="text-xs font-mono font-bold">
                        {isReward ? '🎁' : idx}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 font-mono">
                    {idx === 6 ? 'Reward' : `Dot ${idx}`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quick test add stamp right in modal */}
          {!isRewardUnlocked && (
            <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-zinc-400">Testing this card?</span>
              <button
                onClick={() => onDirectAddStamp(restaurant.id)}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[#76FF03] font-medium text-[11px] flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Simulate 1 Stamp</span>
              </button>
            </div>
          )}
        </div>

        {/* Reward Status Banner */}
        {isRewardUnlocked ? (
          <div className="p-4 rounded-2xl bg-[#76FF03]/15 border-2 border-[#76FF03] mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-[#76FF03]" />
              <span className="text-xs font-extrabold text-[#76FF03] uppercase tracking-wider">
                Reward Unlocked! Free Meal/Drink
              </span>
            </div>
            <div className="text-sm font-bold text-white mb-2">
              {restaurant.rewardTitle}
            </div>
            <button
              onClick={() => onRedeemReward(restaurant)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-[#76FF03]/30 transition-all cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              <span>Redeem Reward Now</span>
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 mb-4">
            <div className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-[#76FF03]" />
              <span>Perk when you complete 6 stamps</span>
            </div>
            <p className="text-xs text-zinc-400">
              {restaurant.rewardTitle}
            </p>
          </div>
        )}

        {/* Member Perks List */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 mb-4">
          <div className="text-xs font-semibold text-zinc-300 mb-2">
            Active Member Perks:
          </div>
          <ul className="space-y-1.5 text-xs text-zinc-400">
            {restaurant.perks.map((perk, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#76FF03] shrink-0" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Location & Hours */}
        <div className="space-y-2 text-xs text-zinc-400 mb-5">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
            <span className="text-zinc-300">{restaurant.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-500 shrink-0" />
            <span>Open today: {restaurant.openingHours}</span>
          </div>
        </div>

        {/* Bottom Action */}
        <button
          onClick={() => {
            onClose();
            onScanStamp(restaurant);
          }}
          className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition-colors cursor-pointer"
        >
          <QrCode className="w-4 h-4 text-[#76FF03]" />
          <span>Scan Counter QR at {restaurant.name}</span>
        </button>
      </div>
    </div>
  );
};
