import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WelcomeModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ forceOpen, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Listen for custom trigger event
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('pointili:open-welcome-modal', handleOpen);

    if (forceOpen) {
      setIsOpen(true);
      return () => window.removeEventListener('pointili:open-welcome-modal', handleOpen);
    }

    try {
      const hasVisited = localStorage.getItem('pointili_first_time_visited');
      if (!hasVisited) {
        // First time visitor: show modal after a slight smooth mount delay
        const timer = setTimeout(() => {
          setIsOpen(true);
          // Play subtle festive celebration
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.5 },
            colors: ['#22c55e', '#76FF03', '#ffffff'],
          });
        }, 300);
        return () => {
          clearTimeout(timer);
          window.removeEventListener('pointili:open-welcome-modal', handleOpen);
        };
      }
    } catch {}

    return () => window.removeEventListener('pointili:open-welcome-modal', handleOpen);
  }, [forceOpen]);

  const dismissWelcomeModal = () => {
    setIsOpen(false);
    try {
      localStorage.setItem('pointili_first_time_visited', 'true');
    } catch {}
    if (onClose) onClose();
  };

  // Expose to window for inline onclick handler compatibility
  useEffect(() => {
    (window as any).dismissWelcomeModal = dismissWelcomeModal;
  }, []);

  if (!isOpen) return null;

  return (
    <div
      id="welcomeModal"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none font-['Plus_Jakarta_Sans'] animate-in fade-in duration-200"
      onClick={dismissWelcomeModal}
    >
      <div
        className="welcome-card relative bg-[#1a1a1a] border border-[#333] rounded-[24px] p-7 text-center max-w-[340px] w-[90%] shadow-[0_10px_35px_rgba(0,0,0,0.7)] animate-in zoom-in-95 duration-250"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glowing Ambient Light */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#22c55e]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Big Festive Icon */}
        <div className="welcome-icon text-5xl mb-3.5 select-none animate-bounce">
          🎉
        </div>

        {/* Welcome Title */}
        <h2 className="text-[#22c55e] text-xl font-black mb-2.5 tracking-tight flex items-center justify-center gap-1.5">
          <span>مرحباً بك في Pointili!</span>
        </h2>

        {/* Subtitle / Description */}
        <p className="text-zinc-300 text-xs sm:text-[13px] leading-relaxed mb-5 font-medium">
          تطبيقك الذكي لنظام ولاء مطاعم برج بوعريريج والمنصورة. اجمع أختامك بكل سهولة وتابع عروضك الحصرية بثقة وأمان.
        </p>

        {/* Quick Highlights Pill */}
        <div className="grid grid-cols-2 gap-2 mb-5 text-[11px] text-zinc-400 bg-black/40 p-2.5 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-1.5 justify-center">
            <span className="text-[#22c55e] font-bold">✓</span>
            <span>أختام مجانية</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center">
            <span className="text-[#22c55e] font-bold">✓</span>
            <span>خصوصية 100%</span>
          </div>
        </div>

        {/* Call to Action Button */}
        <button
          type="button"
          onClick={dismissWelcomeModal}
          className="welcome-btn w-full py-3 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#22c55e]/25 active:scale-95 transition-all cursor-pointer border border-[#22c55e]"
        >
          <span>بدء الاستخدام</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
