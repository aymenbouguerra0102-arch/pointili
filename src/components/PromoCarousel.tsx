import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Gift,
  Plus,
  ShieldCheck,
  MapPin,
  Flame,
  ArrowRight,
  ExternalLink,
  Award,
  Store,
  QrCode,
} from 'lucide-react';
import { Restaurant } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface PromoSlide {
  id: string;
  badge: string;
  badgeIcon: React.ReactNode;
  badgeColor: string;
  title: string;
  titleHighlight?: string;
  description: string;
  actionText: string;
  actionIcon?: React.ReactNode;
  gradientBg: string;
  borderColor: string;
  glowColor: string;
  floatingEmojis: string[];
  onAction: () => void;
}

interface PromoCarouselProps {
  restaurants: Restaurant[];
  readyRewardsCount: number;
  onOpenDiscover: () => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onFilterChange: (filter: 'all' | 'ready' | 'cafes' | 'food') => void;
}

export const PromoCarousel: React.FC<PromoCarouselProps> = ({
  restaurants,
  readyRewardsCount,
  onOpenDiscover,
  onSelectRestaurant,
  onFilterChange,
}) => {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  const topRestaurant = restaurants[0];

  // Define dynamic slides
  const slides: PromoSlide[] = [
    {
      id: 'bba_rewards',
      badge: 'ولاية برج بوعريريج (34)',
      badgeIcon: <MapPin className="w-3 h-3 text-[#76FF03]" />,
      badgeColor: 'bg-[#76FF03]/15 text-[#76FF03] border-[#76FF03]/30',
      title: 'بطاقات ولاء مطاعم برج بوعريريج',
      titleHighlight: '6 أختام = هدية مجانية',
      description: 'امسح كود QR عند الكاشير في كل زيارة، اجمع الأختام واحصل على وجبتك أو مشروبك مجاناً.',
      actionText: readyRewardsCount > 0 ? `استبدال ${readyRewardsCount} جوائز جاهزة 🎁` : 'عرض جميع المطاعم الشريكة',
      actionIcon: readyRewardsCount > 0 ? <Gift className="w-3.5 h-3.5 text-black" /> : <Flame className="w-3.5 h-3.5 text-black" />,
      gradientBg: 'from-zinc-950 via-zinc-900 to-black',
      borderColor: 'border-[#76FF03]/40',
      glowColor: 'bg-[#76FF03]/15',
      floatingEmojis: ['🍔', '☕', '🍕', '🍰'],
      onAction: () => {
        if (readyRewardsCount > 0) {
          onFilterChange('ready');
        } else {
          onFilterChange('all');
        }
      },
    },
    {
      id: 'discover_venues',
      badge: 'جديد المطاعم والكافيهات',
      badgeIcon: <Store className="w-3 h-3 text-cyan-400" />,
      badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      title: 'استكشف أشهر 10 مطاعم في البرج',
      titleHighlight: 'انضم لبطاقات جديدة',
      description: 'برغر هاوس 34، كافيه إسبانيا، ميلانو بيتزا، تيراميسو والمزيد من أماكن ولاية 34.',
      actionText: '+ استكشاف وإضافة أماكن جديدة',
      actionIcon: <Plus className="w-3.5 h-3.5 text-black" />,
      gradientBg: 'from-slate-950 via-zinc-900 to-cyan-950/40',
      borderColor: 'border-cyan-500/40',
      glowColor: 'bg-cyan-500/15',
      floatingEmojis: ['📍', '✨', '🌮', '🥤'],
      onAction: () => onOpenDiscover(),
    },
    {
      id: 'privacy_security',
      badge: 'أمان وخصوصية 100%',
      badgeIcon: <ShieldCheck className="w-3 h-3 text-emerald-400" />,
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      title: 'نظام تشفير خاص يحمي هويتك',
      titleHighlight: 'بدون بريد أو كلمات مرور',
      description: 'لا نشارك أي بيانات شخصية لك. تعاملك يتم برقم زبون مشفر يحفظ جميع أختامك بأمان.',
      actionText: 'مسح كود طاولة الكاشير بأمان',
      actionIcon: <QrCode className="w-3.5 h-3.5 text-black" />,
      gradientBg: 'from-zinc-950 via-zinc-900 to-emerald-950/40',
      borderColor: 'border-emerald-500/40',
      glowColor: 'bg-emerald-500/15',
      floatingEmojis: ['🛡️', '⚡', '🔒', '🎫'],
      onAction: () => {
        if (topRestaurant) {
          onSelectRestaurant(topRestaurant);
        }
      },
    },
    {
      id: 'exclusive_offers',
      badge: 'كافيهات ومقاهي BBA',
      badgeIcon: <Award className="w-3 h-3 text-amber-400" />,
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      title: 'عشاق القهوة والمشروبات المنعشة',
      titleHighlight: 'مشروبك السابع مجاناً',
      description: 'استمتع بأشهى أصناف القهوة الإيطالية والحلويات الفاخرة مع كل زيارة لكافيهات البرج.',
      actionText: 'تصفح قائمة الكافيهات (Cafés)',
      actionIcon: <ArrowRight className="w-3.5 h-3.5 text-black" />,
      gradientBg: 'from-stone-950 via-zinc-900 to-amber-950/40',
      borderColor: 'border-amber-500/40',
      glowColor: 'bg-amber-500/15',
      floatingEmojis: ['☕', '🥐', '🍪', '🧇'],
      onAction: () => onFilterChange('cafes'),
    },
  ];

  // Auto-advance slider
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4800);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Touch Swipe Handlers (Mobile Friendly)
  const minSwipeDistance = 45;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsPaused(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    setIsPaused(false);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // In RTL (Arabic), swiping left means next, right means prev
    if (language === 'ar') {
      if (isLeftSwipe) handleNext();
      if (isRightSwipe) handlePrev();
    } else {
      if (isLeftSwipe) handleNext();
      if (isRightSwipe) handlePrev();
    }
  };

  // Mouse Drag Handlers (Desktop Friendly)
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setIsPaused(true);
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    setIsPaused(false);
    const distance = dragStartX - e.clientX;
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  return (
    <div
      className="relative w-full mb-3.5 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        setIsDragging(false);
      }}
    >
      {/* Carousel Container */}
      <div
        className="relative overflow-hidden rounded-3xl cursor-grab active:cursor-grabbing shadow-xl"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(${language === 'ar' ? currentIndex * 100 : -currentIndex * 100}%)`,
          }}
        >
          {slides.map((slide, index) => {
            const isActive = index === currentIndex;

            return (
              <div
                key={slide.id}
                className="w-full shrink-0 relative"
                aria-hidden={!isActive}
              >
                <div
                  className={`p-4 sm:p-5 rounded-3xl bg-gradient-to-br ${slide.gradientBg} border ${slide.borderColor} relative overflow-hidden backdrop-blur-md transition-all duration-300`}
                >
                  {/* Glowing Ambient Light */}
                  <div
                    className={`absolute -top-16 -right-16 w-36 h-36 ${slide.glowColor} rounded-full blur-3xl pointer-events-none transition-all duration-500`}
                  />
                  <div
                    className={`absolute -bottom-16 -left-16 w-36 h-36 ${slide.glowColor} rounded-full blur-3xl pointer-events-none transition-all duration-500`}
                  />

                  {/* Floating Emojis background accent */}
                  <div className="absolute top-2 left-3 flex gap-1 opacity-20 pointer-events-none text-base">
                    {slide.floatingEmojis.map((emoji, i) => (
                      <span key={i} className="animate-pulse" style={{ animationDelay: `${i * 300}ms` }}>
                        {emoji}
                      </span>
                    ))}
                  </div>

                  {/* Header Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2 relative z-10">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold shadow-sm ${slide.badgeColor}`}
                    >
                      {slide.badgeIcon}
                      <span>{slide.badge}</span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-black/40 px-2 py-0.5 rounded-full border border-zinc-800">
                      <span>{currentIndex + 1}</span>
                      <span>/</span>
                      <span>{slides.length}</span>
                    </div>
                  </div>

                  {/* Slide Title & Highlights */}
                  <div className="relative z-10 mb-2">
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
                      {slide.title}
                    </h2>
                    {slide.titleHighlight && (
                      <div className="text-xs sm:text-sm font-extrabold text-[#76FF03] flex items-center gap-1 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#76FF03] shrink-0" />
                        <span>{slide.titleHighlight}</span>
                      </div>
                    )}
                    <p className="text-[11px] text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
                      {slide.description}
                    </p>
                  </div>

                  {/* Bottom Action Button (Interactive) */}
                  <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        slide.onAction();
                      }}
                      className="py-2 px-3.5 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] active:scale-95 text-black font-black text-xs inline-flex items-center gap-1.5 shadow-md shadow-[#76FF03]/25 transition-all cursor-pointer border border-[#76FF03]"
                    >
                      {slide.actionIcon}
                      <span>{slide.actionText}</span>
                    </button>

                    <span className="text-[10px] text-zinc-400 font-medium">
                      اسحب للتالي ‹›
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Navigation Arrows */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          aria-label="Previous Slide"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border border-white/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer backdrop-blur-md shadow-lg z-20"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          aria-label="Next Slide"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border border-white/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer backdrop-blur-md shadow-lg z-20"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Pagination Dot Indicators (Clickable) */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        {slides.map((s, idx) => {
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                isCurrent
                  ? 'w-6 bg-[#76FF03] shadow-sm shadow-[#76FF03]/50'
                  : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
              }`}
              title={`انتقال للإعلان ${idx + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
};
