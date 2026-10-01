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
  neighborhood?: string;
  wilaya?: string;
  distance: string;
  openingHours: string;
  accentColor: string;
  themeGradient: string;
  imageEmoji: string;
  imageUrl: string;
  googleMapsUrl: string;
  phone?: string;
  stampsCount: number; // Strictly 0 to 6
  maxStamps: 6;
  rewardTitle: string;
  rewardDescription: string;
  qrSecretCode: string;
  uniqueCode?: string;
  totalRewardsClaimed: number;
  perks: string[];
  // Multilingual translations
  nameAr?: string;
  nameFr?: string;
  nameEn?: string;
  categoryAr?: string;
  categoryFr?: string;
  categoryEn?: string;
  rewardTitleAr?: string;
  rewardTitleFr?: string;
  rewardTitleEn?: string;
  descriptionAr?: string;
  descriptionFr?: string;
  descriptionEn?: string;
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
  anonymousCode?: string;
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

export interface StampRequest {
  id: string;
  restaurantId: string;
  restaurantName: string;
  restaurantEmoji: string;
  userId: string;
  userEmail: string;
  userName: string;
  userAvatar: string;
  timestamp: string;
  createdAt: number;
  status: 'pending' | 'accepted' | 'rejected' | 'appealed' | 'appeal_approved' | 'appeal_rejected';
  resolvedAt?: string;
  currentStampsBefore: number;
  newStampsAfter?: number;
  // Appeal system fields
  appealNote?: string;
  appealedAt?: string;
  appealVerdict?: 'approved' | 'rejected';
  appealResolvedBy?: string;
  appealResolvedAt?: string;
  appealVerdictNote?: string;
}

export interface MerchantSession {
  role: 'merchant' | 'super_admin';
  restaurantId?: string;
  restaurantName?: string;
  restaurant?: Restaurant;
  username: string;
  loginTime: string;
}

export interface AppUpdateInfo {
  version: string;
  releaseDate: string;
  title: string;
  titleAr: string;
  titleFr: string;
  description: string;
  descriptionAr: string;
  descriptionFr: string;
  highlightsAr: string[];
  highlightsFr: string[];
  highlightsEn: string[];
  isCritical?: boolean;
}

export interface AppNotification {
  id: string;
  type: 'app_update' | 'reward' | 'system' | 'broadcast';
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  timestamp: string;
  read: boolean;
  version?: string;
  senderName?: string;
}
