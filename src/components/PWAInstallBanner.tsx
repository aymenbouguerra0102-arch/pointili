import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, Share2, PlusSquare, ArrowUpRight } from 'lucide-react';

interface PWAInstallBannerProps {
  forceOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  forceOpenModal = false,
  onCloseModal,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isModalActive = forceOpenModal || showGuide;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (!res) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  const closeModal = () => {
    setShowGuide(false);
    if (onCloseModal) onCloseModal();
  };

  // If already installed or dismissed banner, don't show the floating bar
  // But if forceOpenModal is true, always show the modal!
  return (
    <>
      {/* 1. Subtle In-App Floating Install Trigger (if not running in standalone and not dismissed) */}
      {!isInstalled && !dismissed && !forceOpenModal && (
        <div className="mx-4 mb-3 p-3 rounded-2xl bg-zinc-900/95 border border-[#76FF03]/40 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3 min-w-0">
            {/* The Official Home Screen Icon from 2.png */}
            <img
              src="/icon.svg"
              alt="Pointili App Icon"
              className="w-10 h-10 rounded-xl shadow-md ring-1 ring-zinc-700 shrink-0 object-cover"
            />
            <div className="min-w-0">
              <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                <span>تثبيت في مكتب الهاتف</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#76FF03] animate-pulse" />
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                أضف Pointili إلى شاشة هاتفك الرئيسية
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] active:scale-[0.98] text-black font-extrabold text-[11px] flex items-center gap-1 shadow-md shadow-[#76FF03]/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تثبيت</span>
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Comprehensive Phone Home-Screen Installation Guide Modal */}
      {isModalActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 relative shadow-2xl text-center">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Official App Desktop Icon Preview (Image 2.png) */}
            <div className="mx-auto mb-4 relative w-24 h-24">
              <div className="absolute inset-0 bg-[#76FF03]/30 rounded-3xl blur-xl animate-pulse" />
              <img
                src="/icon.svg"
                alt="Pointili Home Screen App Icon"
                className="relative w-24 h-24 rounded-3xl shadow-2xl border-2 border-[#76FF03] object-cover mx-auto"
              />
              <div className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full bg-black border border-[#76FF03] text-[9px] font-mono text-[#76FF03] font-bold">
                APP ICON
              </div>
            </div>

            <h3 className="text-lg font-extrabold text-white font-['Plus_Jakarta_Sans']">
              شعار Pointili على مكتب الهاتف
            </h3>
            <p className="text-xs text-zinc-400 mt-1 mb-5">
              أيقونة التطبيق الرسمية للشاشة الرئيسية على هواتف Android و iPhone
            </p>

            {/* Platform Instructions */}
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-left text-xs space-y-3 mb-5">
              {isIOS ? (
                <>
                  <div className="font-bold text-[#76FF03] flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>طريقة التثبيت على أجهزة iPhone / iPad (Safari):</span>
                  </div>
                  <div className="flex items-start gap-2 text-zinc-300 text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-[#76FF03] font-bold flex items-center justify-center shrink-0">1</span>
                    <span>اضغط على زر المشاركة <Share2 className="w-3.5 h-3.5 inline text-blue-400 mx-1" /> أسفل متصفح Safari.</span>
                  </div>
                  <div className="flex items-start gap-2 text-zinc-300 text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-[#76FF03] font-bold flex items-center justify-center shrink-0">2</span>
                    <span>اختر <PlusSquare className="w-3.5 h-3.5 inline text-zinc-200 mx-1" /> <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2 text-zinc-300 text-[11px]">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-[#76FF03] font-bold flex items-center justify-center shrink-0">3</span>
                    <span>اضغط <strong>"إضافة" (Add)</strong> وسيظهر الشعار فوراً في مكتب الهاتف.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="font-bold text-[#76FF03] flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>طريقة التثبيت على أجهزة Android & Chrome:</span>
                  </div>
                  {isInstallable ? (
                    <button
                      onClick={async () => {
                        await install();
                        closeModal();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#76FF03] text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-[#8aff24] transition-all cursor-pointer shadow-md shadow-[#76FF03]/20"
                    >
                      <Download className="w-4 h-4" />
                      <span>تثبيت التطبيق بنقرة واحدة الآن</span>
                    </button>
                  ) : (
                    <div className="space-y-2 text-zinc-300 text-[11px]">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-zinc-800 text-[#76FF03] font-bold flex items-center justify-center shrink-0">1</span>
                        <span>اضغط على النقاط الثلاث ⋮ في أعلى يمين المتصفح.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-zinc-800 text-[#76FF03] font-bold flex items-center justify-center shrink-0">2</span>
                        <span>اختر <strong>"تثبيت التطبيق" (Install App)</strong> أو <strong>"الإضافة إلى الشاشة الرئيسية"</strong>.</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Done button */}
            <button
              onClick={closeModal}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              تم / إغلاق
            </button>
          </div>
        </div>
      )}
    </>
  );
};
