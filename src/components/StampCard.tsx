import React from 'react';
import { Restaurant } from '../types';
import { Gift, Sparkles, MapPin, Check, QrCode, ChevronRight } from 'lucide-react';
import { PointiliLogo } from './PointiliLogo';

interface StampCardProps {
  restaurant: Restaurant;
  onSelect: (restaurant: Restaurant) => void;
  onRedeem: (restaurant: Restaurant) => void;
  onQuickScan: (restaurant: Restaurant) => void;
}

export const StampCard: React.FC<StampCardProps> = ({
  restaurant,
  onSelect,
  onRedeem,
  onQuickScan,
}) => {
  const isRewardUnlocked = restaurant.stampsCount >= 6;
  const stampsRemaining = Math.max(0, 6 - restaurant.stampsCount);

  return (
    <div
      onClick={() => onSelect(restaurant)}
      className={`group relative rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer overflow-hidden ${
        isRewardUnlocked
          ? 'bg-gradient-to-b from-zinc-900 to-black border-2 border-[#76FF03] shadow-xl shadow-[#76FF03]/15'
          : 'bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 shadow-md'
      }`}
    >
      {/* Top Background subtle glow if reward unlocked */}
      {isRewardUnlocked && (
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#76FF03]/20 rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Restaurant Avatar / Icon */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 bg-zinc-800 border border-zinc-700/80 shadow-inner"
            style={{ borderColor: isRewardUnlocked ? '#76FF03' : undefined }}
          >
            <span>{restaurant.imageEmoji}</span>
          </div>

          {/* Name & Clean Unboxed Metadata */}
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white tracking-tight truncate group-hover:text-[#76FF03] transition-colors font-['Plus_Jakarta_Sans']">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5 truncate">
              <span>{restaurant.category}</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="flex items-center gap-0.5 shrink-0">
                <MapPin className="w-3 h-3 text-zinc-500" />
                {restaurant.distance}
              </span>
            </div>
          </div>
        </div>

        {/* View Details Chevron */}
        <div className="p-1 rounded-lg text-zinc-500 group-hover:text-white transition-colors">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>

      {/* EXACTLY 6 CIRCLES (DOTS) LOYALTY CARD AREA */}
      <div className="bg-black/60 rounded-xl p-3.5 border border-zinc-800/80 mb-3.5">
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-zinc-300">Pointili Card</span>
            <span className="text-zinc-600">·</span>
            <span className="font-mono text-zinc-400">
              {restaurant.stampsCount}/6 Completed
            </span>
          </div>

          <div className="text-[11px] font-medium text-zinc-400">
            {isRewardUnlocked ? (
              <span className="text-[#76FF03] font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Ready to Claim
              </span>
            ) : (
              <span>{stampsRemaining} more stamp{stampsRemaining === 1 ? '' : 's'} needed</span>
            )}
          </div>
        </div>

        {/* THE 6 DOTS (STAMPS) GRID */}
        <div className="grid grid-cols-6 gap-2 sm:gap-3 py-1">
          {[1, 2, 3, 4, 5, 6].map((index) => {
            const isFilled = index <= restaurant.stampsCount;
            const isLastDot = index === 6;

            return (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-full aspect-square rounded-full flex items-center justify-center relative transition-all duration-300 ${
                    isFilled
                      ? 'bg-[#76FF03] text-black shadow-md shadow-[#76FF03]/40 scale-100 ring-2 ring-[#76FF03]/30'
                      : isLastDot
                      ? 'border-2 border-dashed border-[#76FF03]/60 bg-[#76FF03]/5 text-[#76FF03]'
                      : 'border-2 border-dashed border-zinc-700 bg-zinc-950 text-zinc-500'
                  }`}
                >
                  {isFilled ? (
                    <div className="flex items-center justify-center w-full h-full">
                      {isLastDot ? (
                        <Gift className="w-4 h-4 text-black stroke-[2.5]" />
                      ) : (
                        <Check className="w-4 h-4 text-black stroke-[3]" />
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] font-bold font-mono">
                      {isLastDot ? '🎁' : index}
                    </span>
                  )}

                  {/* Stamp number micro badge */}
                  <span className="sr-only">Dot {index} {isFilled ? 'filled' : 'empty'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WHEN ALL 6 CIRCLES ARE FILLED: CLEAR REWARD BADGE / ALERT */}
      {isRewardUnlocked ? (
        <div className="space-y-2.5">
          {/* The required clear reward badge/alert */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#76FF03]/15 border border-[#76FF03] text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#76FF03] text-black flex items-center justify-center shrink-0 shadow-sm shadow-[#76FF03]/50">
                <Gift className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#76FF03] tracking-wide uppercase">
                  Reward Unlocked! Free Meal/Drink
                </div>
                <div className="text-xs text-zinc-200 truncate font-medium">
                  {restaurant.rewardTitle}
                </div>
              </div>
            </div>
          </div>

          {/* Action button to redeem */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRedeem(restaurant);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] active:scale-[0.98] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#76FF03]/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Redeem Free Reward Now</span>
          </button>
        </div>
      ) : (
        /* Progress & Quick Scan Action */
        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-zinc-400">
            <span className="text-zinc-200 font-medium">Perk at 6:</span> {restaurant.rewardTitle.slice(0, 32)}...
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickScan(restaurant);
            }}
            className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-[#76FF03] flex items-center gap-1.5 transition-colors border border-zinc-700/60 shrink-0 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan Stamp</span>
          </button>
        </div>
      )}
    </div>
  );
};
