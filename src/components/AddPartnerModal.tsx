import React, { useState } from 'react';
import { Restaurant } from '../types';
import { X, Store, Sparkles, Plus, MapPin, Gift, Tag } from 'lucide-react';

interface AddPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRestaurant: (newRestaurant: Restaurant) => void;
}

export const AddPartnerModal: React.FC<AddPartnerModalProps> = ({
  isOpen,
  onClose,
  onAddRestaurant,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Specialty Coffee');
  const [address, setAddress] = useState('');
  const [rewardTitle, setRewardTitle] = useState('Free Meal/Drink of Your Choice');
  const [rewardDescription, setRewardDescription] = useState('Redeem any signature item on completion of 6 stamps.');
  const [imageEmoji, setImageEmoji] = useState('☕');

  if (!isOpen) return null;

  const emojiOptions = ['☕', '🍔', '🍕', '🍜', '🍵', '🥐', '🥗', '🌮', '🍣', '🍦', '🍩', '🧋'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newRest: Restaurant = {
      id: `rest_${slug}_${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      category: category.trim(),
      description: `Partner establishment offering digital loyalty rewards with Pointili.`,
      address: address.trim() || 'Downtown City Center',
      distance: '0.4 mi away',
      openingHours: '8:00 AM - 10:00 PM',
      accentColor: '#76FF03',
      themeGradient: 'from-zinc-900 to-zinc-950',
      imageEmoji: imageEmoji,
      stampsCount: 0,
      maxStamps: 6,
      rewardTitle: rewardTitle.trim(),
      rewardDescription: rewardDescription.trim(),
      qrSecretCode: `POINTILI_QR_${slug.toUpperCase()}_2026`,
      totalRewardsClaimed: 0,
      perks: ['10% off member perk', 'Instant stamp with QR', 'Priority checkout'],
    };

    onAddRestaurant(newRest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-[#76FF03] text-xs font-bold uppercase tracking-wider">
          <Store className="w-4 h-4" />
          <span>Admin Restaurant Onboarding</span>
        </div>

        <h3 className="text-xl font-extrabold text-white font-['Plus_Jakarta_Sans'] mb-4">
          Add Partner Restaurant
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Store / Restaurant Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Matcha Social Club"
              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#76FF03]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Category
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Cafe & Bakery"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#76FF03]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Store Icon
              </label>
              <div className="flex gap-1.5 overflow-x-auto p-1 bg-zinc-900 rounded-xl border border-zinc-800">
                {emojiOptions.slice(0, 5).map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setImageEmoji(em)}
                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                      imageEmoji === em
                        ? 'bg-[#76FF03] text-black scale-110 shadow-sm'
                        : 'hover:bg-zinc-800 text-white'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Store Address & Location
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 55 Republic Avenue, Algiers"
              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#76FF03]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Unlocked Reward Title (Earned at 6 Stamps)
            </label>
            <input
              type="text"
              required
              value={rewardTitle}
              onChange={(e) => setRewardTitle(e.target.value)}
              placeholder="e.g. Free Signature Coffee or Gourmet Burger"
              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#76FF03]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Reward Terms & Description
            </label>
            <textarea
              rows={2}
              value={rewardDescription}
              onChange={(e) => setRewardDescription(e.target.value)}
              placeholder="e.g. Valid for any main course or beverage on your next visit."
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#76FF03]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#76FF03] hover:bg-[#8aff24] active:scale-[0.98] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl shadow-[#76FF03]/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Partner & Generate QR Stand</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
