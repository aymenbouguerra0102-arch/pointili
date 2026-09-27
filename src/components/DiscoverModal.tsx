import React from 'react';
import { Restaurant } from '../types';
import { X, Plus, Check, MapPin, Sparkles } from 'lucide-react';

interface DiscoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  availablePlaces: Restaurant[];
  existingIds: string[];
  onAddPlace: (restaurant: Restaurant) => void;
}

export const DiscoverModal: React.FC<DiscoverModalProps> = ({
  isOpen,
  onClose,
  availablePlaces,
  existingIds,
  onAddPlace,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-950 border-t sm:border border-zinc-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 relative max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-white font-['Plus_Jakarta_Sans']">
              Discover Participating Places
            </h3>
            <p className="text-xs text-zinc-400">
              Join digital stamp cards to earn free meals & drinks
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {availablePlaces.map((place) => {
            const alreadyJoined = existingIds.includes(place.id);
            return (
              <div
                key={place.id}
                className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl shrink-0">
                    {place.imageEmoji}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">
                      {place.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                      <span>{place.category}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        {place.distance}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#76FF03] font-medium mt-1 truncate">
                      Reward: {place.rewardTitle}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {alreadyJoined ? (
                    <span className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 font-medium text-xs flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-[#76FF03]" />
                      Joined
                    </span>
                  ) : (
                    <button
                      onClick={() => onAddPlace(place)}
                      className="px-3 py-1.5 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] text-black font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Join Card</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
