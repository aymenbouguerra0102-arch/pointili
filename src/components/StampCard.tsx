import React from 'react';
import { Restaurant } from '../types';
import { Gift, Sparkles, MapPin, Check, QrCode, ChevronRight, ExternalLink, Navigation } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

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
  const { t, language } = useLanguage();
  const isRewardUnlocked = restaurant.stampsCount >= 6;
  const stampsRemaining = Math.max(0, 6 - restaurant.stampsCount);

  // Localized restaurant metadata
  const displayName =
    language === 'ar'
      ? restaurant.nameAr || restaurant.name
      : language === 'fr'
      ? restaurant.nameFr || restaurant.name
      : restaurant.nameEn || restaurant.name;

  const displayCategory =
    language === 'ar'
      ? restaurant.categoryAr || restaurant.category
      : language === 'fr'
      ? restaurant.categoryFr || restaurant.category
      : restaurant.categoryEn || restaurant.category;

  const displayRewardTitle =
    language === 'ar'
      ? restaurant.rewardTitleAr || restaurant.rewardTitle
      : language === 'fr'
      ? restaurant.rewardTitleFr || restaurant.rewardTitle
      : restaurant.rewardTitleEn || restaurant.rewardTitle;

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

      {/* Restaurant Visual Image Banner */}
      <div className="relative w-full h-32 rounded-xl mb-3.5 overflow-hidden bg-zinc-950 border border-zinc-800">
        <img
          src={restaurant.imageUrl}
          alt={displayName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Emoji Badge & Category Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="w-8 h-8 rounded-xl bg-black/75 backdrop-blur-md border border-zinc-700/80 flex items-center justify-center text-lg shadow-md">
            {restaurant.imageEmoji}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-zinc-700/60 text-[11px] font-bold text-white shadow-sm">
            {displayCategory}
          </span>
        </div>

        {/* Direct Google Maps Link Overlay Button */}
        <a
          href={restaurant.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white text-[11px] font-bold flex items-center gap-1 backdrop-blur-md shadow-lg transition-transform hover:scale-105 cursor-pointer"
          title={t.viewOnMaps}
        >
          <Navigation className="w-3 h-3 fill-current" />
          <span>Maps</span>
        </a>

        {/* Location & Neighborhood Tag inside image bottom */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-zinc-300">
          <div className="flex items-center gap-1 font-semibold text-white truncate drop-shadow-md">
            <MapPin className="w-3.5 h-3.5 text-[#76FF03] shrink-0" />
            <span className="truncate">{restaurant.neighborhood || 'برج بوعريريج'}</span>
          </div>
          <span className="text-[11px] text-zinc-300 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm shrink-0">
            {restaurant.distance}
          </span>
        </div>
      </div>

      {/* Card Header (Title & Details) */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-base font-extrabold text-white tracking-tight truncate group-hover:text-[#76FF03] transition-colors font-['Plus_Jakarta_Sans']">
            {displayName}
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
            {restaurant.address}
          </p>
        </div>

        <div className="p-1 rounded-lg text-zinc-500 group-hover:text-white transition-colors shrink-0">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>

      {/* EXACTLY 6 CIRCLES (DOTS) LOYALTY CARD AREA */}
      <div className="bg-black/70 rounded-xl p-3.5 border border-zinc-800/80 mb-3.5">
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-zinc-200">Pointili Card</span>
            <span className="text-zinc-600">·</span>
            <span className="font-mono text-[#76FF03] font-bold">
              {restaurant.stampsCount}/6
            </span>
          </div>

          <div className="text-[11px] font-medium text-zinc-400">
            {isRewardUnlocked ? (
              <span className="text-[#76FF03] font-bold flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                {t.rewardUnlocked}
              </span>
            ) : restaurant.stampsCount === 0 ? (
              <span className="text-zinc-400 font-medium">0 / 6 (ابدأ بالمسح)</span>
            ) : (
              <span>باقي {stampsRemaining} أختام للمكافأة</span>
            )}
          </div>
        </div>

        {/* THE 6 DOTS (STAMPS) GRID */}
        <div className="grid grid-cols-6 gap-2 sm:gap-2.5 py-1">
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
                      ? 'border-2 border-dashed border-[#76FF03]/70 bg-[#76FF03]/10 text-[#76FF03]'
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
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WHEN ALL 6 CIRCLES ARE FILLED: CLEAR REWARD BADGE / ALERT */}
      {isRewardUnlocked ? (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#76FF03]/15 border border-[#76FF03] text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#76FF03] text-black flex items-center justify-center shrink-0 shadow-sm shadow-[#76FF03]/50">
                <Gift className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#76FF03] tracking-wide uppercase">
                  {t.rewardUnlocked}
                </div>
                <div className="text-xs text-zinc-200 truncate font-semibold">
                  {displayRewardTitle}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRedeem(restaurant);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] active:scale-[0.98] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#76FF03]/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t.claimReward}</span>
          </button>
        </div>
      ) : (
        /* Progress info & Google Maps / Scan QR Button Actions */
        <div className="flex items-center justify-between pt-1 gap-2">
          {/* External Google Maps Button */}
          <a
            href={restaurant.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors border border-zinc-700/60 shrink-0 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>{t.viewOnMaps}</span>
          </a>

          {/* Scan QR Stamp */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickScan(restaurant);
            }}
            className="py-1.5 px-3 rounded-lg bg-[#76FF03] hover:bg-[#8aff24] text-xs font-extrabold text-black flex items-center gap-1.5 transition-all shadow-sm shadow-[#76FF03]/20 shrink-0 cursor-pointer active:scale-95"
          >
            <QrCode className="w-3.5 h-3.5 text-black" />
            <span>{t.scanToEarn}</span>
          </button>
        </div>
      )}
    </div>
  );
};
