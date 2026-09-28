import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Restaurant } from '../types';
import {
  Camera,
  Flashlight,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ArrowRight,
  Gift,
  Upload,
  Zap,
  ShieldCheck,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import jsQR from 'jsqr';
import { useLanguage } from '../i18n/LanguageContext';

interface QRScannerTabProps {
  restaurants: Restaurant[];
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

    // Tone 1 (High note)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.18);

    // Tone 2 (Higher note for rewarding chime)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.1); // A5
    gain2.gain.setValueAtTime(0.22, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.32);
  } catch {}
}

export const QRScannerTab: React.FC<QRScannerTabProps> = ({
  restaurants,
  onAddStamp,
  onNavigateToCards,
}) => {
  const { t, language } = useLanguage();
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Manual code input
  const [manualCodeInput, setManualCodeInput] = useState<string>('');
  const [manualCodeError, setManualCodeError] = useState<string | null>(null);

  // Unrecognized QR warning
  const [unrecognizedCode, setUnrecognizedCode] = useState<string | null>(null);

  // Success Notification State
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    restaurant: Restaurant;
    newCount: number;
    rewardUnlocked: boolean;
    message: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastScanTimestampRef = useRef<number>(0);

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

      // 4. Fuzzy restaurant name match if encoded
      matched = restaurants.find((r) => {
        const nameEn = r.name.toLowerCase();
        const nameAr = (r.nameAr || '').toLowerCase();
        return lower === nameEn || (nameAr && lower === nameAr);
      });

      return matched || null;
    },
    [restaurants]
  );

  // Execute authentic stamp addition
  const handleExecuteValidScan = useCallback(
    (target: Restaurant) => {
      if (soundEnabled) playScanChime();
      navigator.vibrate?.([80, 50, 100]);

      const res = onAddStamp(target.id);
      if (res.success && res.restaurant) {
        if (res.rewardUnlocked) {
          confetti({
            particleCount: 110,
            spread: 90,
            origin: { y: 0.55 },
            colors: ['#76FF03', '#FFFFFF', '#00E5FF', '#FFD600'],
          });
        } else {
          confetti({
            particleCount: 45,
            spread: 60,
            origin: { y: 0.65 },
            colors: ['#76FF03', '#FFFFFF'],
          });
        }

        const restName =
          language === 'ar'
            ? res.restaurant.nameAr || res.restaurant.name
            : language === 'fr'
            ? res.restaurant.nameFr || res.restaurant.name
            : res.restaurant.nameEn || res.restaurant.name;

        setScanResult({
          success: true,
          restaurant: res.restaurant,
          newCount: res.newCount,
          rewardUnlocked: res.rewardUnlocked,
          message: res.rewardUnlocked
            ? t.rewardUnlockedCelebration
            : `${t.stampSuccess} (${restName})`,
        });

        setIsScanning(false);
        setManualCodeError(null);
        setUnrecognizedCode(null);
      }
    },
    [language, onAddStamp, soundEnabled, t]
  );

  // Core frame-by-frame scanner loop
  const tickScan = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) {
      animFrameIdRef.current = requestAnimationFrame(tickScan);
      return;
    }

    const video = videoRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const now = Date.now();
      // Throttle scanning to ~7 times per second (every 140ms) for maximum responsiveness and 60fps UI
      if (now - lastScanTimestampRef.current > 140) {
        lastScanTimestampRef.current = now;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            // Decode with jsQR
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (code && code.data) {
              const matched = findMatchingRestaurant(code.data);
              if (matched) {
                handleExecuteValidScan(matched);
                return;
              } else {
                setUnrecognizedCode(code.data);
              }
            }
          } catch {}
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(tickScan);
  }, [findMatchingRestaurant, handleExecuteValidScan, isScanning]);

  // Start Camera Stream
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          language === 'ar'
            ? 'الكاميرا غير مدعومة على متصفحك. يرجى إدخال الكود يدوياً أو رفع صورة الـ QR.'
            : 'Camera not supported. Please enter the store code manually or upload an image.'
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
      setIsScanning(true);
    } catch (err: any) {
      console.warn('Camera initiation notice:', err);
      setCameraError(
        language === 'ar'
          ? 'يرجى السماح بالوصول للكاميرا لمسح كود QR، أو قم بإدخال كود المحل كتابة بالأسفل.'
          : 'Please grant camera permissions to scan QR codes, or enter the code manually below.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    animFrameIdRef.current = requestAnimationFrame(tickScan);

    return () => {
      stopCamera();
    };
  }, [facingMode]);

  // Flashlight toggle
  const toggleTorch = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as any;
      if (capabilities && capabilities.torch) {
        try {
          await (track as any).applyConstraints({
            advanced: [{ torch: !torchOn }],
          });
          setTorchOn(!torchOn);
        } catch {
          setTorchOn(!torchOn);
        }
      } else {
        setTorchOn(!torchOn);
      }
    }
  };

  // Flip camera between environment (rear) and user (selfie)
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Handle Image File Pick for QR decoding
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
              handleExecuteValidScan(matched);
            } else {
              setUnrecognizedCode(code.data);
            }
          } else {
            alert(
              language === 'ar'
                ? 'لم يتم العثور على رمز QR واضح في الصورة. يرجى تجربة صورة أوضح أو مسحه بالكاميرا.'
                : 'No QR code detected in this image. Please try a clearer image.'
            );
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Manual Code Submission
  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualCodeError(null);
    setUnrecognizedCode(null);

    const input = manualCodeInput.trim();
    if (!input) {
      setManualCodeError(
        language === 'ar'
          ? 'يرجى كتابة الكود السري للمحل أولاً.'
          : 'Please enter the store code first.'
      );
      return;
    }

    const matched = findMatchingRestaurant(input);
    if (matched) {
      handleExecuteValidScan(matched);
      setManualCodeInput('');
      setManualCodeError(null);
    } else {
      // STRICT: Absolutely no stamp added if code is incorrect!
      setManualCodeError(
        language === 'ar'
          ? '❌ كود غير صحيح! يرجى التأكد من كتابة الكود السري المكتوب لدى المحل في برج بوعريريج أو مسحه بالكاميرا.'
          : '❌ Invalid code! Please verify the code displayed at the store in Bordj Bou Arreridj.'
      );
    }
  };

  const handleScanAnother = () => {
    setScanResult(null);
    setIsScanning(true);
    setUnrecognizedCode(null);
    setManualCodeError(null);
    lastScanTimestampRef.current = 0;
  };

  return (
    <div className="min-h-full pb-28 pt-2 px-3 sm:px-4 max-w-lg mx-auto flex flex-col font-['Plus_Jakarta_Sans'] select-none">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file input for uploading QR image */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{t.scannerTitle}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#76FF03] animate-pulse" />
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {t.scannerSubtitle} · كاميرا سريعة ودقيقة
          </p>
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled((prev) => !prev)}
          className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
            soundEnabled
              ? 'bg-zinc-900 border-zinc-700 text-[#76FF03]'
              : 'bg-zinc-950 border-zinc-800 text-zinc-500'
          }`}
          title="صوت التأكيد عند المسح"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* UNRECOGNIZED QR CODE ALERT */}
      {unrecognizedCode && (
        <div className="mb-3 p-3 rounded-2xl bg-amber-950/70 border border-amber-500/50 text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-amber-300">رمز QR غير مسجل في شبكة Pointili</div>
            <div className="text-[11px] text-amber-200/80 mt-0.5 break-all">
              الرمز المقروء: {unrecognizedCode.slice(0, 50)}... تأكد من مسح ملصق Pointili في محلات برج بوعريريج.
            </div>
          </div>
          <button
            onClick={() => setUnrecognizedCode(null)}
            className="p-1 rounded-lg text-amber-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SCAN SUCCESS MODAL / CELEBRATION OVERLAY */}
      {scanResult && scanResult.restaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-zinc-950 border-2 border-[#76FF03] rounded-3xl p-6 text-center shadow-2xl shadow-[#76FF03]/20 relative overflow-hidden animate-in zoom-in-95">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#76FF03]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-2xl bg-[#76FF03] text-black mx-auto mb-3 flex items-center justify-center shadow-xl shadow-[#76FF03]/40">
              {scanResult.rewardUnlocked ? (
                <Gift className="w-9 h-9 stroke-[2.5]" />
              ) : (
                <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
              )}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#76FF03]/10 border border-[#76FF03]/40 text-[#76FF03] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {scanResult.rewardUnlocked ? 'المكافأة أصبحت جاهزة! 🎉' : 'تم الختم بنجاح!'}
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white mb-1">
              {language === 'ar'
                ? scanResult.restaurant.nameAr || scanResult.restaurant.name
                : scanResult.restaurant.name}
            </h2>

            <p className="text-xs text-zinc-300 mb-4">
              {scanResult.rewardUnlocked
                ? `مبروك! أكملت 6 أختام في ${scanResult.restaurant.nameAr || scanResult.restaurant.name}`
                : `تم شطب الختم رقم ${scanResult.newCount} من أصل 6 أختام`}
            </p>

            {/* Visual 6 Dots Summary */}
            <div className="bg-black/85 rounded-2xl p-4 border border-zinc-800 mb-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
                <span className="font-bold text-white">{t.stampsProgress}</span>
                <span className="font-mono text-[#76FF03] font-extrabold text-sm">
                  {scanResult.newCount} / 6
                </span>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => {
                  const isDone = i <= scanResult.newCount;
                  const isSix = i === 6;
                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isDone
                          ? 'bg-[#76FF03] text-black ring-2 ring-[#76FF03]/50 scale-105 shadow-md shadow-[#76FF03]/40'
                          : isSix
                          ? 'border-2 border-dashed border-[#76FF03] bg-[#76FF03]/10 text-[#76FF03]'
                          : 'border border-dashed border-zinc-700 bg-zinc-900 text-zinc-500'
                      }`}
                    >
                      {isDone ? (isSix ? '🎁' : '✓') : isSix ? '🎁' : i}
                    </div>
                  );
                })}
              </div>

              {scanResult.rewardUnlocked && (
                <div className="mt-3 pt-3 border-t border-zinc-800 text-xs font-bold text-[#76FF03] flex items-center justify-center gap-1.5 animate-pulse">
                  <Gift className="w-4 h-4" />
                  <span>{scanResult.restaurant.rewardTitleAr || scanResult.restaurant.rewardTitle}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={onNavigateToCards}
                className="w-full py-3.5 px-4 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#76FF03]/30 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>العودة لبطاقات الولاء</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleScanAnother}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs border border-zinc-800 transition-colors cursor-pointer"
              >
                مسح كود آخر / Scan Another
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          LARGE, SMOOTH CAMERA SCANNER VIEWFINDER
      ======================================================== */}
      <div className="relative w-full aspect-[3/4] sm:aspect-square min-h-[420px] max-h-[580px] bg-zinc-950 rounded-3xl overflow-hidden border-2 border-zinc-800/90 shadow-2xl mb-4 flex items-center justify-center">
        {/* Video feed */}
        {cameraActive ? (
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="w-full h-full object-cover scale-100"
          />
        ) : (
          <div className="p-6 text-center text-zinc-500 z-10">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 text-[#76FF03] mx-auto mb-3 flex items-center justify-center shadow-lg">
              <Camera className="w-8 h-8" />
            </div>
            <p className="text-xs text-zinc-300 max-w-xs mx-auto mb-4 font-medium leading-relaxed">
              {cameraError || 'جارِ تشغيل عدسة الكاميرا عالية الدقة...'}
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={startCamera}
                className="px-4 py-2 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] text-black text-xs font-bold transition-all shadow-md shadow-[#76FF03]/20 cursor-pointer"
              >
                إعادة تشغيل الكاميرا
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold border border-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-[#76FF03]" />
                <span>رفع صورة</span>
              </button>
            </div>
          </div>
        )}

        {/* Viewfinder Target Reticle Frame & Laser Scan Bar */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 sm:p-10">
          <div className="w-64 h-64 sm:w-72 sm:h-72 relative">
            {/* Top-Left Corner */}
            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-[#76FF03] rounded-tl-2xl shadow-[0_0_15px_#76FF03]" />
            {/* Top-Right Corner */}
            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-[#76FF03] rounded-tr-2xl shadow-[0_0_15px_#76FF03]" />
            {/* Bottom-Left Corner */}
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-[#76FF03] rounded-bl-2xl shadow-[0_0_15px_#76FF03]" />
            {/* Bottom-Right Corner */}
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-[#76FF03] rounded-br-2xl shadow-[0_0_15px_#76FF03]" />

            {/* Central Target Radar Pulse */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border border-[#76FF03]/30 animate-ping opacity-40" />
              <div className="w-3 h-3 rounded-full bg-[#76FF03]/60 shadow-[0_0_10px_#76FF03]" />
            </div>

            {/* Glowing Laser Scan Bar */}
            {isScanning && cameraActive && (
              <div
                className="absolute left-2 right-2 h-1 bg-gradient-to-r from-transparent via-[#76FF03] to-transparent shadow-[0_0_18px_#76FF03] animate-bounce"
                style={{
                  animationDuration: '2.2s',
                  animationIterationCount: 'infinite',
                }}
              />
            )}
          </div>
        </div>

        {/* Top Controls Overlay inside Viewfinder */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-20">
          <div className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-mono text-[#76FF03] border border-zinc-800 flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#76FF03] animate-ping" />
            <span className="font-bold">Pointili Cam · مسح مباشر</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Torch toggle */}
            <button
              onClick={toggleTorch}
              className={`p-2.5 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                torchOn
                  ? 'bg-[#76FF03] text-black border-[#76FF03] shadow-lg shadow-[#76FF03]/40'
                  : 'bg-black/70 text-zinc-300 border-zinc-800 hover:text-white'
              }`}
              title="فلاش الكاميرا / Flashlight"
            >
              <Flashlight className="w-4 h-4" />
            </button>

            {/* Flip camera */}
            <button
              onClick={flipCamera}
              className="p-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="قلب الكاميرا الأمامية/الخلفية"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Upload QR image */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="رفع صورة تحتوي على رمز QR"
            >
              <Upload className="w-4 h-4 text-[#76FF03]" />
            </button>
          </div>
        </div>

        {/* Bottom Helper overlay inside Viewfinder */}
        <div className="absolute bottom-3 left-3 right-3 text-center pointer-events-none z-20">
          <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-[11px] font-medium text-zinc-300 border border-zinc-800 inline-block shadow-md">
            وجّه الكاميرا نحو رمز QR الملصق لدى المحل لكسب الختم تلقائياً
          </span>
        </div>
      </div>

      {/* ========================================================
          MANUAL CODE INPUT SECTION ("وضع كود بالكتابة")
      ======================================================== */}
      <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-3xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#76FF03]/10 text-[#76FF03] flex items-center justify-center border border-[#76FF03]/20">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                {t.orEnterCode} (وضع الكود بالكتابة)
              </h2>
              <div className="text-[11px] text-zinc-400">
                إذا تعذّر استخدام الكاميرا، اكتب الكود السري المكتوب على ملصق المحل
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#76FF03] bg-[#76FF03]/10 px-2 py-0.5 rounded-full border border-[#76FF03]/30">
            كود المحل
          </span>
        </div>

        {/* Manual Code Error Alert */}
        {manualCodeError && (
          <div className="mb-3 p-3 rounded-2xl bg-red-950/70 border border-red-800/60 text-red-200 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="leading-snug">{manualCodeError}</span>
          </div>
        )}

        <form onSubmit={handleManualCodeSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualCodeInput}
            onChange={(e) => {
              setManualCodeInput(e.target.value);
              if (manualCodeError) setManualCodeError(null);
            }}
            placeholder="مثال: POINTILI_BBA_BURGER_HOUSE_34_2026"
            className="flex-1 px-3.5 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#76FF03] font-mono tracking-wide"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-[#76FF03] hover:bg-[#8aff24] active:scale-[0.98] text-black font-extrabold text-xs rounded-2xl transition-all shadow-md shadow-[#76FF03]/20 shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>{t.submitCode}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500 px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#76FF03]" />
            <span>نظام شطب أختام مشفر ومحمي</span>
          </span>
          <span className="font-mono text-zinc-400">BBA 34 Loyalty</span>
        </div>
      </div>
    </div>
  );
};
