import React, { useState, useEffect, useRef } from 'react';
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
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QRScannerTabProps {
  restaurants: Restaurant[];
  onAddStamp: (restaurantId: string) => { success: boolean; restaurant?: Restaurant; newCount: number; rewardUnlocked: boolean };
  onNavigateToCards: () => void;
  preSelectedRestaurant?: Restaurant | null;
}

export const QRScannerTab: React.FC<QRScannerTabProps> = ({
  restaurants,
  onAddStamp,
  onNavigateToCards,
  preSelectedRestaurant,
}) => {
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [manualCodeInput, setManualCodeInput] = useState<string>('');

  // Success Notification State
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    restaurant?: Restaurant;
    newCount: number;
    rewardUnlocked: boolean;
    message: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera access is not supported on this browser. Use simulation mode below.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera initiation notice:', err);
      setCameraError('Camera not available or permission denied. Test with Simulation Mode below!');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  // Handle successful stamp addition
  const handleExecuteScan = (restaurantId: string) => {
    const res = onAddStamp(restaurantId);
    if (res.success && res.restaurant) {
      if (res.rewardUnlocked) {
        // Confetti explosion for reward unlock!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#76FF03', '#FFFFFF', '#00E5FF', '#FFD600'],
        });
      }

      setScanResult({
        success: true,
        restaurant: res.restaurant,
        newCount: res.newCount,
        rewardUnlocked: res.rewardUnlocked,
        message: 'Stamp added successfully!',
      });
      setIsScanning(false);
    } else {
      setScanResult({
        success: false,
        newCount: 0,
        rewardUnlocked: false,
        message: 'Invalid or already maxed QR code.',
      });
    }
  };

  // Toggle Torch
  const toggleTorch = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
      if (capabilities.torch) {
        try {
          await (track as any).applyConstraints({
            advanced: [{ torch: !torchOn }],
          });
          setTorchOn(!torchOn);
        } catch (e) {
          console.warn('Torch constraint error', e);
        }
      } else {
        setTorchOn(!torchOn);
      }
    } else {
      setTorchOn(!torchOn);
    }
  };

  const handleScanAnother = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className="min-h-full pb-28 pt-2 px-4 max-w-lg mx-auto flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2 font-['Plus_Jakarta_Sans']">
            <span>Scan Loyalty QR</span>
            <span className="w-2 h-2 rounded-full bg-[#76FF03] animate-pulse" />
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Point camera at the Pointili counter QR or tap a quick simulation
          </p>
        </div>

        <button
          onClick={startCamera}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
          title="Restart Camera"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* SUCCESS NOTIFICATION MODAL / OVERLAY */}
      {scanResult && scanResult.success && scanResult.restaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-900 border-2 border-[#76FF03] rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl shadow-[#76FF03]/25 relative overflow-hidden">
            {/* Ambient burst */}
            <div className="absolute -top-20 -left-20 w-44 h-44 bg-[#76FF03]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Checkmark Stamp Visual */}
            <div className="relative mx-auto w-20 h-20 rounded-full bg-[#76FF03] text-black flex items-center justify-center mb-4 shadow-xl shadow-[#76FF03]/40 animate-bounce">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            {/* THE EXACT REQUIRED SUCCESS NOTIFICATION MESSAGE */}
            <h2 className="text-xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              Stamp added successfully!
            </h2>

            <div className="mt-1 text-sm text-zinc-300 font-medium">
              {scanResult.restaurant.name}
            </div>

            {/* Visual 6 Dots Preview */}
            <div className="mt-4 p-3 bg-black/60 rounded-2xl border border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2.5">
                <span>Card Progress</span>
                <span className="font-mono text-[#76FF03] font-bold">
                  {scanResult.newCount} / 6 Stamps
                </span>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i <= scanResult.newCount
                        ? 'bg-[#76FF03] text-black ring-2 ring-[#76FF03]/50'
                        : 'border border-dashed border-zinc-700 bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    {i <= scanResult.newCount ? '✓' : i}
                  </div>
                ))}
              </div>
            </div>

            {/* Reward Unlocked Alert if 6/6 */}
            {scanResult.rewardUnlocked && (
              <div className="mt-4 p-3 rounded-2xl bg-[#76FF03]/20 border border-[#76FF03] text-left flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#76FF03] text-black flex items-center justify-center shrink-0 font-bold">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-[#76FF03] uppercase">
                    Reward Unlocked! Free Meal/Drink
                  </div>
                  <div className="text-xs text-white truncate font-medium">
                    {scanResult.restaurant.rewardTitle}
                  </div>
                </div>
              </div>
            )}

            {/* Next Actions */}
            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={onNavigateToCards}
                className="w-full py-3 px-4 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] text-black font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#76FF03]/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>View in My Cards</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleScanAnother}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Scan Another QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCANNER VIEWFINDER BOX */}
      <div className="relative w-full aspect-[4/3] sm:aspect-square bg-zinc-950 rounded-3xl overflow-hidden border-2 border-zinc-800 shadow-2xl mb-5 flex items-center justify-center">
        {/* Real Video Element */}
        {cameraActive ? (
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="p-6 text-center text-zinc-500">
            <Camera className="w-12 h-12 mx-auto mb-2 opacity-40 text-[#76FF03]" />
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              {cameraError || 'Camera standby mode'}
            </p>
            <button
              onClick={startCamera}
              className="mt-3 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-white font-medium transition-colors"
            >
              Enable Camera
            </button>
          </div>
        )}

        {/* Viewfinder Reticle Framing */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
          <div className="w-56 h-56 relative">
            {/* 4 Corner Markers in Lime Green #76FF03 */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#76FF03] rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#76FF03] rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#76FF03] rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#76FF03] rounded-br-xl" />

            {/* Glowing Laser Sweep Animation */}
            {isScanning && (
              <div
                className="absolute left-2 right-2 h-1 bg-gradient-to-r from-transparent via-[#76FF03] to-transparent shadow-[0_0_15px_#76FF03] animate-bounce"
                style={{
                  animationDuration: '2s',
                  animationIterationCount: 'infinite',
                }}
              />
            )}
          </div>
        </div>

        {/* Top Viewfinder Controls */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-mono text-[#76FF03] border border-zinc-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#76FF03] animate-ping" />
            <span>ALIGN QR CODE</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTorch}
              className={`p-2 rounded-xl backdrop-blur-md border transition-colors ${
                torchOn
                  ? 'bg-[#76FF03] text-black border-[#76FF03]'
                  : 'bg-black/60 text-zinc-300 border-zinc-800 hover:text-white'
              }`}
              title="Flashlight"
            >
              <Flashlight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
              className="p-2 rounded-xl bg-black/60 backdrop-blur-md border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
              title="Flip Camera"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* QUICK TESTING / CAMERA SIMULATION SECTION (Mandatory & Highly Functional!) */}
      <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-4 mb-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#76FF03]/10 text-[#76FF03] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Quick Test Scanner Simulation
            </h2>
          </div>
          <span className="text-[10px] text-zinc-500">1-Tap Scan</span>
        </div>

        <p className="text-xs text-zinc-400 mb-3">
          Tap any restaurant below to simulate scanning their official counter QR code and collect a stamp:
        </p>

        {/* Quick Simulation Buttons for Each Restaurant */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {restaurants.map((rest) => {
            const isFull = rest.stampsCount >= 6;
            return (
              <button
                key={rest.id}
                onClick={() => handleExecuteScan(rest.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  isFull
                    ? 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    : 'bg-zinc-850 hover:bg-zinc-800 border-zinc-700/80 hover:border-[#76FF03]/60 text-white shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">{rest.imageEmoji}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate text-zinc-200">
                      {rest.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {rest.stampsCount}/6 stamps
                    </div>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  {isFull ? (
                    <span className="text-[10px] font-bold text-[#76FF03] bg-[#76FF03]/10 px-2 py-0.5 rounded-md">
                      FULL (6/6)
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-black bg-[#76FF03] px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                      + Stamp
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual QR Code Input Option */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3.5">
        <div className="text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-1.5">
          <QrCode className="w-3.5 h-3.5 text-[#76FF03]" />
          <span>Manual QR Code / Secret Scan Code</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualCodeInput}
            onChange={(e) => setManualCodeInput(e.target.value)}
            placeholder="e.g. POINTILI_QR_NEON_BEAN_COFFEE_2026"
            className="flex-1 px-3 py-2 bg-black border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#76FF03] font-mono"
          />
          <button
            onClick={() => {
              // Find matching restaurant by secret code or name keyword
              const target =
                restaurants.find(
                  (r) =>
                    r.qrSecretCode.toLowerCase() === manualCodeInput.trim().toLowerCase() ||
                    r.id.toLowerCase() === manualCodeInput.trim().toLowerCase()
                ) || restaurants[0];
              if (target) {
                handleExecuteScan(target.id);
                setManualCodeInput('');
              }
            }}
            className="px-4 py-2 bg-white text-zinc-950 font-bold text-xs rounded-xl hover:bg-zinc-200 transition-colors shrink-0"
          >
            Scan Code
          </button>
        </div>
      </div>
    </div>
  );
};
