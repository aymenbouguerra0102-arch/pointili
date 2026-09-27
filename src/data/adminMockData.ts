import { DailyActivityPoint, WinnerLogItem, UserProfile } from '../types';

// Cryptographic SHA-256 hashes for secure administrative authentication
// Neither username nor password is saved in plaintext anywhere in code or storage
export const ADMIN_AUTH_HASHES = {
  userHash: '992d1481263074a6e753a50e7c09d5eb174a4b40c83e966db1e00c36b3979f6b',
  passHash: '19d3c16ab8ffdeb1ef2a30955361ffd3f7e66b634f7d7b51dbd188902934bb87',
};

export async function hashStringSHA256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyAdminCredentials(usernameInput: string, passwordInput: string): Promise<boolean> {
  const userHash = await hashStringSHA256(usernameInput.trim().toUpperCase());
  const passHash = await hashStringSHA256(passwordInput.trim());

  return (
    userHash === ADMIN_AUTH_HASHES.userHash &&
    passHash === ADMIN_AUTH_HASHES.passHash
  );
}

export const INITIAL_DAILY_ACTIVITY: DailyActivityPoint[] = [
  { day: 'Mon', dayAr: 'الإثنين', scans: 430, activeUsers: 280, rewardsUnlocked: 18 },
  { day: 'Tue', dayAr: 'الثلاثاء', scans: 590, activeUsers: 395, rewardsUnlocked: 29 },
  { day: 'Wed', dayAr: 'الأربعاء', scans: 512, activeUsers: 340, rewardsUnlocked: 24 },
  { day: 'Thu', dayAr: 'الخميس', scans: 740, activeUsers: 490, rewardsUnlocked: 42 },
  { day: 'Fri', dayAr: 'الجمعة', scans: 920, activeUsers: 610, rewardsUnlocked: 58 },
  { day: 'Sat', dayAr: 'السبت', scans: 980, activeUsers: 680, rewardsUnlocked: 65 },
  { day: 'Sun', dayAr: 'الأحد (اليوم)', scans: 614, activeUsers: 412, rewardsUnlocked: 37 },
];

export const INITIAL_WINNERS_LOG: WinnerLogItem[] = [
  {
    id: 'win_1',
    userName: 'Alex Rivera',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    restaurantName: 'Burger & Craft Lab',
    restaurantEmoji: '🍔',
    rewardTitle: 'Free Meal/Drink (Deluxe Smash Burger + Truffle Fries)',
    timestamp: '12 mins ago',
    code: 'PTL-LAB-2026',
    status: 'unlocked',
  },
  {
    id: 'win_2',
    userName: 'Sophia Chen',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    restaurantName: 'Neon Bean Specialty Coffee',
    restaurantEmoji: '☕',
    rewardTitle: 'Free Signature Beverage (Iced Oat Latte)',
    timestamp: '45 mins ago',
    code: 'PTL-BEAN-9812',
    status: 'claimed',
  },
  {
    id: 'win_3',
    userName: 'Marcus Vance',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    restaurantName: 'Crust & Fire Pizzeria',
    restaurantEmoji: '🍕',
    rewardTitle: 'Free 12" Personal Pizza or Calzone',
    timestamp: '2 hours ago',
    code: 'PTL-FIRE-4401',
    status: 'claimed',
  },
  {
    id: 'win_4',
    userName: 'Nadia Larbi',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    restaurantName: 'Umami Ramen House',
    restaurantEmoji: '🍜',
    rewardTitle: 'Free Signature Ramen Bowl & Gyoza Combo',
    timestamp: '3 hours ago',
    code: 'PTL-RAMEN-7723',
    status: 'claimed',
  },
  {
    id: 'win_5',
    userName: 'Karim Ziani',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    restaurantName: 'Matcha Bloom Tea Bar',
    restaurantEmoji: '🍵',
    rewardTitle: 'Free Large Signature Matcha Boba',
    timestamp: '5 hours ago',
    code: 'PTL-MATCHA-1120',
    status: 'claimed',
  },
  {
    id: 'win_6',
    userName: 'Yasmine Mansour',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    restaurantName: 'Sourdough & Butter',
    restaurantEmoji: '🥐',
    rewardTitle: 'Free Artisan Loaf & Pastry Box',
    timestamp: 'Yesterday',
    code: 'PTL-BAKE-5542',
    status: 'claimed',
  },
];

export const INITIAL_REGISTERED_USERS: UserProfile[] = [
  {
    id: 'usr_001',
    name: 'Alex Rivera',
    email: 'alex.rivera@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    memberSince: 'March 2026',
    tier: 'Gold Loyalty',
    stampsCount: 21,
    rewardsWon: 3,
  },
  {
    id: 'usr_002',
    name: 'Sophia Chen',
    email: 'sophia.chen@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    memberSince: 'January 2026',
    tier: 'Platinum Club',
    stampsCount: 34,
    rewardsWon: 5,
  },
  {
    id: 'usr_003',
    name: 'Marcus Vance',
    email: 'marcus.vance@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    memberSince: 'February 2026',
    tier: 'VIP Foodie',
    stampsCount: 18,
    rewardsWon: 2,
  },
  {
    id: 'usr_004',
    name: 'Nadia Larbi',
    email: 'nadia.larbi@outlook.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    memberSince: 'March 2026',
    tier: 'Silver Member',
    stampsCount: 12,
    rewardsWon: 1,
  },
  {
    id: 'usr_005',
    name: 'Karim Ziani',
    email: 'karim.z@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    memberSince: 'February 2026',
    tier: 'Gold Loyalty',
    stampsCount: 26,
    rewardsWon: 4,
  },
  {
    id: 'usr_006',
    name: 'Yasmine Mansour',
    email: 'yasmine.m@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    memberSince: 'March 2026',
    tier: 'Active Foodie',
    stampsCount: 9,
    rewardsWon: 1,
  },
];
