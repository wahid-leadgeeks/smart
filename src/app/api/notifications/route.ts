import { NextResponse } from 'next/server';
import { getAppNotifications, getAllPushSubscriptions, markNotificationAsRead } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { getVapidKeys } from '@/lib/push';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    const notifications = await getAppNotifications(40);
    const subscriptions = await getAllPushSubscriptions();
    const vapidPublicKey = getVapidKeys().publicKey;

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        subscribersCount: subscriptions.length,
        currentUser: user,
        vapidPublicKey,
      },
    });
  } catch (err: any) {
    console.error('[API /api/notifications GET]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body?.id);
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    await markNotificationAsRead(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error marking notification as read' },
      { status: 500 }
    );
  }
}
