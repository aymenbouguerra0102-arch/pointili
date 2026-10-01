import { UserProfile } from '../types';
import {
  RealScanLogEvent,
  getRealScanLogs,
  STORAGE_KEY_SCAN_EVENTS,
} from '../data/adminMockData';
import { getStampRequests } from '../data/stampRequestsManager';

export const SCAN_COOLDOWN_SECONDS = 3600; // 1 hour (60 minutes) anti-fraud window per restaurant
export const ONE_HOUR_MS = 60 * 60 * 1000; // ساعة كاملة بالمللي ثانية (3,600,000 ms)
export const SCAN_COOLDOWN_MS = ONE_HOUR_MS;

const STORAGE_KEY_DEVICE_ID = 'pointili_device_id_v2';

/**
 * دالة التحقق من وقت المسح (تطبق على كل مطعم بشكل منفصل)
 * منع المسح المتتالي لنفس المطعم إلا بعد مرور ساعة كاملة (60 دقيقة)
 */
export interface StoreScanCheckResult {
  allowed: boolean;
  remainingMinutes?: number;
  remainingSeconds?: number;
}

export function canUserScanStore(storeId: string): StoreScanCheckResult {
  const lastScanKey = `last_scan_store_${storeId}`;
  const lastScanTime = localStorage.getItem(lastScanKey) || localStorage.getItem(`last_scan_${storeId}`);

  if (!lastScanTime) {
    return { allowed: true }; // لم يقم بمسح هذا المطعم من قبل
  }

  const currentTime = new Date().getTime();
  const timeDifference = currentTime - parseInt(lastScanTime, 10);
  const oneHourInMs = ONE_HOUR_MS;

  if (timeDifference < oneHourInMs) {
    const remainingMinutes = Math.ceil((oneHourInMs - timeDifference) / (60 * 1000));
    const remainingSeconds = Math.ceil((oneHourInMs - timeDifference) / 1000);
    return {
      allowed: false,
      remainingMinutes: remainingMinutes,
      remainingSeconds: remainingSeconds,
    };
  }

  return { allowed: true }; // مر أكثر من ساعة على آخر زيارة لهذا المطعم تحديداً
}

/**
 * دالة التحقق من وقت المسح بناءً على توقيت المسح الأخير
 */
export function canUserScanNow(lastScanTimestamp: number | null): StoreScanCheckResult {
  if (!lastScanTimestamp) {
    return { allowed: true }; // إذا لم يقم بالمسح من قبل، يُسمح له فوراً
  }

  const currentTime = new Date().getTime();
  const timeDifference = currentTime - lastScanTimestamp;
  const oneHourInMs = ONE_HOUR_MS;

  if (timeDifference < oneHourInMs) {
    const remainingMinutes = Math.ceil((oneHourInMs - timeDifference) / (60 * 1000));
    const remainingSeconds = Math.ceil((oneHourInMs - timeDifference) / 1000);
    return {
      allowed: false,
      remainingMinutes: remainingMinutes,
      remainingSeconds: remainingSeconds,
    };
  }

  return { allowed: true }; // لقد مر أكثر من ساعة، مسموح بالمسح
}

/**
 * حفظ توقيت المسح الأخير لهذا المطعم في الـ localStorage
 */
export function recordStoreScanTimestamp(storeId: string, timestamp?: number): void {
  const currentTime = timestamp || new Date().getTime();
  localStorage.setItem(`last_scan_store_${storeId}`, currentTime.toString());
  localStorage.setItem(`last_scan_${storeId}`, currentTime.toString());
}

/**
 * إعادة تعيين مهلة المسح لمطعم معين (مفيدة للتجار والاختبار)
 */
export function resetStoreScanCooldown(storeId: string): void {
  localStorage.removeItem(`last_scan_store_${storeId}`);
  localStorage.removeItem(`last_scan_${storeId}`);
}

/**
 * Get or create a unique persistent hardware/device identifier
 */
export function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
    if (existing && existing.startsWith('DEV-BBA-')) {
      return existing;
    }
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const timePart = Date.now().toString(36).slice(-4).toUpperCase();
    const newId = `DEV-BBA-${randPart}-${timePart}`;
    localStorage.setItem(STORAGE_KEY_DEVICE_ID, newId);
    return newId;
  } catch {
    return 'DEV-BBA-9999-TEMP';
  }
}

/**
 * Detect client platform (OS, Browser, Screen)
 */
export function getDevicePlatformInfo(): string {
  if (typeof window === 'undefined') return 'Web Client';
  const ua = navigator.userAgent;

  let os = 'Unknown OS';
  if (/android/i.test(ua)) os = 'Android';
  else if (/iPad|iPhone|iPod/.test(ua)) os = 'iOS';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Browser';
  if (/Chrome/i.test(ua) && !/Edge|Edg/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Edg/i.test(ua)) browser = 'Edge';

  return `${os} · ${browser}`;
}

/**
 * Resolve effective customer Gmail account or identity
 */
export function resolveUserEmail(user?: UserProfile | null): string {
  if (user?.email && user.email.includes('@')) {
    return user.email.trim().toLowerCase();
  }
  try {
    const stored = localStorage.getItem('user_email');
    if (stored && stored.includes('@')) {
      return stored.trim().toLowerCase();
    }
  } catch {}
  return user?.id ? `${user.id.toLowerCase()}@pointili.app` : 'guest.client@pointili.app';
}

export interface ScanEligibilityResult {
  isAllowed: boolean;
  secondsRemaining: number;
  minutesRemaining?: number;
  userEmail: string;
  deviceId: string;
  devicePlatform: string;
  lastScanTimestamp?: string;
  lastScanTimeFormatted?: string;
  reason?: string;
  storeId?: string;
}

/**
 * Validates if the customer is allowed to scan this specific restaurant's QR code.
 * Enforces a strict 1-hour (60-minute) cooldown per restaurant by localStorage, Gmail account, and Device ID.
 */
export function checkScanCooldown(
  restaurantId: string,
  user?: UserProfile | null
): ScanEligibilityResult {
  const deviceId = getOrCreateDeviceId();
  const devicePlatform = getDevicePlatformInfo();
  const userEmail = resolveUserEmail(user);
  const userId = user?.id || '';
  const now = Date.now();

  // 1. Direct check per restaurant storage key (canUserScanStore)
  const storeCheck = canUserScanStore(restaurantId);
  if (!storeCheck.allowed) {
    const minutesRemaining = storeCheck.remainingMinutes || 1;
    const secondsRemaining = storeCheck.remainingSeconds || minutesRemaining * 60;
    const lastScanMs = now - (ONE_HOUR_MS - secondsRemaining * 1000);
    return {
      isAllowed: false,
      secondsRemaining,
      minutesRemaining,
      userEmail,
      deviceId,
      devicePlatform,
      storeId: restaurantId,
      lastScanTimeFormatted: new Date(lastScanMs).toLocaleTimeString('ar-DZ', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      reason: `⏳ عذراً، لقد قمت بمسح كود هذا المطعم مؤخراً. يرجى الانتظار لمدة ${minutesRemaining} دقيقة أخرى لتكرار زيارته.`,
    };
  }

  // 2. Check persistent scan events database
  const scanLogs = getRealScanLogs();
  
  // Find any successful scan for this restaurant in the last 1 hour
  const recentMatchingScan = scanLogs.find((scan) => {
    if (scan.restaurantId !== restaurantId) return false;
    // Disregard scans that were already blocked attempts
    if (scan.status === 'rate_limited') return false;

    const scanTime = new Date(scan.timestamp).getTime();
    if (isNaN(scanTime)) return false;

    const elapsed = now - scanTime;
    if (elapsed < 0 || elapsed > SCAN_COOLDOWN_MS) return false;

    // Check if same Gmail, same userId, or same physical device
    const matchesEmail =
      scan.userEmail && scan.userEmail.toLowerCase() === userEmail.toLowerCase();
    const matchesUserId = userId && scan.userId && scan.userId === userId;
    const matchesDevice = scan.deviceId && scan.deviceId === deviceId;

    return Boolean(matchesEmail || matchesUserId || matchesDevice);
  });

  // 3. Also check live active stamp requests queue
  const pendingRequests = getStampRequests();
  const recentMatchingReq = pendingRequests.find((req) => {
    if (req.restaurantId !== restaurantId) return false;
    if (req.status === 'rejected' || req.status === 'appeal_rejected') return false;

    const reqTime = req.createdAt || 0;
    const elapsed = now - reqTime;
    if (elapsed < 0 || elapsed > SCAN_COOLDOWN_MS) return false;

    const matchesEmail =
      req.userEmail && req.userEmail.toLowerCase() === userEmail.toLowerCase();
    const matchesUserId = userId && req.userId && req.userId === userId;
    const matchesDevice = req.deviceId && req.deviceId === deviceId;

    return Boolean(matchesEmail || matchesUserId || matchesDevice);
  });

  const matchedScan = recentMatchingScan || recentMatchingReq;

  if (matchedScan) {
    const scanTimestampMs =
      'createdAt' in matchedScan && matchedScan.createdAt
        ? matchedScan.createdAt
        : new Date((matchedScan as RealScanLogEvent).timestamp).getTime();

    const elapsed = Math.max(0, now - scanTimestampMs);
    const secondsRemaining = Math.max(1, Math.ceil((SCAN_COOLDOWN_MS - elapsed) / 1000));
    const minutesRemaining = Math.max(1, Math.ceil(secondsRemaining / 60));

    const timeFormatted =
      'timeStr' in matchedScan
        ? matchedScan.timeStr
        : new Date(scanTimestampMs).toLocaleTimeString('ar-DZ', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

    return {
      isAllowed: false,
      secondsRemaining,
      minutesRemaining,
      userEmail,
      deviceId,
      devicePlatform,
      storeId: restaurantId,
      lastScanTimestamp:
        'timestamp' in matchedScan
          ? (matchedScan as RealScanLogEvent).timestamp
          : new Date(scanTimestampMs).toISOString(),
      lastScanTimeFormatted: timeFormatted,
      reason: `⏳ عذراً، لقد قمت بمسح كود هذا المطعم مؤخراً. يرجى الانتظار لمدة ${minutesRemaining} دقيقة أخرى لتكرار زيارته.`,
    };
  }

  return {
    isAllowed: true,
    secondsRemaining: 0,
    minutesRemaining: 0,
    userEmail,
    deviceId,
    devicePlatform,
    storeId: restaurantId,
  };
}

/**
 * Record a scan event into the database with timestamp, Gmail, and Device ID
 */
export function recordDatabaseScan(params: {
  restaurantId: string;
  restaurantName: string;
  user?: UserProfile | null;
  status: 'accepted' | 'rate_limited';
  blockReason?: string;
}): RealScanLogEvent {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toLocaleTimeString('ar-DZ', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const deviceId = getOrCreateDeviceId();
  const devicePlatform = getDevicePlatformInfo();
  const userEmail = resolveUserEmail(params.user);

  const logItem: RealScanLogEvent = {
    id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    restaurantId: params.restaurantId,
    restaurantName: params.restaurantName,
    timestamp: now.toISOString(),
    dateStr,
    timeStr,
    userId: params.user?.id || 'usr_guest',
    userName: params.user?.name || 'زبون معتمد',
    userEmail,
    deviceId,
    devicePlatform,
    status: params.status,
    blockReason: params.blockReason,
  };

  try {
    const current = getRealScanLogs();
    const updated = [logItem, ...current];
    localStorage.setItem(STORAGE_KEY_SCAN_EVENTS, JSON.stringify(updated.slice(0, 1500)));

    // Record per-store scan timestamp on successful scan
    if (params.status === 'accepted') {
      recordStoreScanTimestamp(params.restaurantId, now.getTime());
    }

    // Dispatch event for live UI listener
    window.dispatchEvent(new CustomEvent('pointili_scan_logged', { detail: logItem }));
  } catch (err) {
    console.warn('Failed to persist scan event:', err);
  }

  return logItem;
}

/**
 * دالة تنفيذ عملية المسح للمطعم (مطابقة تماماً لطلب المستخدم)
 */
export function handleStoreScan(
  storeId: string,
  options?: {
    onSuccess?: () => void;
    onBlocked?: (remainingMinutes: number) => void;
    showAlerts?: boolean;
  }
): { allowed: boolean; remainingMinutes?: number } {
  const checkResult = canUserScanStore(storeId);

  if (!checkResult.allowed) {
    const mins = checkResult.remainingMinutes || 60;
    if (options?.showAlerts) {
      alert(
        `⏳ عذراً، لقد قمت بمسح كود هذا المطعم مؤخراً. يرجى الانتظار لمدة ${mins} دقيقة أخرى لتكرار زيارته.`
      );
    }
    options?.onBlocked?.(mins);
    return {
      allowed: false,
      remainingMinutes: mins,
    };
  }

  // إذا سمح النظام بالمسح، نقوم بتسجيل الوقت الحالي لهذا المطعم فقط
  const currentTime = new Date().getTime();
  recordStoreScanTimestamp(storeId, currentTime);

  if (options?.showAlerts) {
    alert(`✅ تم التحقق بنجاح! تم تسجيل زيارتك لهذا المطعم (معرف المحل: ${storeId}).`);
  }
  options?.onSuccess?.();

  return { allowed: true };
}
