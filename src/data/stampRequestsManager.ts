import { StampRequest, Restaurant } from '../types';

export const STORAGE_KEY_STAMP_REQUESTS = 'pointili_stamp_requests_v1';

// Seed sample initial pending requests so store owners immediately see how the queue works
export const INITIAL_SAMPLE_REQUESTS: StampRequest[] = [
  {
    id: 'req_sample_1',
    restaurantId: 'bba_le_mirage',
    restaurantName: 'Le Mirage',
    restaurantEmoji: '🍽️',
    userId: 'usr_sample_1',
    userEmail: 'karim.bouzid.bba@gmail.com',
    userName: 'كريم بوزيد',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    timestamp: 'منذ دقيقة',
    createdAt: Date.now() - 60000,
    status: 'pending',
    currentStampsBefore: 3,
  },
  {
    id: 'req_sample_2',
    restaurantId: 'bba_el_bey',
    restaurantName: 'El Bey',
    restaurantEmoji: '🥩',
    userId: 'usr_sample_2',
    userEmail: 'samia.mansouri34@gmail.com',
    userName: 'سامية منصوري',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    timestamp: 'منذ 3 دقائق',
    createdAt: Date.now() - 180000,
    status: 'pending',
    currentStampsBefore: 5,
  },
  {
    id: 'req_sample_3',
    restaurantId: 'bba_burger_house_34',
    restaurantName: 'Burger HOUSE 34',
    restaurantEmoji: '🍔',
    userId: 'usr_sample_3',
    userEmail: 'mehdi.zerrouki@gmail.com',
    userName: 'مهدي زروقي',
    userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
    timestamp: 'منذ 5 دقائق',
    createdAt: Date.now() - 300000,
    status: 'pending',
    currentStampsBefore: 1,
  },
];

export function getStampRequests(): StampRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STAMP_REQUESTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    // Initialize with sample requests if first run
    localStorage.setItem(STORAGE_KEY_STAMP_REQUESTS, JSON.stringify(INITIAL_SAMPLE_REQUESTS));
    return INITIAL_SAMPLE_REQUESTS;
  } catch {
    return INITIAL_SAMPLE_REQUESTS;
  }
}

export function saveStampRequests(requests: StampRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_STAMP_REQUESTS, JSON.stringify(requests));
    // Dispatch local custom event for instant cross-component reactivity
    window.dispatchEvent(new CustomEvent('pointili_stamp_requests_changed', { detail: requests }));
  } catch (err) {
    console.error('Failed to save stamp requests:', err);
  }
}

export function createStampRequest(data: {
  restaurant: Restaurant;
  userId: string;
  userEmail: string;
  userName: string;
  userAvatar: string;
}): StampRequest {
  const current = getStampRequests();

  const newRequest: StampRequest = {
    id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    restaurantId: data.restaurant.id,
    restaurantName: data.restaurant.nameAr || data.restaurant.name,
    restaurantEmoji: data.restaurant.imageEmoji || '🍽️',
    userId: data.userId,
    userEmail: data.userEmail,
    userName: data.userName,
    userAvatar: data.userAvatar,
    timestamp: 'الآن (Just now)',
    createdAt: Date.now(),
    status: 'pending',
    currentStampsBefore: data.restaurant.stampsCount || 0,
  };

  const updated = [newRequest, ...current];
  saveStampRequests(updated);
  return newRequest;
}

export function updateStampRequestStatus(
  requestId: string,
  status: StampRequest['status']
): StampRequest | null {
  const current = getStampRequests();
  let updatedItem: StampRequest | null = null;

  const updated = current.map((req) => {
    if (req.id === requestId) {
      updatedItem = {
        ...req,
        status,
        resolvedAt: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
        newStampsAfter:
          status === 'accepted' || status === 'appeal_approved'
            ? Math.min(6, req.currentStampsBefore + 1)
            : req.currentStampsBefore,
      };
      return updatedItem;
    }
    return req;
  });

  if (updatedItem) {
    saveStampRequests(updated);
  }
  return updatedItem;
}

/**
 * Requirement 4: Submit appeal from customer to Master Admin (AYMEN BG)
 */
export function submitStampRequestAppeal(
  requestId: string,
  appealNote: string
): StampRequest | null {
  const current = getStampRequests();
  let updatedItem: StampRequest | null = null;

  const updated: StampRequest[] = current.map((req): StampRequest => {
    if (req.id === requestId) {
      const modified: StampRequest = {
        ...req,
        status: 'appealed' as const,
        appealNote: appealNote.trim() || 'طعن مقدم من الزبون بعد رفض المحل',
        appealedAt: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
      };
      updatedItem = modified;
      return modified;
    }
    return req;
  });

  if (updatedItem) {
    saveStampRequests(updated);
  }
  return updatedItem;
}

/**
 * Requirement 4: Master Admin (AYMEN BG) resolves customer appeal
 */
export function resolveStampRequestAppeal(
  requestId: string,
  verdict: 'approved' | 'rejected',
  adminNote?: string
): StampRequest | null {
  const current = getStampRequests();
  let updatedItem: StampRequest | null = null;

  const updated: StampRequest[] = current.map((req): StampRequest => {
    if (req.id === requestId) {
      const isApproved = verdict === 'approved';
      const modified: StampRequest = {
        ...req,
        status: isApproved ? ('appeal_approved' as const) : ('appeal_rejected' as const),
        appealVerdict: verdict,
        appealVerdictNote: adminNote || (isApproved ? 'تمت الموافقة على الطعن واحتساب الختم' : 'تم تثبيت الرفض بعد المراجعة'),
        appealResolvedBy: 'AYMEN BG (رئيس الإدارة)',
        appealResolvedAt: new Date().toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' }),
        newStampsAfter: isApproved ? Math.min(6, req.currentStampsBefore + 1) : req.currentStampsBefore,
      };
      updatedItem = modified;
      return modified;
    }
    return req;
  });

  if (updatedItem) {
    saveStampRequests(updated);
  }
  return updatedItem;
}

export function getAppealedStampRequests(): StampRequest[] {
  const all = getStampRequests();
  return all.filter((r) => r.status === 'appealed');
}

export function getStoreStampRequests(restaurantId: string): StampRequest[] {
  const all = getStampRequests();
  return all.filter(
    (r) =>
      r.restaurantId.toLowerCase() === restaurantId.toLowerCase() ||
      r.restaurantName.toLowerCase().includes(restaurantId.toLowerCase())
  );
}

export function getUserPendingRequest(userId: string, restaurantId?: string): StampRequest | null {
  const all = getStampRequests();
  return (
    all.find((r) => {
      const matchUser = r.userId === userId;
      const matchRest = restaurantId ? r.restaurantId === restaurantId : true;
      return matchUser && matchRest && r.status === 'pending';
    }) || null
  );
}
