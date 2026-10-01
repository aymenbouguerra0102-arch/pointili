import React, { useState } from 'react';
import { Restaurant } from '../types';
import {
  X,
  MapPin,
  Clock,
  Gift,
  Sparkles,
  Check,
  QrCode,
  Navigation,
  Phone,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Download,
  Camera,
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { getStoreQRInfo } from '../data/qrStoreDirectory';

interface CardDetailModalProps {
  restaurant: Restaurant | null;
  onClose: () => void;
  onScanStamp: (restaurant: Restaurant) => void;
  onRedeemReward: (restaurant: Restaurant) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  restaurant,
  onClose,
  onScanStamp,
  onRedeemReward,
}) => {
  const { t, language } = useLanguage();
  const [showEnlargedQR, setShowEnlargedQR] = useState(false);

  if (!restaurant) return null;

  const isRewardUnlocked = restaurant.stampsCount >= 6;
  const stampsRemaining = Math.max(0, 6 - restaurant.stampsCount);

  // Check if this store has an official QR code among the 10 registered stores
  const qrInfo = getStoreQRInfo(restaurant);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none font-['Plus_Jakarta_Sans']">
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 relative shadow-2xl overflow-y-auto max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Restaurant Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-3xl shadow-lg shrink-0">
            {restaurant.imageEmoji}
          </div>
          <div className="min-w-0 pr-6">
            <h2 className="text-base font-extrabold text-white truncate">{displayName}</h2>
            <p className="text-xs text-[#76FF03] font-semibold truncate">{displayCategory}</p>
            <p className="text-[11px] text-zinc-400 truncate">{restaurant.neighborhood}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-400 leading-relaxed mb-4">{displayDescription}</p>

        {/* EXACTLY 6 CIRCLES (DOTS) CARD PREVIEW */}
        <div className="p-4 rounded-2xl bg-black border border-zinc-800 mb-4">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-bold text-white">{t.stampsProgress}</span>
            <span className="font-mono text-[#76FF03] font-extrabold text-sm">
              {restaurant.stampsCount} / 6
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

        {/* ========================================================
            REQUIREMENT 1: DYNAMIC QR CODE DISPLAY OR COMING SOON
        ======================================================== */}
        <div className="mb-4">
          {qrInfo ? (
            /* ACTIVE QR CODE FOR ONE OF THE 10 REGISTERED STORES */
            <div className="p-4 rounded-2xl bg-zinc-900 border border-[#76FF03]/30 text-center relative overflow-hidden">
              {/* QR Header with SCAN ME Badge */}
              <div className="flex items-center justify-between text-[11px] font-bold text-[#76FF03] mb-2.5">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#76FF03]" />
                  <span>رمز QR المعتمد للمحل</span>
                </span>
                <span className="font-black text-[11px] bg-[#76FF03] text-black px-2.5 py-0.5 rounded-full shadow-sm tracking-wider uppercase flex items-center gap-1">
                  <QrCode className="w-3 h-3 stroke-[2.5]" />
                  <span>SCAN ME</span>
                </span>
              </div>

              {/* QR Image */}
              <div className="bg-white p-2.5 rounded-xl mx-auto w-40 h-40 shadow-lg relative flex items-center justify-center border-2 border-zinc-800">
                <img
                  src={qrInfo.qrImagePath}
                  alt={`QR Code ${qrInfo.name}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.src.includes(encodeURIComponent(qrInfo.name))) {
                      target.src = `/qr-codes/${encodeURIComponent(qrInfo.name)}.png`;
                    }
                  }}
                />
              </div>

              <div className="mt-2.5 text-xs font-bold text-white">
                {qrInfo.name}
              </div>
              <div className="text-[11px] text-zinc-400 font-mono mt-0.5" dir="ltr">
                {qrInfo.payload}
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#76FF03]/10 border border-[#76FF03]/30 text-[#76FF03]" dir="ltr">
                  كود حصري: {qrInfo.uniqueCode}
                </span>
              </div>

              {/* ACTION: فتح الكاميرا لمسح كود طاولة الكاشير */}
              <div className="mt-3.5">
                <button
                  type="button"
                  onClick={() => onScanStamp(restaurant)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] active:scale-95 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#76FF03]/25 cursor-pointer transition-all border border-[#76FF03]"
                  title="فتح كاميرا المسح لقراءة كود طاولة الكاشير"
                >
                  <Camera className="w-4 h-4 stroke-[2.5]" />
                  <span>فتح الكاميرا لمسح كود طاولة الكاشير</span>
                </button>
                <p className="text-[10px] text-zinc-400 text-center mt-1.5 font-medium">
                  لا يتم احتساب الختم إلا عند مسح رمز الـ QR المعتمد على طاولة كاشير المحل بالكاميرا
                </p>
              </div>
            </div>
          ) : (
            /* COMING SOON NOTICE FOR ALL OTHER RESTAURANTS */
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 text-center">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-500 mx-auto mb-2 flex items-center justify-center">
                <QrCode className="w-5 h-5 opacity-40" />
              </div>
              <div className="text-xs font-bold text-zinc-300">
                رمز الـ QR الخاص بهذا المحل لم يتم توليده بعد (قريباً)
              </div>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                ملصق الـ QR المعتمد لهذا المتجر قيد التجهيز من قبل فريق Pointili وسيتم إضافته قريباً في التحديث القادم.
              </p>
            </div>
          )}
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
              <span>{t.scanToEarn} ({restaurant.nameAr || restaurant.name})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
