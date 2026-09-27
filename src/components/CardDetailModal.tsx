import React from 'react';
import { Restaurant } from '../types';
import { X, MapPin, Clock, Gift, Sparkles, Check, QrCode, Navigation, Phone, ExternalLink } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

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
  const { t, language } = useLanguage();

  if (!restaurant) return null;

  const isRewardUnlocked = restaurant.stampsCount >= 6;
  const stampsRemaining = Math.max(0, 6 - restaurant.stampsCount);

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

  const displayDescription =
    language === 'ar'
      ? restaurant.descriptionAr || restaurant.description
      : language === 'fr'
      ? restaurant.descriptionFr || restaurant.description
      : restaurant.descriptionEn || restaurant.description;

  const displayRewardTitle =
    language === 'ar'
      ? restaurant.rewardTitleAr || restaurant.rewardTitle
      : language === 'fr'
      ? restaurant.rewardTitleFr || restaurant.rewardTitle
      : restaurant.rewardTitleEn || restaurant.rewardTitle;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-950 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 relative max-h-[92vh] overflow-y-auto shadow-2xl font-['Plus_Jakarta_Sans']">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#76FF03]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Controls */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#76FF03]" />
            <span>{restaurant.wilaya || 'ولاية برج بوعريريج (34)'}</span>
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Restaurant Visual Image Banner */}
        <div className="relative w-full h-40 rounded-2xl mb-4 overflow-hidden bg-zinc-900 border border-zinc-800">
          <img
            src={restaurant.imageUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Badges on image */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-black/80 backdrop-blur-md border border-zinc-700/80 flex items-center justify-center text-xl shadow-lg">
              {restaurant.imageEmoji}
            </span>
            <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-zinc-700/80 text-xs font-bold text-white">
              {displayCategory}
            </span>
          </div>

          {/* Google Maps Button on Image */}
          <a
            href={restaurant.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xl transition-transform hover:scale-105"
          >
            <Navigation className="w-3.5 h-3.5 fill-current" />
            <span>{t.viewOnMaps}</span>
          </a>

          {/* Bottom text inside banner */}
          <div className="absolute bottom-3 left-3 right-3">
            <h2 className="text-lg font-extrabold text-white tracking-tight drop-shadow-md">
              {displayName}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-zinc-300 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#76FF03] shrink-0" />
              <span>{restaurant.neighborhood || restaurant.address}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-300 leading-relaxed mb-4 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
          {displayDescription}
        </p>

        {/* 6 STAMPS DETAILED DISPLAY */}
        <div className="p-4 rounded-2xl bg-black border border-zinc-800 mb-4">
          <div className="flex items-center justify-between text-xs mb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{t.stampsProgress}</span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] font-mono text-[#76FF03] font-bold">
                {restaurant.stampsCount}/6
              </span>
            </div>
            <span className="text-xs text-zinc-400">
              {isRewardUnlocked ? (
                <span className="text-[#76FF03] font-bold animate-pulse">{t.rewardUnlocked}</span>
              ) : restaurant.stampsCount === 0 ? (
                <span className="text-zinc-500">0 أختام (لم يتم المسح بعد)</span>
              ) : (
                `باقي ${stampsRemaining} أختام للمكافأة`
              )}
            </span>
          </div>

          <div className="grid grid-cols-6 gap-2 sm:gap-2.5 py-1">
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
                      <span className="text-[11px] font-bold font-mono">
                        {isReward ? '🎁' : idx}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Free Reward Perk Box */}
        <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#76FF03]/10 border border-[#76FF03]/30 flex items-center justify-center shrink-0 text-[#76FF03]">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#76FF03] tracking-wider">
                {t.freeRewardAt6}
              </div>
              <div className="text-xs font-bold text-white mt-0.5">
                {displayRewardTitle}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1 leading-snug">
                {restaurant.rewardDescription}
              </div>
            </div>
          </div>
        </div>

        {/* Venue Information (Address, Hours, Google Maps Link) */}
        <div className="space-y-2 mb-5 text-xs text-zinc-400">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
            <span className="truncate">{restaurant.address}</span>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <Clock className="w-4 h-4 text-zinc-500 shrink-0" />
            <span>{restaurant.openingHours}</span>
          </div>

          {restaurant.phone && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
              <Phone className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="font-mono text-zinc-300">{restaurant.phone}</span>
            </div>
          )}

          {/* Full Google Maps Navigation Button */}
          <a
            href={restaurant.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-400 hover:text-white font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-blue-400" />
            <span>فتح الاتجاهات والموقع في Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {isRewardUnlocked ? (
            <button
              onClick={() => onRedeemReward(restaurant)}
              className="w-full py-3.5 px-4 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] active:scale-[0.98] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#76FF03]/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.claimReward}</span>
            </button>
          ) : (
            <button
              onClick={() => onScanStamp(restaurant)}
              className="w-full py-3.5 px-4 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] active:scale-[0.98] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#76FF03]/30 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>{t.scanToEarn}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
