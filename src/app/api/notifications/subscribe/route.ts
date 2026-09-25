import { NextResponse } from 'next/server';
import { upsertPushSubscription, deletePushSubscriptionByEndpoint } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { sendPushToSubscriptions } from '@/lib/push';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscription, deviceInfo } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json(
        { success: false, error: 'Valid PushSubscription with endpoint and keys is required' },
        { status: 400 }
      );
    }

    const user = await getSessionUser(request);

    const record = await upsertPushSubscription({
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      user_email: user?.email,
      user_name: user?.name,
      user_avatar: user?.picture,
      device_info: deviceInfo || 'Web Browser',
    });

    // Send a confirmation welcome push
    try {
      await sendPushToSubscriptions([record], {
        title: 'LeadGeeks IT SMART Goals',
        body: 'Push notifications enabled! You will receive live team messages and initiative alerts.',
        url: '/',
      });
    } catch {
      // ignore push errors on initial subscribe
    }

    return NextResponse.json({
      success: true,
      message: 'Push notifications registered successfully',
      data: record,
    });
  } catch (err: any) {
    console.error('[API /api/notifications/subscribe POST]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to save push subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const endpoint = body?.endpoint;
    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: 'Subscription endpoint is required' },
        { status: 400 }
      );
    }

    await deletePushSubscriptionByEndpoint(endpoint);
    return NextResponse.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
