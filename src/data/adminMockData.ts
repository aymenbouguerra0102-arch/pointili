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

export const INITIAL_WINNERS_LOG: WinnerLogItem[] = [];

export const STORAGE_KEY_REGISTERED_USERS = 'pointili_registered_users_v2';

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

export const INITIAL_REGISTERED_USERS: UserProfile[] = [];
