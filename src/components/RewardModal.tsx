import React, { useState, useEffect } from 'react';
import { Restaurant } from '../types';
import { X, Gift, Check, Clock, Sparkles, ShieldCheck, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RewardModalProps {
  restaurant: Restaurant | null;
  onClose: () => void;
  onConfirmRedemption: (restaurantId: string) => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  restaurant,
  onClose,
  onConfirmRedemption,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300); // 5 mins
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);
  const [redeemedSuccess, setRedeemedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!restaurant) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [restaurant]);

  if (!restaurant) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const handleRedeem = () => {
    setIsRedeeming(true);
    setTimeout(() => {
      setIsRedeeming(false);
      setRedeemedSuccess(true);
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#76FF03', '#FFFFFF', '#000000'],
      });
      setTimeout(() => {
        onConfirmRedemption(restaurant.id);
        onClose();
      }, 1500);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-950 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        {/* Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#76FF03]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {redeemedSuccess ? (
          <div className="py-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-[#76FF03] text-black flex items-center justify-center mx-auto mb-4 shadow-xl shadow-[#76FF03]/40">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Reward Claimed!</h3>
            <p className="text-sm text-zinc-400 mt-1 max-w-xs mx-auto">
              Your voucher for {restaurant.name} was successfully redeemed. Enjoy your free treat!
            </p>
            <div className="mt-4 text-xs font-mono text-[#76FF03]">
              Starting a brand new stamp card for your next reward!
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xl shrink-0">
                {restaurant.imageEmoji}
              </div>
              <div className="min-w-0">
                <span className="text-xs text-zinc-400 font-medium">Redeem Loyalty Reward</span>
                <h3 className="text-base font-bold text-white truncate font-['Plus_Jakarta_Sans']">
                  {restaurant.name}
                </h3>
              </div>
            </div>

            {/* Reward Card Highlight */}
            <div className="p-4 rounded-2xl bg-[#76FF03]/10 border-2 border-[#76FF03] mb-4 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#76FF03] text-black font-extrabold text-[10px] uppercase tracking-wider">
                  6 STAMPS COMPLETE
                </span>
                <span className="text-xs font-mono text-[#76FF03] flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  {timeFormatted}
                </span>
              </div>

              <div className="text-base font-extrabold text-white">
                {restaurant.rewardTitle}
              </div>
              <p className="text-xs text-zinc-300 mt-1">
                {restaurant.rewardDescription}
              </p>
            </div>

            {/* Cashier Voucher Code & Barcode */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-center mb-5">
              <div className="text-[11px] text-zinc-400 uppercase tracking-wider mb-1">
                Show to Cashier / Server
              </div>
              <div className="font-mono text-2xl font-black text-[#76FF03] tracking-widest my-1">
                PTL-{restaurant.id.slice(-4).toUpperCase()}-2026
              </div>

              {/* Barcode visual */}
              <div className="flex items-center justify-center gap-1 h-10 my-3 px-4 bg-white/90 rounded-lg">
                {[4, 2, 6, 2, 5, 3, 2, 7, 2, 4, 3, 6, 2, 5, 2, 4, 7, 2, 3].map((w, idx) => (
                  <div
                    key={idx}
                    className="bg-black h-7"
                    style={{ width: `${w * 2}px` }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#76FF03]" />
                <span>Verified Instant Digital Voucher</span>
              </div>
            </div>

            {/* Cashier Confirmation Action */}
            <button
              onClick={handleRedeem}
              disabled={isRedeeming}
              className="w-full py-3.5 px-4 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] active:scale-[0.98] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#76FF03]/25 transition-all cursor-pointer"
            >
              {isRedeeming ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Redeeming Reward...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Cashier Verified · Claim Reward</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-zinc-500 text-center mt-3">
              Only press when the cashier or barista confirms your order. This will reset the card to 0 stamps for your next cycle.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
