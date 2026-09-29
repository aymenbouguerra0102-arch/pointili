import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Restaurant, UserProfile, StampRequest } from '../types';
import {
  Flashlight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ArrowRight,
  Gift,
  ImageIcon,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldCheck,
  Store,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import jsQR from 'jsqr';
import { Html5Qrcode } from 'html5-qrcode';
import { useLanguage } from '../i18n/LanguageContext';
import {
  createStampRequest,
  getStampRequests,
} from '../data/stampRequestsManager';

interface QRScannerTabProps {
  restaurants: Restaurant[];
  currentUser?: UserProfile | null;
  onAddStamp: (restaurantId: string) => {
    success: boolean;
    restaurant?: Restaurant;
    newCount: number;
    rewardUnlocked: boolean;
  };
  onNavigateToCards: () => void;
  preSelectedRestaurant?: Restaurant | null;
}

// Synthesize pleasant chime on successful scan using Web Audio API
function playScanChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.18);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.1); // A5
    gain2.gain.setValueAtTime(0.25, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.35);
  } catch {}
}

export const QRScannerTab: React.FC<QRScannerTabProps> = ({
  restaurants,
  currentUser,
  onAddStamp,
  onNavigateToCards,
}) => {
  const { t, language } = useLanguage();

  // State: Direct Camera Access on Mount
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState<boolean>(false);

  // Manual fallback toggle
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [manualCodeInput, setManualCodeInput] = useState<string>('');
  const [manualCodeError, setManualCodeError] = useState<string | null>(null);

  // Unrecognized QR warning
  const [unrecognizedCode, setUnrecognizedCode] = useState<string | null>(null);

  // ANTI-FRAUD PENDING REQUEST STATE
  const [activeRequest, setActiveRequest] = useState<StampRequest | null>(null);
  const [requestResolvedState, setRequestResolvedState] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [newStampCount, setNewStampCount] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastScanTimestampRef = useRef<number>(0);
  const isHandlingScanRef = useRef<boolean>(false);

  // Parse raw QR code string to find matching BBA restaurant
  const findMatchingRestaurant = useCallback(
    (scannedText: string): Restaurant | null => {
      if (!scannedText) return null;
      const clean = scannedText.trim();
      const lower = clean.toLowerCase();

      // 1. Direct secret code match (exact or case-insensitive)
      let matched = restaurants.find(
        (r) =>
          r.qrSecretCode === clean ||
          r.qrSecretCode.toLowerCase() === lower ||
          r.id.toLowerCase() === lower
      );
      if (matched) return matched;

      // 2. Check if URL contains code or id as param
      try {
        if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('pointili://')) {
          const url = new URL(clean.replace('pointili://', 'https://pointili.app/'));
          const paramCode =
            url.searchParams.get('code') ||
            url.searchParams.get('id') ||
            url.searchParams.get('venue') ||
            url.searchParams.get('secret');

          if (paramCode) {
            matched = restaurants.find(
              (r) =>
                r.qrSecretCode.toLowerCase() === paramCode.toLowerCase() ||
                r.id.toLowerCase() === paramCode.toLowerCase()
            );
            if (matched) return matched;
          }

          // Path segment match: /stamp/bba_...
          const segments = url.pathname.split('/').filter(Boolean);
          for (const seg of segments) {
            matched = restaurants.find(
              (r) =>
                r.id.toLowerCase() === seg.toLowerCase() ||
                r.qrSecretCode.toLowerCase() === seg.toLowerCase()
            );
            if (matched) return matched;
          }
        }
      } catch {}

      // 3. JSON formatted QR payload
      try {
        if (clean.startsWith('{') && clean.endsWith('}')) {
          const parsed = JSON.parse(clean);
          const targetId = parsed.id || parsed.restaurantId || parsed.secret || parsed.code;
          if (targetId) {
            matched = restaurants.find(
              (r) =>
                r.id.toLowerCase() === String(targetId).toLowerCase() ||
                r.qrSecretCode.toLowerCase() === String(targetId).toLowerCase()
            );
            if (matched) return matched;
          }
        }
      } catch {}

      // 4. Fuzzy restaurant name match (e.g. "Le Mirage", "El Bey")
      matched = restaurants.find((r) => {
        const nameEn = r.name.toLowerCase();
        const nameAr = (r.nameAr || '').toLowerCase();
        return lower === nameEn || (nameAr && lower === nameAr);
      });

      return matched || null;
    },
    [restaurants]
  );

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  }, []);

  // Requirement 2: Generates a Pending Stamp Request (Anti-Fraud)
  const handleInitiateStampRequest = useCallback(
    (target: Restaurant) => {
      if (isHandlingScanRef.current) return;
      isHandlingScanRef.current = true;

      playScanChime();
      navigator.vibrate?.([80, 50, 80]);

      // Create secure pending request
      const req = createStampRequest({
        restaurant: target,
        userId: currentUser?.id || 'usr_anonymous',
        userEmail: currentUser?.email || 'customer@gmail.com',
        userName: currentUser?.name || 'زبون Pointili',
        userAvatar:
          currentUser?.avatarUrl ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      });

      setActiveRequest(req);
      setRequestResolvedState('pending');
      stopCamera();
    },
    [currentUser, stopCamera]
  );

  // Live polling & event listener for merchant's Accept/Reject action
  useEffect(() => {
    if (!activeRequest) return;

    const checkRequestStatus = () => {
      const all = getStampRequests();
      const current = all.find((r) => r.id === activeRequest.id);

      if (current && current.status !== 'pending') {
        if (current.status === 'accepted' && requestResolvedState === 'pending') {
          // Merchant approved! Actually add stamp to card
          setRequestResolvedState('accepted');
          const result = onAddStamp(current.restaurantId);
          setNewStampCount(result.newCount);

          playScanChime();
          navigator.vibrate?.([100, 50, 100]);

          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#76FF03', '#FFFFFF', '#00E5FF'],
          });

          // Auto-redirect to dashboard after celebration
          setTimeout(() => {
            onNavigateToCards();
          }, 2200);
        } else if (current.status === 'rejected' && requestResolvedState === 'pending') {
          setRequestResolvedState('rejected');
          navigator.vibrate?.([200, 100, 200]);
        }
      }
    };

    const interval = setInterval(checkRequestStatus, 700);
    const handleStorage = () => checkRequestStatus();
    window.addEventListener('pointili_stamp_requests_changed', handleStorage);
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('pointili_stamp_requests_changed', handleStorage);
      window.removeEventListener('storage', handleStorage);
    };
  }, [activeRequest, onAddStamp, onNavigateToCards, requestResolvedState]);

  // Zero-lag real-time frame scanning loop
  const tickScan = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isHandlingScanRef.current) {
      if (!isHandlingScanRef.current) {
        animFrameIdRef.current = requestAnimationFrame(tickScan);
      }
      return;
    }

    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const now = Date.now();
      if (now - lastScanTimestampRef.current > 90) {
        lastScanTimestampRef.current = now;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (code && code.data) {
              const matched = findMatchingRestaurant(code.data);
              if (matched) {
                handleInitiateStampRequest(matched);
                return;
              } else {
                setUnrecognizedCode(code.data);
              }
            }
          } catch {}
        }
      }
    }

    if (!isHandlingScanRef.current) {
      animFrameIdRef.current = requestAnimationFrame(tickScan);
    }
  }, [findMatchingRestaurant, handleInitiateStampRequest]);

  // Requirement 1: Direct Camera Access on Mount
  const startCamera = async () => {
    setIsInitializing(true);
    setCameraError(null);
    setUnrecognizedCode(null);
    isHandlingScanRef.current = false;

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          language === 'ar'
            ? 'متصفحك لا يدعم الوصول المباشر للكاميرا. يمكنك إدخال الكود كتابة أو رفع صورة.'
            : 'Camera not supported. Please upload a QR image or enter code manually.'
        );
        setIsInitializing(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play().catch(() => {});
      }

      setCameraActive(true);
      setIsInitializing(false);

      animFrameIdRef.current = requestAnimationFrame(tickScan);
    } catch (err: any) {
      console.warn('Direct camera start notice:', err);
      setIsInitializing(false);
      setCameraActive(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(
          language === 'ar'
            ? 'يرجى السماح للتطبيق بالوصول للكاميرا من إعدادات المتصفح لمسح كود QR.'
            : 'Camera permission denied. Please allow camera access in browser settings.'
        );
      } else {
        setCameraError(
          language === 'ar'
            ? 'تعذر تشغيل الكاميرا الخلفية. يمكنك رفع صورة أو إدخال الكود يدوياً بالأسفل.'
            : 'Could not activate rear camera. You may upload a photo or enter code below.'
        );
      }
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  // Flashlight toggle
  const toggleTorch = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track) {
        const newTorch = !torchOn;
        try {
          await (track as any).applyConstraints({
            advanced: [{ torch: newTorch }],
          });
          setTorchOn(newTorch);
        } catch {
          setTorchOn(newTorch);
        }
      }
    }
  };

  // Gallery image file upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('qr-temp-file-reader');
      const decodedResult = await html5QrCode.scanFile(file, false);
      html5QrCode.clear();

      if (decodedResult) {
        const matched = findMatchingRestaurant(decodedResult);
        if (matched) {
          handleInitiateStampRequest(matched);
          return;
        } else {
          setUnrecognizedCode(decodedResult);
          return;
        }
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imgData.data, imgData.width, imgData.height, {
              inversionAttempts: 'attemptBoth',
            });

            if (code && code.data) {
              const matched = findMatchingRestaurant(code.data);
              if (matched) {
                handleInitiateStampRequest(matched);
              } else {
                setUnrecognizedCode(code.data);
              }
            } else {
              alert(
                language === 'ar'
                  ? 'لم يتم العثور على كود QR واضح في هذه الصورة.'
                  : 'No valid QR code found in this photo.'
              );
            }
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }

    e.target.value = '';
  };

  // Manual code submission
  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualCodeError(null);
    setUnrecognizedCode(null);

    const input = manualCodeInput.trim();
    if (!input) {
      setManualCodeError(
        language === 'ar' ? 'يرجى كتابة كود المحل أولاً.' : 'Please enter the store code.'
      );
      return;
    }

    const matched = findMatchingRestaurant(input);
    if (matched) {
      handleInitiateStampRequest(matched);
      setManualCodeInput('');
    } else {
      setManualCodeError(
        language === 'ar'
          ? '❌ كود غير صحيح! يرجى التأكد من الكود المكتوب على ملصق المحل أو مسحه بالكاميرا.'
          : '❌ Invalid code! Please verify the code displayed at the store.'
      );
    }
  };

  const handleDismissPending = () => {
    setActiveRequest(null);
    setRequestResolvedState('pending');
    isHandlingScanRef.current = false;
    startCamera();
  };

  return (
    <div className="relative w-full min-h-[85vh] flex flex-col font-['Plus_Jakarta_Sans'] select-none bg-black text-white overflow-hidden pb-20">
      <canvas ref={canvasRef} className="hidden" />
      <div id="qr-temp-file-reader" className="hidden" />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* ========================================================
          FULL CAMERA VIEWPORT WITH UI OVERLAY (MATCHING image_1.png)
      ======================================================== */}
      <div className="relative flex-1 w-full min-h-[520px] max-h-[720px] sm:min-h-[580px] bg-black flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            cameraActive ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* LOADING STATE ("جاري تشغيل الكاميرا...") */}
        {isInitializing && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 p-6 text-center">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-[#76FF03] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-[#76FF03]">
                <QrCode className="w-7 h-7" />
              </div>
            </div>
            <p className="text-sm font-bold text-white tracking-wide">
              {language === 'ar' ? 'جاري تشغيل الكاميرا...' : 'Starting camera...'}
            </p>
            <p className="text-xs text-zinc-400 mt-1">Pointili Instant Scanner</p>
          </div>
        )}

        {/* CAMERA ERROR */}
        {!isInitializing && cameraError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/95 p-6 text-center max-w-sm mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center mb-3">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1.5">
              {language === 'ar' ? 'تعذر فتح الكاميرا' : 'Camera Unavailable'}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-5">{cameraError}</p>
            <div className="flex gap-2.5 w-full">
              <button
                onClick={startCamera}
                className="flex-1 py-3 px-4 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] text-black font-extrabold text-xs shadow-lg shadow-[#76FF03]/20 cursor-pointer"
              >
                {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4 text-[#76FF03]" />
                <span>{language === 'ar' ? 'من المعرض' : 'Gallery'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            DARK OVERLAY & SQUARE SCAN RETICLE (MATCHING image_1.png)
        ======================================================== */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between items-center py-8 px-6 bg-black/35 backdrop-brightness-95">
          <div className="pt-2 text-center pointer-events-auto">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide drop-shadow-md">
              Find a QR code
            </h2>
            <p className="text-[11px] text-zinc-300 font-medium drop-shadow mt-0.5">
              وجه الكاميرا نحو كود QR الموضوع لدى الكاشير
            </p>
          </div>

          {/* 4 White Corner Brackets ("L" Shapes) */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            <div className="absolute top-0 left-0 w-11 h-11 border-t-[5px] border-l-[5px] border-white rounded-tl-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
            <div className="absolute top-0 right-0 w-11 h-11 border-t-[5px] border-r-[5px] border-white rounded-tr-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
            <div className="absolute bottom-0 left-0 w-11 h-11 border-b-[5px] border-l-[5px] border-white rounded-bl-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
            <div className="absolute bottom-0 right-0 w-11 h-11 border-b-[5px] border-r-[5px] border-white rounded-br-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />

            {cameraActive && (
              <div
                className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-[#76FF03] to-transparent shadow-[0_0_12px_#76FF03] animate-bounce"
                style={{ animationDuration: '2.4s', animationIterationCount: 'infinite' }}
              />
            )}
          </div>

          {/* Bottom Dark Bar with Flashlight & Gallery Buttons */}
          <div className="w-full flex items-center justify-center pb-2 pointer-events-auto">
            <div className="flex items-center gap-14 px-8 py-3 rounded-full bg-black/65 backdrop-blur-xl border border-white/10 shadow-2xl">
              <button
                type="button"
                onClick={toggleTorch}
                aria-label="Toggle Flashlight"
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-lg ${
                  torchOn
                    ? 'bg-[#76FF03] text-black shadow-[#76FF03]/50 scale-105'
                    : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md'
                }`}
                title="تشغيل / إطفاء الفلاش"
              >
                <Flashlight className={`w-6 h-6 stroke-[2.2] ${torchOn ? 'fill-black' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload QR code from gallery"
                className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 active:scale-90 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-lg"
                title="اختيار صورة من المعرض"
              >
                <ImageIcon className="w-6 h-6 stroke-[2.2]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          ANTI-FRAUD PENDING APPROVAL MODAL (Requirement 2)
      ======================================================== */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95">
            {requestResolvedState === 'pending' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border-2 border-amber-400 text-amber-400 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-amber-400/20 animate-pulse">
                  <Clock className="w-8 h-8 stroke-[2.5]" />
                </div>

                {/* Exact requested text notification */}
                <h3 className="text-base font-extrabold text-white mb-2 leading-relaxed">
                  تم إرسال طلب الختم بنجاح. في انتظار موافقة صاحب المحل...
                </h3>

                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  طلبك معروض الآن على شاشة كاشير <strong className="text-amber-300">{activeRequest.restaurantName}</strong> للتحقق والموافقة.
                </p>

                {/* Request Verification Details */}
                <div className="bg-zinc-900/90 rounded-2xl p-4 border border-zinc-800 mb-5 text-right space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="text-zinc-400">المحل / المتجر:</span>
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span>{activeRequest.restaurantEmoji}</span>
                      <span>{activeRequest.restaurantName}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="text-zinc-400">حساب الزبون:</span>
                    <span className="font-bold text-zinc-200">{activeRequest.userName}</span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="text-zinc-400">البريد الموثق:</span>
                    <span className="font-mono text-[11px] text-zinc-300">{activeRequest.userEmail}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-zinc-400">الحالة:</span>
                    <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span>قيد المراجعة لدى الكاشير...</span>
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDismissPending}
                    className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white text-xs font-semibold border border-zinc-800 transition-colors cursor-pointer"
                  >
                    إلغاء الطلب والعودة للمسح
                  </button>
                </div>
              </>
            )}

            {requestResolvedState === 'accepted' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#76FF03] text-black mx-auto mb-3 flex items-center justify-center shadow-xl shadow-[#76FF03]/40">
                  <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                </div>

                <h3 className="text-lg font-extrabold text-white mb-1">
                  🎉 وافق صاحب المحل على طلبك!
                </h3>

                <p className="text-xs text-zinc-300 mb-4">
                  تم شطب ختم جديد في بطاقة ولاء {activeRequest.restaurantName} بنجاح.
                </p>

                <div className="p-3 rounded-2xl bg-black border border-zinc-800 text-xs text-zinc-400 mb-4">
                  رصيدك الجديد: <strong className="text-[#76FF03] font-mono text-sm">{newStampCount} / 6 أختام</strong>
                </div>

                <button
                  type="button"
                  onClick={onNavigateToCards}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#76FF03]/30 transition-all cursor-pointer"
                >
                  <span>عرض بطاقتي في لوحة التحكم</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {requestResolvedState === 'rejected' && (
              <>
                <div className="w-16 h-16 rounded-2xl bg-red-950/80 border-2 border-red-600 text-red-400 mx-auto mb-3 flex items-center justify-center shadow-xl shadow-red-600/20">
                  <AlertCircle className="w-8 h-8 stroke-[2.5]" />
                </div>

                <h3 className="text-lg font-extrabold text-white mb-1">
                  عذراً، رفض صاحب المحل الطلب
                </h3>

                <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
                  لم يتم اعتماد الختم من قِبل كاشير {activeRequest.restaurantName}. تأكد من تواجدك في المحل واستلام الخدمة مباشرة.
                </p>

                <button
                  type="button"
                  onClick={handleDismissPending}
                  className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs border border-zinc-800 transition-colors cursor-pointer"
                >
                  إغلاق والعودة
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Manual Code Fallback */}
      <div className="px-4 mt-3 max-w-lg mx-auto w-full">
        <button
          type="button"
          onClick={() => setShowManualInput((prev) => !prev)}
          className="w-full py-2 px-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-[#76FF03]" />
            <span>أو إدخال كود المحل كتابة باليد</span>
          </span>
          {showManualInput ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showManualInput && (
          <form
            onSubmit={handleManualCodeSubmit}
            className="mt-2 p-3 bg-zinc-950 border border-zinc-800 rounded-2xl animate-in fade-in"
          >
            {manualCodeError && (
              <div className="mb-2 p-2 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>{manualCodeError}</span>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCodeInput}
                onChange={(e) => {
                  setManualCodeInput(e.target.value);
                  if (manualCodeError) setManualCodeError(null);
                }}
                placeholder="مثال: POINTILI_BBA_LE_MIRAGE_2026"
                className="flex-1 px-3 py-2 bg-black border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#76FF03] font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#76FF03] hover:bg-[#8aff24] text-black font-extrabold text-xs rounded-xl transition-all cursor-pointer"
              >
                إرسال الطلب
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
