import { UserProfile } from '../types';

/**
 * Mask email address to hide identity in public views
 * Example: aymenbouguerra0102@gmail.com -> aym***@gmail.com
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'user***@priv.com';
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return `${localPart}***@${domain}`;
  }
  const visiblePrefix = localPart.slice(0, 3);
  return `${visiblePrefix}***@${domain}`;
}

/**
 * Generate a consistent anonymous Google ID code based on user's email or sub ID
 * Example: GID-BBA-8492
 */
export function generateGoogleAnonymousCode(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const positive = Math.abs(hash);
  const num = (positive % 9000) + 1000;
  return `GID-BBA-${num}`;
}

/**
 * Decode JWT credential returned by Google Identity Services (GIS)
 */
export function decodeGoogleJwt(token: string): {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
} | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Error decoding Google JWT token', err);
    return null;
  }
}

/**
 * Construct UserProfile from Google credentials with full privacy shielding
 */
export function createGoogleUserProfile(params: {
  email: string;
  name?: string;
  picture?: string;
  sub?: string;
  customNickname?: string;
}): UserProfile {
  const { email, name, picture, sub, customNickname } = params;
  const anonCode = generateGoogleAnonymousCode(sub || email);
  const masked = maskEmail(email);

  // If user provided a custom nickname, use it, otherwise use Google name or masked display
  const displayName = customNickname?.trim() || name || `مستخدم Google (${anonCode})`;

  const avatarUrl =
    picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName
    )}&background=76FF03&color=000000&bold=true&rounded=true&size=200`;

  return {
    id: `usr_g_${sub ? sub.slice(0, 12) : anonCode.toLowerCase().replace(/-/g, '_')}`,
    name: displayName,
    email: email.trim().toLowerCase(),
    avatarUrl,
    memberSince: new Date().toLocaleDateString('ar-DZ', {
      month: 'long',
      year: 'numeric',
    }),
    tier: 'حساب Google موثّق 🛡️ (حماية الخصوصية)',
    stampsCount: 0,
    rewardsWon: 0,
    anonymousCode: anonCode,
    isGoogleAuth: true,
    maskedEmail: masked,
    hideEmailFromPublic: true,
    googleSub: sub,
  };
}

/**
 * Initialize Google Identity Services (GIS) if available
 */
export function initGoogleIdentityServices(
  onSuccess: (user: UserProfile) => void
): boolean {
  if (typeof window === 'undefined') return false;

  const clientId =
    (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_CLIENT_ID ||
    '798728501590-pointili-bba.apps.googleusercontent.com';

  const google = (window as unknown as { google?: { accounts?: { id: {
    initialize: (config: any) => void;
    renderButton: (parent: HTMLElement, options: any) => void;
    prompt: () => void;
  } } } }).google;

  if (google?.accounts?.id) {
    try {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential?: string }) => {
          if (response.credential) {
            const decoded = decodeGoogleJwt(response.credential);
            if (decoded && decoded.email) {
              const profile = createGoogleUserProfile({
                email: decoded.email,
                name: decoded.name,
                picture: decoded.picture,
                sub: decoded.sub,
              });
              onSuccess(profile);
            }
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      return true;
    } catch (err) {
      console.warn('GIS initialization notice:', err);
    }
  }
  return false;
}
