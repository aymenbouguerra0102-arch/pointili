import { UserProfile } from '../types';
import {
  RealScanLogEvent,
  getRealScanLogs,
  STORAGE_KEY_SCAN_EVENTS,
} from '../data/adminMockData';
import { getStampRequests } from '../data/stampRequestsManager';

export const SCAN_COOLDOWN_SECONDS = 60; // 1 minute anti-fraud window
export const SCAN_COOLDOWN_MS = SCAN_COOLDOWN_SECONDS * 1000;

const STORAGE_KEY_DEVICE_ID = 'pointili_device_id_v2';

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
  userEmail: string;
  deviceId: string;
  devicePlatform: string;
  lastScanTimestamp?: string;
  lastScanTimeFormatted?: string;
  reason?: string;
}

/**
 * Validates if the customer is allowed to scan this specific restaurant's QR code.
 * Enforces a strict 60-second cooldown per restaurant by both Gmail account AND Device ID.
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

  // 1. Check persistent scan events database
  const scanLogs = getRealScanLogs();
  
  // Find any successful scan for this restaurant in the last 60 seconds
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

  // 2. Also check live active stamp requests queue
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
      userEmail,
      deviceId,
      devicePlatform,
      lastScanTimestamp:
        'timestamp' in matchedScan
          ? (matchedScan as RealScanLogEvent).timestamp
          : new Date(scanTimestampMs).toISOString(),
      lastScanTimeFormatted: timeFormatted,
      reason: `تم رصد مسح متكرر لنفس الكود خلال أقل من دقيقة (${secondsRemaining} ثانية متبقية)`,
    };
  }

  return {
    isAllowed: true,
    secondsRemaining: 0,
    userEmail,
    deviceId,
    devicePlatform,
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
    // Dispatch event for live UI listener
    window.dispatchEvent(new CustomEvent('pointili_scan_logged', { detail: logItem }));
  } catch (err) {
    console.warn('Failed to persist scan event:', err);
  }

  return logItem;
}
