import React, { useState, useEffect } from 'react';
import { Restaurant } from '../types';
import { X, QrCode, Store, Sparkles, Copy, Check, Printer, ShieldCheck, AlertCircle } from 'lucide-react';
import { PointiliLogo } from './PointiliLogo';
import { getStoreQRInfo } from '../data/qrStoreDirectory';

interface MerchantQRSheetProps {
  restaurants: Restaurant[];
  isOpen: boolean;
  onClose: () => void;
  onSimulateCustomerScan: (restaurantId: string) => void;
  initialRestaurantId?: string;
}

export const MerchantQRSheet: React.FC<MerchantQRSheetProps> = ({
  restaurants,
  isOpen,
  onClose,
  onSimulateCustomerScan,
  initialRestaurantId,
}) => {
  const [selectedRestId, setSelectedRestId] = useState<string>(
    initialRestaurantId || restaurants[0]?.id || ''
  );

  useEffect(() => {
    if (initialRestaurantId) {
      setSelectedRestId(initialRestaurantId);
    }
  }, [initialRestaurantId]);

  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeRest = restaurants.find((r) => r.id === selectedRestId) || restaurants[0];
  const qrInfo = getStoreQRInfo(activeRest);

  const handleCopyCode = () => {
    const codeToCopy = qrInfo ? qrInfo.payload : activeRest.qrSecretCode;
    navigator.clipboard?.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in select-none font-['Plus_Jakarta_Sans']">
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 relative shadow-2xl text-center max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-xs text-[#76FF03] font-semibold mb-1">
          <Store className="w-4 h-4" />
          <span>Pointili BBA Merchant Stand</span>
        </div>

        <h3 className="text-lg font-bold text-white mb-2">
          ملصق رمز الـ QR لطاولة الكاشير
        </h3>

        {/* Restaurant Picker if multiple */}
        {restaurants.length > 1 && (
          <select
            value={selectedRestId}
            onChange={(e) => setSelectedRestId(e.target.value)}
            className="w-full mb-3 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#76FF03]"
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.imageEmoji} {r.nameAr || r.name}
              </option>
            ))}
          </select>
        )}

        {/* Counter Display Poster Card in Lime Green Theme */}
        {qrInfo ? (
          <div className="bg-[#76FF03] rounded-3xl p-5 text-black shadow-xl mb-3 relative overflow-hidden">
            <div className="flex items-center justify-center gap-2 mb-2">
              <PointiliLogo variant="icon" size="sm" theme="light" />
              <span className="font-['Pacifico',cursive] text-2xl font-bold text-black">
                Pointili
              </span>
            </div>

            <div className="text-xs font-black uppercase tracking-wider mb-2 flex items-center justify-center gap-2">
              <span>امسح الكود لربح ختم الولاء ⚡</span>
              <span className="px-2 py-0.5 rounded-full bg-black text-[#76FF03] text-[10px] font-black tracking-wider">
                SCAN ME
              </span>
            </div>

            {/* REAL STATIC QR CODE IMAGE FROM /qr-codes */}
            <div className="bg-white p-3 rounded-2xl mx-auto w-48 h-48 flex items-center justify-center shadow-lg relative border-2 border-black/10">
              <img
                src={qrInfo.qrImagePath}
                alt={`QR code for ${activeRest.name}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.src.includes(encodeURIComponent(qrInfo.name))) {
                    target.src = `/qr-codes/${encodeURIComponent(qrInfo.name)}.png`;
                  }
                }}
              />
            </div>

            <div className="mt-3 text-sm font-extrabold truncate">
              {activeRest.nameAr || activeRest.name}
            </div>
            <div className="text-[11px] text-zinc-900/90 font-medium">
              اجمع 6 أختام واحصل على وجبتك أو مشروبك المجاني 🎁
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 text-center mb-3">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <div className="text-sm font-bold text-white mb-1">
              رمز الـ QR الخاص بهذا المحل لم يتم توليده بعد (قريباً)
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              رمز الـ QR المعتمد لـ ({activeRest.nameAr || activeRest.name}) قيد التجهيز وسيتم توفيره قريباً.
            </p>
          </div>
        )}

        {/* Secret Code / Payload Display */}
        {qrInfo && (
          <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 mb-3 text-left">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
              <span className="font-semibold text-zinc-300">محتوى الكود المشفر (Payload):</span>
              <button
                onClick={handleCopyCode}
                className="text-[#76FF03] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ'}</span>
              </button>
            </div>
            <div className="px-2.5 py-1.5 rounded-xl bg-black border border-zinc-800 text-[#76FF03] font-mono text-xs font-bold break-all select-all">
              {qrInfo.payload}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onSimulateCustomerScan(activeRest.id);
              onClose();
            }}
            className="py-2.5 px-3 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#76FF03]/20 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>تجربة المسح الآن</span>
          </button>

          <button
            onClick={handlePrint}
            className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white font-semibold text-xs border border-zinc-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-400" />
            <span>طباعة الملصق</span>
          </button>
        </div>
      </div>
    </div>
  );
};
