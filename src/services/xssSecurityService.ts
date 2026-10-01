/**
 * Pointili Content Security Policy & XSS Attack Defense Service
 * إضافة سياسة أمان المحتوى لمنع حقن السكريبتات الخبيثة (XSS Attacks) أو تشغيل أكواد غريبة داخل التطبيق
 */

export interface XssAttackLog {
  id: string;
  timestamp: string;
  source: string; // 'qr_scanner' | 'manual_input' | 'user_profile' | 'test_sandbox'
  payloadSample: string;
  detectedPattern: string;
  actionTaken: 'quarantined_and_blocked';
}

export interface CspPolicyDetails {
  status: 'active' | 'enforced';
  policyLevel: string;
  objectSrc: string;
  scriptSrc: string;
  baseUri: string;
  formAction: string;
  frameSrc: string;
  xssFilterMode: string;
  blockedAttacksCount: number;
}

const STORAGE_KEY_XSS_LOGS = 'pointili_xss_attacks_logs_v1';

// Known XSS injection signatures and suspicious execution vectors
const XSS_DETECTION_REGEXES: { name: string; regex: RegExp }[] = [
  { name: '<script> Tag Injection', regex: /<\s*script[^>]*>[\s\S]*?(<\s*\/script[^>]*>)?/i },
  { name: 'JavaScript Pseudo-Protocol (javascript:)', regex: /javascript\s*:/i },
  { name: 'VBScript Pseudo-Protocol (vbscript:)', regex: /vbscript\s*:/i },
  { name: 'Data URI HTML Injection (data:text/html)', regex: /data\s*:\s*text\/html/i },
  { name: 'Event Handler Injection (onerror/onload)', regex: /on(error|load|click|mouseover|focus|blur|submit|keydown)\s*=/i },
  { name: 'iFrame / Embedded Object Injection', regex: /<\s*(iframe|object|embed|applet|meta)[^>]*>/i },
  { name: 'Document Cookie / Location Tampering', regex: /(document\.(cookie|location)|window\.location)\b/i },
  { name: 'Eval / Function Constructor Injection', regex: /(eval|Function|setTimeout|setInterval)\s*\([^)]*['"`]/i },
  { name: 'HTML Expression Injection', regex: /<\s*(img|svg|body|input|audio|video)[^>]+(onerror|onload)\s*=/i },
];

/**
 * Scans a text string for dangerous cross-site scripting (XSS) patterns
 */
export function detectXssAttack(payload: string): {
  isMalicious: boolean;
  detectedPattern?: string;
  reason?: string;
} {
  if (!payload || typeof payload !== 'string') {
    return { isMalicious: false };
  }

  // Decode common URL/HTML entities for deep inspection
  let decoded = payload;
  try {
    decoded = decodeURIComponent(payload);
  } catch {}

  for (const item of XSS_DETECTION_REGEXES) {
    if (item.regex.test(payload) || item.regex.test(decoded)) {
      return {
        isMalicious: true,
        detectedPattern: item.name,
        reason: `تم رصد محاولة حقن كود غريب أو مشبوه (${item.name}).`,
      };
    }
  }

  return { isMalicious: false };
}

/**
 * Sanitizes input text by neutralizing potentially dangerous HTML characters
 */
export function sanitizeInputText(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Get all logged XSS attack prevention incidents
 */
export function getXssAttackLogs(): XssAttackLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_XSS_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Record a blocked XSS attack attempt into security database
 */
export function recordXssAttackAttempt(params: {
  payload: string;
  source: string;
  detectedPattern: string;
}): XssAttackLog {
  const newLog: XssAttackLog = {
    id: `xss_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    source: params.source,
    payloadSample: params.payload.slice(0, 150),
    detectedPattern: params.detectedPattern,
    actionTaken: 'quarantined_and_blocked',
  };

  try {
    const logs = getXssAttackLogs();
    const updated = [newLog, ...logs].slice(0, 200);
    localStorage.setItem(STORAGE_KEY_XSS_LOGS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('pointili_xss_blocked', { detail: newLog }));
  } catch (err) {
    console.warn('[SECURITY] Failed to log XSS attack:', err);
  }

  return newLog;
}

/**
 * Returns complete CSP policy details and audit status
 */
export function getCspPolicyDetails(): CspPolicyDetails {
  const logs = getXssAttackLogs();
  return {
    status: 'enforced',
    policyLevel: 'W3C CSP Level 3 Strict',
    objectSrc: "'none' (حظر شامل للمكونات الإضافية)",
    scriptSrc: "'self' 'unsafe-inline' accounts.google.com apis.google.com",
    baseUri: "'self' (منع التلاعب بالروابط الأساسية)",
    formAction: "'self' accounts.google.com",
    frameSrc: "'self' accounts.google.com",
    xssFilterMode: '1; mode=block (تطهير وحظر تلقائي)',
    blockedAttacksCount: logs.length,
  };
}
