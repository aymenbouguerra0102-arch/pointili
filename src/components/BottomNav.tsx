import React from 'react';
import { CreditCard, QrCode, User, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export type NavTab = 'cards' | 'scanner' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  unlockedRewardsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  unlockedRewardsCount,
}) => {
  const { t } = useLanguage();

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 px-4 py-2 transition-all font-['Plus_Jakarta_Sans']"
    >
      <div className="max-w-md mx-auto grid grid-cols-3 items-center relative">
        {/* Tab 1: My Cards */}
        <button
          type="button"
          onClick={() => onChangeTab('cards')}
          className={`min-h-[48px] flex flex-col items-center justify-center relative transition-colors cursor-pointer ${
            currentTab === 'cards'
              ? 'text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <div className="relative">
            <CreditCard
              className={`w-5 h-5 transition-transform ${
                currentTab === 'cards' ? 'text-[#76FF03] scale-110' : ''
              }`}
            />
            {unlockedRewardsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#76FF03] text-black font-extrabold text-[10px] flex items-center justify-center shadow-md shadow-[#76FF03]/50 animate-pulse">
                {unlockedRewardsCount}
              </span>
            )}
          </div>
          <span
            className={`text-[11px] font-medium tracking-tight mt-1 ${
              currentTab === 'cards' ? 'text-white font-semibold' : 'text-zinc-400'
            }`}
          >
            {t.tabCards}
          </span>
          {currentTab === 'cards' && (
            <span className="w-1 h-1 rounded-full bg-[#76FF03] mt-0.5" />
          )}
        </button>

        {/* Tab 2: Elevated Center Scan QR */}
        <div className="flex justify-center -mt-5">
          <button
            type="button"
            onClick={() => onChangeTab('scanner')}
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer relative group ${
              currentTab === 'scanner'
                ? 'bg-[#76FF03] text-black ring-4 ring-black shadow-[#76FF03]/50'
                : 'bg-zinc-900 border-2 border-[#76FF03] text-[#76FF03] shadow-black/80 hover:bg-zinc-850'
            }`}
          >
            <div className="relative flex items-center justify-center">
              <QrCode
                className={`w-6 h-6 stroke-[2.5] transition-transform ${
                  currentTab === 'scanner' ? 'scale-105 text-black' : 'text-[#76FF03]'
                }`}
              />
            </div>
            <span
              className={`text-[9px] font-extrabold tracking-tight uppercase leading-none mt-0.5 ${
                currentTab === 'scanner' ? 'text-black' : 'text-[#76FF03]'
              }`}
            >
              QR
            </span>
          </button>
        </div>

        {/* Tab 3: Profile */}
        <button
          type="button"
          onClick={() => onChangeTab('profile')}
          className={`min-h-[48px] flex flex-col items-center justify-center relative transition-colors cursor-pointer ${
            currentTab === 'profile'
              ? 'text-white'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <User
            className={`w-5 h-5 transition-transform ${
              currentTab === 'profile' ? 'text-[#76FF03] scale-110' : ''
            }`}
          />
          <span
            className={`text-[11px] font-medium tracking-tight mt-1 ${
              currentTab === 'profile' ? 'text-white font-semibold' : 'text-zinc-400'
            }`}
          >
            {t.tabProfile}
          </span>
          {currentTab === 'profile' && (
            <span className="w-1 h-1 rounded-full bg-[#76FF03] mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
};
