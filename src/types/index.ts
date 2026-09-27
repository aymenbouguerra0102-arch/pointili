export interface StampHistoryItem {
  id: string;
  type: 'stamp_added' | 'reward_unlocked' | 'reward_redeemed';
  timestamp: string;
  restaurantId: string;
  restaurantName: string;
  details: string;
}

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  distance: string;
  openingHours: string;
  accentColor: string;
  themeGradient: string;
  imageEmoji: string;
  stampsCount: number; // 0 to 6
  maxStamps: 6;
  rewardTitle: string;
  rewardDescription: string;
  qrSecretCode: string;
  totalRewardsClaimed: number;
  perks: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  memberSince: string;
  tier: string;
  stampsCount?: number;
  rewardsWon?: number;
}

export interface AdminStats {
  totalRegisteredUsers: number;
  totalRewardsClaimed: number;
  dailyActiveUsers: number;
  dailyScansToday: number;
  totalPartnerRestaurants: number;
}

export interface DailyActivityPoint {
  day: string;
  dayAr: string;
  scans: number;
  activeUsers: number;
  rewardsUnlocked: number;
}

export interface WinnerLogItem {
  id: string;
  userName: string;
  userAvatar: string;
  restaurantName: string;
  restaurantEmoji: string;
  rewardTitle: string;
  timestamp: string;
  code: string;
  status: 'claimed' | 'unlocked';
}
