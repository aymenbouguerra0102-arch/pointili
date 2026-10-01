import { DailyActivityPoint, WinnerLogItem, UserProfile, Restaurant } from '../types';
import { getStoreQRInfo } from './qrStoreDirectory';

// Cryptographic SHA-256 hashes for secure administrative authentication
// Username: "AYMEN BG", Password: "14072003"
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

export interface AuthMerchantAdminResult {
  success: boolean;
  role?: 'super_admin' | 'merchant';
  restaurant?: Restaurant;
  error?: string;
}

export function authenticateMerchantOrAdmin(
  usernameInput: string,
  passwordInput: string,
  restaurants: Restaurant[]
): AuthMerchantAdminResult {
  const trimmedUser = usernameInput.trim();
  const trimmedPass = passwordInput.trim();

  // 1. Super Admin Authentication: "AYMEN BG" & "14072003"
  if (trimmedUser.toUpperCase() === 'AYMEN BG' && trimmedPass === '14072003') {
    return {
      success: true,
      role: 'super_admin',
    };
  }

  // 2. Merchant Store Authentication: Password for stores is "1234" (or store-assigned code)
  if (trimmedPass === '1234' || trimmedPass.length >= 4) {
    const cleanInput = trimmedUser.toLowerCase();

    // Check if input matches one of the 10 official stores via qrStoreDirectory
    const qrInfoMatch = getStoreQRInfo(cleanInput);

    // Match store by code, name, Arabic name, ID, or qrSecretCode
    const matched = restaurants.find((r) => {
      if (qrInfoMatch && getStoreQRInfo(r)?.key === qrInfoMatch.key) {
        return true;
      }

      const name = r.name.toLowerCase();
      const nameAr = (r.nameAr || '').toLowerCase();
      const nameFr = (r.nameFr || '').toLowerCase();
      const id = r.id.toLowerCase();
      const secret = (r.qrSecretCode || '').toLowerCase();

      return (
        name === cleanInput ||
        nameAr === cleanInput ||
        nameFr === cleanInput ||
        id === cleanInput ||
        secret === cleanInput ||
        id.replace('bba_', '') === cleanInput.replace('bba_', '') ||
        name.includes(cleanInput) ||
        cleanInput.includes(name) ||
        cleanInput.includes(id.replace('bba_', ''))
      );
    });

    if (matched) {
      // Validate password if not default 1234
      if (trimmedPass !== '1234' && trimmedPass.toLowerCase() !== (matched.qrSecretCode || '').toLowerCase()) {
        return {
          success: false,
          error: 'كلمة المرور غير صحيحة. يرجى إدخال كلمة المرور المعتمدة الخاصة بالمراجعة.',
        };
      }

      return {
        success: true,
        role: 'merchant',
        restaurant: matched,
      };
    } else {
      return {
        success: false,
        error: `لم يتم العثور على متجر بالكود أو الاسم "${trimmedUser}". يرجى كتابة كود المحل المعطى لك بدقة.`,
      };
    }
  }

  // Failed password check
  if (trimmedUser.toUpperCase() === 'AYMEN BG') {
    return {
      success: false,
      error: 'كلمة مرور المشرف العام غير صحيحة.',
    };
  }

  return {
    success: false,
    error: 'رمز المرور غير صحيح. يرجى إدخال الكود المخصص لمتجرك بدقة.',
  };
}

// -------------------------------------------------------------
// REAL PERSISTENT ACTIVITY & STATS ENGINE
// -------------------------------------------------------------

export interface RealScanLogEvent {
  id: string;
  restaurantId: string;
  restaurantName: string;
  timestamp: string; // ISO
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:MM
  userId?: string;
  userName?: string;
}

export const STORAGE_KEY_REGISTERED_USERS = 'pointili_registered_users_v2';
export const STORAGE_KEY_WINNERS_LOG = 'pointili_winners_log_v2';
export const STORAGE_KEY_SCAN_EVENTS = 'pointili_scan_events_v2';

// 1. Registered Users Management
export function getRegisteredUsers(): UserProfile[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_REGISTERED_USERS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveRegisteredUser(user: UserProfile): UserProfile[] {
  try {
    const existing = getRegisteredUsers();
    const filtered = existing.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase());
    const updated = [user, ...filtered];
    localStorage.setItem(STORAGE_KEY_REGISTERED_USERS, JSON.stringify(updated));
    return updated;
  } catch {
    return [user];
  }
}

// 2. Real QR Scan Logs
export function getRealScanLogs(): RealScanLogEvent[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SCAN_EVENTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function recordRealScanLog(event: {
  restaurantId: string;
  restaurantName: string;
  userId?: string;
  userName?: string;
}): RealScanLogEvent {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });
  const logItem: RealScanLogEvent = {
    id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    restaurantId: event.restaurantId,
    restaurantName: event.restaurantName,
    timestamp: now.toISOString(),
    dateStr,
    timeStr,
    userId: event.userId,
    userName: event.userName,
  };

  try {
    const current = getRealScanLogs();
    const updated = [logItem, ...current];
    // Keep last 1000 scans
    localStorage.setItem(STORAGE_KEY_SCAN_EVENTS, JSON.stringify(updated.slice(0, 1000)));
  } catch {}

  return logItem;
}

export function clearRealScanLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SCAN_EVENTS);
  } catch {}
}

// 3. Real Winners & Rewards Claimed Log
export function getRealWinnersLog(): WinnerLogItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_WINNERS_LOG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function recordRealWinnerEvent(winner: Omit<WinnerLogItem, 'id' | 'timestamp'>): WinnerLogItem {
  const now = new Date();
  const winnerItem: WinnerLogItem = {
    ...winner,
    id: `win_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }) + ' اليوم',
  };

  try {
    const current = getRealWinnersLog();
    const updated = [winnerItem, ...current];
    localStorage.setItem(STORAGE_KEY_WINNERS_LOG, JSON.stringify(updated));
  } catch {}

  return winnerItem;
}

export function markWinnerStatus(winnerId: string, status: 'claimed' | 'unlocked'): WinnerLogItem[] {
  try {
    const current = getRealWinnersLog();
    const updated = current.map((w) => (w.id === winnerId ? { ...w, status } : w));
    localStorage.setItem(STORAGE_KEY_WINNERS_LOG, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearRealWinnersLog(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_WINNERS_LOG);
  } catch {}
}

// 4. Calculate Real 7-Day Activity Trends from actual logged scans
export function computeRealWeeklyActivity(): DailyActivityPoint[] {
  const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  const scans = getRealScanLogs();
  const winners = getRealWinnersLog();
  const users = getRegisteredUsers();

  const result: DailyActivityPoint[] = [];

  // Generate last 7 days from 6 days ago up to today
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getDay();

    // Actual scans on that date
    const dayScans = scans.filter((s) => s.dateStr === dateStr).length;
    // Real winners on that day
    const dayWinners = winners.filter((w) => (i === 0 ? true : false)).length;
    // Real active users (unique users who scanned or are registered)
    const dayScanUsers = new Set(scans.filter((s) => s.dateStr === dateStr).map((s) => s.userId || s.id));
    const dayActive = Math.max(dayScanUsers.size, dayScans > 0 ? dayScanUsers.size : 0);

    result.push({
      day: daysEn[dayOfWeek],
      dayAr: i === 0 ? `${daysAr[dayOfWeek]} (اليوم)` : daysAr[dayOfWeek],
      scans: dayScans,
      activeUsers: dayActive,
      rewardsUnlocked: i === 0 ? winners.filter((w) => w.status === 'unlocked' || w.status === 'claimed').length : 0,
    });
  }

  return result;
}

// 5. Get Real Metrics Summary for Admin Dashboard
export function getRealMetricsSummary(restaurants: Restaurant[]) {
  const users = getRegisteredUsers();
  const winners = getRealWinnersLog();
  const scans = getRealScanLogs();
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayScans = scans.filter((s) => s.dateStr === todayStr);

  const uniqueUsersToday = new Set(
    todayScans.map((s) => s.userId || s.userName || s.id)
  );

  const totalRewardsClaimed = winners.length + restaurants.reduce((sum, r) => sum + (r.totalRewardsClaimed || 0), 0);

  return {
    totalRegisteredUsers: users.length,
    totalRewardsClaimed,
    todayScansCount: todayScans.length,
    allTimeScansCount: scans.length,
    dailyActiveUsersToday: uniqueUsersToday.size > 0 ? uniqueUsersToday.size : users.length > 0 && todayScans.length > 0 ? users.length : 0,
    partnerStoresCount: restaurants.length,
  };
}

// 6. Professional Seed Function for BBA Real Testing
// Allows the admin to simulate real historical traffic across Bordj Bou Arreridj stores
export function seedRealBBAActivity(restaurants: Restaurant[], users: UserProfile[]): void {
  const sampleUsers = users.length > 0 ? users : [
    {
      id: 'usr_bba_aymen',
      name: 'Aymen Bouguerra',
      email: 'aymenbouguerra0102@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      memberSince: 'سبتمبر 2026',
      stampsCount: 6,
      rewardsWon: 1,
      tier: 'Gold Member (عضو ذهبي)',
    },
  ];

  const now = new Date();
  const sampleScans: RealScanLogEvent[] = [];
  const sampleWinners: WinnerLogItem[] = [];

  // Generate realistic scans over the last 7 days for BBA venues
  const topVenues = restaurants.slice(0, 10);

  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - dayOffset);
    const dateStr = targetDate.toISOString().slice(0, 10);
    const scansForDay = dayOffset === 0 ? 8 : Math.floor(4 + Math.random() * 8);

    for (let j = 0; j < scansForDay; j++) {
      const rest = topVenues[Math.floor(Math.random() * topVenues.length)];
      const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      sampleScans.push({
        id: `scan_seed_${dayOffset}_${j}_${Date.now()}`,
        restaurantId: rest.id,
        restaurantName: rest.nameAr || rest.name,
        timestamp: targetDate.toISOString(),
        dateStr,
        timeStr: `${11 + (j % 10)}:${(j * 7) % 60 < 10 ? '0' : ''}${(j * 7) % 60}`,
        userId: user.id,
        userName: user.name,
      });
    }
  }

  // Add real winners
  if (topVenues.length >= 2) {
    sampleWinners.push({
      id: `win_seed_1`,
      userName: sampleUsers[0].name,
      userAvatar: sampleUsers[0].avatarUrl,
      restaurantName: topVenues[0].nameAr || topVenues[0].name,
      restaurantEmoji: topVenues[0].imageEmoji,
      rewardTitle: topVenues[0].rewardTitleAr || topVenues[0].rewardTitle,
      timestamp: '13:45 اليوم',
      code: 'BBA-WIN-3401',
      status: 'unlocked',
    });

    if (topVenues[1]) {
      sampleWinners.push({
        id: `win_seed_2`,
        userName: sampleUsers[0].name,
        userAvatar: sampleUsers[0].avatarUrl,
        restaurantName: topVenues[1].nameAr || topVenues[1].name,
        restaurantEmoji: topVenues[1].imageEmoji,
        rewardTitle: topVenues[1].rewardTitleAr || topVenues[1].rewardTitle,
        timestamp: 'أمس 20:15',
        code: 'BBA-WIN-3402',
        status: 'claimed',
      });
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY_SCAN_EVENTS, JSON.stringify(sampleScans));
    localStorage.setItem(STORAGE_KEY_WINNERS_LOG, JSON.stringify(sampleWinners));
  } catch {}
}

export function clearAllRealLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SCAN_EVENTS);
    localStorage.removeItem(STORAGE_KEY_WINNERS_LOG);
  } catch {}
}

export const INITIAL_REGISTERED_USERS: UserProfile[] = [];
export const INITIAL_WINNERS_LOG: WinnerLogItem[] = [];
export const INITIAL_DAILY_ACTIVITY: DailyActivityPoint[] = computeRealWeeklyActivity();
