export interface RegisteredQRStore {
  key: string;
  name: string;
  nameAr?: string;
  uniqueCode: string;
  aliases: string[];
  qrImagePath: string;
  payload: string;
}

// قائمة المطاعم مع كود QR خاص وحصري لكل محل (Stores Database)
export const storesDatabase = [
  { id: "burger_house_34", name: "Burger HOUSE 34", uniqueCode: "POINTILI_QR_BURGER_HOUSE_34" },
  { id: "217_fast_food", name: "217 (Fast Food)", uniqueCode: "POINTILI_QR_217_FAST_FOOD" },
  { id: "pizzeria_antakya", name: "Pizzeria Antakya", uniqueCode: "POINTILI_QR_PIZZERIA_ANTAKYA" },
  { id: "sparte_pizzeria", name: "Sparte Pizzeria", uniqueCode: "POINTILI_QR_SPARTE_PIZZERIA" },
  { id: "pizzeria_savannah_34", name: "Pizzeria Savannah 34", uniqueCode: "POINTILI_QR_PIZZERIA_SAVANNAH_34" },
  { id: "5_juillet_pizzeria", name: "5 juillet Pizzeria", uniqueCode: "POINTILI_QR_5_JUILLET_PIZZERIA" },
  { id: "chiken_house", name: "Chiken house", uniqueCode: "POINTILI_QR_CHIKEN_HOUSE" },
  { id: "34_food_fastfood", name: "34 Food Fastfood", uniqueCode: "POINTILI_QR_34_FOOD_FASTFOOD" },
  { id: "belarbi_fast_food", name: "Belarbi Fast Food", uniqueCode: "POINTILI_QR_BELARBI_FAST_FOOD" },
  { id: "rahim_cook", name: "Rahim cook", uniqueCode: "POINTILI_QR_RAHIM_COOK" }
];

export const OFFICIAL_10_QR_STORES: RegisteredQRStore[] = [
  {
    key: 'burger_house_34',
    name: 'Burger HOUSE 34',
    nameAr: 'برغر هاوس 34',
    uniqueCode: 'POINTILI_QR_BURGER_HOUSE_34',
    aliases: [
      'POINTILI_QR_BURGER_HOUSE_34',
      'pointili_qr_burger_house_34',
      'burger_house_34',
      'bba_burger_house_34',
      'burger house 34',
      'burger house',
      'burger_house',
      'برغر هاوس 34',
      'برجر هاوس 34',
    ],
    qrImagePath: '/qr-codes/burger_house_34.png',
    payload: 'pointili://scan?store=burger_house_34',
  },
  {
    key: '217_fast_food',
    name: '217 (Fast Food)',
    nameAr: '217 فاست فود',
    uniqueCode: 'POINTILI_QR_217_FAST_FOOD',
    aliases: [
      'POINTILI_QR_217_FAST_FOOD',
      'pointili_qr_217_fast_food',
      '217_fast_food',
      'bba_217_fast_food',
      '217 (fast food)',
      '217 (Fast Food)',
      '217 fast food',
      '217_fastfood',
      '217',
      '217 فاست فود',
    ],
    qrImagePath: '/qr-codes/217_fast_food.png',
    payload: 'pointili://scan?store=217_fast_food',
  },
  {
    key: 'pizzeria_antakya',
    name: 'Pizzeria Antakya',
    nameAr: 'بيتزا أنطاكيا',
    uniqueCode: 'POINTILI_QR_PIZZERIA_ANTAKYA',
    aliases: [
      'POINTILI_QR_PIZZERIA_ANTAKYA',
      'pointili_qr_pizzeria_antakya',
      'pizzeria_antakya',
      'bba_pizzeria_antakya',
      'pizzeria antakya',
      'antakya',
      'بيتزا أنطاكيا',
      'انطاكيا',
    ],
    qrImagePath: '/qr-codes/pizzeria_antakya.png',
    payload: 'pointili://scan?store=pizzeria_antakya',
  },
  {
    key: 'sparte_pizzeria',
    name: 'Sparte Pizzeria',
    nameAr: 'سبارت بيتزا',
    uniqueCode: 'POINTILI_QR_SPARTE_PIZZERIA',
    aliases: [
      'POINTILI_QR_SPARTE_PIZZERIA',
      'pointili_qr_sparte_pizzeria',
      'sparte_pizzeria',
      'bba_sparte_pizzeria',
      'sparte pizzeria',
      'sparte',
      'سبارت بيتزا',
      'سبارتا',
    ],
    qrImagePath: '/qr-codes/sparte_pizzeria.png',
    payload: 'pointili://scan?store=sparte_pizzeria',
  },
  {
    key: 'pizzeria_savannah_34',
    name: 'Pizzeria Savannah 34',
    nameAr: 'بيتزا سافانا 34',
    uniqueCode: 'POINTILI_QR_PIZZERIA_SAVANNAH_34',
    aliases: [
      'POINTILI_QR_PIZZERIA_SAVANNAH_34',
      'pointili_qr_pizzeria_savannah_34',
      'pizzeria_savannah_34',
      'bba_pizzeria_savannah',
      'bba_pizzeria_savannah_34',
      'pizzeria savannah 34',
      'pizzeria savannah',
      'savannah',
      'savannah 34',
      'بيتزا سافانا 34',
      'سافانا',
    ],
    qrImagePath: '/qr-codes/pizzeria_savannah_34.png',
    payload: 'pointili://scan?store=pizzeria_savannah_34',
  },
  {
    key: '5_juillet_pizzeria',
    name: '5 juillet Pizzeria',
    nameAr: 'بيتزا 5 جويلية',
    uniqueCode: 'POINTILI_QR_5_JUILLET_PIZZERIA',
    aliases: [
      'POINTILI_QR_5_JUILLET_PIZZERIA',
      'pointili_qr_5_juillet_pizzeria',
      '5_juillet_pizzeria',
      'bba_5_juillet_pizzeria',
      '5 juillet pizzeria',
      '5 juillet',
      'pizzeria 5 juillet',
      'cinq juillet',
      'بيتزا 5 جويلية',
      '5 جويلية',
    ],
    qrImagePath: '/qr-codes/5_juillet_pizzeria.png',
    payload: 'pointili://scan?store=5_juillet_pizzeria',
  },
  {
    key: 'chiken_house',
    name: 'Chiken house',
    nameAr: 'تشيكن هاوس',
    uniqueCode: 'POINTILI_QR_CHIKEN_HOUSE',
    aliases: [
      'POINTILI_QR_CHIKEN_HOUSE',
      'pointili_qr_chiken_house',
      'chiken_house',
      'bba_chicken_house',
      'chicken_house',
      'chiken house',
      'chicken house',
      'تشيكن هاوس',
      'شيكن هاوس',
    ],
    qrImagePath: '/qr-codes/chiken_house.png',
    payload: 'pointili://scan?store=chiken_house',
  },
  {
    key: '34_food_fastfood',
    name: '34 Food Fastfood',
    nameAr: '34 فود فاست فود',
    uniqueCode: 'POINTILI_QR_34_FOOD_FASTFOOD',
    aliases: [
      'POINTILI_QR_34_FOOD_FASTFOOD',
      'pointili_qr_34_food_fastfood',
      '34_food_fastfood',
      'bba_34_food',
      '34 food fastfood',
      '34 food',
      '34_food',
      '34food',
      '34 فود فاست فود',
      '34 فود',
    ],
    qrImagePath: '/qr-codes/34_food_fastfood.png',
    payload: 'pointili://scan?store=34_food_fastfood',
  },
  {
    key: 'belarbi_fast_food',
    name: 'Belarbi Fast Food',
    nameAr: 'بلعربي فاست فود',
    uniqueCode: 'POINTILI_QR_BELARBI_FAST_FOOD',
    aliases: [
      'POINTILI_QR_BELARBI_FAST_FOOD',
      'pointili_qr_belarbi_fast_food',
      'belarbi_fast_food',
      'bba_belarbi_fast_food',
      'belarbi fast food',
      'belarbi',
      'بلعربي فاست فود',
      'بلعربي',
    ],
    qrImagePath: '/qr-codes/belarbi_fast_food.png',
    payload: 'pointili://scan?store=belarbi_fast_food',
  },
  {
    key: 'rahim_cook',
    name: 'Rahim cook',
    nameAr: 'رحيم كوك',
    uniqueCode: 'POINTILI_QR_RAHIM_COOK',
    aliases: [
      'POINTILI_QR_RAHIM_COOK',
      'pointili_qr_rahim_cook',
      'rahim_cook',
      'bba_rahim_cook',
      'rahim cook',
      'rahim',
      'رحيم كوك',
      'رحيم',
    ],
    qrImagePath: '/qr-codes/rahim_cook.png',
    payload: 'pointili://scan?store=rahim_cook',
  },
];

/**
 * Check if a restaurant has an active static QR code among the official 10 stores
 * Returns the RegisteredQRStore config or null if not in the official 10.
 */
export function getStoreQRInfo(
  restaurantOrId: { id?: string; name?: string; nameAr?: string } | string | null | undefined
): RegisteredQRStore | null {
  if (!restaurantOrId) return null;

  const idStr = typeof restaurantOrId === 'string' ? restaurantOrId : restaurantOrId.id || '';
  const nameStr = typeof restaurantOrId === 'string' ? restaurantOrId : restaurantOrId.name || '';
  const nameArStr = typeof restaurantOrId === 'object' && restaurantOrId ? restaurantOrId.nameAr || '' : '';

  const cleanId = idStr.toLowerCase().trim();
  const cleanName = nameStr.toLowerCase().trim();
  const cleanNameAr = nameArStr.toLowerCase().trim();

  for (const store of OFFICIAL_10_QR_STORES) {
    if (
      store.key === cleanId ||
      store.uniqueCode.toLowerCase() === cleanId ||
      store.uniqueCode.toLowerCase() === cleanName ||
      store.name.toLowerCase() === cleanName ||
      (cleanNameAr && store.nameAr && store.nameAr.toLowerCase() === cleanNameAr) ||
      store.aliases.some(
        (a) =>
          a.toLowerCase() === cleanId ||
          a.toLowerCase() === cleanName ||
          (cleanNameAr && a.toLowerCase() === cleanNameAr)
      )
    ) {
      return store;
    }
  }

  return null;
}

/**
 * Extracts store id from scanned QR text
 * Supports:
 * - pointili://scan?store=store_id
 * - pointili://stamp?id=store_id
 * - https://pointili.app/scan?store=store_id
 * - JSON: {"store": "store_id"}
 * - raw key like "burger_house_34" or "bba_burger_house_34"
 */
export function extractStoreIdFromQRPayload(scannedText: string): string | null {
  if (!scannedText) return null;
  const raw = scannedText.trim();

  // 1. URI protocol: pointili://scan?store=... or https://...
  try {
    if (raw.startsWith('pointili://') || raw.startsWith('http://') || raw.startsWith('https://')) {
      const normalizedUrl = raw.replace('pointili://', 'https://pointili.app/');
      const urlObj = new URL(normalizedUrl);
      const storeParam =
        urlObj.searchParams.get('store') ||
        urlObj.searchParams.get('id') ||
        urlObj.searchParams.get('code') ||
        urlObj.searchParams.get('venue');

      if (storeParam) {
        return storeParam.toLowerCase().trim();
      }
    }
  } catch {}

  // 2. Query param style: store=... or id=...
  if (raw.includes('store=') || raw.includes('id=')) {
    const match = raw.match(/(?:store|id)=([a-zA-Z0-9_\-]+)/);
    if (match && match[1]) {
      return match[1].toLowerCase().trim();
    }
  }

  // 3. JSON format
  if (raw.startsWith('{') && raw.endsWith('}')) {
    try {
      const parsed = JSON.parse(raw);
      const val = parsed.store || parsed.id || parsed.store_id || parsed.restaurantId;
      if (val) return String(val).toLowerCase().trim();
    } catch {}
  }

  // 4. POINTILI_QR_... exclusive store code format
  if (raw.toUpperCase().startsWith('POINTILI_QR_')) {
    const cleanKey = raw.toUpperCase().replace('POINTILI_QR_', '').toLowerCase();
    for (const store of OFFICIAL_10_QR_STORES) {
      if (store.key === cleanKey || store.uniqueCode.toUpperCase() === raw.toUpperCase()) {
        return store.key;
      }
    }
    return cleanKey;
  }

  // 5. POINTILI_BBA_... secret code format
  if (raw.startsWith('POINTILI_BBA_')) {
    const key = raw.replace('POINTILI_BBA_', '').replace('_2026', '').toLowerCase();
    return key;
  }

  // 6. Direct key match among official 10 stores
  const clean = raw.toLowerCase();
  for (const store of OFFICIAL_10_QR_STORES) {
    if (
      store.key === clean ||
      store.uniqueCode.toLowerCase() === clean ||
      store.aliases.some((a) => a.toLowerCase() === clean)
    ) {
      return store.key;
    }
  }

  // 6. Fallback return raw clean string
  return clean;
}

export interface QRValidationResult {
  isValid: boolean;
  scannedStoreKey: string | null;
  scannedStoreName: string | null;
  scannedStoreArabicName?: string | null;
  rawPayload: string;
  identifiedStore: RegisteredQRStore | null;
  errorMessage?: string;
  spokenWarning?: string;
}

/**
 * Validates if the scanned QR code matches the target restaurant that the user is currently browsing
 */
export function validateScannedQR(
  scannedText: string,
  targetRestaurant: { id: string; name: string; nameAr?: string }
): QRValidationResult {
  const extractedStoreId = extractStoreIdFromQRPayload(scannedText);

  if (!extractedStoreId) {
    return {
      isValid: false,
      scannedStoreKey: null,
      scannedStoreName: null,
      rawPayload: scannedText || '',
      identifiedStore: null,
      errorMessage: '❌ رمز الـ QR غير صالح أو لا يحتوي على كود متجر معتمد في تطبيق Pointili.',
      spokenWarning: 'رمز الـ QR غير صالح أو غير معتمد في تطبيق Pointili.',
    };
  }

  // Find info of the scanned store among official 10 stores
  const scannedStoreInfo = getStoreQRInfo(extractedStoreId);
  const targetStoreInfo = getStoreQRInfo(targetRestaurant);

  const targetDisplayName = targetRestaurant.nameAr || targetRestaurant.name;

  // Case A: The target store is one of the 10 registered stores
  if (targetStoreInfo) {
    const isExactMatch =
      extractedStoreId === targetStoreInfo.key ||
      targetStoreInfo.aliases.some((a) => a.toLowerCase() === extractedStoreId.toLowerCase()) ||
      (scannedStoreInfo && scannedStoreInfo.key === targetStoreInfo.key);

    if (isExactMatch) {
      return {
        isValid: true,
        scannedStoreKey: targetStoreInfo.key,
        scannedStoreName: targetStoreInfo.nameAr || targetStoreInfo.name,
        scannedStoreArabicName: targetStoreInfo.nameAr,
        rawPayload: scannedText,
        identifiedStore: targetStoreInfo,
      };
    } else {
      const otherDisplayName = scannedStoreInfo
        ? (scannedStoreInfo.nameAr ? `${scannedStoreInfo.nameAr} (${scannedStoreInfo.name})` : scannedStoreInfo.name)
        : extractedStoreId.replace('bba_', '').replace(/_/g, ' ');

      const spoken = scannedStoreInfo
        ? `كود غير مطابق! هذا كود QR خاص بـ ${scannedStoreInfo.nameAr || scannedStoreInfo.name} وليس ${targetDisplayName}.`
        : `كود غير مطابق! رمز الـ QR الممسوح لا يخص ${targetDisplayName}.`;

      return {
        isValid: false,
        scannedStoreKey: extractedStoreId,
        scannedStoreName: otherDisplayName,
        scannedStoreArabicName: scannedStoreInfo?.nameAr,
        rawPayload: scannedText,
        identifiedStore: scannedStoreInfo,
        errorMessage: `❌ كود غير مطابق! رمز الـ QR الذي قمت بمسحه يخص "${otherDisplayName}" وليس "${targetDisplayName}". يرجى مسح ملصق هذا المحل حصراً لمنع التلاعب.`,
        spokenWarning: spoken,
      };
    }
  } else {
    // Case B: The target store is another store outside the top 10
    const cleanTargetId = targetRestaurant.id.toLowerCase();
    const cleanTargetName = targetRestaurant.name.toLowerCase();

    const isMatch =
      extractedStoreId === cleanTargetId ||
      extractedStoreId.replace('bba_', '') === cleanTargetId.replace('bba_', '') ||
      cleanTargetName.includes(extractedStoreId);

    if (isMatch) {
      return {
        isValid: true,
        scannedStoreKey: targetRestaurant.id,
        scannedStoreName: targetDisplayName,
        scannedStoreArabicName: targetRestaurant.nameAr,
        rawPayload: scannedText,
        identifiedStore: null,
      };
    } else {
      const otherDisplayName = scannedStoreInfo
        ? (scannedStoreInfo.nameAr ? `${scannedStoreInfo.nameAr} (${scannedStoreInfo.name})` : scannedStoreInfo.name)
        : extractedStoreId.replace('bba_', '').replace(/_/g, ' ');

      const spoken = scannedStoreInfo
        ? `كود غير مطابق! هذا كود QR لـ ${scannedStoreInfo.nameAr || scannedStoreInfo.name} وليس ${targetDisplayName}.`
        : `كود غير مطابق! هذا الكود لا يطابق المحل الحالي.`;

      return {
        isValid: false,
        scannedStoreKey: extractedStoreId,
        scannedStoreName: otherDisplayName,
        scannedStoreArabicName: scannedStoreInfo?.nameAr,
        rawPayload: scannedText,
        identifiedStore: scannedStoreInfo,
        errorMessage: `❌ كود غير مطابق! هذا الرمز يخص "${otherDisplayName}" ولا يطابق المحل الحالي "${targetDisplayName}".`,
        spokenWarning: spoken,
      };
    }
  }
}

/**
 * Directly identifies and resolves the target restaurant from any scanned Pointili QR code
 * No pre-selection needed - immediate detection!
 */
export function identifyStoreFromQR<T extends { id: string; name: string; nameAr?: string; uniqueCode?: string; qrSecretCode?: string }>(
  scannedText: string,
  allRestaurants: T[]
): { restaurant: T; qrInfo: RegisteredQRStore | null } | null {
  if (!scannedText) return null;

  const extractedId = extractStoreIdFromQRPayload(scannedText);
  if (!extractedId) return null;

  const cleanExtracted = extractedId.toLowerCase().trim();
  const qrInfo = getStoreQRInfo(cleanExtracted);

  // Match restaurant in array
  const matched = allRestaurants.find((r) => {
    const rId = r.id.toLowerCase();
    const rName = r.name.toLowerCase();
    const rNameAr = (r.nameAr || '').toLowerCase();
    const rUnique = (r.uniqueCode || '').toLowerCase();
    const rSecret = (r.qrSecretCode || '').toLowerCase();

    if (qrInfo) {
      if (
        rId === qrInfo.key ||
        rId === `bba_${qrInfo.key}` ||
        rUnique === qrInfo.uniqueCode.toLowerCase() ||
        rName === qrInfo.name.toLowerCase() ||
        qrInfo.aliases.some((a) => a.toLowerCase() === rId || a.toLowerCase() === rName)
      ) {
        return true;
      }
    }

    return (
      rId === cleanExtracted ||
      rId.replace('bba_', '') === cleanExtracted.replace('bba_', '') ||
      rUnique === cleanExtracted ||
      rSecret === cleanExtracted ||
      rName === cleanExtracted ||
      rNameAr === cleanExtracted
    );
  });

  if (matched) {
    return {
      restaurant: matched,
      qrInfo: qrInfo || getStoreQRInfo(matched),
    };
  }

  return null;
}
