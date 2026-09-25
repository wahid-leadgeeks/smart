import webpush from 'web-push';
import { deletePushSubscriptionByEndpoint, PushSubscriptionRecord } from './db';

// In-memory cached VAPID keys
let cachedVapidKeys: { publicKey: string; privateKey: string } | null = null;

export function getVapidKeys(): { publicKey: string; privateKey: string } {
  if (cachedVapidKeys) return cachedVapidKeys;

  const envPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const envPrivate = process.env.VAPID_PRIVATE_KEY;

  if (envPublic && envPrivate) {
    cachedVapidKeys = { publicKey: envPublic, privateKey: envPrivate };
  } else {
    // Generate valid VAPID keys dynamically without hardcoded secrets
    cachedVapidKeys = webpush.generateVAPIDKeys();
  }

  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@leadgeeks.com';
  try {
    webpush.setVapidDetails(subject, cachedVapidKeys.publicKey, cachedVapidKeys.privateKey);
  } catch (err) {
    console.warn('[WebPush] Error configuring VAPID details:', err);
  }

  return cachedVapidKeys;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

/**
 * Dispatches web push notifications to an array of stored push subscriptions.
 * Automatically prunes expired endpoints (HTTP 410 / 404).
 */
export async function sendPushToSubscriptions(
  subscriptions: PushSubscriptionRecord[],
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  // Ensure VAPID keys are initialized
  getVapidKeys();

  let sent = 0;
  let failed = 0;

  const notificationData = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/icon-192.png',
    url: payload.url || '/',
    tag: payload.tag || 'smart-goals-team-message',
  });

  const sendPromises = subscriptions.map(async (sub) => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    try {
      await webpush.sendNotification(pushSubscription, notificationData);
      sent++;
    } catch (err: any) {
      failed++;
      // If endpoint has expired or unsubscribed, prune from database
      if (err.statusCode === 410 || err.statusCode === 404) {
        try {
          await deletePushSubscriptionByEndpoint(sub.endpoint);
        } catch {
          // ignore
        }
      } else {
        console.warn(`[WebPush] Failed sending to endpoint ${sub.endpoint}:`, err.message || err);
      }
    }
  });

  await Promise.allSettled(sendPromises);

  return { sent, failed };
}
