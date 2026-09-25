import { NextResponse } from 'next/server';
import { createAppNotification, getAllPushSubscriptions } from '@/lib/db';
import { getSessionUser } from '@/lib/auth/session';
import { sendPushToSubscriptions } from '@/lib/push';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, recipient_email, target_url, category } = body;

    if (!title?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title and message are required' },
        { status: 400 }
      );
    }

    const user = await getSessionUser(request);
    const senderName = user?.name || 'LeadGeeks IT';
    const senderEmail = user?.email || undefined;
    const recipient = recipient_email?.trim() || 'ALL';

    // 1. Record the in-app notification in database
    const notification = await createAppNotification({
      sender_email: senderEmail,
      sender_name: senderName,
      recipient_email: recipient,
      category: category || 'Announcement',
      title: title.trim(),
      message: message.trim(),
      target_url: target_url || '/',
    });

    // 2. Fetch active browser push subscriptions
    const subscriptions = await getAllPushSubscriptions(recipient);

    // 3. Dispatch web-push payload
    const pushResult = await sendPushToSubscriptions(subscriptions, {
      title: `[${senderName}] ${title.trim()}`,
      body: message.trim(),
      url: target_url || '/',
      tag: `msg-${notification.id}`,
    });

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${pushResult.sent} active device(s)`,
      data: {
        notification,
        subscribersTargeted: subscriptions.length,
        deliveredCount: pushResult.sent,
        failedCount: pushResult.failed,
      },
    });
  } catch (err: any) {
    console.error('[API /api/notifications/send POST]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to dispatch notification' },
      { status: 500 }
    );
  }
}
