import React, { useState } from 'react';
import { Restaurant } from '../types';
import { X, QrCode, Store, Sparkles, Copy, Check } from 'lucide-react';
import { PointiliLogo } from './PointiliLogo';

interface MerchantQRSheetProps {
  restaurants: Restaurant[];
  isOpen: boolean;
  onClose: () => void;
  onSimulateCustomerScan: (restaurantId: string) => void;
}

export const MerchantQRSheet: React.FC<MerchantQRSheetProps> = ({
  restaurants,
  isOpen,
  onClose,
  onSimulateCustomerScan,
}) => {
  const [selectedRestId, setSelectedRestId] = useState<string>(restaurants[0]?.id || '');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeRest = restaurants.find((r) => r.id === selectedRestId) || restaurants[0];

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(activeRest.qrSecretCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 relative shadow-2xl text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center gap-1.5 text-xs text-[#76FF03] font-semibold mb-2">
          <Store className="w-4 h-4" />
          <span>Pointili Merchant Stand Display</span>
        </div>

        <h3 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans'] mb-3">
          Countertop QR Stand
        </h3>

        {/* Restaurant Picker */}
        <select
          value={selectedRestId}
          onChange={(e) => setSelectedRestId(e.target.value)}
          className="w-full mb-4 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#76FF03]"
        >
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.imageEmoji} {r.name}
            </option>
          ))}
        </select>

        {/* Counter Display Poster Card */}
        <div className="bg-[#76FF03] rounded-2xl p-5 text-black shadow-xl mb-4 relative overflow-hidden">
          {/* Top Logo */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <PointiliLogo variant="icon" size="sm" theme="light" />
            <span className="font-['Pacifico',cursive] text-2xl font-bold text-black">
              Pointili
            </span>
          </div>

          <div className="text-xs font-extrabold uppercase tracking-wider mb-2">
            Scan for 1 Loyalty Stamp
          </div>

          {/* High Contrast Stylized QR Code Pattern */}
          <div className="bg-white p-3 rounded-xl mx-auto w-44 h-44 flex flex-col items-center justify-center shadow-md relative">
            {/* SVG Visual Representation of Pointili QR */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-black" fill="currentColor">
              {/* Corner 1 */}
              <rect x="5" y="5" width="28" height="28" rx="4" fill="black" />
              <rect x="10" y="10" width="18" height="18" fill="white" />
              <rect x="14" y="14" width="10" height="10" fill="black" />

              {/* Corner 2 */}
              <rect x="67" y="5" width="28" height="28" rx="4" fill="black" />
              <rect x="72" y="10" width="18" height="18" fill="white" />
              <rect x="76" y="14" width="10" height="10" fill="black" />

              {/* Corner 3 */}
              <rect x="5" y="67" width="28" height="28" rx="4" fill="black" />
              <rect x="10" y="72" width="18" height="18" fill="white" />
              <rect x="14" y="76" width="10" height="10" fill="black" />

              {/* Center Points / Data matrix dots */}
              <circle cx="50" cy="50" r="10" fill="#76FF03" stroke="black" strokeWidth="3" />
              <circle cx="50" cy="50" r="4" fill="black" />

              {/* Data Blocks */}
              <rect x="38" y="8" width="6" height="12" fill="black" />
              <rect x="48" y="16" width="12" height="6" fill="black" />
              <rect x="8" y="38" width="12" height="6" fill="black" />
              <rect x="22" y="48" width="6" height="12" fill="black" />
              <rect x="40" y="70" width="14" height="6" fill="black" />
              <rect x="68" y="40" width="8" height="18" fill="black" />
              <rect x="82" y="68" width="10" height="8" fill="black" />
              <rect x="70" y="78" width="8" height="14" fill="black" />
              <rect x="38" y="38" width="6" height="6" fill="black" />
            </svg>

            {/* Micro logo inside QR */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-7 h-7 rounded-md bg-black text-[#76FF03] flex items-center justify-center font-bold text-xs shadow">
                P
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs font-bold truncate">
            {activeRest.name}
          </div>
          <div className="text-[10px] text-zinc-900/80 font-medium">
            Collect 6 stamps · Get Free Meal/Drink
          </div>
        </div>

        {/* Action button to test scanning this exact QR */}
        <button
          onClick={() => {
            onSimulateCustomerScan(activeRest.id);
            onClose();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-black font-bold text-xs flex items-center justify-center gap-1.5 mb-2 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Test-Scan this QR Code Now</span>
        </button>

        {/* Copy Code */}
        <button
          onClick={handleCopyCode}
          className="text-xs text-zinc-400 hover:text-white flex items-center justify-center gap-1 mx-auto transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#76FF03]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Code copied!' : 'Copy raw QR secret code'}</span>
        </button>
      </div>
    </div>
  );
};
